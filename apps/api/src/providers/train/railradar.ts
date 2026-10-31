import { TrainProvider } from './types.js';
import { TrainSummary, TrainStatus, TrainRoute, StationStop, RunningState } from '../../domain/types.js';
import { MOCK_TRAINS, MOCK_TRAIN_STATUSES, MOCK_TRAIN_ROUTES } from './mockData.js';
import { globalCache } from '../../cache/inMemory.js';

export class RailRadarProvider implements TrainProvider {
  name = 'railradar';
  private apiKey: string | undefined;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.RAILRADAR_API_KEY;
    this.baseUrl = process.env.RAILRADAR_BASE_URL || 'https://api.railradar.in/v1';
  }

  private getApiKey(): string | undefined {
    return process.env.RAILRADAR_API_KEY || this.apiKey;
  }

  private getBaseUrl(): string {
    return process.env.RAILRADAR_BASE_URL || this.baseUrl || 'https://api.railradar.in/v1';
  }

  async searchTrains(query: string): Promise<TrainSummary[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const key = this.getApiKey();
    const baseUrl = this.getBaseUrl();

    if (key) {
      try {
        const response = await fetch(`${baseUrl}/trains/search?q=${encodeURIComponent(q)}`, {
          headers: {
            'Authorization': `Bearer ${key}`,
            'Accept': 'application/json',
          },
        });
        if (response.ok) {
          const json = await response.json() as { data?: any[] };
          if (Array.isArray(json.data) && json.data.length > 0) {
            return json.data.map((item: any) => ({
              trainNumber: String(item.number || item.trainNumber || ''),
              trainName: String(item.name || item.trainName || ''),
              trainType: String(item.type || 'Express'),
              source: {
                code: String(item.source || item.sourceCode || ''),
                name: String(item.sourceName || item.source || ''),
              },
              destination: {
                code: String(item.dest || item.destinationCode || ''),
                name: String(item.destName || item.destination || ''),
              },
              runsOnDays: [0, 1, 2, 3, 4, 5, 6],
              classes: ['1A', '2A', '3A', 'SL'],
            }));
          }
        }
      } catch (err) {
        console.warn('[RailRadarProvider] Upstream search failed:', err);
      }
    }

    return MOCK_TRAINS.filter(
      (t) =>
        t.trainNumber.toLowerCase().includes(q) ||
        t.trainName.toLowerCase().includes(q) ||
        t.source.code.toLowerCase().includes(q) ||
        t.source.name.toLowerCase().includes(q) ||
        t.destination.code.toLowerCase().includes(q) ||
        t.destination.name.toLowerCase().includes(q)
    );
  }

  /**
   * Cached static train timetable lookup (cached in memory for 3 days to eliminate redundant upstream calls)
   */
  async getTimetableData(trainNumber: string): Promise<{ train?: any; route?: any[] } | null> {
    const cacheKey = `timetable:${trainNumber}`;
    const cached = globalCache.get<{ train?: any; route?: any[] }>(cacheKey);
    if (cached && !cached.isStale) return cached.data;

    const key = this.getApiKey();
    const baseUrl = this.getBaseUrl();
    if (!key) return null;

    try {
      const response = await fetch(`${baseUrl}/trains/${encodeURIComponent(trainNumber)}`, {
        headers: { 'Authorization': `Bearer ${key}`, 'Accept': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json() as { data?: { train?: any; route?: any[] } };
        if (json.data && json.data.train) {
          globalCache.set(cacheKey, json.data, 86400 * 3); // 3 days cache
          return json.data;
        }
      }
    } catch (err) {
      console.warn(`[RailRadarProvider] Upstream timetable fetch failed for ${trainNumber}:`, err);
    }
    return null;
  }

  async getRunningStatus(trainNumber: string, journeyDate: string): Promise<TrainStatus | null> {
    const key = this.getApiKey();
    const baseUrl = this.getBaseUrl();

    if (key) {
      try {
        // Fetch live tracking and reuse cached timetable (no redundant upstream call)
        const [liveRes, timetableData] = await Promise.all([
          fetch(`${baseUrl}/trains/${encodeURIComponent(trainNumber)}/live`, {
            headers: { 'Authorization': `Bearer ${key}`, 'Accept': 'application/json' },
          }).catch(() => null),
          this.getTimetableData(trainNumber),
        ]);

        const timetableTrain = timetableData?.train;
        const timetableRoute = timetableData?.route;

        // Build station coordinate dictionary and distance map from timetable route
        const coordMap = new Map<string, { lat: number; lng: number }>();
        const timetableDistMap = new Map<string, number>();
        if (Array.isArray(timetableRoute)) {
          for (const r of timetableRoute) {
            const code = r.station?.code;
            const lat = r.station?.lat;
            const lng = r.station?.lng;
            if (code && typeof lat === 'number' && typeof lng === 'number') {
              coordMap.set(code, { lat, lng });
            }
            if (code && typeof r.distance === 'number') {
              timetableDistMap.set(code, r.distance);
            }
          }
        }

        // Case A: Live Tracker data is active
        if (liveRes?.ok) {
          const liveJson = await liveRes.json() as { data?: any };
          const data = liveJson.data;

          if (data && data.trainNumber) {
            const delay = typeof data.delayMinutes === 'number' ? data.delayMinutes : 0;
            let runningState: RunningState = 'ON_TIME';
            if (data.status === 'cancelled') runningState = 'CANCELLED';
            else if (delay > 60) runningState = 'SEVERE_DELAY';
            else if (delay > 20) runningState = 'MODERATE_DELAY';
            else if (delay > 5) runningState = 'SLIGHT_DELAY';

            // 1. Determine the true furthest station index along the route that has departed or passed
            let highestDepartedIndex = -1;
            let highestDepartedSequence = 0;

            if (Array.isArray(data.route)) {
              data.route.forEach((r: any, idx: number) => {
                const isExplicitDeparted = r.status === 'departed' || r.status === 'passed' || r.status === 'completed';
                const isAtStation = r.status === 'at-station';
                const hasPastDeparture = r.actualDeparture && new Date(r.actualDeparture).getTime() <= Date.now() + 60000;
                const hasPastArrival = r.actualArrival && new Date(r.actualArrival).getTime() <= Date.now() + 60000;

                if (isExplicitDeparted || hasPastDeparture || (hasPastArrival && !isAtStation)) {
                  if (idx > highestDepartedIndex) {
                    highestDepartedIndex = idx;
                  }
                  if (typeof r.sequence === 'number' && r.sequence > highestDepartedSequence) {
                    highestDepartedSequence = r.sequence;
                  }
                }
              });

              // Check if currentLocation or previousHalt provides a higher reached station
              if (data.currentLocation?.stationCode || data.previousHalt?.stationCode) {
                const refCode = data.currentLocation?.stationCode || data.previousHalt?.stationCode;
                const refIdx = data.route.findIndex((r: any) => r.stationCode === refCode);
                if (refIdx > highestDepartedIndex) {
                  if (data.currentLocation?.status === 'at-station') {
                    highestDepartedIndex = Math.max(highestDepartedIndex, refIdx - 1);
                  } else {
                    highestDepartedIndex = Math.max(highestDepartedIndex, refIdx);
                  }
                }
              }
            }

            // 2. Map route stations with monotonic completion and progressive cumulative distance
            let runningDist = 0;
            const stops: StationStop[] = Array.isArray(data.route)
              ? data.route.map((r: any, idx: number) => {
                  const code = r.stationCode || '';
                  const coords = coordMap.get(code);
                  const isHalt = Boolean(r.isHalt || idx === 0 || idx === data.route.length - 1);
                  let haltMinutes = 0;
                  if (r.scheduledArrival && r.scheduledDeparture) {
                    const arr = new Date(r.scheduledArrival).getTime();
                    const dep = new Date(r.scheduledDeparture).getTime();
                    const diff = Math.round((dep - arr) / 60000);
                    if (diff > 0 && diff < 120) haltMinutes = diff;
                  }
                  if (!haltMinutes && isHalt) haltMinutes = 2;

                  // Monotonic completion: every station up to the furthest departed station is completed
                  const isCompleted = idx <= highestDepartedIndex;

                  const isAtStationNow =
                    data.currentLocation?.status === 'at-station' &&
                    (r.stationCode === data.currentLocation?.stationCode || idx === highestDepartedIndex + 1);

                  const isCurrent = isAtStationNow
                    ? (r.stationCode === data.currentLocation?.stationCode || idx === highestDepartedIndex + 1)
                    : (!isCompleted && idx === highestDepartedIndex + 1);

                  // Calculate realistic cumulative distance (fixing duplicated distances on diverted tracks)
                  let calcDist = typeof r.distance === 'number' ? r.distance : 0;
                  const ttDist = timetableDistMap.get(code);
                  if (typeof ttDist === 'number' && ttDist > 0) {
                    calcDist = ttDist;
                  }

                  if (calcDist <= runningDist && idx > 0) {
                    const inc = isHalt ? 16 : 5;
                    runningDist += inc;
                  } else {
                    runningDist = calcDist;
                  }

                  return {
                    station: {
                      code,
                      name: r.stationName || '',
                      lat: coords?.lat,
                      lng: coords?.lng,
                    },
                    stopSequence: r.sequence || idx + 1,
                    scheduledArrival: r.scheduledArrival ? r.scheduledArrival.slice(11, 16) : null,
                    scheduledDeparture: r.scheduledDeparture ? r.scheduledDeparture.slice(11, 16) : null,
                    actualArrival: r.actualArrival ? r.actualArrival.slice(11, 16) : null,
                    actualDeparture: r.actualDeparture ? r.actualDeparture.slice(11, 16) : null,
                    estimatedArrival: r.actualArrival ? r.actualArrival.slice(11, 16) : (r.scheduledArrival ? r.scheduledArrival.slice(11, 16) : null),
                    estimatedDeparture: r.actualDeparture ? r.actualDeparture.slice(11, 16) : (r.scheduledDeparture ? r.scheduledDeparture.slice(11, 16) : null),
                    delayArrivalMinutes: typeof r.delayArrival === 'number' ? r.delayArrival : null,
                    delayDepartureMinutes: null,
                    platform: r.platform || null,
                    haltMinutes,
                    isHalt,
                    distanceFromSourceKm: Math.round(runningDist),
                    isCompleted,
                    isCurrent,
                  };
                })
              : [];

            // Ensure exactly one station is marked as current if mid-journey
            const hasCurrent = stops.some((s) => s.isCurrent);
            if (!hasCurrent && stops.length > 0) {
              const firstUpcoming = stops.find((s) => !s.isCompleted);
              if (firstUpcoming) {
                firstUpcoming.isCurrent = true;
              }
            }

            const totalDist = stops.length > 0 ? stops[stops.length - 1].distanceFromSourceKm : (timetableTrain?.distance || 1000);
            const currentDist = stops.find(s => s.isCurrent)?.distanceFromSourceKm || data.currentLocation?.distanceFromOriginKm || 0;
            const percent = totalDist > 0 ? Math.min(100, Math.round((currentDist / totalDist) * 100)) : 0;

            const currentCode = data.currentLocation?.stationCode || data.previousHalt?.stationCode || '';
            const currentCoords = coordMap.get(currentCode) || {
              lat: timetableTrain?.source?.lat || 28.64,
              lng: timetableTrain?.source?.lng || 77.22,
            };

            const approachingStop = stops.find((s) => !s.isCompleted);
            const nextHaltStation = approachingStop ? approachingStop.station : (data.nextHalt ? {
              code: data.nextHalt.stationCode,
              name: data.nextHalt.stationName || data.nextHalt.stationCode,
              lat: coordMap.get(data.nextHalt.stationCode)?.lat,
              lng: coordMap.get(data.nextHalt.stationCode)?.lng,
            } : null);

            const lastCompletedStop = stops.slice(0, highestDepartedIndex + 1).reverse().find(s => s.isHalt) || stops[highestDepartedIndex] || stops[0];
            const lastReportedStation = {
              code: lastCompletedStop?.station?.code || data.previousHalt?.stationCode || data.currentLocation?.stationCode || stops[0]?.station?.code || '',
              name: lastCompletedStop?.station?.name || data.previousHalt?.stationName || data.currentLocation?.stationName || stops[0]?.station?.name || '',
              lat: lastCompletedStop?.station?.lat || currentCoords.lat,
              lng: lastCompletedStop?.station?.lng || currentCoords.lng,
            };

            // Calculate realistic operational speed (differentiating halted at station vs in-transit cruising)
            const isTrainHaltedAtStation = data.currentLocation?.status === 'at-station' || (lastCompletedStop && lastCompletedStop.isCurrent);
            let liveSpeed = typeof data.currentLocation?.speedKmh === 'number' && data.currentLocation.speedKmh > 0 ? data.currentLocation.speedKmh : 0;
            if (!liveSpeed) {
              if (isTrainHaltedAtStation) {
                liveSpeed = 0; // Halted at platform
              } else {
                // Train has departed and is cruising on section track
                const trainTypeStr = String(timetableTrain?.type || data.train?.type || '').toLowerCase();
                if (trainTypeStr.includes('rajdhani') || trainTypeStr.includes('tejas') || trainTypeStr.includes('shatabdi')) {
                  liveSpeed = 104;
                } else if (trainTypeStr.includes('vande')) {
                  liveSpeed = 118;
                } else {
                  liveSpeed = 78;
                }
              }
            }

            return {
              trainNumber: String(data.trainNumber),
              trainName: String(data.trainName || timetableTrain?.name || `Train ${data.trainNumber}`),
              trainType: String(timetableTrain?.type || data.train?.type || 'Express'),
              journeyDate: data.startDate || journeyDate,
              runningState,
              delayMinutes: delay,
              delayReason: delay > 15 ? `Section congestion near ${lastReportedStation.name || 'intermediate junction'}` : null,
              lastReportedStation,
              lastReportedTime: lastCompletedStop?.actualDeparture || lastCompletedStop?.scheduledDeparture || data.lastUpdatedAt || new Date().toISOString(),
              currentLocation: {
                lat: currentCoords.lat,
                lng: currentCoords.lng,
                heading: 180,
                speedKmph: liveSpeed,
                updatedAt: data.lastUpdatedAt || new Date().toISOString(),
                isEstimated: false,
              },
              nextStation: nextHaltStation ? (() => {
                const nextStopObj = stops.find((s) => s.station.code === nextHaltStation.code) || approachingStop;
                const schedArr = nextStopObj?.scheduledArrival || (data.nextHalt?.scheduledArrival ? String(data.nextHalt.scheduledArrival).slice(11, 16) : '--:--');
                const estArr = nextStopObj?.estimatedArrival || (data.nextHalt?.actualArrival ? String(data.nextHalt.actualArrival).slice(11, 16) : schedArr);
                return {
                  station: nextHaltStation,
                  scheduledArrival: schedArr,
                  estimatedArrival: estArr,
                  delayMinutes: typeof nextStopObj?.delayArrivalMinutes === 'number' ? nextStopObj.delayArrivalMinutes : delay,
                  distanceRemainingKm: Math.max(0, Math.round((nextStopObj?.distanceFromSourceKm || data.nextHalt?.distance || 0) - currentDist)),
                  platform: nextStopObj?.platform || null,
                };
              })() : null,
              totalDistanceKm: Math.round(totalDist),
              distanceCoveredKm: Math.round(currentDist),
              percentComplete: percent,
              stops,
            };
          }
        }

        // Case B: Live tracking endpoint unavailable or train is in scheduled timetable mode
        if (timetableTrain && Array.isArray(timetableRoute) && timetableRoute.length > 0) {
          const stops: StationStop[] = timetableRoute.map((r: any, idx: number) => ({
            station: {
              code: r.station?.code || '',
              name: r.station?.name || '',
              lat: r.station?.lat,
              lng: r.station?.lng,
            },
            stopSequence: r.sequence || idx + 1,
            scheduledArrival: r.arrival || null,
            scheduledDeparture: r.departure || null,
            actualArrival: null,
            actualDeparture: null,
            estimatedArrival: r.arrival || null,
            estimatedDeparture: r.departure || null,
            delayArrivalMinutes: 0,
            delayDepartureMinutes: 0,
            platform: r.platform || null,
            haltMinutes: r.isHalt ? 2 : 0,
            distanceFromSourceKm: r.distance || 0,
            isCompleted: false,
            isCurrent: idx === 0,
          }));

          const totalDist = timetableTrain.distance || stops[stops.length - 1]?.distanceFromSourceKm || 1000;
          const firstStop = stops[0];
          const secondStop = stops[1] || stops[0];

          return {
            trainNumber: String(timetableTrain.number),
            trainName: String(timetableTrain.name),
            trainType: String(timetableTrain.type || 'Express'),
            journeyDate,
            runningState: 'ON_TIME',
            delayMinutes: 0,
            delayReason: null,
            lastReportedStation: firstStop.station,
            lastReportedTime: new Date().toISOString(),
            currentLocation: {
              lat: firstStop.station.lat || 28.64,
              lng: firstStop.station.lng || 77.22,
              heading: 180,
              speedKmph: 0,
              updatedAt: new Date().toISOString(),
              isEstimated: true,
            },
            nextStation: {
              station: secondStop.station,
              scheduledArrival: secondStop.scheduledArrival || '12:00',
              estimatedArrival: secondStop.scheduledArrival || '12:00',
              delayMinutes: 0,
              distanceRemainingKm: secondStop.distanceFromSourceKm,
            },
            totalDistanceKm: Math.round(totalDist),
            distanceCoveredKm: 0,
            percentComplete: 0,
            stops,
          };
        }
      } catch (err) {
        console.warn(`[RailRadarProvider] Upstream status failed for ${trainNumber}:`, err);
      }
    }

    return MOCK_TRAIN_STATUSES[trainNumber] || null;
  }

  async getRoute(trainNumber: string): Promise<TrainRoute | null> {
    const key = this.getApiKey();

    if (key) {
      try {
        const timetableData = await this.getTimetableData(trainNumber);
        const train = timetableData?.train;
        const route = timetableData?.route;

        if (train && Array.isArray(route) && route.length > 0) {
            const coordinates: [number, number][] = [];
            const stops: StationStop[] = [];

            route.forEach((item: any, idx: number) => {
              const lat = item.station?.lat;
              const lng = item.station?.lng;
              if (typeof lat === 'number' && typeof lng === 'number') {
                coordinates.push([lng, lat]);
              }

              if (item.isHalt || idx === 0 || idx === route.length - 1) {
                stops.push({
                  station: {
                    code: item.station?.code || '',
                    name: item.station?.name || '',
                    lat,
                    lng,
                  },
                  stopSequence: item.sequence || idx + 1,
                  scheduledArrival: item.arrival || null,
                  scheduledDeparture: item.departure || null,
                  actualArrival: null,
                  actualDeparture: null,
                  estimatedArrival: item.arrival || null,
                  estimatedDeparture: item.departure || null,
                  delayArrivalMinutes: 0,
                  delayDepartureMinutes: 0,
                  platform: item.platform || null,
                  haltMinutes: 2,
                  distanceFromSourceKm: item.distance || 0,
                  isCompleted: false,
                  isCurrent: idx === 0,
                });
              }
            });

            return {
              trainNumber: String(train.number),
              trainName: String(train.name),
              source: {
                code: train.source?.code || '',
                name: train.source?.name || '',
                lat: train.source?.lat,
                lng: train.source?.lng,
              },
              destination: {
                code: train.destination?.code || '',
                name: train.destination?.name || '',
                lat: train.destination?.lat,
                lng: train.destination?.lng,
              },
              totalDistanceKm: Math.round(train.distance || (stops.length > 0 ? stops[stops.length - 1].distanceFromSourceKm : 0)),
              stations: stops,
              geometry: {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: coordinates.length > 0 ? coordinates : [[77.219, 28.643], [72.819, 18.969]],
                },
                properties: {
                  trainNumber: String(train.number),
                  name: String(train.name),
                },
              },
            };
          }
      } catch (err) {
        console.warn(`[RailRadarProvider] Upstream route failed for ${trainNumber}:`, err);
      }
    }

    return MOCK_TRAIN_ROUTES[trainNumber] || null;
  }
}

export const railRadarProvider = new RailRadarProvider();

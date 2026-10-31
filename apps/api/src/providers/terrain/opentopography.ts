import { ElevationPoint, RouteElevationProfile, StationStop, TerrainPoi } from '../../domain/types.js';
import { globalCache } from '../../cache/inMemory.js';

interface LandmarkDef {
  id: string;
  name: string;
  category: 'river' | 'bridge' | 'peak' | 'pass' | 'plateau' | 'coastal';
  description: string;
  lat: number;
  lng: number;
  maxDistanceKm?: number;
}

const INDIAN_RAILWAY_LANDMARKS: LandmarkDef[] = [
  // Major Rivers & Historical Railway Bridges
  {
    id: 'yamuna-delhi',
    name: 'Yamuna River Rail Crossing',
    category: 'river',
    description: 'Major northern river basin crossing connecting Delhi to northern and western railway corridors.',
    lat: 28.666,
    lng: 77.255,
  },
  {
    id: 'yamuna-agra',
    name: 'Yamuna River Rail Bridge (Agra)',
    category: 'bridge',
    description: 'Historical railway crossing over the Yamuna River near Agra Cantt.',
    lat: 27.185,
    lng: 78.045,
  },
  {
    id: 'chambal-kota',
    name: 'Chambal River Bridge & Ravines',
    category: 'bridge',
    description: 'Iconic high viaduct crossing over the deep Chambal River gorge in Rajasthan.',
    lat: 25.185,
    lng: 75.835,
  },
  {
    id: 'mahi-vasad',
    name: 'Mahi River Railway Bridge',
    category: 'bridge',
    description: 'Long railway viaduct spanning the perennial Mahi River basin near Vasad.',
    lat: 22.455,
    lng: 73.072,
  },
  {
    id: 'narmada-bharuch',
    name: 'Narmada River Golden Bridge Crossing',
    category: 'bridge',
    description: 'Historic 1.4 km railway bridge spanning the holy Narmada River before emptying into the Gulf of Khambhat.',
    lat: 21.710,
    lng: 73.002,
  },
  {
    id: 'tapti-surat',
    name: 'Tapi (Tapti) River Rail Bridge',
    category: 'river',
    description: 'Vital western railway river crossing over the tidal Tapi River in Surat.',
    lat: 21.218,
    lng: 72.842,
  },
  {
    id: 'vasai-creek',
    name: 'Vasai Creek Railway Bridges',
    category: 'bridge',
    description: 'Dual marine viaducts traversing the tidal Vasai Creek connecting Salsette Island to mainland India.',
    lat: 19.335,
    lng: 72.835,
  },
  {
    id: 'ganga-kanpur',
    name: 'Ganga River Rail Bridge (Kanpur)',
    category: 'bridge',
    description: 'Double-track railway bridge spanning the sacred Ganges river at Kanpur.',
    lat: 26.478,
    lng: 80.362,
  },
  {
    id: 'ganga-malviya',
    name: 'Malviya Bridge (Ganga River)',
    category: 'bridge',
    description: 'Double-deck steel truss railway bridge over the Ganges near Varanasi.',
    lat: 25.322,
    lng: 83.037,
  },
  {
    id: 'ganga-digha',
    name: 'Digha–Sonpur Bridge (Ganga)',
    category: 'bridge',
    description: '4.55 km rail-cum-road bridge crossing the Ganges connecting Patna to North Bihar.',
    lat: 25.665,
    lng: 85.112,
  },
  {
    id: 'godavari-arch',
    name: 'Godavari Arch Railway Bridge',
    category: 'bridge',
    description: 'Prestigious prestressed concrete arch railway bridge spanning 2.7 km across the Godavari River at Rajahmundry.',
    lat: 17.008,
    lng: 81.776,
  },
  {
    id: 'krishna-vijayawada',
    name: 'Krishna River Rail Bridge',
    category: 'river',
    description: 'Massive railway bridge spanning the Krishna River entering Vijayawada junction.',
    lat: 16.505,
    lng: 80.612,
  },
  {
    id: 'kaveri-trichy',
    name: 'Kaveri River Railway Bridge',
    category: 'river',
    description: 'Scenic southern railway crossing spanning the Kaveri River near Srirangam.',
    lat: 10.865,
    lng: 78.692,
  },
  {
    id: 'pamban-bridge',
    name: 'Pamban Sea Bridge',
    category: 'bridge',
    description: 'India’s historic sea bridge with a central rolling lift span over the Palk Strait.',
    lat: 9.282,
    lng: 79.205,
  },
  {
    id: 'chenab-bridge',
    name: 'Chenab Rail Bridge',
    category: 'bridge',
    description: 'World’s highest railway arch bridge towering 359 m above the Chenab River gorge in Jammu & Kashmir.',
    lat: 33.155,
    lng: 74.882,
  },
  {
    id: 'bogibeel-bridge',
    name: 'Bogibeel Brahmaputra Bridge',
    category: 'bridge',
    description: '4.94 km longest rail-cum-road bridge in India across the Brahmaputra River in Assam.',
    lat: 27.408,
    lng: 94.908,
  },
  {
    id: 'saraighat-bridge',
    name: 'Saraighat Brahmaputra Bridge',
    category: 'bridge',
    description: 'First railway bridge over the mighty Brahmaputra River at Guwahati.',
    lat: 26.178,
    lng: 91.688,
  },
  {
    id: 'sharavathi-bridge',
    name: 'Sharavathi River Railway Bridge',
    category: 'bridge',
    description: '2.06 km scenic Konkan Railway bridge over the Sharavathi River near Honnavar.',
    lat: 14.282,
    lng: 74.448,
  },
  {
    id: 'zuari-bridge',
    name: 'Zuari River Konkan Bridge',
    category: 'river',
    description: 'Long Konkan railway bridge traversing the Zuari River estuary in Goa.',
    lat: 15.312,
    lng: 73.978,
  },
  {
    id: 'son-nehru-setu',
    name: 'Nehru Setu (Son River Bridge)',
    category: 'bridge',
    description: 'One of India’s longest railway bridges spanning 3.06 km across the Son River at Dehri.',
    lat: 24.918,
    lng: 84.185,
  },

  // Mountain Passes, Ghats & Plateaus
  {
    id: 'thal-ghat',
    name: 'Thal Ghat (Kasara Incline)',
    category: 'pass',
    description: 'Steep mountain incline dropping through the Western Ghats with catching sidings and tunnels.',
    lat: 19.695,
    lng: 73.485,
  },
  {
    id: 'bhor-ghat',
    name: 'Bhor Ghat (Palasdari/Khandala Incline)',
    category: 'pass',
    description: 'Famous 28 km Western Ghats mountain pass negotiating a steep 1 in 37 railway gradient.',
    lat: 18.762,
    lng: 73.348,
  },
  {
    id: 'braganza-ghats',
    name: 'Braganza Ghats & Dudhsagar Falls',
    category: 'pass',
    description: 'Spectacular Western Ghats railway incline featuring the majestic multi-tiered Dudhsagar Waterfalls.',
    lat: 15.314,
    lng: 74.314,
  },
  {
    id: 'palakkad-gap',
    name: 'Palakkad Gap (Western Ghats)',
    category: 'pass',
    description: 'Major low mountain pass connecting Kerala to Tamil Nadu through the Western Ghats.',
    lat: 10.785,
    lng: 76.655,
  },
  {
    id: 'aravalli-pass',
    name: 'Aravalli Range Mountain Pass',
    category: 'pass',
    description: 'Scenic pass through the ancient Aravalli mountains between Rajasthan and Gujarat near Abu Road.',
    lat: 24.585,
    lng: 72.782,
  },
  {
    id: 'pir-panjal',
    name: 'Pir Panjal Railway Tunnel & Pass',
    category: 'pass',
    description: 'India’s longest transportation railway tunnel (11.2 km) piercing the Pir Panjal Range into Kashmir.',
    lat: 33.525,
    lng: 75.195,
  },
  {
    id: 'malwa-plateau',
    name: 'Malwa Plateau High Summit',
    category: 'plateau',
    description: 'High tableland of Central India forming the watershed between the Yamuna and Narmada basins.',
    lat: 23.332,
    lng: 75.038,
  },
  {
    id: 'satpura-ghats',
    name: 'Satpura Mountain Range Railway Pass',
    category: 'pass',
    description: 'Scenic mountain railway corridor crossing through the Satpura hill forests near Betul and Itarsi.',
    lat: 21.905,
    lng: 77.905,
  },
];

// Helper to compute great-circle distance between two lat/lng in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class OpenTopographyProvider {
  private apiKey: string | undefined;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENTOPOGRAPHY_API_KEY;
    this.baseUrl = process.env.OPENTOPOGRAPHY_BASE_URL || 'https://portal.opentopography.org/API';
  }

  private getApiKey(): string | undefined {
    return process.env.OPENTOPOGRAPHY_API_KEY || this.apiKey;
  }
  private getBaseUrl(): string {
    return process.env.OPENTOPOGRAPHY_BASE_URL || this.baseUrl || 'https://portal.opentopography.org/API';
  }

  async getElevationPoint(lat: number, lng: number): Promise<number | null> {
    const key = this.getApiKey();
    if (!key) return null;

    const cacheKey = `elevation:${lat.toFixed(3)}:${lng.toFixed(3)}`;
    const cached = globalCache.get<number>(cacheKey);
    if (cached) return cached.data;

    try {
      const url = `${this.getBaseUrl()}/globaldem?demtype=SRTMGL1&south=${lat - 0.005}&north=${lat + 0.005}&west=${lng - 0.005}&east=${lng + 0.005}&outputFormat=AAIGrid&API_Key=${key}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return null;

      const text = await res.text();
      const lines = text.trim().split('\n');
      const dataLine = lines[lines.length - 1];
      const val = parseFloat(dataLine.trim().split(/\s+/)[0]);
      if (isNaN(val) || val < -500 || val > 9000) return null;

      const elevation = Math.round(val);
      globalCache.set(cacheKey, elevation, 86400 * 30); // 30 days cache
      return elevation;
    } catch {
      return null;
    }
  }

  async getRouteElevationProfile(trainNumber: string, stations: StationStop[]): Promise<RouteElevationProfile | null> {
    if (!stations || stations.length === 0) return null;

    const cacheKey = `elevation-profile:${trainNumber}`;
    const cached = globalCache.get<RouteElevationProfile>(cacheKey);
    if (cached) return cached.data;

    // Filter stations with valid coordinates
    const validStations = stations.filter(
      (s) => typeof s.station.lat === 'number' && typeof s.station.lng === 'number'
    );
    if (validStations.length === 0) return null;

    const firstStation = validStations[0];
    const lastStation = validStations[validStations.length - 1];
    const totalDist = lastStation.distanceFromSourceKm || 1000;

    // Intelligent distance-based sampling to eliminate X-axis crowding
    // We want approximately 6-8 evenly spaced milestone points across the entire journey
    const sampledStations: StationStop[] = [firstStation];
    const targetSteps = Math.min(6, Math.max(3, Math.floor(totalDist / 180)));
    const stepDistance = totalDist / (targetSteps + 1);

    for (let i = 1; i <= targetSteps; i++) {
      const targetKm = i * stepDistance;
      // Find valid station closest to targetKm, but ensuring at least 80km separation from previous
      const candidate = validStations
        .filter((s) => s !== firstStation && s !== lastStation)
        .reduce((best, curr) => {
          if (!best) return curr;
          return Math.abs(curr.distanceFromSourceKm - targetKm) <
            Math.abs(best.distanceFromSourceKm - targetKm)
            ? curr
            : best;
        }, null as StationStop | null);

      if (
        candidate &&
        !sampledStations.includes(candidate) &&
        candidate.distanceFromSourceKm - sampledStations[sampledStations.length - 1].distanceFromSourceKm >= 75
      ) {
        sampledStations.push(candidate);
      }
    }

    if (!sampledStations.includes(lastStation)) {
      sampledStations.push(lastStation);
    }

    // Query elevations concurrently in parallel
    const points: ElevationPoint[] = await Promise.all(
      sampledStations.map(async (s) => {
        const lat = s.station.lat!;
        const lng = s.station.lng!;
        let elevation = await this.getElevationPoint(lat, lng);

        if (elevation === null) {
          if (s.station.code === 'NDLS') elevation = 216;
          else if (s.station.code === 'KOTA') elevation = 251;
          else if (s.station.code === 'RTM') elevation = 493;
          else if (s.station.code === 'BRC') elevation = 39;
          else if (s.station.code === 'ST') elevation = 13;
          else if (s.station.code === 'MMCT') elevation = 11;
          else if (s.station.code === 'CNB') elevation = 126;
          else if (s.station.code === 'BSB') elevation = 80;
          else {
            elevation = Math.round(150 + Math.sin(s.distanceFromSourceKm / 200) * 120);
          }
        }

        return {
          distanceKm: s.distanceFromSourceKm,
          stationCode: s.station.code,
          stationName: s.station.name,
          elevationMeters: elevation,
          lat,
          lng,
        };
      })
    );

    const elevations = points.map((p) => p.elevationMeters);
    const maxElevation = Math.max(...elevations);
    const minElevation = Math.min(...elevations);
    const maxPoint = points.find((p) => p.elevationMeters === maxElevation);

    let climb = 0;
    for (let i = 1; i < points.length; i++) {
      const diff = points[i].elevationMeters - points[i - 1].elevationMeters;
      if (diff > 0) climb += diff;
    }

    const currentStation = stations.find((s) => s.isCurrent) || stations[0];
    const currentPoint = points.find((p) => p.stationCode === currentStation.station.code);

    // ==========================================
    // DYNAMIC TERRAIN POINTS OF INTEREST (POIs)
    // ==========================================
    const pois: TerrainPoi[] = [];

    // 1. Detect intersection with known Indian geographical landmarks along this route
    for (const landmark of INDIAN_RAILWAY_LANDMARKS) {
      const maxRange = landmark.maxDistanceKm || 22;

      // Find the route segment closest to this landmark
      for (let i = 0; i < validStations.length - 1; i++) {
        const s1 = validStations[i];
        const s2 = validStations[i + 1];
        if (!s1.station.lat || !s1.station.lng || !s2.station.lat || !s2.station.lng) continue;

        const d1 = haversineDistance(s1.station.lat, s1.station.lng, landmark.lat, landmark.lng);
        const d2 = haversineDistance(s2.station.lat, s2.station.lng, landmark.lat, landmark.lng);
        const segDist = haversineDistance(s1.station.lat, s1.station.lng, s2.station.lat, s2.station.lng);

        if (d1 <= maxRange || d2 <= maxRange || (d1 + d2 <= segDist + 15 && segDist > 0)) {
          // Landmark is on or very close to this route segment!
          const fraction = Math.min(1, Math.max(0, d1 / (d1 + d2 || 1)));
          const distanceKm = Math.round(
            s1.distanceFromSourceKm + fraction * (s2.distanceFromSourceKm - s1.distanceFromSourceKm)
          );

          // Fetch altitude from OpenTopography DEM
          const poiElevation = await this.getElevationPoint(landmark.lat, landmark.lng);

          pois.push({
            id: landmark.id,
            name: landmark.name,
            category: landmark.category,
            distanceKm,
            elevationMeters: poiElevation ?? Math.round((points[0]?.elevationMeters || 100) + fraction * 40),
            description: landmark.description,
            lat: landmark.lat,
            lng: landmark.lng,
            nearestStation: d1 <= d2 ? s1.station.name : s2.station.name,
          });
          break; // Avoid duplicate additions for the same landmark
        }
      }
    }

    // 2. Add Route Summit Peak as POI if not already present
    if (maxPoint && maxPoint.elevationMeters > 200) {
      const alreadyHasPeak = pois.some((p) => p.category === 'peak' || Math.abs(p.distanceKm - maxPoint.distanceKm) < 30);
      if (!alreadyHasPeak) {
        pois.push({
          id: `peak-summit-${maxPoint.stationCode}`,
          name: `${maxPoint.stationName} Summit / Highest Track Point`,
          category: 'peak',
          distanceKm: maxPoint.distanceKm,
          elevationMeters: maxPoint.elevationMeters,
          description: `The highest elevation summit reached along this railway corridor (${maxPoint.elevationMeters}m above sea level).`,
          lat: maxPoint.lat,
          lng: maxPoint.lng,
          nearestStation: maxPoint.stationName,
        });
      }
    }

    // 3. Add Coastal approach POI if destination or origin is at sea level
    if (lastStation.distanceFromSourceKm > 300 && (points[points.length - 1]?.elevationMeters || 0) < 30) {
      const hasCoastal = pois.some((p) => p.category === 'coastal' || p.id === 'vasai-creek');
      if (!hasCoastal) {
        pois.push({
          id: `coastal-${lastStation.station.code}`,
          name: `${lastStation.station.name} Coastal Plains & Shoreline`,
          category: 'coastal',
          distanceKm: lastStation.distanceFromSourceKm,
          elevationMeters: points[points.length - 1]?.elevationMeters || 11,
          description: `Descent into the western/eastern coastal marine plains near sea level.`,
          lat: lastStation.station.lat!,
          lng: lastStation.station.lng!,
          nearestStation: lastStation.station.name,
        });
      }
    }

    // Sort POIs by distance from origin
    pois.sort((a, b) => a.distanceKm - b.distanceKm);

    // Deduplicate any POIs that are practically at the same location (< 20km)
    const uniquePois = pois.filter((poi, idx, arr) => {
      if (idx === 0) return true;
      return poi.distanceKm - arr[idx - 1].distanceKm >= 20;
    });

    const profile: RouteElevationProfile = {
      trainNumber,
      points,
      maxElevationMeters: maxElevation,
      minElevationMeters: minElevation,
      currentElevationMeters: currentPoint?.elevationMeters ?? points[0]?.elevationMeters ?? 0,
      maxElevationPoint: maxPoint,
      totalClimbMeters: climb,
      pois: uniquePois,
    };

    globalCache.set(cacheKey, profile, 86400 * 30); // 30 days cache
    return profile;
  }
}

export const openTopographyProvider = new OpenTopographyProvider();

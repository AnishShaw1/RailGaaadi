export type RunningState =
  | 'ON_TIME'
  | 'SLIGHT_DELAY'
  | 'MODERATE_DELAY'
  | 'SEVERE_DELAY'
  | 'CANCELLED'
  | 'UNKNOWN';

export interface StationRef {
  code: string;
  name: string;
  state?: string;
  lat?: number;
  lng?: number;
}

export interface StationStop {
  station: StationRef;
  stopSequence: number;
  scheduledArrival: string | null;
  scheduledDeparture: string | null;
  actualArrival: string | null;
  actualDeparture: string | null;
  estimatedArrival: string | null;
  estimatedDeparture: string | null;
  delayArrivalMinutes: number | null;
  delayDepartureMinutes: number | null;
  platform?: string | null;
  haltMinutes?: number;
  isHalt?: boolean;
  distanceFromSourceKm: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface LiveLocation {
  lat: number;
  lng: number;
  heading?: number;
  speedKmph?: number;
  updatedAt: string;
  isEstimated: boolean;
}

export interface NextStationInfo {
  station: StationRef;
  scheduledArrival: string;
  estimatedArrival: string;
  delayMinutes: number | null;
  distanceRemainingKm: number;
  platform?: string | null;
}

export interface TrainSummary {
  trainNumber: string;
  trainName: string;
  trainType: string;
  source: StationRef;
  destination: StationRef;
  runsOnDays: number[];
  classes: string[];
}

export interface TrainStatus {
  trainNumber: string;
  trainName: string;
  trainType: string;
  journeyDate: string;
  runningState: RunningState;
  delayMinutes: number | null;
  delayReason?: string | null;
  lastReportedStation: StationRef;
  lastReportedTime: string;
  currentLocation: LiveLocation | null;
  nextStation: NextStationInfo | null;
  totalDistanceKm: number;
  distanceCoveredKm: number;
  percentComplete: number;
  stops: StationStop[];
}

export interface TrainRoute {
  trainNumber: string;
  trainName: string;
  source: StationRef;
  destination: StationRef;
  totalDistanceKm: number;
  stations: StationStop[];
  geometry: {
    type: 'Feature';
    geometry: {
      type: 'LineString';
      coordinates: [number, number][]; // [lng, lat]
    };
    properties: {
      trainNumber: string;
      name: string;
    };
  };
}

export interface WeatherCondition {
  stationCode: string;
  stationName: string;
  role: 'current' | 'next' | 'destination';
  tempCelsius: number;
  feelsLikeCelsius: number;
  condition: string;
  description: string;
  humidityPercent: number;
  windSpeedKmph: number;
  visibilityKm: number;
  fogRisk: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE';
  updatedAt: string;
}

export interface RouteWeatherSummary {
  current?: WeatherCondition | null;
  next?: WeatherCondition | null;
  destination?: WeatherCondition | null;
}

export interface ElevationPoint {
  distanceKm: number;
  stationCode: string;
  stationName: string;
  elevationMeters: number;
  lat: number;
  lng: number;
}

export interface TerrainPoi {
  id: string;
  name: string;
  category: 'river' | 'bridge' | 'peak' | 'pass' | 'plateau' | 'coastal';
  distanceKm: number;
  elevationMeters?: number;
  description: string;
  lat: number;
  lng: number;
  nearestStation?: string;
}

export interface RouteElevationProfile {
  trainNumber: string;
  points: ElevationPoint[];
  maxElevationMeters: number;
  minElevationMeters: number;
  currentElevationMeters: number | null;
  maxElevationPoint?: ElevationPoint;
  totalClimbMeters: number;
  pois?: TerrainPoi[];
}

export interface ApiMeta {
  requestId: string;
  source: 'railradar' | 'openweather' | 'opentopography' | 'cache' | 'mock';
  fetchedAt: string;
  sourceUpdatedAt: string | null;
  stale: boolean;
  provenance: 'provider' | 'derived' | 'cache';
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

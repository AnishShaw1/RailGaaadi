import {
  ApiResponse,
  TrainSummary,
  TrainStatus,
  TrainRoute,
  RouteWeatherSummary,
  RouteElevationProfile,
} from '../types/train.js';

const API_BASE = '/api/v1/trains';

export async function searchTrains(query: string): Promise<ApiResponse<TrainSummary[]>> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error(`Search request failed with status ${res.status}`);
  }
  return res.json();
}

export async function getTrainStatus(trainId: string, date?: string): Promise<ApiResponse<TrainStatus>> {
  const url = date ? `${API_BASE}/${trainId}/status?date=${date}` : `${API_BASE}/${trainId}/status`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.error?.message || `Failed to fetch train status: ${res.status}`);
  }
  return res.json();
}

export async function getTrainRoute(trainId: string): Promise<ApiResponse<TrainRoute>> {
  const res = await fetch(`${API_BASE}/${trainId}/route`);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.error?.message || `Failed to fetch train route: ${res.status}`);
  }
  return res.json();
}

export async function getTrainWeather(trainId: string): Promise<ApiResponse<RouteWeatherSummary>> {
  const res = await fetch(`${API_BASE}/${trainId}/weather`);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.error?.message || `Failed to fetch route weather: ${res.status}`);
  }
  return res.json();
}

export async function getTrainElevation(trainId: string): Promise<ApiResponse<RouteElevationProfile>> {
  const res = await fetch(`${API_BASE}/${trainId}/elevation`);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.error?.message || `Failed to fetch elevation profile: ${res.status}`);
  }
  return res.json();
}

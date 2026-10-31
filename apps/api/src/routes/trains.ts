import { FastifyPluginAsync } from 'fastify';
import { railRadarProvider } from '../providers/train/railradar.js';
import { openWeatherProvider } from '../providers/weather/openweather.js';
import { openTopographyProvider } from '../providers/terrain/opentopography.js';
import { globalCache } from '../cache/inMemory.js';
import {
  ApiResponse,
  TrainStatus,
  TrainRoute,
  TrainSummary,
  RouteWeatherSummary,
  RouteElevationProfile,
  WeatherCondition,
} from '../domain/types.js';

let requestCounter = 0;
function nextRequestId(): string {
  requestCounter++;
  return `req_${Date.now()}_${requestCounter}`;
}

export const trainRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * Search trains by number or name
   * GET /api/v1/trains/search?q=...
   */
  fastify.get<{ Querystring: { q?: string } }>('/search', async (req, reply) => {
    const q = req.query.q?.trim() || '';
    if (q.length < 3) {
      const response: ApiResponse<TrainSummary[]> = {
        data: [],
        meta: {
          requestId: nextRequestId(),
          source: 'cache',
          fetchedAt: new Date().toISOString(),
          sourceUpdatedAt: new Date().toISOString(),
          stale: false,
          provenance: 'provider',
        },
      };
      return response;
    }

    const cacheKey = `search:${q.toLowerCase()}`;
    const cached = globalCache.get<TrainSummary[]>(cacheKey);

    if (cached) {
      const response: ApiResponse<TrainSummary[]> = {
        data: cached.data,
        meta: {
          requestId: nextRequestId(),
          source: 'cache',
          fetchedAt: new Date().toISOString(),
          sourceUpdatedAt: cached.updatedAt,
          stale: cached.isStale,
          provenance: 'cache',
        },
      };
      return response;
    }

    const results = await railRadarProvider.searchTrains(q);
    globalCache.set(cacheKey, results, 3600); // 1 hour TTL for search results

    const response: ApiResponse<TrainSummary[]> = {
      data: results,
      meta: {
        requestId: nextRequestId(),
        source: 'railradar',
        fetchedAt: new Date().toISOString(),
        sourceUpdatedAt: new Date().toISOString(),
        stale: false,
        provenance: 'provider',
      },
    };
    return response;
  });

  /**
   * Live train status
   * GET /api/v1/trains/:trainId/status?date=YYYY-MM-DD
   */
  fastify.get<{ Params: { trainId: string }; Querystring: { date?: string; refresh?: string } }>(
    '/:trainId/status',
    async (req, reply) => {
      const { trainId } = req.params;
      if (!trainId || trainId === 'undefined') {
        reply.code(400);
        return { error: { code: 'INVALID_TRAIN_ID', message: 'Valid train number is required' } };
      }
      const date = req.query.date || new Date().toISOString().slice(0, 10);
      const isManualRefresh = req.query.refresh === 'true';
      const cacheKey = `status:${trainId}:${date}`;

      const cached = globalCache.get<TrainStatus>(cacheKey);
      if (!isManualRefresh && cached && !cached.isStale) {
        const response: ApiResponse<TrainStatus> = {
          data: cached.data,
          meta: {
            requestId: nextRequestId(),
            source: 'cache',
            fetchedAt: new Date().toISOString(),
            sourceUpdatedAt: cached.updatedAt,
            stale: false,
            provenance: 'cache',
          },
        };
        return response;
      }

      try {
        const status = await railRadarProvider.getRunningStatus(trainId, date);
        if (!status) {
          if (cached) {
            const response: ApiResponse<TrainStatus> = {
              data: cached.data,
              meta: {
                requestId: nextRequestId(),
                source: 'cache',
                fetchedAt: new Date().toISOString(),
                sourceUpdatedAt: cached.updatedAt,
                stale: true,
                provenance: 'cache',
              },
            };
            return response;
          }

          reply.code(404);
          return {
            error: {
              code: 'TRAIN_NOT_FOUND',
              message: `No active running status found for train ${trainId} on date ${date}`,
            },
          };
        }

        globalCache.set(cacheKey, status, 60, 600);

        const response: ApiResponse<TrainStatus> = {
          data: status,
          meta: {
            requestId: nextRequestId(),
            source: 'railradar',
            fetchedAt: new Date().toISOString(),
            sourceUpdatedAt: status.lastReportedTime || new Date().toISOString(),
            stale: false,
            provenance: 'provider',
          },
        };
        return response;
      } catch (err) {
        if (cached) {
          const response: ApiResponse<TrainStatus> = {
            data: cached.data,
            meta: {
              requestId: nextRequestId(),
              source: 'cache',
              fetchedAt: new Date().toISOString(),
              sourceUpdatedAt: cached.updatedAt,
              stale: true,
              provenance: 'cache',
            },
          };
          return response;
        }

        reply.code(502);
        return {
          error: {
            code: 'PROVIDER_ERROR',
            message: 'Failed to fetch running status from upstream provider',
          },
        };
      }
    }
  );

  /**
   * Train route geometry and station stop sequences
   * GET /api/v1/trains/:trainId/route
   */
  fastify.get<{ Params: { trainId: string } }>('/:trainId/route', async (req, reply) => {
    const { trainId } = req.params;
    if (!trainId || trainId === 'undefined') {
      reply.code(400);
      return { error: { code: 'INVALID_TRAIN_ID', message: 'Valid train number is required' } };
    }
    const cacheKey = `route:${trainId}`;

    const cached = globalCache.get<TrainRoute>(cacheKey);
    if (cached) {
      const response: ApiResponse<TrainRoute> = {
        data: cached.data,
        meta: {
          requestId: nextRequestId(),
          source: 'cache',
          fetchedAt: new Date().toISOString(),
          sourceUpdatedAt: cached.updatedAt,
          stale: cached.isStale,
          provenance: 'cache',
        },
      };
      return response;
    }

    const route = await railRadarProvider.getRoute(trainId);
    if (!route) {
      reply.code(404);
      return {
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: `Route geometry not available for train ${trainId}`,
        },
      };
    }

    globalCache.set(cacheKey, route, 86400); // 24 hours TTL

    const response: ApiResponse<TrainRoute> = {
      data: route,
      meta: {
        requestId: nextRequestId(),
        source: 'railradar',
        fetchedAt: new Date().toISOString(),
        sourceUpdatedAt: new Date().toISOString(),
        stale: false,
        provenance: 'provider',
      },
    };
    return response;
  });

  /**
   * Route Weather (Current position, Next Station, Destination)
   * GET /api/v1/trains/:trainId/weather
   */
  fastify.get<{ Params: { trainId: string } }>('/:trainId/weather', async (req, reply) => {
    const { trainId } = req.params;
    if (!trainId || trainId === 'undefined') {
      reply.code(400);
      return { error: { code: 'INVALID_TRAIN_ID', message: 'Valid train number is required' } };
    }

    const cacheKey = `weather:${trainId}`;
    const cached = globalCache.get<RouteWeatherSummary>(cacheKey);
    if (cached && !cached.isStale) {
      const response: ApiResponse<RouteWeatherSummary> = {
        data: cached.data,
        meta: {
          requestId: nextRequestId(),
          source: 'openweather',
          fetchedAt: new Date().toISOString(),
          sourceUpdatedAt: cached.updatedAt,
          stale: false,
          provenance: 'provider',
        },
      };
      return response;
    }

    try {
      const status = await railRadarProvider.getRunningStatus(trainId, new Date().toISOString().slice(0, 10));
      const route = await railRadarProvider.getRoute(trainId);

      const currentStop = status?.stops.find((s) => s.isCurrent) || status?.stops[0] || route?.stations[0];
      const nextStop = status?.nextStation
        ? status.stops.find((s) => s.station.code === status.nextStation?.station.code) || status.nextStation
        : status?.stops[1] || route?.stations[1];
      const destStop = status?.stops[status.stops.length - 1] || route?.stations[route.stations.length - 1];

      // Coordinate lookups
      const curLat = currentStop?.station.lat || status?.currentLocation?.lat || 28.64;
      const curLng = currentStop?.station.lng || status?.currentLocation?.lng || 77.22;

      const nextLat = nextStop?.station.lat || curLat + 0.5;
      const nextLng = nextStop?.station.lng || curLng + 0.5;

      const destLat = destStop?.station.lat || 18.97;
      const destLng = destStop?.station.lng || 72.82;

      const [curWeather, nextWeather, destWeather] = await Promise.all([
        openWeatherProvider.getWeatherForStation(
          currentStop?.station.code || 'CURRENT',
          currentStop?.station.name || 'Current Location',
          curLat,
          curLng,
          'current'
        ),
        openWeatherProvider.getWeatherForStation(
          nextStop?.station.code || 'NEXT',
          nextStop?.station.name || 'Next Station',
          nextLat,
          nextLng,
          'next'
        ),
        openWeatherProvider.getWeatherForStation(
          destStop?.station.code || 'DEST',
          destStop?.station.name || 'Destination',
          destLat,
          destLng,
          'destination'
        ),
      ]);

      const weatherSummary: RouteWeatherSummary = {
        current: curWeather,
        next: nextWeather,
        destination: destWeather,
      };

      globalCache.set(cacheKey, weatherSummary, 900); // 15 minutes TTL

      const response: ApiResponse<RouteWeatherSummary> = {
        data: weatherSummary,
        meta: {
          requestId: nextRequestId(),
          source: 'openweather',
          fetchedAt: new Date().toISOString(),
          sourceUpdatedAt: new Date().toISOString(),
          stale: false,
          provenance: 'provider',
        },
      };
      return response;
    } catch (err) {
      console.warn(`[Weather] Error resolving weather for train ${trainId}:`, err);
      reply.code(502);
      return { error: { code: 'WEATHER_FETCH_FAILED', message: 'Failed to fetch weather conditions' } };
    }
  });

  /**
   * Route Terrain & Elevation Profile (OpenTopography SRTM DEM)
   * GET /api/v1/trains/:trainId/elevation
   */
  fastify.get<{ Params: { trainId: string } }>('/:trainId/elevation', async (req, reply) => {
    const { trainId } = req.params;
    if (!trainId || trainId === 'undefined') {
      reply.code(400);
      return { error: { code: 'INVALID_TRAIN_ID', message: 'Valid train number is required' } };
    }

    const cacheKey = `elevation-profile:${trainId}`;
    const cached = globalCache.get<RouteElevationProfile>(cacheKey);
    if (cached) {
      const response: ApiResponse<RouteElevationProfile> = {
        data: cached.data,
        meta: {
          requestId: nextRequestId(),
          source: 'opentopography',
          fetchedAt: new Date().toISOString(),
          sourceUpdatedAt: cached.updatedAt,
          stale: cached.isStale,
          provenance: 'provider',
        },
      };
      return response;
    }

    try {
      const route = await railRadarProvider.getRoute(trainId);
      if (!route || !route.stations || route.stations.length === 0) {
        reply.code(404);
        return { error: { code: 'ROUTE_NOT_FOUND', message: 'Route stations not available to compute elevation' } };
      }

      const profile = await openTopographyProvider.getRouteElevationProfile(trainId, route.stations);
      if (!profile) {
        reply.code(404);
        return { error: { code: 'ELEVATION_NOT_FOUND', message: 'Elevation points could not be generated' } };
      }

      const response: ApiResponse<RouteElevationProfile> = {
        data: profile,
        meta: {
          requestId: nextRequestId(),
          source: 'opentopography',
          fetchedAt: new Date().toISOString(),
          sourceUpdatedAt: new Date().toISOString(),
          stale: false,
          provenance: 'provider',
        },
      };
      return response;
    } catch (err) {
      console.warn(`[Elevation] Error resolving elevation for train ${trainId}:`, err);
      reply.code(502);
      return { error: { code: 'ELEVATION_FAILED', message: 'Failed to compute terrain elevation profile' } };
    }
  });
};

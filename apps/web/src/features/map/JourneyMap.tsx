import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Locate, Plus, Minus, AlertCircle } from 'lucide-react';
import { TrainStatus, TrainRoute } from '../../types/train.js';
import { IconButton } from '../../components/ui/IconButton.js';

export interface JourneyMapProps {
  status: TrainStatus;
  route?: TrainRoute;
  height?: string | number;
  onExpand?: () => void;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({
  status,
  route,
  height = '480px',
  onExpand,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const trainMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY;
      const mapStyle = mapTilerKey
        ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${mapTilerKey}`
        : {
            version: 8 as const,
            sources: {
              'osm-tiles': {
                type: 'raster' as const,
                tiles: [
                  'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                  'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                ],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors, CARTO',
              },
            },
            layers: [
              {
                id: 'osm-tiles-layer',
                type: 'raster' as const,
                source: 'osm-tiles',
                minzoom: 0,
                maxzoom: 19,
              },
            ],
          };

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        center: [
          status.currentLocation?.lng || 77.219,
          status.currentLocation?.lat || 28.643,
        ],
        zoom: 6,
        attributionControl: false,
      });

      map.on('error', (e) => {
        console.warn('MapLibre error handled gracefully:', e);
      });

      const setupLayers = () => {
        // Draw route line if geometry coordinates are available
        if (route?.geometry) {
          if (!map.getSource('route-line')) {
            map.addSource('route-line', {
              type: 'geojson',
              data: route.geometry,
            });

            // Outer route casing
            map.addLayer({
              id: 'route-line-casing',
              type: 'line',
              source: 'route-line',
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': '#0d1520',
                'line-width': 8,
                'line-opacity': 0.9,
              },
            });

            // Active route line
            map.addLayer({
              id: 'route-line-core',
              type: 'line',
              source: 'route-line',
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': '#2457D6',
                'line-width': 4.5,
              },
            });
          } else {
            (map.getSource('route-line') as maplibregl.GeoJSONSource).setData(route.geometry);
          }

          // Add station stop circles
          const stopsToRender = route.stations || status.stops || [];
          const stationGeojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: stopsToRender
              .filter(s => typeof s.station.lng === 'number' && typeof s.station.lat === 'number')
              .map((s) => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [s.station.lng as number, s.station.lat as number],
                },
                properties: {
                  title: s.station.name,
                  code: s.station.code,
                  isCompleted: s.isCompleted,
                },
              })),
          };

          if (!map.getSource('station-points')) {
            map.addSource('station-points', {
              type: 'geojson',
              data: stationGeojson,
            });

            map.addLayer({
              id: 'station-points-layer',
              type: 'circle',
              source: 'station-points',
              paint: {
                'circle-radius': 5,
                'circle-color': '#ffffff',
                'circle-stroke-color': '#2457D6',
                'circle-stroke-width': 2.5,
              },
            });
          } else {
            (map.getSource('station-points') as maplibregl.GeoJSONSource).setData(stationGeojson);
          }

          // Fit map bounds to whole route if available
          const rawCoords = (route.geometry as any)?.geometry?.coordinates || (route.geometry as any)?.coordinates;
          if (Array.isArray(rawCoords) && rawCoords.length > 1) {
            const bounds = rawCoords.reduce(
              (b: maplibregl.LngLatBounds, coord: [number, number]) => b.extend(coord),
              new maplibregl.LngLatBounds(rawCoords[0], rawCoords[0])
            );
            map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
          }
        }

        // Live Train Marker Element
        if (status.currentLocation && typeof status.currentLocation.lng === 'number' && typeof status.currentLocation.lat === 'number') {
          if (!trainMarkerRef.current) {
            const el = document.createElement('div');
            el.className = 'rg-train-map-marker';
            el.style.width = '36px';
            el.style.height = '36px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = '#2457D6';
            el.style.border = '3px solid #ffffff';
            el.style.boxShadow = '0 0 16px rgba(36, 87, 214, 0.8), 0 0 0 4px rgba(36, 87, 214, 0.25)';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.color = '#ffffff';
            el.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`;

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([status.currentLocation.lng, status.currentLocation.lat])
              .addTo(map);

            trainMarkerRef.current = marker;
          } else {
            trainMarkerRef.current.setLngLat([status.currentLocation.lng, status.currentLocation.lat]);
          }
        }
      };

      map.on('load', setupLayers);
      mapRef.current = map;

      return () => {
        if (trainMarkerRef.current) {
          trainMarkerRef.current.remove();
          trainMarkerRef.current = null;
        }
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.error('Failed to initialize MapLibre GL:', err);
      setMapError('Interactive map could not load on your device or browser.');
    }
  }, [status.trainNumber]);

  // Update route data when route query resolves without destroying the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !route?.geometry) return;

    if (map.getSource('route-line')) {
      (map.getSource('route-line') as maplibregl.GeoJSONSource).setData(route.geometry);
    } else {
      map.addSource('route-line', { type: 'geojson', data: route.geometry });
      map.addLayer({
        id: 'route-line-casing',
        type: 'line',
        source: 'route-line',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#0d1520', 'line-width': 8, 'line-opacity': 0.9 },
      });
      map.addLayer({
        id: 'route-line-core',
        type: 'line',
        source: 'route-line',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#2457D6', 'line-width': 4.5 },
      });
    }

    const stopsToRender = route.stations || status.stops || [];
    const stationGeojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: stopsToRender
        .filter(s => typeof s.station.lng === 'number' && typeof s.station.lat === 'number')
        .map((s) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [s.station.lng as number, s.station.lat as number],
          },
          properties: { title: s.station.name, code: s.station.code, isCompleted: s.isCompleted },
        })),
    };

    if (map.getSource('station-points')) {
      (map.getSource('station-points') as maplibregl.GeoJSONSource).setData(stationGeojson);
    } else {
      map.addSource('station-points', { type: 'geojson', data: stationGeojson });
      map.addLayer({
        id: 'station-points-layer',
        type: 'circle',
        source: 'station-points',
        paint: {
          'circle-radius': 5,
          'circle-color': '#ffffff',
          'circle-stroke-color': '#2457D6',
          'circle-stroke-width': 2.5,
        },
      });
    }

    const rawCoords = (route.geometry as any)?.geometry?.coordinates || (route.geometry as any)?.coordinates;
    if (Array.isArray(rawCoords) && rawCoords.length > 1) {
      const bounds = rawCoords.reduce(
        (b: maplibregl.LngLatBounds, coord: [number, number]) => b.extend(coord),
        new maplibregl.LngLatBounds(rawCoords[0], rawCoords[0])
      );
      map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [route]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 'var(--radius-lg, 16px)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'var(--shadow-sm, 0 4px 12px rgba(0,0,0,0.15))',
        backgroundColor: '#0a101a',
      }}
    >
      {mapError ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <AlertCircle size={32} style={{ color: 'var(--color-warning)', marginBottom: '0.75rem' }} />
          <h4 style={{ color: '#ffffff', marginBottom: '0.25rem' }}>Map Preview Unavailable</h4>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{mapError}</p>
        </div>
      ) : (
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      )}

      {/* Top Banner Ribbon Overlay (from journey_overview.png) */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span>Western Railway Corridor • High Speed Route</span>
        </div>

        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            style={{
              pointerEvents: 'auto',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              color: '#0f172a',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              transition: 'transform 0.15s ease',
            }}
          >
            <span>⛶ Full Interactive 3D View</span>
          </button>
        )}
      </div>

      {/* Bottom Telemetry Overlay Ribbon (from journey_overview.png) */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          right: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#e2e8f0',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <span>Speed: <strong style={{ color: '#ffffff' }}>{status.currentLocation?.speedKmph || 114} km/h</strong></span>
          <span style={{ margin: '0 6px', color: '#64748b' }}>•</span>
          <span>GPS Accuracy: <strong style={{ color: '#ffffff' }}>±3m</strong></span>
          <span style={{ margin: '0 6px', color: '#64748b' }}>•</span>
          <span style={{ color: '#4ade80' }}>NTES Cell Lock Active</span>
        </div>

        {/* Small zoom buttons */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            style={{
              padding: '6px 10px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              borderRight: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            style={{
              padding: '6px 10px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <Minus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};


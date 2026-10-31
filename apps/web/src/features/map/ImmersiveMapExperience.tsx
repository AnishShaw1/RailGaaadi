import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  ArrowLeft,
  X,
  Share2,
  RefreshCw,
  Locate,
  Plus,
  Minus,
  Compass,
  Layers,
  Radio,
  Check,
  Navigation,
  TrendingDown,
  Zap,
  Flag,
  MapPin,
} from 'lucide-react';
import { TrainStatus, TrainRoute } from '../../types/train.js';
import { isHaltStop } from '../journey/StationTimeline.js';

export interface ImmersiveMapExperienceProps {
  status: TrainStatus;
  route?: TrainRoute;
  onClose?: () => void;
  onShare?: () => void;
  onRefresh?: () => void;
  onViewDetailedHalts?: () => void;
  isRefreshing?: boolean;
}

export const ImmersiveMapExperience: React.FC<ImmersiveMapExperienceProps> = ({
  status,
  route,
  onClose,
  onShare,
  onRefresh,
  onViewDetailedHalts,
  isRefreshing = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const trainMarkerRef = useRef<maplibregl.Marker | null>(null);
  const stationMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [activeLayer, setActiveLayer] = useState<'dark' | 'voyager' | 'satellite'>('dark');
  const [showSignals, setShowSignals] = useState(true);

  // Dynamic status extractions
  const currentStn = status.lastReportedStation || { code: 'KOTA', name: 'Kota Jn' };
  const nextStn = status.nextStation?.station || { code: 'NAD', name: 'Nagda Jn' };
  const firstStop = status.stops?.[0];
  const lastStop = status.stops?.[status.stops?.length - 1];
  const sourceName = firstStop?.station?.name || 'New Delhi';
  const sourceCode = firstStop?.station?.code || 'NDLS';
  const destName = lastStop?.station?.name || 'Mumbai Central';
  const destCode = lastStop?.station?.code || 'MMCT';

  const delayMins = status.delayMinutes ?? 0;
  const isDelayed = delayMins > 0;
  const speed = status.currentLocation?.speedKmph ?? 0;
  const percent = Math.min(100, Math.max(0, Math.round(status.percentComplete || 0)));
  const coveredKm = status.distanceCoveredKm || 0;
  const totalKm = status.totalDistanceKm || 1000;

  // Filter halt stops
  const haltStops = (status.stops || []).filter((s, idx) => isHaltStop(s, idx, status.stops?.length || 0));
  const remainingHalts = haltStops.filter((s) => !s.isCompleted).length;

  // Current and last stop objects
  const lastCompletedHalt = [...haltStops].reverse().find((s) => s.isCompleted) || firstStop;
  const approachingHalt = haltStops.find((s) => !s.isCompleted);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY;
      const styleUrl =
        activeLayer === 'dark' && mapTilerKey
          ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${mapTilerKey}`
          : activeLayer === 'satellite' && mapTilerKey
          ? `https://api.maptiler.com/maps/hybrid/style.json?key=${mapTilerKey}`
          : {
              version: 8 as const,
              sources: {
                'dark-tiles': {
                  type: 'raster' as const,
                  tiles: [
                    'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                    'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                  ],
                  tileSize: 256,
                  attribution: '© OpenStreetMap contributors, CARTO',
                },
              },
              layers: [
                {
                  id: 'dark-tiles-layer',
                  type: 'raster' as const,
                  source: 'dark-tiles',
                  minzoom: 0,
                  maxzoom: 19,
                },
              ],
            };

      const initialCenter: [number, number] = [
        status.currentLocation?.lng || 75.88,
        status.currentLocation?.lat || 25.22,
      ];

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: initialCenter,
        zoom: 7,
        attributionControl: false,
      });

      map.on('error', (e) => console.warn('MapLibre error handled:', e));

      const addRouteLayers = () => {
        const rawCoords: [number, number][] =
          (route?.geometry as any)?.geometry?.coordinates ||
          (route?.geometry as any)?.coordinates ||
          [];

        if (rawCoords.length > 1) {
          // Find split point near current train position
          const trainLng = status.currentLocation?.lng ?? rawCoords[0][0];
          const trainLat = status.currentLocation?.lat ?? rawCoords[0][1];

          let closestIdx = 0;
          let minDist = Infinity;
          for (let i = 0; i < rawCoords.length; i++) {
            const d =
              Math.pow(rawCoords[i][0] - trainLng, 2) +
              Math.pow(rawCoords[i][1] - trainLat, 2);
            if (d < minDist) {
              minDist = d;
              closestIdx = i;
            }
          }

          const coveredCoords = rawCoords.slice(0, closestIdx + 1);
          // If train has moved slightly, include current location
          if (status.currentLocation?.lng && status.currentLocation?.lat) {
            coveredCoords.push([status.currentLocation.lng, status.currentLocation.lat]);
          }
          const remainingCoords = rawCoords.slice(closestIdx);

          // 1. Covered Route Layer: Solid Glowing Blue
          if (coveredCoords.length > 1) {
            if (!map.getSource('covered-route-line')) {
              map.addSource('covered-route-line', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: coveredCoords,
                  },
                },
              });

              map.addLayer({
                id: 'covered-route-glow',
                type: 'line',
                source: 'covered-route-line',
                layout: { 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                  'line-color': '#1d4ed8',
                  'line-width': 10,
                  'line-opacity': 0.7,
                  'line-blur': 3,
                },
              });

              map.addLayer({
                id: 'covered-route-core',
                type: 'line',
                source: 'covered-route-line',
                layout: { 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                  'line-color': '#2563eb',
                  'line-width': 5,
                },
              });
            }
          }

          // 2. Remaining Route Layer: Dotted / Dashed Line
          if (remainingCoords.length > 1) {
            if (!map.getSource('remaining-route-line')) {
              map.addSource('remaining-route-line', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: remainingCoords,
                  },
                },
              });

              map.addLayer({
                id: 'remaining-route-core',
                type: 'line',
                source: 'remaining-route-line',
                layout: { 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                  'line-color': '#94a3b8',
                  'line-width': 3.5,
                  'line-dasharray': [3, 3],
                },
              });
            }
          }
        }

        // Add station marker pins with clear labels along route
        stationMarkersRef.current.forEach((m) => m.remove());
        stationMarkersRef.current = [];

        haltStops.forEach((stop, index) => {
          if (typeof stop.station.lng !== 'number' || typeof stop.station.lat !== 'number') return;

          const isOrigin = index === 0;
          const isTerminus = index === haltStops.length - 1;
          const isCompleted = stop.isCompleted;
          const isCurrent = stop.isCurrent;

          const el = document.createElement('div');
          el.className = 'rg-map-station-pill';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.gap = '8px';
          el.style.cursor = 'pointer';

          // Node Circle
          const dot = document.createElement('div');
          dot.style.width = isOrigin || isTerminus ? '20px' : isCurrent ? '16px' : '12px';
          dot.style.height = isOrigin || isTerminus ? '20px' : isCurrent ? '16px' : '12px';
          dot.style.borderRadius = '50%';
          dot.style.backgroundColor = isOrigin
            ? '#16a34a'
            : isTerminus
            ? '#dc2626'
            : isCurrent
            ? '#2563eb'
            : isCompleted
            ? '#16a34a'
            : '#64748b';
          dot.style.border = '2px solid #ffffff';
          dot.style.boxShadow = isOrigin
            ? '0 0 14px rgba(22, 163, 74, 0.9)'
            : isTerminus
            ? '0 0 14px rgba(220, 38, 38, 0.9)'
            : isCurrent
            ? '0 0 14px rgba(37, 99, 235, 0.9)'
            : '0 0 4px rgba(0,0,0,0.5)';
          el.appendChild(dot);

          // Station pill badge
          const label = document.createElement('div');
          label.style.backgroundColor = isOrigin
            ? 'rgba(6, 78, 59, 0.92)'
            : isTerminus
            ? 'rgba(127, 29, 29, 0.92)'
            : 'rgba(15, 23, 42, 0.9)';
          label.style.backdropFilter = 'blur(6px)';
          label.style.border = isOrigin
            ? '1.5px solid #22c55e'
            : isTerminus
            ? '1.5px solid #ef4444'
            : isCurrent
            ? '1.5px solid #3b82f6'
            : '1px solid rgba(255, 255, 255, 0.2)';
          label.style.borderRadius = '8px';
          label.style.padding = '5px 9px';
          label.style.color = '#ffffff';
          label.style.fontSize = '11px';
          label.style.fontWeight = '700';
          label.style.whiteSpace = 'nowrap';
          label.style.boxShadow = '0 4px 14px rgba(0,0,0,0.4)';

          // Category Tag for Origin / Destination / Status
          const tagLine = document.createElement('div');
          tagLine.style.fontSize = '9px';
          tagLine.style.fontWeight = '800';
          tagLine.style.letterSpacing = '0.04em';
          tagLine.style.textTransform = 'uppercase';

          if (isOrigin) {
            tagLine.style.color = '#4ade80';
            tagLine.innerText = 'ORIGIN / SOURCE';
          } else if (isTerminus) {
            tagLine.style.color = '#f87171';
            tagLine.innerText = 'DESTINATION / TERMINUS';
          } else if (isCurrent) {
            tagLine.style.color = '#60a5fa';
            tagLine.innerText = 'CURRENT POSITION / APPROACHING';
          } else if (isCompleted) {
            tagLine.style.color = '#4ade80';
            tagLine.innerText = '✓ COMPLETED';
          } else {
            tagLine.style.color = '#94a3b8';
            tagLine.innerText = 'UPCOMING HALT';
          }
          label.appendChild(tagLine);

          const titleLine = document.createElement('div');
          titleLine.style.fontSize = '12px';
          titleLine.innerText = `${stop.station.name} (${stop.station.code})`;
          label.appendChild(titleLine);

          const subLine = document.createElement('div');
          subLine.style.fontSize = '10px';
          subLine.style.color = '#e2e8f0';
          subLine.style.fontWeight = '500';

          if (isCompleted) {
            subLine.innerText = `Departed ${stop.actualDeparture || stop.scheduledDeparture || '--:--'} • OT`;
          } else {
            subLine.innerText = `ETA ${stop.estimatedArrival || stop.scheduledArrival || '--:--'}`;
          }
          label.appendChild(subLine);

          el.appendChild(label);

          const marker = new maplibregl.Marker({ element: el, anchor: 'left' })
            .setLngLat([stop.station.lng, stop.station.lat])
            .addTo(map);

          stationMarkersRef.current.push(marker);
        });

        // Fit map bounds
        if (rawCoords.length > 1) {
          const bounds = rawCoords.reduce(
            (b: maplibregl.LngLatBounds, coord: [number, number]) => b.extend(coord),
            new maplibregl.LngLatBounds(rawCoords[0], rawCoords[0])
          );
          map.fitBounds(bounds, { padding: 60, maxZoom: 10 });
        }
      };

      map.on('load', () => {
        addRouteLayers();

        // Train live GPS marker
        if (status.currentLocation?.lng && status.currentLocation?.lat) {
          const el = document.createElement('div');
          el.className = 'rg-immersive-train-marker';
          el.style.width = '42px';
          el.style.height = '42px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#2563eb';
          el.style.border = '3px solid #ffffff';
          el.style.boxShadow =
            '0 0 24px rgba(37, 99, 235, 0.9), 0 0 0 8px rgba(37, 99, 235, 0.3)';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.color = '#ffffff';
          el.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`;

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([status.currentLocation.lng, status.currentLocation.lat])
            .addTo(map);

          trainMarkerRef.current = marker;
        }
      });

      mapRef.current = map;

      return () => {
        stationMarkersRef.current.forEach((m) => m.remove());
        stationMarkersRef.current = [];
        if (trainMarkerRef.current) {
          trainMarkerRef.current.remove();
          trainMarkerRef.current = null;
        }
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.error('Failed to init maplibregl:', err);
    }
  }, [activeLayer, status.trainNumber, status.currentLocation?.lng, status.currentLocation?.lat]);

  // Recenter / Track live position
  const handleTrackTrain = () => {
    if (mapRef.current && status.currentLocation) {
      mapRef.current.flyTo({
        center: [status.currentLocation.lng, status.currentLocation.lat],
        zoom: 10,
        speed: 1.4,
        essential: true,
      });
    }
  };

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetBearing = () => mapRef.current?.resetNorthPitch();

  // Dynamic telemetry values
  const currentStationDisplay = currentStn.name
    ? `${currentStn.name} (${currentStn.code})`
    : `${lastCompletedHalt?.station?.name || 'Origin'}`;

  const currentDepTime =
    lastCompletedHalt?.actualDeparture ||
    lastCompletedHalt?.scheduledDeparture ||
    (status.lastReportedTime ? status.lastReportedTime.slice(11, 16) : '--:--');

  const currentSchedTime = lastCompletedHalt?.scheduledDeparture || '--:--';
  const currentPlatform = lastCompletedHalt?.platform || '1';

  const nextStopDisplay = status.nextStation?.station?.name
    ? `${status.nextStation.station.name} (${status.nextStation.station.code})`
    : 'Upcoming Halt';

  const nextEta =
    status.nextStation?.estimatedArrival ||
    status.nextStation?.scheduledArrival ||
    '--:--';

  const nextDist = status.nextStation?.distanceRemainingKm ?? 0;
  const nextPlatform = status.nextStation?.platform || 'Expected Pl 2';

  const destEta =
    lastStop?.estimatedArrival ||
    lastStop?.scheduledArrival ||
    '--:--';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Map Canvas Container with Floating Top Bar & Toolbar Controls */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '620px',
          borderRadius: 'var(--radius-lg, 16px)',
          overflow: 'hidden',
          backgroundColor: '#070b12',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* MapLibre Canvas Container */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating Top Left Identity Card */}
        <div
          style={{
            position: 'absolute',
            top: '1.25rem',
            left: '1.25rem',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '10px 16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 10,
            border: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Back to overview"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0f172a',
              }}
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              }}
            >
              {status.trainNumber}
            </span>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#0f172a' }}>
                  {status.trainName}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: isDelayed ? '#fef3c7' : '#dcfce7',
                    color: isDelayed ? '#b45309' : '#15803d',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  <span>🕒 {isDelayed ? `Delayed ${delayMins}m` : 'On Time'}</span>
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                {sourceName} ({sourceCode}) → {destName} ({destCode})
              </div>
            </div>
          </div>
        </div>

        {/* Floating Top Right Controls Pill */}
        <div
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '8px 12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            zIndex: 10,
            border: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          {/* NTES Live Lock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#0f172a',
              padding: '4px 8px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
            <span>NTES Live Lock <span style={{ color: '#64748b', fontWeight: 500 }}>±3m</span></span>
          </div>

          {/* Speed pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 800,
            }}
          >
            <Navigation size={14} />
            <span>{speed} km/h</span>
          </div>

          {/* Share Button */}
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              aria-label="Share train track"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <Share2 size={16} />
            </button>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh status"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isRefreshing ? 'wait' : 'pointer',
                color: '#475569',
              }}
            >
              <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Exit immersive map"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Floating Right Vertical Toolbar */}
        <div
          style={{
            position: 'absolute',
            right: '1.25rem',
            top: '5.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
            zIndex: 10,
          }}
        >
          {/* TRACK Primary Blue Button */}
          <button
            type="button"
            onClick={handleTrackTrain}
            aria-label="Track live train position"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '46px',
              height: '52px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
              gap: '2px',
            }}
          >
            <Locate size={18} />
            <span style={{ fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.04em' }}>TRACK</span>
          </button>

          {/* Map Control Group */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0f172a',
              }}
            >
              <Plus size={18} />
            </button>

            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0f172a',
              }}
            >
              <Minus size={18} />
            </button>

            <button
              type="button"
              onClick={handleResetBearing}
              aria-label="Reset north compass"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ef4444',
              }}
            >
              <Compass size={18} />
            </button>
          </div>

          {/* Layers & Signal Controls */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveLayer(activeLayer === 'dark' ? 'satellite' : 'dark')}
              aria-label="Toggle map layer style"
              title="Toggle map layer style"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <Layers size={18} />
            </button>

            <button
              type="button"
              onClick={() => setShowSignals(!showSignals)}
              aria-label="Toggle railway signals layer"
              title="Toggle railway signals layer"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: showSignals ? '#eff6ff' : 'transparent',
                color: showSignals ? '#2563eb' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Radio size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. LOWER TELEMETRY HUD BLOCK PLACED DIRECTLY UNDER THE MAP */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem 1.75rem',
          boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06))',
          border: '1px solid var(--color-border, #e2e8f0)',
        }}
      >
        {/* 4 Bento Telemetry Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Card 1: Current Station */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <span>CURRENT STATION</span>
                <Check size={14} style={{ color: '#16a34a' }} strokeWidth={3} />
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {currentStationDisplay}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                Departed {currentDepTime} (Sched {currentSchedTime})
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                Platform {currentPlatform}
              </span>
            </div>
          </div>

          {/* Card 2: Next Stop */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <span>NEXT STOP</span>
                <Navigation size={14} style={{ color: '#2563eb' }} />
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {nextStopDisplay}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 700, marginTop: '2px' }}>
                ETA {nextEta} • {nextDist} km
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                {nextPlatform}
              </span>
            </div>
          </div>

          {/* Card 3: Delay Status */}
          <div
            style={{
              backgroundColor: isDelayed ? '#fffbeb' : '#f0fdf4',
              border: isDelayed ? '1px solid #fde68a' : '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: isDelayed ? '#b45309' : '#15803d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <span>DELAY STATUS</span>
                <TrendingDown size={14} style={{ color: isDelayed ? '#b45309' : '#15803d' }} />
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: isDelayed ? '#b45309' : '#15803d',
                  marginTop: '4px',
                }}
              >
                {isDelayed ? `+${delayMins} min` : 'Right Time'}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: isDelayed ? '#92400e' : '#166534',
                  marginTop: '2px',
                }}
              >
                {isDelayed ? `Running late by ${delayMins}m` : 'Nominal corridor speed'}
              </div>
            </div>
            <div
              style={{
                marginTop: '0.75rem',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: isDelayed ? '#b45309' : '#15803d',
              }}
            >
              Priority Corridor Active
            </div>
          </div>

          {/* Card 4: Loco & Power */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <span>LOCO & POWER</span>
                <Zap size={14} style={{ color: '#2563eb' }} />
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {status.trainNumber === '22503' ? 'WAP-7 #37214' : 'WAP-7 #30452'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                Speed: <strong>{speed} km/h</strong> •{' '}
                <span style={{ color: speed > 0 ? '#15803d' : '#b45309', fontWeight: 600 }}>
                  {speed > 0 ? 'In Transit' : 'Halted at Station'}
                </span>
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                {status.trainNumber === '22503' ? 'Erode / Royapuram Shed (ED)' : 'Tuglakabad Shed (TKD)'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Sub-Bar */}
        <div style={{ marginTop: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
              color: '#475569',
              marginBottom: '6px',
            }}
          >
            <span>
              <strong>{coveredKm} km</strong> of {totalKm} km completed ({percent}%)
            </span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>
              {remainingHalts} halts remaining • {destCode} at {destEta}
            </span>
          </div>

          <div
            style={{
              height: '6px',
              backgroundColor: '#e2e8f0',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percent}%`,
                backgroundColor: '#2563eb',
                borderRadius: '9999px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Bottom meta row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
            <span>Updated 2 min ago via NTES GPS Relay</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {onViewDetailedHalts && (
              <button
                type="button"
                onClick={onViewDetailedHalts}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.75rem',
                }}
              >
                View Detailed Halts
              </button>
            )}
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>
              Emergency Alarm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

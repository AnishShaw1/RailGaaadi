import React, { useState } from 'react';
import { Mountain, Table as TableIcon } from 'lucide-react';
import { RouteElevationProfile } from '../../types/train.js';
import { Card } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { Button } from '../../components/ui/Button.js';

export interface ElevationProfileChartProps {
  profile?: RouteElevationProfile | null;
  isLoading?: boolean;
}

export const ElevationProfileChart: React.FC<ElevationProfileChartProps> = ({ profile, isLoading }) => {
  const [showTable, setShowTable] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    stationName: string;
    stationCode: string;
    distanceKm: number;
    elevationMeters: number;
    x: number;
    y: number;
  } | null>(null);

  if (isLoading) {
    return (
      <Card padding="lg" style={{ marginBottom: '1.5rem' }}>
        <Skeleton height={28} width={220} />
        <Skeleton height={180} style={{ marginTop: '1rem' }} />
      </Card>
    );
  }

  if (!profile || !profile.points || profile.points.length === 0) {
    return null;
  }

  const points = profile.points;
  const maxElevation = Math.max(...points.map((p) => p.elevationMeters), 100);
  const minElevation = Math.min(...points.map((p) => p.elevationMeters), 0);
  const totalDistance = points[points.length - 1]?.distanceKm || 1000;

  // SVG Chart dimensions
  const width = 800;
  const height = 230;
  const paddingX = 48;
  const paddingTop = 25;
  const paddingBottom = 48;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingTop - paddingBottom;

  const getX = (dist: number) => paddingX + (dist / (totalDistance || 1)) * plotWidth;
  const getY = (ele: number) =>
    paddingTop + plotHeight - ((ele - minElevation) / (maxElevation - minElevation || 1)) * plotHeight;

  // Build SVG path
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.distanceKm)} ${getY(p.elevationMeters)}`)
    .join(' ');

  const areaPath = `${linePath} L ${getX(totalDistance)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z`;

  // Pre-calculate which station points should render X-axis text labels to completely avoid overlapping
  const minLabelSpacingPx = 65;
  const lastPointX = getX(points[points.length - 1].distanceKm);

  // We determine visible label flags
  const visibleLabelFlags: boolean[] = new Array(points.length).fill(false);
  visibleLabelFlags[0] = true; // Always show origin

  let lastPlacedX = getX(points[0].distanceKm);

  for (let i = 1; i < points.length - 1; i++) {
    const curX = getX(points[i].distanceKm);
    const distToLast = lastPointX - curX;

    // Check if this point has enough space from the previously placed label AND doesn't collide with the final destination label
    if (curX - lastPlacedX >= minLabelSpacingPx && distToLast >= minLabelSpacingPx) {
      visibleLabelFlags[i] = true;
      lastPlacedX = curX;
    }
  }

  visibleLabelFlags[points.length - 1] = true; // Always show destination

  return (
    <section aria-label="Route terrain and elevation profile" style={{ marginBottom: '1.5rem' }}>
      <Card padding="lg">
        {/* Title & Key Highlights */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mountain size={22} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                Terrain & Track Elevation Profile
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                OpenTopography SRTM Satellite DEM • 30m resolution
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8125rem' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Highest Point: </span>
              <strong style={{ color: 'var(--color-primary)' }}>
                {profile.maxElevationMeters} m
              </strong>
              {profile.maxElevationPoint && (
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {' '}({profile.maxElevationPoint.stationName})
                </span>
              )}
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Total Climb: </span>
              <strong>{profile.totalClimbMeters} m</strong>
            </div>
          </div>
        </div>

        {/* Interactive SVG Elevation Profile Chart */}
        <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: 'auto', maxHeight: '270px', display: 'block' }}
          >
            <defs>
              <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line
              x1={paddingX}
              y1={paddingTop}
              x2={width - paddingX}
              y2={paddingTop}
              stroke="var(--color-border)"
              strokeDasharray="3 3"
            />
            <line
              x1={paddingX}
              y1={paddingTop + plotHeight / 2}
              x2={width - paddingX}
              y2={paddingTop + plotHeight / 2}
              stroke="var(--color-border)"
              strokeDasharray="3 3"
            />
            <line
              x1={paddingX}
              y1={height - paddingBottom}
              x2={width - paddingX}
              y2={height - paddingBottom}
              stroke="var(--color-border)"
            />

            {/* Altitude Axis labels */}
            <text x={paddingX - 8} y={paddingTop + 4} textAnchor="end" fontSize="10" fill="var(--color-text-muted)">
              {maxElevation}m
            </text>
            <text
              x={paddingX - 8}
              y={paddingTop + plotHeight / 2 + 3}
              textAnchor="end"
              fontSize="10"
              fill="var(--color-text-muted)"
            >
              {Math.round((maxElevation + minElevation) / 2)}m
            </text>
            <text
              x={paddingX - 8}
              y={height - paddingBottom + 3}
              textAnchor="end"
              fontSize="10"
              fill="var(--color-text-muted)"
            >
              {minElevation}m
            </text>

            {/* Area fill */}
            <path d={areaPath} fill="url(#elevationGrad)" />

            {/* Track Elevation Line */}
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Station Points & Non-overlapping Labels */}
            {points.map((p, idx) => {
              const cx = getX(p.distanceKm);
              const cy = getY(p.elevationMeters);
              const isMax = p.elevationMeters === maxElevation;
              const shouldRenderLabel = visibleLabelFlags[idx];
              const isFirst = idx === 0;
              const isLast = idx === points.length - 1;

              // Anchor adjustment for edge labels so they stay inside the graph bounds
              const textAnchor = isFirst ? 'start' : isLast ? 'end' : 'middle';

              return (
                <g key={p.stationCode + idx}>
                  {/* Interactive dot on curve */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isMax ? 5.5 : 4}
                    fill={isMax ? '#EF4444' : '#ffffff'}
                    stroke={isMax ? '#EF4444' : 'var(--color-primary)'}
                    strokeWidth="2.5"
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                    onMouseEnter={() =>
                      setHoveredPoint({
                        stationName: p.stationName,
                        stationCode: p.stationCode,
                        distanceKm: p.distanceKm,
                        elevationMeters: p.elevationMeters,
                        x: cx,
                        y: cy,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {/* Clean Non-overlapping X-axis labels */}
                  {shouldRenderLabel && (
                    <g>
                      {/* Distance in km */}
                      <text
                        x={cx}
                        y={height - paddingBottom + 16}
                        textAnchor={textAnchor}
                        fontSize="9.5"
                        fill="var(--color-text-muted)"
                        fontFamily="var(--font-mono, monospace)"
                      >
                        {Math.round(p.distanceKm)}km
                      </text>

                      {/* Station Code */}
                      <text
                        x={cx}
                        y={height - paddingBottom + 29}
                        textAnchor={textAnchor}
                        fontSize="10"
                        fontWeight="700"
                        fill={isMax ? '#dc2626' : 'var(--color-text)'}
                      >
                        {p.stationCode}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredPoint && (
            <div
              style={{
                position: 'absolute',
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100}%`,
                transform: 'translate(-50%, -125%)',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                color: '#ffffff',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                pointerEvents: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap',
                zIndex: 20,
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.8125rem' }}>
                {hoveredPoint.stationName} ({hoveredPoint.stationCode})
              </div>
              <div style={{ marginTop: '2px', color: '#93c5fd' }}>
                Elevation: <strong style={{ color: '#ffffff' }}>{hoveredPoint.elevationMeters} m</strong> above sea level
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.6875rem', marginTop: '2px' }}>
                Distance from origin: {hoveredPoint.distanceKm} km
              </div>
            </div>
          )}
        </div>

        {/* Accessible Table Toggle Button */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTable(!showTable)}
            leftIcon={<TableIcon size={14} />}
          >
            {showTable ? 'Hide Elevation Data Table' : 'Show Accessible Elevation Table'}
          </Button>
        </div>

        {/* Accessible Elevation Table */}
        {showTable && (
          <div style={{ marginTop: '0.75rem', overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8125rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '6px 12px' }}>Station</th>
                  <th style={{ padding: '6px 12px' }}>Code</th>
                  <th style={{ padding: '6px 12px' }}>Distance (km)</th>
                  <th style={{ padding: '6px 12px' }}>Elevation (m)</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.stationCode} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '6px 12px', fontWeight: 600 }}>{p.stationName}</td>
                    <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>{p.stationCode}</td>
                    <td style={{ padding: '6px 12px' }}>{p.distanceKm} km</td>
                    <td style={{ padding: '6px 12px', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {p.elevationMeters} m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
};

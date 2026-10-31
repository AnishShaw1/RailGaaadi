import React from 'react';
import {
  Waves,
  Mountain,
  Compass,
  Layers,
  Anchor,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { TerrainPoi } from '../../types/train.js';
import { Card } from '../../components/ui/Card.js';

export interface TerrainPointsOfInterestProps {
  pois?: TerrainPoi[];
  isLoading?: boolean;
}

export const TerrainPointsOfInterest: React.FC<TerrainPointsOfInterestProps> = ({
  pois = [],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card padding="lg" style={{ marginBottom: '1.5rem' }}>
        <div style={{ height: '140px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '12px' }} />
      </Card>
    );
  }

  if (!pois || pois.length === 0) {
    return null;
  }

  const getCategoryMeta = (cat: TerrainPoi['category']) => {
    switch (cat) {
      case 'river':
        return {
          icon: <Waves size={18} />,
          label: 'River Crossing',
          bg: '#eff6ff',
          color: '#2563eb',
          badgeBg: '#dbeafe',
        };
      case 'bridge':
        return {
          icon: <Sparkles size={18} />,
          label: 'Rail Viaduct / Bridge',
          bg: '#f5f3ff',
          color: '#7c3aed',
          badgeBg: '#ede9fe',
        };
      case 'peak':
        return {
          icon: <Mountain size={18} />,
          label: 'Peak Summit',
          bg: '#fef2f2',
          color: '#dc2626',
          badgeBg: '#fee2e2',
        };
      case 'pass':
        return {
          icon: <Compass size={18} />,
          label: 'Mountain Pass / Ghat',
          bg: '#fffbeb',
          color: '#d97706',
          badgeBg: '#fef3c7',
        };
      case 'plateau':
        return {
          icon: <Layers size={18} />,
          label: 'Plateau & Watershed',
          bg: '#ecfdf5',
          color: '#059669',
          badgeBg: '#d1fae5',
        };
      case 'coastal':
      default:
        return {
          icon: <Anchor size={18} />,
          label: 'Coastal Plain',
          bg: '#ecfeff',
          color: '#0891b2',
          badgeBg: '#cffafe',
        };
    }
  };

  return (
    <section aria-label="Terrain and Points of Interest" style={{ marginBottom: '1.5rem' }}>
      <Card padding="lg">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mountain size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                Terrain & Points of Interest
              </h2>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: '3px 0 0 0' }}>
              Prominent rivers, historic bridges, mountain passes & high terrain peaks traversed along this route
            </p>
          </div>

          <span
            style={{
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-surface-subtle)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
            }}
          >
            {pois.length} Geo Landmarks Detected
          </span>
        </div>

        {/* POI Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {pois.map((poi) => {
            const meta = getCategoryMeta(poi.category);

            return (
              <div
                key={poi.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '1.125rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.04))',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div>
                  {/* Top category ribbon and distance */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: meta.bg,
                        color: meta.color,
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {meta.icon}
                      <span>{meta.label}</span>
                    </span>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {poi.distanceKm} km from origin
                    </span>
                  </div>

                  {/* POI Name */}
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--color-text)',
                      margin: '0 0 0.375rem 0',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {poi.name}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                      lineHeight: 1.45,
                    }}
                  >
                    {poi.description}
                  </p>
                </div>

                {/* Bottom Footer Info: Elevation & Nearest Station */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '1rem',
                    paddingTop: '0.625rem',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>
                    <MapPin size={12} />
                    <span>Near {poi.nearestStation || 'Route Corridor'}</span>
                  </div>

                  {poi.elevationMeters !== undefined && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                      }}
                    >
                      <span>Alt:</span>
                      <strong>{poi.elevationMeters} m</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
};

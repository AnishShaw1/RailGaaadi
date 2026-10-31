import React from 'react';
import { Clock, Star } from 'lucide-react';
import { StationStop } from '../../types/train.js';
import { isHaltStop } from './StationTimeline.js';

export interface UpcomingStopsCardProps {
  stops: StationStop[];
  onViewAll?: () => void;
}

export const UpcomingStopsCard: React.FC<UpcomingStopsCardProps> = ({ stops = [], onViewAll }) => {
  // Filter to upcoming halts (all uncompleted stops, including currently approaching stop)
  const haltStops = stops.filter((s, idx) => isHaltStop(s, idx, stops.length));
  const upcomingHalts = haltStops.filter((s) => !s.isCompleted);

  // Show first 4 upcoming halts
  const displayStops = upcomingHalts.slice(0, 4);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--radius-lg, 16px)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-border, #f1f5f9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} style={{ color: 'var(--color-primary, #2563eb)' }} />
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-text, #0f172a)', margin: 0 }}>
            Upcoming Stops
          </h3>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary, #2563eb)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Full {haltStops.length} Halts
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayStops.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>
            All halts completed. Train has reached its final destination.
          </p>
        ) : (
          displayStops.map((stop, index) => {
            const isDestination = stop === haltStops[haltStops.length - 1];
            const badgeNumber = index + 1;
            const timeDisplay = stop.estimatedArrival || stop.scheduledArrival || stop.actualArrival || '--:--';

            return (
              <div
                key={`${stop.station.code}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  {/* Circular Index or Star Badge */}
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: isDestination
                        ? '#eff6ff'
                        : stop.isCurrent
                        ? '#dbeafe'
                        : '#f8fafc',
                      border: isDestination
                        ? '1px solid #bfdbfe'
                        : stop.isCurrent
                        ? '1px solid #93c5fd'
                        : '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: isDestination || stop.isCurrent ? '#2563eb' : '#64748b',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {isDestination ? <Star size={13} fill="#2563eb" /> : badgeNumber}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>
                        {stop.station.name} ({stop.station.code})
                      </span>
                      {stop.isCurrent && (
                        <span
                          style={{
                            padding: '1px 6px',
                            borderRadius: '9999px',
                            backgroundColor: '#dbeafe',
                            color: '#1d4ed8',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          Approaching
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #64748b)', marginTop: '2px' }}>
                      {isDestination
                        ? `Final Destination • PF ${stop.platform || 1}`
                        : `Halt: ${stop.haltMinutes || 2} mins • PF ${stop.platform || 'TBD'}`}
                    </div>
                  </div>
                </div>

                {/* Right Arrival and Sched time */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text, #0f172a)' }}>
                    {timeDisplay}
                  </div>
                  {stop.scheduledArrival && stop.scheduledArrival !== timeDisplay && (
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted, #94a3b8)', textDecoration: 'line-through' }}>
                      {stop.scheduledArrival} Sched
                    </div>
                  )}
                  {stop.delayArrivalMinutes !== null && stop.delayArrivalMinutes > 0 && (
                    <div style={{ fontSize: '0.6875rem', color: '#d97706', fontWeight: 600 }}>
                      +{stop.delayArrivalMinutes}m late
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

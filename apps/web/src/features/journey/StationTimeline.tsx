import React, { useState } from 'react';
import { Check, Train, Clock, MapPin, Eye, EyeOff } from 'lucide-react';
import { StationStop } from '../../types/train.js';

export interface StationTimelineProps {
  stops: StationStop[];
}

export const isHaltStop = (stop: StationStop, index: number, totalStops: number): boolean => {
  if (index === 0 || index === totalStops - 1) return true;
  if (stop.isCurrent) return true;
  if (stop.isHalt === true) return true;
  if (typeof stop.haltMinutes === 'number' && stop.haltMinutes > 0) return true;
  return false;
};

export const StationTimeline: React.FC<StationTimelineProps> = ({ stops = [] }) => {
  const [showAllStops, setShowAllStops] = useState(false);

  const haltStops = stops.filter((stop, idx) => isHaltStop(stop, idx, stops.length));
  const displayedStops = showAllStops ? stops : (haltStops.length > 0 ? haltStops : stops);

  const completedCount = displayedStops.filter((s) => s.isCompleted).length;

  return (
    <section
      aria-label="Route and station timetable"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg, 16px)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header with halt filter indicator */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              Route & Halt Schedule
            </h2>
            <span
              style={{
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {displayedStops.length} Halts • {completedCount} Completed
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Commercial and operational passenger boarding stations only. Passing-through waypoints omitted.
          </p>
        </div>

        {stops.length > haltStops.length && (
          <button
            type="button"
            onClick={() => setShowAllStops(!showAllStops)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor: showAllStops ? 'var(--color-surface-subtle)' : '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {showAllStops ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showAllStops ? 'Show Halts Only' : `Show All Waypoints (${stops.length})`}</span>
          </button>
        )}
      </div>

      {/* Timeline track */}
      <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
        {/* Continuous vertical timeline track bar */}
        <div
          style={{
            position: 'absolute',
            left: '20px',
            top: '20px',
            bottom: '24px',
            width: '3px',
            backgroundColor: 'var(--color-border)',
            borderRadius: '2px',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayedStops.map((stop, index) => {
            const isCompleted = stop.isCompleted;
            const isCurrent = stop.isCurrent;
            const isFirst = index === 0;
            const isLast = index === displayedStops.length - 1;

            return (
              <div
                key={`${stop.station?.code || 'stop'}-${stop.stopSequence || index}`}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: isCurrent ? '1rem' : '0.75rem 1rem',
                  borderRadius: 'var(--radius-md, 12px)',
                  backgroundColor: isCurrent
                    ? 'rgba(37, 99, 235, 0.08)'
                    : isCompleted
                    ? 'transparent'
                    : 'rgba(255, 255, 255, 0.4)',
                  border: isCurrent
                    ? '2px solid var(--color-primary)'
                    : '1px solid transparent',
                  boxShadow: isCurrent ? '0 4px 16px rgba(37, 99, 235, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Visual Step Marker on the line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.5rem',
                    top: isCurrent ? '1.25rem' : '1rem',
                    width: isCurrent ? '30px' : '26px',
                    height: isCurrent ? '30px' : '26px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent
                      ? 'var(--color-primary)'
                      : isCompleted
                      ? '#16a34a'
                      : 'var(--color-surface)',
                    border: isCurrent
                      ? '3px solid #ffffff'
                      : isCompleted
                      ? '2px solid #16a34a'
                      : '2px solid var(--color-border)',
                    boxShadow: isCurrent
                      ? '0 0 0 4px rgba(37, 99, 235, 0.35), 0 0 12px rgba(37, 99, 235, 0.5)'
                      : isCompleted
                      ? '0 2px 6px rgba(22, 163, 74, 0.25)'
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    zIndex: 2,
                    marginLeft: isCurrent ? '-2px' : '0',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : isCurrent ? (
                    <Train size={14} strokeWidth={2.5} />
                  ) : (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-border)',
                      }}
                    />
                  )}
                </div>

                {/* Left Station Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontWeight: isCurrent ? 800 : isCompleted ? 600 : 700,
                        fontSize: isCurrent ? '1.0625rem' : '0.9375rem',
                        color: isCurrent ? 'var(--color-primary)' : 'var(--color-text)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {stop.station.name}
                    </span>

                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: isCurrent ? 'var(--color-primary)' : 'var(--color-surface-subtle)',
                        color: isCurrent ? '#ffffff' : 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {stop.station.code}
                    </span>

                    {/* Prominent Current Position Highlight Badge */}
                    {isCurrent && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-primary)',
                          color: '#ffffff',
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.4)',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            animation: 'pulse 1.5s infinite',
                          }}
                        />
                        Current Position
                      </span>
                    )}

                    {isCompleted && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '1px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'rgba(22, 163, 74, 0.12)',
                          color: '#16a34a',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                        }}
                      >
                        <Check size={11} strokeWidth={3} />
                        Completed
                      </span>
                    )}

                    {isFirst && (
                      <span
                        style={{
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--color-surface-subtle)',
                          color: 'var(--color-text-muted)',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                        }}
                      >
                        Source
                      </span>
                    )}

                    {isLast && (
                      <span
                        style={{
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--color-primary-soft)',
                          color: 'var(--color-primary)',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                        }}
                      >
                        Terminating
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '0.875rem',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-secondary)',
                      marginTop: '4px',
                    }}
                  >
                    {stop.platform && (
                      <span style={{ fontWeight: 600, color: isCurrent ? 'var(--color-primary)' : undefined }}>
                        Platform {stop.platform}
                      </span>
                    )}
                    {stop.haltMinutes !== undefined && stop.haltMinutes > 0 && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={12} /> Halt {stop.haltMinutes}m
                      </span>
                    )}
                    <span>{stop.distanceFromSourceKm} km</span>
                  </div>
                </div>

                {/* Right Arrival & Departure Timings */}
                <div style={{ textAlign: 'right', minWidth: '110px' }}>
                  {stop.scheduledArrival ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem', fontWeight: 600 }}>
                          ARR
                        </span>
                        <strong
                          style={{
                            fontSize: '0.9375rem',
                            color: isCurrent ? 'var(--color-primary)' : 'var(--color-text)',
                            fontWeight: 800,
                          }}
                        >
                          {stop.estimatedArrival || stop.actualArrival || stop.scheduledArrival}
                        </strong>
                      </div>

                      {stop.scheduledArrival !== (stop.estimatedArrival || stop.actualArrival) && (
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            textDecoration: 'line-through',
                          }}
                        >
                          Sched {stop.scheduledArrival}
                        </span>
                      )}

                      {stop.delayArrivalMinutes !== null && stop.delayArrivalMinutes > 0 ? (
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '0.6875rem',
                            color: 'var(--color-warning, #d97706)',
                            fontWeight: 700,
                            marginTop: '2px',
                          }}
                        >
                          +{stop.delayArrivalMinutes}m Late
                        </span>
                      ) : stop.delayArrivalMinutes === 0 ? (
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '0.6875rem',
                            color: '#16a34a',
                            fontWeight: 700,
                            marginTop: '2px',
                          }}
                        >
                          Right Time
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem', fontWeight: 600 }}>
                          DEP
                        </span>
                        <strong
                          style={{
                            fontSize: '0.9375rem',
                            color: isCurrent ? 'var(--color-primary)' : 'var(--color-text)',
                            fontWeight: 800,
                          }}
                        >
                          {stop.actualDeparture || stop.scheduledDeparture}
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600 }}>
                        Origin Departure
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

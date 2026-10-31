import React from 'react';
import { MapPin, Navigation, Clock, Gauge, TrendingDown, Train, Check } from 'lucide-react';
import { TrainStatus } from '../../types/train.js';
import { isHaltStop } from './StationTimeline.js';

export interface JourneySummaryCardProps {
  status: TrainStatus;
}

export const JourneySummaryCard: React.FC<JourneySummaryCardProps> = ({ status }) => {
  const currentStn = status.lastReportedStation || { code: 'NDLS', name: 'New Delhi' };
  const nextStn = status.nextStation?.station || { code: 'NEXT', name: 'Next Halt' };

  const delayMins = status.delayMinutes ?? 0;
  const isDelayed = delayMins > 0;
  const speed = status.currentLocation?.speedKmph ?? 0;
  const percent = Math.min(100, Math.max(0, Math.round(status.percentComplete || 0)));
  const coveredKm = status.distanceCoveredKm || 0;
  const totalKm = status.totalDistanceKm || 1000;
  const remainingKm = Math.max(0, totalKm - coveredKm);

  // Filter major halts to display as milestones in the horizontal trajectory
  const haltStops = (status.stops || []).filter((s, idx) => isHaltStop(s, idx, status.stops?.length || 0));

  // Identify last completed stop and next approaching stop
  const lastCompletedHalt = [...haltStops].reverse().find((s) => s.isCompleted) || haltStops[0];
  const approachingHalt = haltStops.find((s) => !s.isCompleted);

  const currentDepTime =
    lastCompletedHalt?.actualDeparture ||
    lastCompletedHalt?.scheduledDeparture ||
    (status.lastReportedTime ? status.lastReportedTime.slice(11, 16) : '--:--');

  const currentSchedTime = lastCompletedHalt?.scheduledDeparture || '--:--';
  const currentPlatform = lastCompletedHalt?.platform || '1';

  const nextStopDisplay = status.nextStation?.station?.name
    ? `${status.nextStation.station.name} (${status.nextStation.station.code})`
    : approachingHalt?.station?.name
    ? `${approachingHalt.station.name} (${approachingHalt.station.code})`
    : nextStn?.name
    ? `${nextStn.name} (${nextStn.code})`
    : 'Upcoming Halt';

  const nextEta =
    status.nextStation?.estimatedArrival ||
    status.nextStation?.scheduledArrival ||
    approachingHalt?.estimatedArrival ||
    '--:--';

  const nextSched =
    status.nextStation?.scheduledArrival ||
    approachingHalt?.scheduledArrival ||
    '--:--';

  const nextDist = status.nextStation?.distanceRemainingKm ?? 0;
  const nextPlatform = status.nextStation?.platform || approachingHalt?.platform || 'Expected Pl 2';

  // Pick 5-7 representative milestone halts evenly spaced across the journey
  let milestoneStops = haltStops;
  if (haltStops.length > 6) {
    const first = haltStops[0];
    const last = haltStops[haltStops.length - 1];
    const current = haltStops.find((s) => s.isCurrent) || haltStops[Math.floor(haltStops.length / 2)];
    const otherStops = haltStops.filter((s) => s !== first && s !== last && s !== current);

    // Pick evenly spaced intermediate halts
    const step = Math.max(1, Math.floor(otherStops.length / 3));
    const selectedOthers = otherStops.filter((_, i) => i % step === 0).slice(0, 3);

    milestoneStops = [first, ...selectedOthers, current, last]
      .filter((v, i, a) => a.findIndex((t) => t.station.code === v.station.code) === i)
      .sort((a, b) => a.distanceFromSourceKm - b.distanceFromSourceKm);
  }

  const remainingHalts = haltStops.filter((s) => !s.isCompleted).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 4 Bento Telemetry Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Card 1: Current Station */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--color-text-secondary, #64748b)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}
            >
              <span>Current Station</span>
              <MapPin size={16} style={{ color: 'var(--color-primary, #2563eb)' }} />
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #0f172a)' }}>
              {currentStn.name} ({currentStn.code})
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary, #64748b)', marginTop: '2px' }}>
              Platform {currentPlatform} • Departed Last Halt
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--color-border, #f1f5f9)',
              fontSize: '0.8125rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full, 9999px)',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              <Check size={12} strokeWidth={3} />
              Departed {currentDepTime}
            </span>
            <span style={{ color: 'var(--color-text-muted, #94a3b8)' }}>Sched {currentSchedTime}</span>
          </div>
        </div>

        {/* Card 2: Next Station */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--color-text-secondary, #64748b)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}
            >
              <span>Next Station</span>
              <Navigation size={16} style={{ color: 'var(--color-primary, #2563eb)' }} />
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #0f172a)' }}>
              {nextStopDisplay}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary, #64748b)', marginTop: '2px' }}>
              {nextPlatform}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--color-border, #f1f5f9)',
              fontSize: '0.8125rem',
            }}
          >
            <span style={{ fontWeight: 800, color: 'var(--color-primary, #2563eb)' }}>
              ETA {nextEta}
            </span>
            <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>
              {nextDist} km away (Sched {nextSched})
            </span>
          </div>
        </div>

        {/* Card 3: Current Delay */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--color-text-secondary, #64748b)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}
            >
              <span>Current Delay</span>
              <Clock size={16} style={{ color: isDelayed ? '#d97706' : '#16a34a' }} />
            </div>

            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: isDelayed ? '#d97706' : '#16a34a',
                letterSpacing: '-0.02em',
              }}
            >
              {isDelayed ? `+${delayMins} min` : 'Right Time'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary, #64748b)', marginTop: '2px' }}>
              {isDelayed ? `Running Late by ${delayMins} mins` : 'Operating as per schedule'}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              marginTop: '1.25rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--color-border, #f1f5f9)',
              fontSize: '0.8125rem',
              color: isDelayed ? '#b45309' : '#059669',
              fontWeight: 600,
            }}
          >
            <TrendingDown size={14} />
            <span>{status.delayReason || (isDelayed ? 'Priority Corridor Active' : 'Normal Operating Speed')}</span>
          </div>
        </div>

        {/* Card 4: Telemetry & Loco */}
        <div
          style={{
            backgroundColor: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--color-text-secondary, #64748b)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}
            >
              <span>Telemetry & Loco</span>
              <Gauge size={16} style={{ color: 'var(--color-primary, #2563eb)' }} />
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text, #0f172a)' }}>
              {speed} km/h
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary, #64748b)', marginTop: '2px' }}>
              Loco: {status.trainNumber === '22503' ? 'WAP-7 #37214 (ED)' : 'WAP-7 #30452 (TKD)'}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--color-border, #f1f5f9)',
              fontSize: '0.8125rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: speed > 0 ? '#16a34a' : '#d97706',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: speed > 0 ? '#16a34a' : '#d97706',
                }}
              />
              {speed > 0 ? 'In Transit • Cruising' : 'Halted at Station Platform'}
            </span>
            <span style={{ color: 'var(--color-text-muted, #94a3b8)', fontSize: '0.75rem' }}>
              NTES Telemetry
            </span>
          </div>
        </div>
      </div>

      {/* Journey Trajectory Section Card */}
      <section
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: 'var(--radius-lg, 16px)',
          padding: '1.5rem 1.75rem',
          boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
        }}
      >
        {/* Top header line of Trajectory */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-text-secondary, #64748b)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.25rem',
              }}
            >
              JOURNEY TRAJECTORY
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text, #0f172a)', margin: 0 }}>
              Estimated journey progress {percent}%
            </h2>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #475569)', textAlign: 'right' }}>
            <strong>{coveredKm} km</strong> of {totalKm} km completed
            <span style={{ margin: '0 0.5rem', color: 'var(--color-border, #cbd5e1)' }}>•</span>
            <strong style={{ color: 'var(--color-primary, #2563eb)' }}>
              {remainingKm} km remaining ({remainingHalts} halts left)
            </strong>
          </div>
        </div>

        {/* Progress Track Bar with Train Badge */}
        <div style={{ position: 'relative', margin: '2rem 0 3.5rem 0' }}>
          {/* Base track background */}
          <div
            style={{
              height: '8px',
              backgroundColor: '#e2e8f0',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percent}%`,
                backgroundColor: 'var(--color-primary, #2563eb)',
                borderRadius: '9999px',
                transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          {/* Floating Train Position Indicator Pin */}
          <div
            style={{
              position: 'absolute',
              left: `${percent}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary, #2563eb)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.3), 0 4px 8px rgba(0,0,0,0.15)',
              }}
            >
              <Train size={16} />
            </div>

            {/* Current Station Pill Label */}
            <div
              style={{
                position: 'absolute',
                top: '36px',
                whiteSpace: 'nowrap',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm, 6px)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              Current: {currentStn.name}
            </div>
          </div>
        </div>

        {/* Major Halt Milestone Nodes */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'relative',
            marginTop: '1rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {milestoneStops.map((stop, index) => {
            const isCompleted = stop.isCompleted;
            const isCurrent = stop.isCurrent;

            return (
              <div
                key={`${stop.station.code}-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '85px',
                  textAlign: 'center',
                }}
              >
                {/* Node dot */}
                <div
                  style={{
                    width: isCurrent ? '14px' : '10px',
                    height: isCurrent ? '14px' : '10px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent
                      ? 'var(--color-primary, #2563eb)'
                      : isCompleted
                      ? '#16a34a'
                      : '#cbd5e1',
                    boxShadow: isCurrent
                      ? '0 0 0 4px rgba(37, 99, 235, 0.35)'
                      : isCompleted
                      ? '0 0 0 2px rgba(22, 163, 74, 0.25)'
                      : 'none',
                    marginBottom: '0.5rem',
                  }}
                />

                {/* Station Code & Name */}
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: isCurrent ? 800 : 700,
                    color: isCurrent
                      ? 'var(--color-primary, #2563eb)'
                      : isCompleted
                      ? 'var(--color-text, #0f172a)'
                      : 'var(--color-text-secondary, #64748b)',
                  }}
                >
                  {stop.station.code} {isCurrent && '(Approaching)'}
                </span>

                {/* Distance */}
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted, #94a3b8)', marginTop: '2px' }}>
                  {stop.distanceFromSourceKm} km
                </span>

                {/* Time or Delay status */}
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: isCompleted
                      ? '#16a34a'
                      : isCurrent
                      ? '#2563eb'
                      : 'var(--color-text-secondary, #64748b)',
                    marginTop: '2px',
                  }}
                >
                  {index === 0
                    ? `Dep ${stop.actualDeparture || stop.scheduledDeparture || '--:--'}`
                    : isCompleted
                    ? `Departed ${stop.actualDeparture || stop.scheduledDeparture || '--:--'}`
                    : stop.delayArrivalMinutes && stop.delayArrivalMinutes > 0
                    ? `+${stop.delayArrivalMinutes}m late`
                    : `ETA ${stop.estimatedArrival || stop.scheduledArrival || '--:--'}`}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

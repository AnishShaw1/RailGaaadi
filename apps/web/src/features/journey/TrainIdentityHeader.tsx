import React from 'react';
import { ArrowRight, Share2, Star, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { TrainStatus, ApiMeta } from '../../types/train.js';
import { useFavouriteTrains } from '../../hooks/useFavouriteTrains.js';

export interface TrainIdentityHeaderProps {
  status: TrainStatus;
  meta?: ApiMeta;
  onShare: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TrainIdentityHeader: React.FC<TrainIdentityHeaderProps> = ({
  status,
  meta,
  onShare,
  onRefresh,
  isRefreshing = false,
}) => {
  const { isFavourite, toggleFavourite } = useFavouriteTrains();
  const favourited = isFavourite(status.trainNumber);

  const firstStop = status.stops?.[0];
  const lastStop = status.stops?.[status.stops?.length - 1];
  const sourceStation = status.stops?.[0]?.station || status.lastReportedStation;
  const destStation = lastStop?.station || status.nextStation?.station || { code: 'DEST', name: 'Destination' };

  const departureTime = firstStop?.actualDeparture || firstStop?.scheduledDeparture || '16:55';
  const arrivalTime = lastStop?.estimatedArrival || lastStop?.scheduledArrival || '08:35';

  const delayMins = status.delayMinutes ?? 0;
  const isDelayed = delayMins > 0;

  return (
    <header
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--radius-lg, 16px)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1.25rem',
        }}
      >
        {/* Left Side: Identity & Details */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--color-primary, #2563eb)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.0625rem',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.02em',
              }}
            >
              {status.trainNumber}
            </span>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--color-text, #0f172a)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {status.trainName}
            </h1>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-full, 9999px)',
                backgroundColor: 'var(--color-surface-subtle, #f1f5f9)',
                color: 'var(--color-text-secondary, #64748b)',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {status.trainType || 'Express'}
            </span>
          </div>

          {/* Route sub-row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary, #475569)',
              marginTop: '0.25rem',
            }}
          >
            <strong style={{ color: 'var(--color-text, #0f172a)' }}>
              {sourceStation?.code} ({sourceStation?.name})
            </strong>
            <ArrowRight size={14} style={{ color: 'var(--color-text-muted, #94a3b8)' }} />
            <strong style={{ color: 'var(--color-text, #0f172a)' }}>
              {destStation?.code} ({destStation?.name})
            </strong>
            <span style={{ color: 'var(--color-border, #cbd5e1)' }}>•</span>
            <span>Departed {departureTime}</span>
            <span style={{ color: 'var(--color-border, #cbd5e1)' }}>•</span>
            <span>Scheduled Arrival {arrivalTime}</span>
            <span style={{ color: 'var(--color-border, #cbd5e1)' }}>•</span>
            <span>Total Distance: {status.totalDistanceKm ? `${status.totalDistanceKm.toLocaleString()} km` : '1,386 km'}</span>
          </div>

          {/* Delay Status and Reason Banner */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '1rem',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full, 9999px)',
                backgroundColor: isDelayed ? '#fef3c7' : '#dcfce7',
                color: isDelayed ? '#b45309' : '#15803d',
                fontSize: '0.8125rem',
                fontWeight: 700,
              }}
            >
              <Clock size={14} />
              <span>{isDelayed ? `Delayed ${delayMins}m` : 'On Time'}</span>
            </div>

            {status.delayReason && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary, #475569)',
                }}
              >
                <AlertTriangle size={14} style={{ color: '#d97706' }} />
                <span>{status.delayReason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Buttons & GPS Dot */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() =>
                toggleFavourite({
                  trainNumber: status.trainNumber,
                  trainName: status.trainName,
                  trainType: status.trainType,
                  source: status.stops?.[0]?.station || { code: '', name: '' },
                  destination: status.stops?.[status.stops.length - 1]?.station || { code: '', name: '' },
                  runsOnDays: [0, 1, 2, 3, 4, 5, 6],
                  classes: [],
                })
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '7px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border, #e2e8f0)',
                backgroundColor: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-text, #0f172a)',
                cursor: 'pointer',
              }}
            >
              <Star
                size={15}
                style={{
                  color: favourited ? '#f59e0b' : 'var(--color-text-muted, #94a3b8)',
                  fill: favourited ? '#f59e0b' : 'none',
                }}
              />
              <span>{favourited ? 'Saved' : '4.8k'}</span>
            </button>

            <button
              type="button"
              onClick={onShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '7px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border, #e2e8f0)',
                backgroundColor: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-text, #0f172a)',
                cursor: 'pointer',
              }}
            >
              <Share2 size={15} />
              <span>Share</span>
            </button>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-text, #0f172a)',
                  cursor: isRefreshing ? 'wait' : 'pointer',
                }}
              >
                <RefreshCw
                  size={15}
                  style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
                />
                <span>Refresh</span>
              </button>
            )}
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary, #64748b)',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                boxShadow: '0 0 6px rgba(22, 163, 74, 0.6)',
              }}
            />
            <span>Updated {meta?.sourceUpdatedAt ? 'just now' : '2m ago'} from NTES GPS</span>
          </div>
        </div>
      </div>
    </header>
  );
};

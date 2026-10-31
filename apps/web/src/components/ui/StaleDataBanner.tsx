import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface StaleDataBannerProps {
  lastUpdated: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const StaleDataBanner: React.FC<StaleDataBannerProps> = ({
  lastUpdated,
  onRefresh,
  isRefreshing = false,
}) => {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Unknown time';

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--color-warning-soft)',
        border: '1px solid var(--color-warning-border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-warning)',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertTriangle size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          <strong>Stale Status:</strong> Showing cached signal from {formattedTime}. Telemetry updates are temporarily delayed.
        </span>
      </div>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-warning-border)',
            color: 'var(--color-text)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          Retry Live Sync
        </button>
      )}
    </div>
  );
};

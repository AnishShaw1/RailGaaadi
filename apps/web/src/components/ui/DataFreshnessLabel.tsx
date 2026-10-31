import React from 'react';
import { Clock, ShieldAlert, Check } from 'lucide-react';
import { ApiMeta } from '../../types/train.js';

export interface DataFreshnessLabelProps {
  meta?: ApiMeta;
}

export const DataFreshnessLabel: React.FC<DataFreshnessLabelProps> = ({ meta }) => {
  if (!meta) return null;

  const getRelativeTime = (isoString: string | null) => {
    if (!isoString) return 'Time unavailable';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 45) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin === 1) return '1 min ago';
    if (diffMin < 60) return `${diffMin} mins ago`;
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}h ago`;
  };

  const relativeText = getRelativeTime(meta.sourceUpdatedAt || meta.fetchedAt);
  const formattedTime = (meta.sourceUpdatedAt || meta.fetchedAt)
    ? new Date(meta.sourceUpdatedAt || meta.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontSize: '0.75rem',
        color: meta.stale ? 'var(--color-warning)' : 'var(--color-text-secondary)',
      }}
      title={`Fetched: ${new Date(meta.fetchedAt).toLocaleString()} | Source updated: ${meta.sourceUpdatedAt ? new Date(meta.sourceUpdatedAt).toLocaleString() : 'N/A'}`}
    >
      {meta.stale ? (
        <ShieldAlert size={14} style={{ color: 'var(--color-warning)' }} aria-hidden="true" />
      ) : (
        <Clock size={14} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
      )}
      <span>
        Updated {relativeText} ({formattedTime})
      </span>
      <span
        style={{
          padding: '1px 5px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: meta.provenance === 'provider' ? 'var(--color-success-soft)' : 'var(--color-surface-subtle)',
          color: meta.provenance === 'provider' ? 'var(--color-success)' : 'var(--color-text-secondary)',
          fontSize: '0.6875rem',
          fontWeight: 600,
        }}
      >
        {meta.provenance === 'provider' ? 'Verified Feed' : 'Cached Feed'}
      </span>
    </div>
  );
};

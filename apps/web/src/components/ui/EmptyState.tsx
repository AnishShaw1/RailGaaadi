import React from 'react';
import { SearchX } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Trains Found',
  message = 'Try searching with a train number (e.g., 12952) or station name.',
  icon,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-surface-subtle)',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem',
        }}
      >
        {icon || <SearchX size={24} aria-hidden="true" />}
      </div>
      <h4 style={{ fontSize: '1.0625rem', marginBottom: '0.375rem', color: 'var(--color-text)' }}>{title}</h4>
      <p style={{ maxWidth: '360px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{message}</p>
    </div>
  );
};

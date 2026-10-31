import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button.js';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Train Status',
  message = 'We could not fetch live running details. Please check your connection or retry shortly.',
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-danger-soft)',
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <AlertCircle size={26} aria-hidden="true" />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>{title}</h3>
      <p style={{ maxWidth: '420px', fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
        {message}
      </p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry} isLoading={isRetrying} leftIcon={<RefreshCw size={16} />}>
          Try Again
        </Button>
      )}
    </div>
  );
};

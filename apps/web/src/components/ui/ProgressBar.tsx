import React from 'react';

export interface ProgressBarProps {
  progressPercent: number; // 0 to 100
  isEstimated?: boolean;
  label?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercent,
  isEstimated = false,
  label,
  height = 8,
}) => {
  const clamped = Math.max(0, Math.min(100, progressPercent));

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '4px',
          }}
        >
          <span>{label}</span>
          <span>
            {Math.round(clamped)}% {isEstimated && '(Estimated)'}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Journey progress'}
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--color-surface-subtle)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease-out',
            opacity: isEstimated ? 0.8 : 1,
            backgroundImage: isEstimated
              ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)'
              : undefined,
            backgroundSize: '16px 16px',
          }}
        />
      </div>
    </div>
  );
};

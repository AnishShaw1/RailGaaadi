import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertOctagon, XCircle, HelpCircle } from 'lucide-react';
import { RunningState } from '../../types/train.js';

export interface StatusBadgeProps {
  state: RunningState;
  delayMinutes: number | null;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  state,
  delayMinutes,
  size = 'md',
}) => {
  let label = 'On Time';
  let Icon = CheckCircle2;
  let bg = 'var(--color-success-soft)';
  let color = 'var(--color-success)';
  let border = 'var(--color-success-border)';

  if (state === 'CANCELLED') {
    label = 'Cancelled';
    Icon = XCircle;
    bg = 'var(--color-danger-soft)';
    color = 'var(--color-danger)';
    border = 'var(--color-danger-border)';
  } else if (state === 'UNKNOWN' || delayMinutes === null) {
    label = 'Delay Unavailable';
    Icon = HelpCircle;
    bg = 'var(--color-surface-subtle)';
    color = 'var(--color-text-secondary)';
    border = 'var(--color-border)';
  } else if (delayMinutes <= 0) {
    label = 'On Time';
    Icon = CheckCircle2;
    bg = 'var(--color-success-soft)';
    color = 'var(--color-success)';
    border = 'var(--color-success-border)';
  } else if (delayMinutes <= 15) {
    label = `Delayed ${delayMinutes}m`;
    Icon = Clock;
    bg = 'var(--color-warning-soft)';
    color = 'var(--color-warning)';
    border = 'var(--color-warning-border)';
  } else if (delayMinutes <= 60) {
    label = `Delayed ${delayMinutes}m`;
    Icon = AlertTriangle;
    bg = 'var(--color-warning-soft)';
    color = 'var(--color-warning)';
    border = 'var(--color-warning-border)';
  } else {
    label = `Delayed ${Math.floor(delayMinutes / 60)}h ${delayMinutes % 60}m`;
    Icon = AlertOctagon;
    bg = 'var(--color-danger-soft)';
    color = 'var(--color-danger)';
    border = 'var(--color-danger-border)';
  }

  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '0.75rem' : '0.875rem';
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        lineHeight: 1.2,
      }}
    >
      <Icon size={iconSize} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

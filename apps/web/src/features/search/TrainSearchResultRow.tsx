import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { TrainSummary } from '../../types/train.js';

export interface TrainSearchResultRowProps {
  train: TrainSummary;
  isSelected?: boolean;
  onSelect: (train: TrainSummary) => void;
}

export const TrainSearchResultRow: React.FC<TrainSearchResultRowProps> = ({
  train,
  isSelected = false,
  onSelect,
}) => {
  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(train)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1rem',
        backgroundColor: isSelected ? 'var(--color-primary-soft)' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color var(--transition-fast)',
        borderBottom: '1px solid var(--color-border)',
      }}
      className="rg-search-row"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <span
          style={{
            padding: '4px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {train.trainNumber || (train as any).number}
        </span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
            {train.trainName || (train as any).name}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)',
              marginTop: '2px',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{train.source.code}</span>
            <ArrowRight size={13} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{train.destination.code}</span>
            <span style={{ color: 'var(--color-text-muted)', marginLeft: '4px' }}>
              • {train.trainType}
            </span>
          </div>
        </div>
      </div>

      <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
    </div>
  );
};

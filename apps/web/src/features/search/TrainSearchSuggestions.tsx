import React from 'react';
import { TrainSearchResultRow } from './TrainSearchResultRow.js';
import { TrainSummary } from '../../types/train.js';
import { Skeleton } from '../../components/ui/Skeleton.js';

export interface TrainSearchSuggestionsProps {
  results: TrainSummary[];
  isLoading: boolean;
  selectedIndex: number;
  onSelect: (train: TrainSummary) => void;
}

export const TrainSearchSuggestions: React.FC<TrainSearchSuggestionsProps> = ({
  results,
  isLoading,
  selectedIndex,
  onSelect,
}) => {
  return (
    <div
      role="listbox"
      aria-label="Train search suggestions"
      style={{
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        maxHeight: '380px',
        overflowY: 'auto',
        zIndex: 100,
      }}
    >
      {isLoading ? (
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton height={32} />
          <Skeleton height={32} />
          <Skeleton height={32} />
        </div>
      ) : results.length === 0 ? (
        <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          No trains matched your search query.
        </div>
      ) : (
        results.map((train, index) => (
          <TrainSearchResultRow
            key={train.trainNumber}
            train={train}
            isSelected={index === selectedIndex}
            onSelect={onSelect}
          />
        ))
      )}
    </div>
  );
};

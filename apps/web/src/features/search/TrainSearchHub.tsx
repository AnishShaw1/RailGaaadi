import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '../../components/ui/SearchInput.js';
import { TrainSearchSuggestions } from './TrainSearchSuggestions.js';
import { useTrainSearch } from '../../hooks/useTrainSearch.js';
import { useRecentSearches } from '../../hooks/useRecentSearches.js';
import { TrainSummary } from '../../types/train.js';

export const TrainSearchHub: React.FC = () => {
  const navigate = useNavigate();
  const { query, setQuery, debouncedQuery, results, isLoading } = useTrainSearch();
  const { addRecentSearch } = useRecentSearches();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = containerRef.current?.querySelector('input');
        input?.focus();
        input?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTrain = (train: TrainSummary) => {
    const num = train.trainNumber || (train as any).number;
    if (!num) return;
    addRecentSearch({ ...train, trainNumber: num });
    setIsOpen(false);
    navigate(`/train/${num}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectTrain(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelectTrain(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const quickChips = [
    { label: '⚡ Vande Bharat', query: 'Vande Bharat' },
    { label: '🚅 Tejas Rajdhani', query: '12952' },
    { label: '⚡ Shatabdi', query: 'Shatabdi' },
    { label: '📍 New Delhi (NDLS)', query: 'NDLS' },
    { label: '📍 Mumbai Central (MMCT)', query: 'MMCT' },
  ];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '680px', margin: '0 auto' }} onKeyDown={handleKeyDown}>
      <SearchInput
        value={query}
        onChange={(val) => {
          setQuery(val);
          if (val.trim().length >= 2) setIsOpen(true);
        }}
        onClear={() => {
          setQuery('');
          setIsOpen(false);
        }}
        onSearchSubmit={() => {
          if (results.length > 0) {
            handleSelectTrain(results[0]);
          }
        }}
        placeholder="Enter train number or name (e.g. 12952, Rajdhani, Vande Bharat)..."
      />

      {isOpen && (
        <TrainSearchSuggestions
          results={results}
          isLoading={isLoading}
          selectedIndex={selectedIndex}
          onSelect={handleSelectTrain}
        />
      )}

      {/* Quick discovery tags */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '0.75rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          Popular:
        </span>
        {quickChips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => {
              setQuery(chip.query);
              setIsOpen(true);
            }}
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'border-color var(--transition-fast), color var(--transition-fast)',
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};

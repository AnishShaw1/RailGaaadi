import { useState, useEffect } from 'react';
import { TrainSummary } from '../types/train.js';

const STORAGE_KEY = 'railgaadi:v1:recent-searches';

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<TrainSummary[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
    } catch {
      // storage unavailable or full
    }
  }, [recentSearches]);

  const addRecentSearch = (train: TrainSummary) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.trainNumber !== train.trainNumber);
      return [train, ...filtered].slice(0, 10);
    });
  };

  const removeRecentSearch = (trainNumber: string) => {
    setRecentSearches((prev) => prev.filter((t) => t.trainNumber !== trainNumber));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
  };

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearAllRecent,
  };
}

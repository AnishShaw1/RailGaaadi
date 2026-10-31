import { useState, useEffect } from 'react';
import { TrainSummary } from '../types/train.js';

const STORAGE_KEY = 'railgaadi:v1:favourites';

export function useFavouriteTrains() {
  const [favourites, setFavourites] = useState<TrainSummary[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      // Default initial favorites for first visit
      return [
        {
          trainNumber: '12952',
          trainName: 'Tejas Rajdhani (NDLS → MMCT)',
          trainType: 'Rajdhani',
          source: { code: 'NDLS', name: 'New Delhi' },
          destination: { code: 'MMCT', name: 'Mumbai Central' },
          runsOnDays: [0, 1, 2, 3, 4, 5, 6],
          classes: ['1A', '2A', '3A'],
        },
        {
          trainNumber: '22436',
          trainName: 'Vande Bharat (NDLS → BSB)',
          trainType: 'Vande Bharat',
          source: { code: 'NDLS', name: 'New Delhi' },
          destination: { code: 'BSB', name: 'Varanasi' },
          runsOnDays: [0, 2, 3, 5, 6],
          classes: ['EC', 'CC'],
        },
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
    } catch {
      // storage unavailable
    }
  }, [favourites]);

  const toggleFavourite = (train: TrainSummary) => {
    setFavourites((prev) => {
      const exists = prev.some((t) => t.trainNumber === train.trainNumber);
      if (exists) {
        return prev.filter((t) => t.trainNumber !== train.trainNumber);
      }
      return [...prev, train];
    });
  };

  const isFavourite = (trainNumber: string) => {
    return favourites.some((t) => t.trainNumber === trainNumber);
  };

  return {
    favourites,
    toggleFavourite,
    isFavourite,
  };
}

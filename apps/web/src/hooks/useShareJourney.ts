import { useState } from 'react';

export function useShareJourney() {
  const [copied, setCopied] = useState(false);

  const getShareUrl = (trainNumber: string, date?: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const dateParam = date ? `?date=${encodeURIComponent(date)}` : '';
    return `${origin}/train/${trainNumber}${dateParam}`;
  };

  const shareJourney = async (trainNumber: string, trainName: string, date?: string) => {
    const url = getShareUrl(trainNumber, date);
    const title = `RailGaadi Live Tracking • ${trainNumber} ${trainName}`;
    const text = `Track live running status of ${trainName} (${trainNumber}) on RailGaadi:`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Web Share API error, falling back to clipboard copy:', err);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      return true;
    } catch {
      return false;
    }
  };

  return {
    shareJourney,
    getShareUrl,
    copied,
  };
}

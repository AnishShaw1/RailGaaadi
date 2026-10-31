import React from 'react';
import { X, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchTrains } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';

export interface StationBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationCode: string;
}

export const StationBoardModal: React.FC<StationBoardModalProps> = ({
  isOpen,
  onClose,
  stationCode,
}) => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['stationTrains', stationCode],
    queryFn: () => searchTrains(stationCode),
    enabled: Boolean(isOpen && stationCode),
  });

  if (!isOpen) return null;

  const trains = data?.data || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(17, 25, 35, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                Station Electronic Board: {stationCode.toUpperCase()}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                Live connected departures and scheduled routes (RailRadar API)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ padding: '6px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Board content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
              <Loader2 size={28} className="spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
              <span>Fetching live departures from RailRadar...</span>
            </div>
          ) : trains.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--color-text-muted)' }}>
              <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500 }}>
                No direct trains found for "{stationCode}".
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8125rem' }}>
                Try searching by station name e.g. "Delhi", "Mumbai", or a train number.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {trains.map((train) => {
                const trainNum = train.trainNumber || (train as any).number;
                return (
                  <div
                    key={trainNum}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onClick={() => {
                      onClose();
                      navigate(`/train/${trainNum}`);
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                          {trainNum}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                          {train.trainName || (train as any).name}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {train.source?.name} ({train.source?.code}) → {train.destination?.name} ({train.destination?.code})
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-success-soft)',
                          color: 'var(--color-success)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        Live Tracking
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--color-primary)', fontSize: '0.75rem', marginTop: '4px', justifyContent: 'flex-end' }}>
                        <span>Track</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

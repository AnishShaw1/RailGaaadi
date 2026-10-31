import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Star,
  ArrowRight,
  Satellite,
  Map as MapIcon,
  BarChart3,
  Ticket,
  Clock,
  Building2,
  Trash2,
} from 'lucide-react';
import { TrainSearchHub } from '../features/search/TrainSearchHub.js';
import { useRecentSearches } from '../hooks/useRecentSearches.js';
import { useFavouriteTrains } from '../hooks/useFavouriteTrains.js';
import { PnrStatusModal } from '../features/pnr/PnrStatusModal.js';
import { StationBoardModal } from '../features/station/StationBoardModal.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { recentSearches, clearAllRecent, removeRecentSearch } = useRecentSearches();
  const { favourites } = useFavouriteTrains();

  // Landing page quick tools state
  const [pnrInput, setPnrInput] = useState('');
  const [isPnrModalOpen, setIsPnrModalOpen] = useState(false);

  const [stationInput, setStationInput] = useState('');
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);

  const handleCheckPnr = (e: React.FormEvent) => {
    e.preventDefault();
    if (pnrInput.trim().length >= 5) {
      setIsPnrModalOpen(true);
    }
  };

  const handleCheckStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (stationInput.trim().length >= 2) {
      setIsStationModalOpen(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', paddingTop: '1.5rem', paddingBottom: '0.5rem' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {/* Eyebrow Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary-border)',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                animation: 'pulse 2s infinite',
              }}
            />
            <span>Next-gen Indian Railway Intelligence • 99.4% Tracking Accuracy</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              color: 'var(--color-text)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Track any train in India
          </h1>

          <p style={{ fontSize: '1.0625rem', color: 'var(--color-text-secondary)', maxWidth: '640px', lineHeight: 1.5, margin: 0 }}>
            Real-time GPS tracking, platform locators, delay predictions, and live station arrival boards across 12,000+ daily trains.
          </p>

          {/* Search Box */}
          <div style={{ width: '100%', marginTop: '1rem' }}>
            <TrainSearchHub />
          </div>
        </div>
      </section>

      {/* Bento Grid: Recent Searches & Favourites */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Left Column: Recent Searches */}
        <Card padding="lg">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '0.875rem',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} style={{ color: 'var(--color-text-secondary)' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Recent Searches</h2>
            </div>
            {recentSearches.length > 0 && (
              <button
                type="button"
                onClick={clearAllRecent}
                style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 500 }}
              >
                Clear all
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.75rem' }}>
            {recentSearches.length === 0 ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                No recent searches yet. Search for any train above to track it live.
              </div>
            ) : (
              recentSearches.map((train) => {
                const trainNum = train.trainNumber || (train as any).number;
                return (
                  <div
                    key={trainNum}
                    onClick={() => trainNum && navigate(`/train/${trainNum}`)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    className="rg-recent-row"
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                        {trainNum} • {train.trainName || (train as any).name}
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
                        <span>{train.source?.code}</span>
                        <ArrowRight size={13} style={{ color: 'var(--color-text-muted)' }} />
                        <span>{train.destination?.code}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--color-primary)' }} />
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Column: Favourite & Pinned Trains */}
        <Card padding="lg">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '0.875rem',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} style={{ color: 'var(--color-warning)', fill: 'var(--color-warning)' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Saved & Favourite Trains</h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {favourites.length} Active Pins
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.75rem' }}>
            {favourites.map((fav) => {
              const favNum = fav.trainNumber || (fav as any).number;
              return (
                <div
                  key={favNum}
                  onClick={() => favNum && navigate(`/train/${favNum}`)}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.875rem',
                    backgroundColor: 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  className="rg-favourite-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>
                        {favNum}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                        {fav.trainName || (fav as any).name}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-success-soft)',
                        color: 'var(--color-success)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Track Live
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    Tap to view live route map, speed telemetry, elevation, and station weather
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* Quick Tool Banners: PNR & Station Arrivals Board */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* PNR Tool */}
        <Card padding="lg">
          <form onSubmit={handleCheckPnr} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ticket size={20} />
              </span>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                  Check PNR Status
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                  Confirmation probability & coach allocation
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="text"
                maxLength={10}
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value)}
                placeholder="Enter 10-digit PNR (e.g. 2451829012)"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                }}
              />
              <Button type="submit" variant="primary" size="sm">
                Check
              </Button>
            </div>
          </form>
        </Card>

        {/* Station Board Tool */}
        <Card padding="lg">
          <form onSubmit={handleCheckStation} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-info-soft)',
                  color: 'var(--color-info)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={20} />
              </span>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                  Station Arrivals & Departures
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                  Electronic display board for any Indian station
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="text"
                maxLength={5}
                value={stationInput}
                onChange={(e) => setStationInput(e.target.value.toUpperCase())}
                placeholder="Station Code (e.g. NDLS, MMCT, BSB)"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                }}
              />
              <Button type="submit" variant="secondary" size="sm">
                View Board
              </Button>
            </div>
          </form>
        </Card>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Precision tools engineered for seamless rail travel
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Direct integrations with Central Railway telemetry, MapTiler vector maps, OpenWeather, and OpenTopography.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <Card padding="lg">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Satellite size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Live GPS Status</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Sub-meter precision tracking with multi-tower cell triangulation and crowd-verified NTES feeds, updated continuously.
            </p>
          </Card>

          <Card padding="lg">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-info-soft)',
                color: 'var(--color-info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <MapIcon size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Interactive Route Map</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              High-resolution vector maps, route elevation profiles from OpenTopography, and station stop layouts in real-time.
            </p>
          </Card>

          <Card padding="lg">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-soft)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Delay & Weather Telemetry</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Section congestion warnings, fog alerts with OpenWeather visibility sensors, and punctuality predictions.
            </p>
          </Card>
        </div>
      </section>

      {/* PNR Modal */}
      <PnrStatusModal
        isOpen={isPnrModalOpen}
        onClose={() => setIsPnrModalOpen(false)}
        pnrNumber={pnrInput || '2451829012'}
      />

      {/* Station Board Modal */}
      <StationBoardModal
        isOpen={isStationModalOpen}
        onClose={() => setIsStationModalOpen(false)}
        stationCode={stationInput || 'NDLS'}
      />
    </div>
  );
};

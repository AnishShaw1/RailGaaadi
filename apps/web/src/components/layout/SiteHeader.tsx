import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Train, Globe, Radio } from 'lucide-react';

export const SiteHeader: React.FC = () => {
  const location = useLocation();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '1.375rem',
              color: 'var(--color-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            <span
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Train size={20} />
            </span>
            <span>RailGaadi</span>
          </Link>

          {/* Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
            }}
            className="rg-desktop-nav"
          >
            <Link
              to="/"
              style={{
                color: location.pathname === '/' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: location.pathname === '/' ? '2px solid var(--color-primary)' : '2px solid transparent',
                paddingBottom: '4px',
              }}
            >
              Live Status
            </Link>
            <Link
              to="/train/12952"
              style={{
                color: location.pathname.startsWith('/train/12952') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: location.pathname.startsWith('/train/12952') ? '2px solid var(--color-primary)' : '2px solid transparent',
                paddingBottom: '4px',
              }}
            >
              Tejas Rajdhani
            </Link>
            <Link
              to="/train/22436"
              style={{
                color: location.pathname.startsWith('/train/22436') ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: location.pathname.startsWith('/train/22436') ? '2px solid var(--color-primary)' : '2px solid transparent',
                paddingBottom: '4px',
              }}
            >
              Vande Bharat
            </Link>
          </nav>
        </div>

        {/* Right Trailing cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Live NTP Data Feed Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-success-soft)',
              color: 'var(--color-success)',
              border: '1px solid var(--color-success-border)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
            className="rg-live-feed-pill"
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
                display: 'inline-block',
                animation: 'pulse 2s infinite',
              }}
            />
            <span>Live Data Feed Active</span>
          </div>

          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--color-text-secondary)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
            aria-label="Change language"
          >
            <Globe size={15} />
            <span>EN / हिन्दी</span>
          </button>
        </div>
      </div>
    </header>
  );
};

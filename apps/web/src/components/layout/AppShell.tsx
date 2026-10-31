import React from 'react';
import { SiteHeader } from './SiteHeader.js';
import { Train } from 'lucide-react';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <SiteHeader />
      <main style={{ flex: 1, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
        {children}
      </main>
      <footer
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          marginTop: '3rem',
          padding: '2rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Train size={14} />
            </span>
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>RailGaadi</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
              © 2025 RailGaadi • Data sourced via IRCTC / NTES live feeds. Unofficial informational platform.
            </span>
          </div>

          <nav style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem' }}>
            <a href="#terms" style={{ color: 'var(--color-text-muted)' }}>Terms of Service</a>
            <a href="#privacy" style={{ color: 'var(--color-text-muted)' }}>Privacy Policy</a>
            <a href="#status" style={{ color: 'var(--color-text-muted)' }}>System Status</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

import React from 'react';
import { Megaphone, Utensils, Wrench } from 'lucide-react';
import { TrainStatus } from '../../types/train.js';

export interface PassengerLiveAdvisoryProps {
  status: TrainStatus;
}

export const PassengerLiveAdvisory: React.FC<PassengerLiveAdvisoryProps> = ({ status }) => {
  const currentStn = status.lastReportedStation?.name || 'Vadodara';
  const nextStn = status.nextStation?.station?.name || 'Godhra Jn';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'var(--radius-lg, 16px)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-border, #f1f5f9)',
        }}
      >
        <Megaphone size={18} style={{ color: 'var(--color-primary, #2563eb)' }} />
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-text, #0f172a)', margin: 0 }}>
          Passenger Live Advisory
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {/* Advisory item 1 */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #f1f5f9',
            borderRadius: 'var(--radius-md, 10px)',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '1px',
            }}
          >
            <Utensils size={15} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
              Catering Service:
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
              Meal & snacks service active post {currentStn} departure. On-board IRCTC e-catering operational on berth.
            </div>
          </div>
        </div>

        {/* Advisory item 2 */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #f1f5f9',
            borderRadius: 'var(--radius-md, 10px)',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '1px',
            }}
          >
            <Wrench size={15} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
              Speed Clearance:
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
              Engineering slow-order lifted between {currentStn} and {nextStn}. Train expected to recover ~7 minutes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

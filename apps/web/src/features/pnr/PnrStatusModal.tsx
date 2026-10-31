import React from 'react';
import { X, CheckCircle, Ticket, User, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button.js';

export interface PnrStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  pnrNumber: string;
}

export const PnrStatusModal: React.FC<PnrStatusModalProps> = ({ isOpen, onClose, pnrNumber }) => {
  if (!isOpen) return null;

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
          maxWidth: '520px',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
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
              <Ticket size={18} />
            </span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
              PNR Status: {pnrNumber}
            </h3>
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

        {/* Status Confirmation Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-success-soft)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle size={24} style={{ color: 'var(--color-success)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-success)' }}>
                CONFIRMED (CNF)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Confirmation Probability: 100%
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-success-border)',
              color: 'var(--color-success)',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            Chart Not Prepared
          </span>
        </div>

        {/* Passenger Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontWeight: 600 }}>Passenger 1</span>
            </div>
            <div>
              Booking: <strong style={{ color: 'var(--color-text)' }}>B3, Berth 42 (MB)</strong> • Current: <strong style={{ color: 'var(--color-success)' }}>CNF</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

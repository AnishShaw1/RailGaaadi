import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { useShareJourney } from '../../hooks/useShareJourney.js';

export interface ShareJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainNumber: string;
  trainName: string;
  date?: string;
}

export const ShareJourneyModal: React.FC<ShareJourneyModalProps> = ({
  isOpen,
  onClose,
  trainNumber,
  trainName,
  date,
}) => {
  const { getShareUrl, shareJourney, copied } = useShareJourney();
  const shareUrl = getShareUrl(trainNumber, date);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(17, 25, 35, 0.6)',
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
          maxWidth: '480px',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 id="share-modal-title" style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
              Share Live Tracking
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          Anyone with this link can view the live running status and map of {trainName} ({trainNumber}) without needing an account.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.75rem',
            marginBottom: '1.25rem',
            gap: '0.5rem',
          }}
        >
          <input
            type="text"
            readOnly
            value={shareUrl}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.8125rem',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <button
            type="button"
            onClick={() => shareJourney(trainNumber, trainName, date)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: copied ? 'var(--color-success-soft)' : 'var(--color-surface)',
              color: copied ? 'var(--color-success)' : 'var(--color-primary)',
              border: '1px solid var(--color-border)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => shareJourney(trainNumber, trainName, date)}
            leftIcon={<Share2 size={15} />}
          >
            Share via System
          </Button>
        </div>
      </div>
    </div>
  );
};

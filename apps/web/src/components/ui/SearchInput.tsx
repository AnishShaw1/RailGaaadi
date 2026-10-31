import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSearchSubmit?: () => void;
  shortcutHint?: string;
  isLoading?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  onSearchSubmit,
  shortcutHint = '⌘K',
  isLoading = false,
  placeholder = 'Enter train number or name...',
  className = '',
  ...props
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      e.preventDefault();
      onSearchSubmit();
    }
    if (e.key === 'Escape' && onClear) {
      e.preventDefault();
      onClear();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '0 1rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        position: 'relative',
        width: '100%',
      }}
      className={`rg-search-input-wrapper ${className}`}
    >
      <Search
        size={22}
        style={{ color: 'var(--color-text-muted)', marginRight: '0.75rem', flexShrink: 0 }}
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          flex: 1,
          height: '100%',
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          fontSize: '1rem',
          color: 'var(--color-text)',
        }}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          aria-label="Clear search query"
          style={{
            padding: '4px',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-xs)',
            marginRight: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
      )}
      {shortcutHint && !value && (
        <span
          style={{
            fontSize: '0.75rem',
            padding: '2px 6px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--color-surface-subtle)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-mono)',
            userSelect: 'none',
          }}
        >
          {shortcutHint}
        </span>
      )}
    </div>
  );
};

import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string; // Strictly required for accessibility
  variant?: 'surface' | 'ghost' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  'aria-label': ariaLabel,
  children,
  variant = 'surface',
  size = 'md',
  disabled,
  style,
  className = '',
  ...props
}) => {
  const dimension = size === 'sm' ? '36px' : size === 'lg' ? '48px' : '44px';

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: dimension,
    height: dimension,
    minWidth: dimension,
    minHeight: dimension,
    borderRadius: 'var(--radius-sm)',
    transition: 'all var(--transition-fast)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: variant === 'surface' ? '1px solid var(--color-border)' : '1px solid transparent',
    backgroundColor:
      variant === 'surface'
        ? 'var(--color-surface)'
        : variant === 'primary'
        ? 'var(--color-primary)'
        : 'transparent',
    color: variant === 'primary' ? '#ffffff' : 'var(--color-text-secondary)',
    ...style,
  };

  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      style={baseStyles}
      className={`rg-icon-button ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

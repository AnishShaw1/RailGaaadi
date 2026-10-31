import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    borderRadius: 'var(--radius-sm)',
    transition: 'all var(--transition-fast)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    minHeight: size === 'sm' ? '36px' : size === 'lg' ? '48px' : '44px',
    padding: size === 'sm' ? '0 0.75rem' : size === 'lg' ? '0 1.5rem' : '0 1.125rem',
    fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.0625rem' : '0.9375rem',
    textDecoration: 'none',
    boxShadow: variant === 'primary' ? 'var(--shadow-sm)' : 'none',
    ...style,
  };

  let variantStyles: React.CSSProperties = {};
  switch (variant) {
    case 'primary':
      variantStyles = {
        backgroundColor: 'var(--color-primary)',
        color: '#ffffff',
        border: '1px solid transparent',
      };
      break;
    case 'secondary':
      variantStyles = {
        backgroundColor: 'var(--color-primary-soft)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-primary-border)',
      };
      break;
    case 'outline':
      variantStyles = {
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
      };
      break;
    case 'ghost':
      variantStyles = {
        backgroundColor: 'transparent',
        color: 'var(--color-text-secondary)',
        border: '1px solid transparent',
      };
      break;
    case 'danger':
      variantStyles = {
        backgroundColor: 'var(--color-danger)',
        color: '#ffffff',
        border: '1px solid transparent',
      };
      break;
  }

  return (
    <button
      disabled={disabled || isLoading}
      style={{ ...baseStyles, ...variantStyles }}
      className={`rg-button rg-button-${variant} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

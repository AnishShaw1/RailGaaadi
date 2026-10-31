import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  interactive = false,
  style,
  className = '',
  ...props
}) => {
  const paddingMap = {
    none: '0',
    sm: '0.75rem',
    md: '1.25rem',
    lg: '1.5rem',
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: paddingMap[padding],
        boxShadow: 'var(--shadow-sm)',
        transition: interactive ? 'transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)' : undefined,
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      }}
      className={`rg-card ${interactive ? 'rg-card-interactive' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

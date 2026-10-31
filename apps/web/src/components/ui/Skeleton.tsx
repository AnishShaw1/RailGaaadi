import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-xs)',
  style,
  className = '',
  ...props
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--color-surface-subtle)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      className={`rg-skeleton ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
};

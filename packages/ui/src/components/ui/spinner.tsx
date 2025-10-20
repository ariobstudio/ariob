import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const dimension = sizeMap[size];

  return (
    <view
      className={cn('inline-flex items-center justify-center', className)}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
      }}
    >
      <view
        style={{
          width: `${dimension}px`,
          height: `${dimension}px`,
          border: '2px solid var(--muted)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </view>
  );
}

import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  'rounded-full border-solid',
  {
    variants: {
      size: {
        sm: 'border-2',
        md: 'border-2',
        lg: 'border-[3px]',
        xl: 'border-4',
      },
      color: {
        // Standalone colors (visible on background)
        default: 'border-foreground',
        primary: 'border-primary',
        muted: 'border-muted-foreground',
        destructive: 'border-destructive',
        // Button colors (for use on colored backgrounds)
        'on-primary': 'border-primary-foreground',
        'on-destructive': 'border-destructive-foreground',
        'on-secondary': 'border-secondary-foreground',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'default',
    },
  }
);

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export function Spinner({ size = 'md', color = 'default', className }: SpinnerProps) {
  const spinnerSize = (size || 'md') as keyof typeof sizeMap;
  const dimension = sizeMap[spinnerSize];

  return (
    <view
      className={cn('inline-flex items-center justify-center', className)}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
      }}
    >
      <view
        data-slot="spinner"
        className={cn(spinnerVariants({ size: spinnerSize, color }))}
        style={{
          width: `${dimension}px`,
          height: `${dimension}px`,
          borderTopColor: 'transparent',
          animationName: 'spin',
          animationDuration: '0.8s',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      />
    </view>
  );
}

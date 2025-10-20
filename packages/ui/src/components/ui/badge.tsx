import { type VariantProps, cva } from 'class-variance-authority';
import type { ViewProps } from '@lynx-js/types';
import * as React from '@lynx-js/react';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold transition-colors shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
        outline: 'border border-border bg-background text-foreground',
        muted: 'bg-muted text-muted-foreground',
      },
      size: {
        sm: 'h-4 min-w-4 px-1 text-[10px]',
        default: 'h-5 min-w-5 px-2 text-xs',
        lg: 'h-6 min-w-6 px-2.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface BadgeProps extends ViewProps, VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
  /**
   * Show as a dot indicator without text
   */
  dot?: boolean;
}

function Badge({
  className,
  variant,
  size,
  dot,
  children,
  ...props
}: BadgeProps) {
  if (dot) {
    return (
      <view
        data-slot="badge"
        className={cn(
          'h-2 w-2 min-w-2 rounded-full',
          variant === 'default' && 'bg-primary',
          variant === 'secondary' && 'bg-secondary',
          variant === 'destructive' && 'bg-destructive',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'outline' && 'border border-border bg-background',
          variant === 'muted' && 'bg-muted',
          className
        )}
        {...props}
      />
    );
  }

  return (
    <view
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {children && (
        <text className="leading-none">{children}</text>
      )}
    </view>
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };

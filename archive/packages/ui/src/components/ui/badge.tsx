import { type VariantProps, cva } from 'class-variance-authority';
import type { ViewProps } from '@lynx-js/types';
import * as React from '@lynx-js/react';

import { cn } from '../../lib/utils';
import type { LynxReactNode } from '../../types/react';

const badgeVariants = cva(
  'flex flex-row items-center justify-center border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 gap-1 transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow [&>text]:text-primary-foreground',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [&>text]:text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow [&>text]:text-destructive-foreground',
        outline:
          'text-foreground border-border [&>text]:text-foreground',
        success:
          'border-transparent bg-green-500 text-white shadow [&>text]:text-white',
        warning:
          'border-transparent bg-yellow-500 text-white shadow [&>text]:text-white',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      radius: 'full',
    },
  },
);

interface BadgeProps extends ViewProps, VariantProps<typeof badgeVariants> {
  children?: LynxReactNode;
}

function Badge({
  className,
  variant,
  radius,
  children,
  ...props
}: BadgeProps) {
  return (
    <view
      data-slot="badge"
      className={cn(badgeVariants({ variant, radius }), className)}
      {...props}
    >
      {typeof children === 'string' ? (
        <text className="leading-none">{children}</text>
      ) : (
        children
      )}
    </view>
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };

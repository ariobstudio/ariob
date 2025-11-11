import * as React from '@lynx-js/react';
import type { ViewProps } from '@lynx-js/types';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface LabelProps extends ViewProps, VariantProps<typeof labelVariants> {
  /**
   * Whether the associated input is required
   */
  required?: boolean;
  /**
   * Whether the associated input is disabled
   */
  disabled?: boolean;
}

function Label({
  className,
  variant,
  required,
  disabled,
  children,
  ...props
}: LabelProps) {
  return (
    <view
      data-slot="label"
      className={cn(
        labelVariants({ variant }),
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      <text>
        {children}
        {required && <text className="text-destructive ml-1">*</text>}
      </text>
    </view>
  );
}

export { Label, labelVariants };
export type { LabelProps };

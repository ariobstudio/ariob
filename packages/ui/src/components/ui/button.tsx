import { type VariantProps, cva } from 'class-variance-authority';

import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';
import { type ViewProps } from '@lynx-js/types';

const buttonVariants = cva(
  'flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs',
        destructive: 'bg-destructive text-destructive-foreground shadow-xs',
        outline: 'border border-border bg-background text-foreground shadow-xs',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs',
        ghost: 'text-foreground',
        link: 'text-primary underline-offset-4',
      },
      size: {
        default: 'h-11 min-w-11 px-4',
        sm: 'h-9 min-w-9 rounded-lg gap-1.5 px-3',
        lg: 'h-12 min-w-12 rounded-lg px-6',
        icon: 'h-11 w-11 min-w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const textVariants = cva('', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-white',
      outline: 'text-accent-foreground',
      secondary: 'text-secondary-foreground',
      ghost: 'text-accent-foreground',
      link: 'text-primary',
    },
    size: {
      default: 'text-sm',
      sm: 'text-xs',
      lg: 'text-lg',
      icon: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

interface ButtonProps
  extends ViewProps,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  disabled?: boolean;
  onTap?: () => void;
}

function Button({ className, variant, size, icon, onTap, disabled, children, ...props }: ButtonProps) {
  const handleTap = () => {
    'background only';
    console.log('[Button] Tap detected');
    console.log('[Button] - Disabled:', disabled);
    console.log('[Button] - Has onTap handler:', !!onTap);
    console.log('[Button] - Children:', children);

    if (onTap && !disabled) {
      console.log('[Button] Executing onTap callback');
      onTap();
    } else if (!onTap) {
      console.warn('[Button] No onTap handler provided');
    } else if (disabled) {
      console.log('[Button] Button is disabled, ignoring tap');
    }
  };

  return (
  <view
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      bindtap={handleTap}
      {...(props as any)}
    >
      {icon && icon as React.ReactNode}
      {children && (
        <text className={cn(textVariants({ variant, size, className }))}>
          {children}
        </text>
      )}
    </view>
  );
}

export { Button, buttonVariants };

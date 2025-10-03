import { type VariantProps, cva } from 'class-variance-authority';

import * as React from '@lynx-js/react';
import lucideGlyphs from '../../lib/lucide.json';
import { cn } from '../../lib/utils';
import { Icon } from './icon';
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
  icon?: keyof typeof lucideGlyphs;
  disabled?: boolean;
  onClick?: () => void;
}

function Button({ className, variant, size, icon, ...props }: ButtonProps) {
  return (
  <view
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      bindtap={props.onClick}
      {...props}
    >
      {icon && <Icon className={cn(textVariants({ variant }))} name={icon} />}
      {props.children && (
        <text className={cn(textVariants({ variant, size, className }))}>
          {props.children}
        </text>
      )}
    </view>
  );
}

export { Button, buttonVariants };

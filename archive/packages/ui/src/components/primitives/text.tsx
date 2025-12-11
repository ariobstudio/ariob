import { type VariantProps, cva } from 'class-variance-authority';
import type { ViewProps } from '@lynx-js/types';
import type * as React from '@lynx-js/react';

import { cn } from '../../lib/utils';
import type { LynxReactNode } from '../../types/react';

const textVariants = cva('', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
    },
    variant: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      destructive: 'text-destructive',
      card: 'text-card-foreground',
      accent: 'text-accent-foreground',
      secondary: 'text-secondary-foreground',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    transform: {
      none: '',
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize',
    },
    leading: {
      none: 'leading-none',
      tight: 'leading-tight',
      snug: 'leading-snug',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
      loose: 'leading-loose',
    },
    wrap: {
      normal: '',
      nowrap: 'whitespace-nowrap',
      pre: 'whitespace-pre',
      'pre-wrap': 'whitespace-pre-wrap',
      'break-words': 'break-words',
    },
  },
  defaultVariants: {
    size: 'base',
    variant: 'default',
    weight: 'normal',
    align: 'left',
    transform: 'none',
    leading: 'normal',
    wrap: 'normal',
  },
});

interface TextProps
  extends Omit<ViewProps, 'children'>,
    VariantProps<typeof textVariants> {
  children?: LynxReactNode;
  /**
   * Truncate text with ellipsis (single line)
   */
  truncate?: boolean;
  /**
   * Limit text to N lines with ellipsis
   */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
}

function Text({
  className,
  size,
  variant,
  weight,
  align,
  transform,
  leading,
  wrap,
  truncate,
  lineClamp,
  children,
  ...props
}: TextProps) {
  const lineClampClass = lineClamp
    ? `line-clamp-${lineClamp}`
    : truncate
    ? 'truncate'
    : '';

  return (
    <text
      data-slot="text"
      className={cn(
        textVariants({
          size,
          variant,
          weight,
          align,
          transform,
          leading,
          wrap,
        }),
        lineClampClass,
        className
      )}
      {...props}
    >
      {children}
    </text>
  );
}

export { Text, textVariants };
export type { TextProps };

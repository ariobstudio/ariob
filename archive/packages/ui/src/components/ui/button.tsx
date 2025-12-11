import { type VariantProps, cva } from 'class-variance-authority';

import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';
import { type ViewProps } from '@lynx-js/types';
import { Spinner } from './spinner';
import type { LynxReactNode } from '../../types/react';

/**
 * Button Component
 *
 * A versatile button component with multiple variants, sizes, and states.
 * Uses LynxJS dual-thread architecture with main-thread touch handlers for smooth interactions.
 * Optimized for mobile with larger default size. Supports prefix/suffix icons.
 *
 * @example
 * ```tsx
 * // Basic button
 * <Button onTap={handleClick}>Click me</Button>
 *
 * // With prefix icon (icon prop is alias for prefix)
 * <Button icon={<Icon name="heart" />}>Like</Button>
 * <Button prefix={<Icon name="heart" />}>Like</Button>
 *
 * // With suffix icon
 * <Button suffix={<Icon name="arrow-right" />}>Next</Button>
 *
 * // With both prefix and suffix
 * <Button prefix={<Icon name="mail" />} suffix={<Icon name="send" />}>
 *   Send Email
 * </Button>
 *
 * // Loading state
 * <Button loading>Processing...</Button>
 *
 * // Icon-only button
 * <Button size="icon"><Icon name="settings" /></Button>
 * ```
 */

const buttonVariants = cva(
  'flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none [&_text]:font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [&_text]:text-primary-foreground',
        destructive:
          'bg-destructive text-destructive-foreground [&_text]:text-destructive-foreground',
        outline:
          'border border-input bg-background text-foreground [&_text]:text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground [&_text]:text-secondary-foreground',
        ghost: 'text-foreground [&_text]:text-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 [&_text]:text-primary',
      },
      size: {
        default: 'h-10 px-4 py-2 [&_text]:text-sm',  // Increased from h-9 to h-10 for mobile
        sm: 'h-9 gap-1.5 px-3 [&_text]:text-xs',
        lg: 'h-11 px-6 [&_text]:text-base',
        icon: 'size-10 p-2',  // Increased from size-9 to size-10
        'icon-sm': 'size-9 p-1.5',
        'icon-lg': 'size-11 p-2.5',
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
      size: 'default',
      radius: 'md',
    },
  },
);


interface ButtonProps
  extends ViewProps,
    VariantProps<typeof buttonVariants> {
  /** Icon element to display before text (alias for prefix, hidden when loading) */
  icon?: LynxReactNode;
  /** Icon element to display before text (hidden when loading) */
  prefix?: LynxReactNode;
  /** Icon element to display after text (hidden when loading) */
  suffix?: LynxReactNode;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show loading spinner */
  loading?: boolean;
  /** Callback when button is tapped - runs on background thread */
  onTap?: () => void;
}

function Button({ className, variant, size, radius, icon, prefix, suffix, onTap, disabled, loading, children, ...props }: ButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false);

  const isDisabled = disabled || loading;

  const handleTouchStart = () => {
    'main thread';
    if (!isDisabled) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    'main thread';
    setIsPressed(false);
  };

  const handleTap = () => {
    'background only';
    if (onTap && !isDisabled) {
      onTap();
    }
  };

  // Helper to wrap string children in text elements
  const renderChildren = () => {
    if (!children) return null;

    // If children is a string, wrap it in a text element
    if (typeof children === 'string') {
      return <text>{children}</text>;
    }

    // Otherwise render as-is
    return children;
  };

  // Resolve prefix: use explicit prefix if provided, otherwise fall back to icon for backward compatibility
  const prefixIcon = prefix || icon;

  return (
    <view
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, radius }),
        // Disabled state styling
        isDisabled && 'opacity-50 cursor-not-allowed',
        // Pressed state styling (only when not disabled)
        isPressed && !isDisabled && variant === 'default' && 'bg-primary/90',
        isPressed && !isDisabled && variant === 'destructive' && 'bg-destructive/90',
        isPressed && !isDisabled && variant === 'secondary' && 'bg-secondary/80',
        isPressed && !isDisabled && variant === 'outline' && 'bg-accent text-accent-foreground',
        isPressed && !isDisabled && variant === 'ghost' && 'bg-accent text-accent-foreground',
        className
      )}
      bindtap={handleTap}
      main-thread:bindtouchstart={handleTouchStart}
      main-thread:bindtouchend={handleTouchEnd}
      {...(props as any)}
    >
      {loading && <Spinner size="sm" color={
        variant === 'default' ? 'on-primary' :
        variant === 'destructive' ? 'on-destructive' :
        variant === 'secondary' ? 'on-secondary' :
        'default'
      } />}
      {prefixIcon && !loading && (prefixIcon as LynxReactNode)}
      {renderChildren()}
      {suffix && !loading && (suffix as LynxReactNode)}
    </view>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };

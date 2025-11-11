import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';
import { type InputProps as NativeInputProps } from '@lynx-js/types';
import type { LynxReactNode } from '../../types/react';

/**
 * Input Component
 *
 * A themed text input component with optional icon support and proper LynxJS dual-thread support.
 * Optimized for mobile with proper dark mode support.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Input placeholder="Enter text" value={text} onChange={setText} />
 *
 * // With prefix icon
 * <Input prefix={<Icon name="search" />} placeholder="Search..." />
 *
 * // With suffix icon
 * <Input suffix={<Icon name="check" />} placeholder="Confirm" />
 *
 * // Password input
 * <Input type="password" placeholder="Enter password" />
 * ```
 */

interface InputProps extends Omit<NativeInputProps, 'disabled' | 'type'> {
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Input type */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'digit';
  /** Current value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Input size */
  size?: 'sm' | 'default' | 'lg';
  /** Border radius size */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Callback when value changes - runs on background thread */
  onChange?: (value: string) => void;
  /** Callback when input loses focus - runs on background thread */
  onBlur?: () => void;
  /** Callback when input gains focus - runs on background thread */
  onFocus?: () => void;
  /** Icon or element to display before input text */
  prefix?: LynxReactNode;
  /** Icon or element to display after input text */
  suffix?: LynxReactNode;
}

function Input({
  className,
  type = 'text',
  size = 'default',
  radius = 'lg',
  onChange,
  onBlur,
  onFocus,
  disabled,
  placeholder,
  prefix,
  suffix,
  ...props
}: InputProps) {
  const handleInput = (e: any) => {
    'background only';
    if (onChange) {
      onChange(e.detail.value);
    }
  };

  const handleBlur = () => {
    'background only';
    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    'background only';
    if (onFocus) {
      onFocus();
    }
  };

  // Map size prop to Tailwind classes
  const sizeClasses = {
    sm: {
      container: 'h-9 px-3',
      input: 'text-sm',
      affix: 'text-sm [&_svg]:size-4',
    },
    default: {
      container: 'h-11 px-3',
      input: 'text-base',
      affix: 'text-base [&_svg]:size-4',
    },
    lg: {
      container: 'h-12 px-4',
      input: 'text-lg',
      affix: 'text-lg [&_svg]:size-5',
    },
  };

  // Map radius prop to Tailwind class
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const selectedSize = sizeClasses[size];

  const wrapperClasses = cn(
    'relative flex w-full min-w-0 items-center border border-input bg-background shadow-xs transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-1 focus-within:ring-ring',
    radiusClasses[radius],
    selectedSize.container,
    disabled && 'cursor-not-allowed opacity-60',
    className
  );

  const inputClasses = cn(
    'flex-1 min-w-0 bg-transparent text-foreground placeholder:text-muted-foreground outline-none border-0 shadow-none h-full',
    selectedSize.input,
    disabled && 'cursor-not-allowed'
  );

  return (
    <view data-slot="input-wrapper" className={wrapperClasses}>
      {prefix && (
        <view className={cn('flex items-center text-muted-foreground pointer-events-none pr-2', selectedSize.affix)}>
          {prefix}
        </view>
      )}
      <input
        type={type}
        data-slot="input"
        placeholder={placeholder}
        className={inputClasses}
        disabled={disabled}
        bindinput={disabled ? undefined : handleInput}
        bindblur={disabled ? undefined : handleBlur}
        bindfocus={disabled ? undefined : handleFocus}
        {...props}
      />
      {suffix && (
        <view className={cn('flex items-center text-muted-foreground pointer-events-none pl-2', selectedSize.affix)}>
          {suffix}
        </view>
      )}
    </view>
  );
}

export { Input };
export type { InputProps };

/**
 * TextArea Component
 *
 * Multi-line text input component built on LynxJS native textarea element.
 * Designed for collecting longer-form text input from users with proper
 * theming, validation, and accessibility support.
 *
 * Features:
 * - Native LynxJS textarea with dual-thread performance
 * - Theming support for light/dark modes
 * - Input type variants (text, number, email, etc.)
 * - Character and line limits with validation
 * - Read-only and disabled states
 * - Custom confirm actions (send, search, done, etc.)
 * - Auto-height or fixed-height modes
 * - Regex-based input filtering
 *
 * @see https://lynxjs.org/api/elements/built-in/textarea
 * @see https://ui.shadcn.com/docs/components/textarea
 */

import * as React from '@lynx-js/react';
import { cn } from '../../lib/utils';
import { type TextAreaProps as NativeTextareaProps } from '@lynx-js/types';
import { type VariantProps, cva } from 'class-variance-authority';

const textareaVariants = cva(
  'flex w-full min-w-0 text-base outline-none transition-colors box-border',
  {
    variants: {
      size: {
        sm: 'px-3 py-2 text-sm leading-tight',
        default: 'px-3 py-2 leading-normal',
        lg: 'px-4 py-2.5 text-lg leading-normal',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
      },
      variant: {
        default: 'bg-background border border-input shadow-sm',
        filled: 'bg-muted border border-transparent',
        outline: 'bg-transparent border-2 border-input',
      },
    },
    defaultVariants: {
      size: 'default',
      radius: 'md',
      variant: 'default',
    },
  }
);

export interface TextAreaProps
  extends Omit<NativeTextareaProps, 'disabled' | 'type'>,
    VariantProps<typeof textareaVariants> {
  /** Additional CSS classes */
  className?: string;

  // Value and change handling
  /** Current value */
  value?: string;
  /** Callback when value changes - runs on background thread */
  onChange?: (value: string) => void;

  // Placeholder and type
  /** Placeholder text with theme-aware color */
  placeholder?: string;
  /** Keyboard input type for mobile optimization */
  type?: 'text' | 'number' | 'digit' | 'tel' | 'email';

  // Input limits
  /** Maximum character count (default: 140) */
  maxlength?: number;
  /** Maximum line count (default: 140) */
  maxlines?: number;
  /** Single-character regex pattern for input filtering (e.g., "[0-9]" for digits only) */
  inputFilter?: string;

  // Size and behavior
  /** Number of visible rows (fixed height) - Default: 3 */
  rows?: number;
  /** Whether to auto-expand with content - CAUTION: May cause unexpected layout shifts */
  autoHeight?: boolean;

  // States
  /** Whether the textarea is disabled (no editing, but allows text selection like readonly) */
  disabled?: boolean;
  /** Read-only mode (no editing, but allows text selection and copying) */
  readonly?: boolean;

  // Keyboard behavior
  /** Show keyboard automatically on focus (default: true) */
  showSoftInputOnFocus?: boolean;
  /** IME enter key behavior for mobile keyboards */
  confirmType?: 'send' | 'search' | 'go' | 'done' | 'next';

  // Event callbacks (all run on background thread)
  /** Callback when textarea gains focus */
  onFocus?: (value: string) => void;
  /** Callback when textarea loses focus */
  onBlur?: (value: string) => void;
  /** Callback when confirm/enter key is pressed */
  onConfirm?: (value: string) => void;
  /** Callback when text selection changes */
  onSelectionChange?: (start: number, end: number) => void;
}

/**
 * TextArea - Multi-line text input component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TextArea
 *   placeholder="Enter your message..."
 *   value={text}
 *   onChange={setText}
 * />
 *
 * // With character limit
 * <TextArea
 *   placeholder="Tweet (280 chars max)"
 *   maxlength={280}
 *   value={tweet}
 *   onChange={setTweet}
 * />
 *
 * // Number input with custom confirm
 * <TextArea
 *   type="number"
 *   placeholder="Enter amount"
 *   confirmType="done"
 *   onConfirm={handleSubmit}
 * />
 *
 * // Auto-height (expands with content)
 * <TextArea
 *   autoHeight
 *   placeholder="This will expand as you type..."
 * />
 *
 * // Read-only (can select and copy text)
 * <TextArea
 *   value={logs}
 *   readonly
 *   rows={10}
 * />
 *
 * // Disabled (same as readonly but visually dimmed)
 * <TextArea
 *   value="Cannot edit but can select"
 *   disabled
 *   rows={2}
 * />
 * ```
 */
function TextArea({
  className,
  size,
  radius,
  variant,
  rows = 3,
  autoHeight = false,
  onChange,
  onFocus,
  onBlur,
  onConfirm,
  onSelectionChange,
  disabled,
  readonly,
  placeholder,
  value = '',
  type = 'text',
  maxlength,
  maxlines,
  inputFilter,
  showSoftInputOnFocus = true,
  confirmType,
  style,
  ...props
}: TextAreaProps) {
  // Event handlers with 'background only' directive
  const handleInput = (e: any) => {
    'background only';
    onChange?.(e.detail?.value ?? '');
  };

  const handleFocus = (e: any) => {
    'background only';
    onFocus?.(e.detail?.value ?? '');
  };

  const handleBlur = (e: any) => {
    'background only';
    onBlur?.(e.detail?.value ?? '');
  };

  const handleConfirm = (e: any) => {
    'background only';
    onConfirm?.(e.detail?.value ?? '');
  };

  const handleSelection = (e: any) => {
    'background only';
    const { start, end } = e.detail || { start: 0, end: 0 };
    onSelectionChange?.(start, end);
  };

  // Determine if textarea should be interactive (both disabled and readonly prevent editing)
  const isInteractive = !disabled && !readonly;

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        textareaVariants({ size, radius, variant }),
        // Theme-aware text color (placeholder handled by global CSS)
        'text-foreground',
        // Focus state - border color change only (no ring to avoid size changes)
        'focus:border-ring',
        // Disabled state - same interaction as readonly but visually dimmed
        disabled && 'opacity-50 cursor-default',
        // Read-only state
        readonly && 'cursor-default',
        className
      )}
      style={style}
      // LynxJS native properties
      placeholder={placeholder}
      type={type}
      max-lines={maxlines ?? (autoHeight ? undefined : rows)}
      maxlength={maxlength}
      input-filter={inputFilter}
      auto-height={autoHeight}
      readonly={readonly}
      show-soft-input-on-focus={showSoftInputOnFocus}
      confirm-type={confirmType}
      // Value
      {...({ value } as any)}
      // Event bindings (only if interactive)
      bindinput={isInteractive && onChange ? handleInput : undefined}
      bindfocus={isInteractive && onFocus ? handleFocus : undefined}
      bindblur={isInteractive && onBlur ? handleBlur : undefined}
      bindconfirm={isInteractive && onConfirm ? handleConfirm : undefined}
      bindselection={isInteractive && onSelectionChange ? handleSelection : undefined}
      {...props}
    />
  );
}

export { TextArea, textareaVariants };

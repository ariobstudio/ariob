import * as React from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icon } from './icon';

/**
 * Checkbox Component
 *
 * Custom checkbox implementation for LynxJS with proper dark mode support.
 * Optimized for mobile with larger default size.
 *
 * Built without Radix UI, using view elements and tap handling with LynxJS dual-thread architecture.
 *
 * @example
 * ```tsx
 * function Example() {
 *   const [checked, setChecked] = useState(false);
 *   return (
 *     <Checkbox
 *       checked={checked}
 *       onCheckedChange={setChecked}
 *     />
 *   );
 * }
 * ```
 */

const checkboxVariants = cva(
  'peer shrink-0 border shadow-xs transition-all outline-none flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'size-6',
        default: 'size-7',  // Larger for mobile
        lg: 'size-8',
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
      size: 'default',
      radius: 'md',
    },
  }
);

interface CheckboxProps extends ViewProps, VariantProps<typeof checkboxVariants> {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Callback when checked state changes - runs on background thread */
  onCheckedChange?: (checked: boolean) => void;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Whether the checkbox is required */
  required?: boolean;
  /** Indeterminate state (partially checked) */
  indeterminate?: boolean;
}

function Checkbox({
  className,
  size,
  radius,
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  required = false,
  indeterminate = false,
  ...props
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);

  const checked = controlledChecked !== undefined ? controlledChecked : internalChecked;

  const handleTap = () => {
    'background only';
    if (disabled) return;

    const newChecked = !checked;

    if (controlledChecked === undefined) {
      setInternalChecked(newChecked);
    }

    if (onCheckedChange) {
      onCheckedChange(newChecked);
    }
  };

  return (
    <view
      data-slot="checkbox"
      data-state={checked ? 'checked' : indeterminate ? 'indeterminate' : 'unchecked'}
      className={cn(
        checkboxVariants({ size, radius }),
        // Base state with proper dark mode colors
        'border-input bg-background',
        // Checked state
        checked && 'bg-primary text-primary-foreground border-primary',
        // Indeterminate state
        indeterminate && 'bg-primary text-primary-foreground border-primary',
        // Disabled state
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && 'cursor-pointer',
        className
      )}
      bindtap={handleTap}
      {...props}
    >
      <view
        data-slot="checkbox-indicator"
        className="grid place-content-center w-full h-full text-current"
      >
        {disabled && !checked && !indeterminate ? (
          <Icon name="minus" className="size-3.5 text-muted-foreground" />
        ) : indeterminate ? (
          <view className="h-0.5 w-3 bg-current rounded-full" />
        ) : (
          <Icon
            name="check"
            className={cn(
              "size-6 text-primary-foreground font-bold transition-opacity",
              checked ? "opacity-100" : "opacity-0"
            )}
          />
        )}
      </view>
    </view>
  );
}

export { Checkbox, checkboxVariants };
export type { CheckboxProps };

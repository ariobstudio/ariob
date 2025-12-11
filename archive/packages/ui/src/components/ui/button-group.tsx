import * as React from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Separator } from './separator';
import type { LynxReactNode } from '../../types/react';

const buttonGroupVariants = cva(
  'flex w-fit items-stretch',
  {
    variants: {
      orientation: {
        horizontal:
          '[&>view]:border [&>view]:border-l [&>view:not(:first-child)]:rounded-l-none [&>view:not(:first-child)]:-ml-px [&>view:not(:last-child)]:rounded-r-none',
        vertical:
          'flex-col [&>view]:border [&>view]:border-t [&>view:not(:first-child)]:rounded-t-none [&>view:not(:first-child)]:-mt-px [&>view:not(:last-child)]:rounded-b-none',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    compoundVariants: [
      // Horizontal + radius combinations (set left corners on first, right corners on last)
      {
        orientation: 'horizontal',
        radius: 'none',
        class: '[&>view:first-child]:rounded-tl-none [&>view:first-child]:rounded-bl-none [&>view:last-child]:rounded-tr-none [&>view:last-child]:rounded-br-none',
      },
      {
        orientation: 'horizontal',
        radius: 'sm',
        class: '[&>view:first-child]:rounded-tl-sm [&>view:first-child]:rounded-bl-sm [&>view:last-child]:rounded-tr-sm [&>view:last-child]:rounded-br-sm',
      },
      {
        orientation: 'horizontal',
        radius: 'md',
        class: '[&>view:first-child]:rounded-tl-md [&>view:first-child]:rounded-bl-md [&>view:last-child]:rounded-tr-md [&>view:last-child]:rounded-br-md',
      },
      {
        orientation: 'horizontal',
        radius: 'lg',
        class: '[&>view:first-child]:rounded-tl-lg [&>view:first-child]:rounded-bl-lg [&>view:last-child]:rounded-tr-lg [&>view:last-child]:rounded-br-lg',
      },
      {
        orientation: 'horizontal',
        radius: 'full',
        class: '[&>view:first-child]:rounded-tl-full [&>view:first-child]:rounded-bl-full [&>view:last-child]:rounded-tr-full [&>view:last-child]:rounded-br-full',
      },
      // Vertical + radius combinations (set top corners on first, bottom corners on last)
      {
        orientation: 'vertical',
        radius: 'none',
        class: '[&>view:first-child]:rounded-tl-none [&>view:first-child]:rounded-tr-none [&>view:last-child]:rounded-bl-none [&>view:last-child]:rounded-br-none',
      },
      {
        orientation: 'vertical',
        radius: 'sm',
        class: '[&>view:first-child]:rounded-tl-sm [&>view:first-child]:rounded-tr-sm [&>view:last-child]:rounded-bl-sm [&>view:last-child]:rounded-br-sm',
      },
      {
        orientation: 'vertical',
        radius: 'md',
        class: '[&>view:first-child]:rounded-tl-md [&>view:first-child]:rounded-tr-md [&>view:last-child]:rounded-bl-md [&>view:last-child]:rounded-br-md',
      },
      {
        orientation: 'vertical',
        radius: 'lg',
        class: '[&>view:first-child]:rounded-tl-lg [&>view:first-child]:rounded-tr-lg [&>view:last-child]:rounded-bl-lg [&>view:last-child]:rounded-br-lg',
      },
      {
        orientation: 'vertical',
        radius: 'full',
        class: '[&>view:first-child]:rounded-tl-full [&>view:first-child]:rounded-tr-full [&>view:last-child]:rounded-bl-full [&>view:last-child]:rounded-br-full',
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      radius: 'md',
    },
  }
);

interface ButtonGroupProps extends ViewProps, VariantProps<typeof buttonGroupVariants> {
  children?: LynxReactNode;
}

/**
 * ButtonGroup - Groups multiple buttons together
 *
 * Automatically styles child buttons to remove borders between them
 * and round only the first and last buttons
 *
 * @example
 * ```tsx
 * // Horizontal button group
 * <ButtonGroup>
 *   <Button variant="outline">Left</Button>
 *   <Button variant="outline">Center</Button>
 *   <Button variant="outline">Right</Button>
 * </ButtonGroup>
 *
 * // Vertical orientation
 * <ButtonGroup orientation="vertical">
 *   <Button variant="outline">Top</Button>
 *   <Button variant="outline">Bottom</Button>
 * </ButtonGroup>
 *
 * // Custom radius
 * <ButtonGroup radius="full">
 *   <Button variant="outline">Cut</Button>
 *   <Button variant="outline">Copy</Button>
 *   <Button variant="outline">Paste</Button>
 * </ButtonGroup>
 * ```
 */
function ButtonGroup({
  className,
  orientation = 'horizontal',
  radius = 'md',
  children,
  ...props
}: ButtonGroupProps) {
  return (
    <view
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation, radius }), className)}
      {...props}
    >
      {children}
    </view>
  );
}

interface ButtonGroupTextProps extends ViewProps {
  children?: LynxReactNode;
}

/**
 * ButtonGroupText - Label or text within a button group
 *
 * Styled to match button group appearance
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <ButtonGroupText>Label:</ButtonGroupText>
 *   <Button variant="outline">Option 1</Button>
 *   <Button variant="outline">Option 2</Button>
 * </ButtonGroup>
 * ```
 */
function ButtonGroupText({
  className,
  children,
  ...props
}: ButtonGroupTextProps) {
  return (
    <view
      className={cn(
        'bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4',
        className
      )}
      {...props}
    >
      {typeof children === 'string' ? <text>{children}</text> : children}
    </view>
  );
}

interface ButtonGroupSeparatorProps extends ViewProps {
  /**
   * Orientation of the separator
   * @default "vertical"
   */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * ButtonGroupSeparator - Divider between button group items
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="outline">Cut</Button>
 *   <Button variant="outline">Copy</Button>
 *   <ButtonGroupSeparator />
 *   <Button variant="outline">Paste</Button>
 * </ButtonGroup>
 * ```
 */
function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: ButtonGroupSeparatorProps) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        'bg-input relative !m-0 self-stretch',
        orientation === 'vertical' && 'h-auto',
        className
      )}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
export type { ButtonGroupProps, ButtonGroupTextProps, ButtonGroupSeparatorProps };

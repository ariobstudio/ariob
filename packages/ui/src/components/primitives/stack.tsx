import * as React from '@lynx-js/react';
import { type ViewProps } from '@lynx-js/types';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import type { LynxReactNode } from '../../types/react';

const stackVariants = cva('flex flex-col', {
  variants: {
    spacing: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-10',
    },
  },
  defaultVariants: {
    spacing: 'md',
  },
});

interface StackProps extends ViewProps, VariantProps<typeof stackVariants> {
  children?: LynxReactNode;
  /**
   * Whether to show dividers between children
   */
  divider?: boolean;
  /**
   * Custom divider component
   */
  dividerComponent?: LynxReactNode;
}

/**
 * Stack component - Vertical layout with consistent spacing
 *
 * Semantic wrapper for vertical spacing with optional dividers between children
 *
 * @example
 * ```tsx
 * <Stack spacing="lg">
 *   <text>Item 1</text>
 *   <text>Item 2</text>
 *   <text>Item 3</text>
 * </Stack>
 *
 * <Stack spacing="md" divider>
 *   <text>Section 1</text>
 *   <text>Section 2</text>
 * </Stack>
 * ```
 */
function Stack({
  children,
  spacing,
  divider,
  dividerComponent,
  className,
  style,
  ...restProps
}: StackProps) {
  // Convert children to array - avoid circular references by accessing via index
  const childArray = Array.isArray(children) ? children : children ? [children] : [];

  // Filter out null/undefined children
  const validIndices = childArray
    .map((child, idx) => (child != null ? idx : -1))
    .filter(idx => idx !== -1);

  if (!divider || validIndices.length === 0) {
    return (
      <view
        data-slot="stack"
        className={cn(stackVariants({ spacing }), className)}
        style={style}
      >
        {children}
      </view>
    );
  }

  // Render with dividers
  const defaultDivider = (
    <view className="h-px w-full bg-border" data-slot="stack-divider" />
  );

  return (
    <view
      data-slot="stack"
      className={cn(stackVariants({ spacing }), className)}
      style={style}
    >
      {validIndices.map((childIndex: number, arrayIndex: number) => (
        <React.Fragment key={`stack-item-${childIndex}`}>
          {childArray[childIndex]}
          {arrayIndex < validIndices.length - 1 && (dividerComponent || defaultDivider)}
        </React.Fragment>
      ))}
    </view>
  );
}

export { Stack, stackVariants };
export type { StackProps };

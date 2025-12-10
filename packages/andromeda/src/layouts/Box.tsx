/**
 * Box - Layout container
 *
 * A foundational container component with elevated surface styling.
 * Pure layout component - use Press atom for pressable behavior.
 *
 * @example
 * ```tsx
 * <Box>
 *   <Text>Content inside a card</Text>
 * </Box>
 *
 * <Box variant="ghost">
 *   <Text>Placeholder content</Text>
 * </Box>
 *
 * <Box variant="outline" padding="lg">
 *   <Text>Outlined card</Text>
 * </Box>
 * ```
 *
 * @see Press - For pressable behavior
 */

import { View, type ViewStyle, type ViewProps } from 'react-native';
import type { ReactNode } from 'react';
import { colors, space, radii } from '../tokens';

/**
 * Box variants
 */
export type BoxVariant = 'elevated' | 'outline' | 'ghost';

/**
 * Box padding sizes
 */
export type BoxPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props for the Box layout component
 */
export interface BoxProps extends Omit<ViewProps, 'style'> {
  /** Content to render inside the box */
  children: ReactNode;
  /** Visual style variant */
  variant?: BoxVariant;
  /** Padding preset */
  padding?: BoxPadding;
  /** Additional styles */
  style?: ViewStyle;
}

/** Padding values from tokens */
const paddingValues: Record<BoxPadding, number> = {
  none: 0,
  sm: space.sm,
  md: space.md,
  lg: space.lg,
  xl: space.xl,
};

/** Variant styles using tokens */
const variantStyles: Record<BoxVariant, ViewStyle> = {
  elevated: {
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    opacity: 0.6,
  },
};

/**
 * Box - layout container with surface styling.
 * Uses design tokens - no hardcoded values.
 */
export function Box({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
  ...rest
}: BoxProps) {
  return (
    <View
      style={[
        styles.box,
        variantStyles[variant],
        { padding: paddingValues[padding] },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = {
  box: {
    borderRadius: radii.lg,
    overflow: 'hidden' as const,
  } as ViewStyle,
};

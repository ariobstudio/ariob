/**
 * Stack - Vertical flex layout
 *
 * A vertical flexbox container with built-in gap support.
 *
 * @example
 * ```tsx
 * <Stack>
 *   <Text size="heading">Title</Text>
 *   <Text color="dim">Description text</Text>
 * </Stack>
 *
 * <Stack align="center" gap="lg">
 *   <Avatar size="lg" char="A" />
 *   <Text size="title">Profile Name</Text>
 * </Stack>
 * ```
 *
 * @see Row - For horizontal layouts
 */

import { View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { space } from '../tokens';

/**
 * Gap sizes
 */
export type GapSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Alignment options
 */
export type Alignment = 'start' | 'center' | 'end' | 'stretch';

/**
 * Props for the Stack layout component
 */
export interface StackProps {
  /** Child elements to arrange vertically */
  children: ReactNode;
  /** Gap between children */
  gap?: GapSize;
  /** Horizontal alignment */
  align?: Alignment;
  /** Additional styles */
  style?: ViewStyle;
}

/** Gap values from tokens */
const gapValues: Record<GapSize, number> = {
  xs: space.xs,
  sm: space.sm,
  md: space.md,
  lg: space.lg,
  xl: space.xl,
};

/** Alignment mapping */
const alignMap: Record<Alignment, ViewStyle> = {
  start: { alignItems: 'flex-start' },
  center: { alignItems: 'center' },
  end: { alignItems: 'flex-end' },
  stretch: { alignItems: 'stretch' },
};

/**
 * Stack - vertical flex container.
 * Uses design tokens - no hardcoded values.
 */
export function Stack({
  children,
  gap = 'sm',
  align = 'stretch',
  style,
}: StackProps) {
  return (
    <View
      style={[
        styles.stack,
        { gap: gapValues[gap] },
        alignMap[align],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = {
  stack: {
    flexDirection: 'column' as const,
  } as ViewStyle,
};

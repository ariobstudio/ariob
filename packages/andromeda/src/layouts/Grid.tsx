/**
 * Grid - Grid layout with fixed columns
 *
 * A simple grid container using flexbox wrap. Children should set
 * their own width based on column count.
 *
 * @example
 * ```tsx
 * <Grid cols={2} gap="sm">
 *   {images.map(img => (
 *     <View style={{ width: '48%' }}>
 *       <Image source={img} />
 *     </View>
 *   ))}
 * </Grid>
 * ```
 *
 * @note Children must manage their own width (use percentage)
 */

import { View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { space } from '../tokens';

/**
 * Gap sizes
 */
export type GapSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Props for the Grid layout component
 */
export interface GridProps {
  /** Grid children (should set own width based on cols) */
  children: ReactNode;
  /** Number of columns (hint for width calculation) */
  cols?: 2 | 3 | 4;
  /** Gap between items */
  gap?: GapSize;
  /** Additional styles */
  style?: ViewStyle;
}

/** Gap values from tokens */
const gapValues: Record<GapSize, number> = {
  xs: space.xs,
  sm: space.sm,
  md: space.md,
  lg: space.lg,
};

/**
 * Grid - flexbox grid container.
 * Uses design tokens - no hardcoded values.
 */
export function Grid({
  children,
  cols = 2,
  gap = 'sm',
  style,
}: GridProps) {
  return (
    <View style={[styles.grid, { gap: gapValues[gap] }, style]}>
      {children}
    </View>
  );
}

const styles = {
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  } as ViewStyle,
};

/**
 * Row - Horizontal flex layout
 *
 * A horizontal flexbox container with built-in gap support.
 *
 * @example
 * ```tsx
 * <Row>
 *   <Avatar char="A" />
 *   <Text>User Name</Text>
 * </Row>
 *
 * <Row justify="between">
 *   <Text>Label</Text>
 *   <Text color="dim">Value</Text>
 * </Row>
 *
 * <Row wrap gap="xs">
 *   {tags.map(tag => <Badge key={tag} label={tag} />)}
 * </Row>
 * ```
 *
 * @see Stack - For vertical layouts
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
 * Justification options
 */
export type Justification = 'start' | 'center' | 'end' | 'between' | 'around';

/**
 * Props for the Row layout component
 */
export interface RowProps {
  /** Child elements to arrange horizontally */
  children: ReactNode;
  /** Gap between children */
  gap?: GapSize;
  /** Cross-axis alignment */
  align?: Alignment;
  /** Main-axis distribution */
  justify?: Justification;
  /** Enable flex wrap for multiple lines */
  wrap?: boolean;
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

/** Justification mapping */
const justifyMap: Record<Justification, ViewStyle> = {
  start: { justifyContent: 'flex-start' },
  center: { justifyContent: 'center' },
  end: { justifyContent: 'flex-end' },
  between: { justifyContent: 'space-between' },
  around: { justifyContent: 'space-around' },
};

/**
 * Row - horizontal flex container.
 * Uses design tokens - no hardcoded values.
 */
export function Row({
  children,
  gap = 'sm',
  align = 'center',
  justify = 'start',
  wrap,
  style,
}: RowProps) {
  return (
    <View
      style={[
        styles.row,
        { gap: gapValues[gap] },
        alignMap[align],
        justifyMap[justify],
        wrap && styles.wrap,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = {
  row: {
    flexDirection: 'row' as const,
  } as ViewStyle,
  wrap: {
    flexWrap: 'wrap' as const,
  } as ViewStyle,
};

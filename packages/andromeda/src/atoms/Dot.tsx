/**
 * Dot - Timeline marker atom with glow effect
 *
 * A circular indicator used in timeline/feed visualizations.
 * Features a glow effect matching the provided color.
 *
 * @example
 * ```tsx
 * import { colors } from '@ariob/andromeda';
 *
 * <Dot color={colors.success} />
 * <Dot color={colors.accent} />
 * <Dot color={colors.degree[1]} />
 * ```
 *
 * @see Line - For connecting timeline elements vertically
 */

import { View, type ViewStyle } from 'react-native';
import { colors } from '../tokens';

/**
 * Props for the Dot atom
 */
export interface DotProps {
  /** Color for both fill and glow effect */
  color: string;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Dot atom - circular marker for timeline visualization.
 * Uses design tokens for border color.
 */
export function Dot({ color, style }: DotProps) {
  return (
    <View
      style={[
        styles.dot,
        { backgroundColor: color, shadowColor: color },
        style,
      ]}
    />
  );
}

const styles = {
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.bg,
    marginVertical: -2,
    zIndex: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  } as ViewStyle,
};

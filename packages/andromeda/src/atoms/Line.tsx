/**
 * Line - Timeline connector atom
 *
 * A vertical connector line used in timeline/feed visualizations
 * to connect Dot markers. Expands to fill available space.
 *
 * @example
 * ```tsx
 * <Row>
 *   <Stack align="center">
 *     <Dot color={colors.success} />
 *     <Line />
 *   </Stack>
 *   <Box style={{ flex: 1 }}>
 *     <Text>Content here</Text>
 *   </Box>
 * </Row>
 *
 * // Hide for last item
 * <Line show={!isLastItem} />
 * ```
 *
 * @see Dot - For timeline markers
 */

import { View, type ViewStyle } from 'react-native';
import { colors } from '../tokens';

/**
 * Props for the Line atom
 */
export interface LineProps {
  /** Whether to render the line (useful for hiding on last items) */
  show?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Line atom - vertical connector for timeline elements.
 * Uses design tokens - no hardcoded values.
 */
export function Line({ show = true, style }: LineProps) {
  if (!show) return null;
  return <View style={[styles.line, style]} />;
}

const styles = {
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.muted,
    opacity: 0.5,
  } as ViewStyle,
};

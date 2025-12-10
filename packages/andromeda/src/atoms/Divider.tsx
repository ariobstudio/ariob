/**
 * Divider - Separator atom
 *
 * A horizontal or vertical line separator for dividing content sections.
 * Cannot be broken down further - a true atomic component.
 *
 * @example
 * ```tsx
 * <Divider />
 * <Divider orientation="vertical" />
 * <Divider thickness="thick" />
 * ```
 */

import { View, type ViewStyle } from 'react-native';
import { colors, space } from '../tokens';

/**
 * Divider orientation
 */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Divider thickness
 */
export type DividerThickness = 'thin' | 'thick';

/**
 * Props for the Divider atom
 */
export interface DividerProps {
  /** Direction of the divider */
  orientation?: DividerOrientation;
  /** Line thickness */
  thickness?: DividerThickness;
  /** Additional styles */
  style?: ViewStyle;
}

/** Thickness values */
const thicknessValues: Record<DividerThickness, number> = {
  thin: 1,
  thick: 2,
};

/**
 * Divider atom - visual separator.
 * Uses design tokens - no hardcoded values.
 */
export function Divider({
  orientation = 'horizontal',
  thickness = 'thin',
  style,
}: DividerProps) {
  const size = thicknessValues[thickness];

  const dividerStyle: ViewStyle =
    orientation === 'horizontal'
      ? {
          height: size,
          width: '100%',
          marginVertical: space.sm,
        }
      : {
          width: size,
          height: '100%',
          marginHorizontal: space.sm,
        };

  return (
    <View
      style={[
        styles.divider,
        dividerStyle,
        style,
      ]}
    />
  );
}

const styles = {
  divider: {
    backgroundColor: colors.border,
  } as ViewStyle,
};

/**
 * Bar.Actions - Actions slot component
 *
 * Renders children (typically Bar.Button components) in action mode layout.
 * Uses three fixed slots: left, center, right - ensuring proper positioning.
 * Used as a slot inside Bar when mode === 'action'.
 */

import { Children, isValidElement, type ReactNode, type ReactElement } from 'react';
import { View, StyleSheet } from 'react-native';

export interface BarActionsProps {
  /** Action buttons to render */
  children: ReactNode;
}

interface ButtonProps {
  position?: 'left' | 'center' | 'right';
}

export function BarActions({ children }: BarActionsProps) {
  // Categorize children by position
  let leftButton: ReactElement | null = null;
  let centerButton: ReactElement | null = null;
  let rightButton: ReactElement | null = null;

  Children.forEach(children, (child) => {
    if (isValidElement<ButtonProps>(child)) {
      const position = child.props.position || 'center';
      if (position === 'left') leftButton = child;
      else if (position === 'right') rightButton = child;
      else centerButton = child;
    }
  });

  return (
    <View style={styles.actionRow}>
      {/* Left slot - fixed width */}
      <View style={styles.slot}>{leftButton}</View>

      {/* Center slot - prominent action */}
      <View style={styles.centerSlot}>{centerButton}</View>

      {/* Right slot - fixed width */}
      <View style={styles.slot}>{rightButton}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  slot: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Mark as slot for Bar to identify
BarActions.displayName = 'Bar.Actions';
BarActions.__isBarSlot = 'actions';

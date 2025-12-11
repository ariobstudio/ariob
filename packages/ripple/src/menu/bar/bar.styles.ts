/**
 * Bar Styles - Theme-aware styles for the main Bar component
 *
 * Uses Unistyles for automatic theme switching between light/dark modes.
 */

import { StyleSheet } from 'react-native-unistyles';

export const barStyles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100, // High z-index to float above everything
    pointerEvents: 'box-none',
  },
  shadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderRadius: 999, // Will be animated
    overflow: 'hidden', // Clip the BlurView
  },
  glassContainer: {
    backgroundColor: theme.colors.surfaceElevated, // Solid background - no transparency
  },
  // Content row for Action Mode
  actionRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  side: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Legacy alias - kept if needed for transition
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

/**
 * ActionButtons Styles - Theme-aware styles for action buttons
 *
 * Uses Unistyles for automatic theme switching between light/dark modes.
 */

import { StyleSheet } from 'react-native-unistyles';

export const actionButtonStyles = StyleSheet.create((theme) => ({
  button: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // No background for side icons
  },
  centerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.textPrimary, // Keep primary fill for main action
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
}));

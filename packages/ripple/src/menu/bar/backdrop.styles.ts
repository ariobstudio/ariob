/**
 * Backdrop Styles - Theme-aware styles for backdrop overlay
 *
 * Uses Unistyles for automatic theme switching between light/dark modes.
 */

import { StyleSheet } from 'react-native-unistyles';

export const backdropStyles = StyleSheet.create((theme) => ({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 60,
    backgroundColor: theme.colors.overlay,
  },
  pressable: {
    flex: 1,
  },
}));

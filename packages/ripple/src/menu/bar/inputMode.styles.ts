/**
 * InputMode Styles - Theme-aware styles for input mode
 *
 * Uses Unistyles for automatic theme switching between light/dark modes.
 */

import { StyleSheet } from 'react-native-unistyles';
import { Platform } from 'react-native';

export const inputModeStyles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  side: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    minWidth: 0,
  },
  input: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.sm : 6,
    maxHeight: 80,
    minHeight: 32,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.borderStrong,
  },
  sendButtonActive: {
    backgroundColor: theme.colors.accentGlow,
    shadowColor: theme.colors.accentGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
}));

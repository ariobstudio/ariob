/**
 * Unistyles Runtime Configuration
 *
 * Type augmentation is in unistyles.d.ts (must be .d.ts for proper resolution)
 */
import { StyleSheet } from 'react-native-unistyles';
import { appThemes, appBreakpoints, appSettings } from './theme/tokens';

StyleSheet.configure({
  themes: appThemes,
  breakpoints: appBreakpoints,
  settings: appSettings,
});

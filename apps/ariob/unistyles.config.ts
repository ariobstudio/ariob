/**
 * Unistyles Runtime Configuration
 */
import { StyleSheet } from 'react-native-unistyles';
import { rippleThemes, rippleBreakpoints } from '@ariob/ripple/styles';

StyleSheet.configure({
  themes: rippleThemes,
  breakpoints: rippleBreakpoints,
  settings: { adaptiveThemes: true },
});

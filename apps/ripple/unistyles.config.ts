import { StyleSheet } from 'react-native-unistyles';
import { appThemes, appBreakpoints, appSettings } from './theme/tokens';

type AppThemes = typeof appThemes;

declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: appThemes,
  breakpoints: appBreakpoints,
  settings: appSettings,
});

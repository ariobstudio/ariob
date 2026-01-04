/**
 * Unistyles Type Augmentation for @ariob/ripple
 *
 * This file must be a .d.ts so TypeScript processes the module augmentation
 * before any component files.
 */

import type { RippleTheme } from './styles';

declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    dark: RippleTheme;
    light: RippleTheme;
  }

  export interface UnistylesBreakpoints {
    xs: 0;
    sm: 360;
    md: 768;
    lg: 1024;
    xl: 1440;
  }
}






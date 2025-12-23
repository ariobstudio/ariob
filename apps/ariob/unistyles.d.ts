/**
 * Unistyles Type Augmentation for apps/ripple
 *
 * This file must be a .d.ts to ensure TypeScript processes the module augmentation
 * before any component files. The runtime configuration is in unistyles.config.ts.
 */

import type { RippleTheme } from '@ariob/ripple/styles';

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

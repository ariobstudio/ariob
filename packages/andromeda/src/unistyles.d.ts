/**
 * Unistyles Type Augmentation
 *
 * This file augments the Unistyles library types to provide
 * proper type inference for the theme data.
 */

import type { Data } from './themes/types';

// Augment the Unistyles types with our theme structure
declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    dark: Data;
    light: Data;
  }
}

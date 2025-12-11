/**
 * Liquid Monochrome Theme
 * Export all theme tokens
 */

export * from './colors';
export * from './typography';
export * from './spacing';

import { colors } from './colors';
import { fonts, fontSizes, lineHeights, letterSpacing } from './typography';
import { spacing, borderRadius } from './spacing';

export const theme = {
  colors,
  fonts,
  fontSizes,
  lineHeights,
  letterSpacing,
  spacing,
  borderRadius,

  // Animation durations
  animation: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
  },

  // Shadows (subtle, for depth)
  shadows: {
    none: {
      shadowColor: colors.abyss,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    soft: {
      shadowColor: colors.abyss,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: colors.abyss,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 4,
    },
    strong: {
      shadowColor: colors.abyss,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 8,
    },
  },
} as const;

export type Theme = typeof theme;

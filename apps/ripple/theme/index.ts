/**
 * Theme Bridge - Backward-compatible theme export using Ripple design tokens
 *
 * This file provides a static `theme` object that matches the shape expected by
 * legacy imports (`import { theme } from '../theme'`) while using the modern
 * Ripple design system values.
 *
 * @note For dynamic theming, prefer using `useUnistyles()` hook directly.
 *
 * @example
 * ```tsx
 * // Legacy (still works)
 * import { theme } from '../theme';
 * const style = { color: theme.colors.text };
 *
 * // Preferred (theme-aware)
 * import { useUnistyles } from 'react-native-unistyles';
 * const { theme } = useUnistyles();
 * ```
 */

import {
  ripplePalettes,
  rippleSpacing,
  rippleRadii,
  rippleTypography,
  rippleEffects,
  rippleSprings,
} from '@ariob/ripple/styles';

// Re-export design system utilities
export const getDegreeColor = (degree: number): string => {
  const colors = ripplePalettes.dark.degree;
  if (degree === 0) return colors[0];
  if (degree === 1) return colors[1];
  if (degree === 2) return colors[2];
  if (degree === 3) return colors[3];
  return colors[4];
};

export const getDegreeGlow = (degree: number): string => {
  return `${getDegreeColor(degree)}40`; // 25% opacity
};

/**
 * Static theme object for backward compatibility
 *
 * Uses Ripple design tokens mapped to the legacy theme shape.
 * Defaults to dark mode values.
 */
const darkColors = ripplePalettes.dark;
const lightColors = ripplePalettes.light;

export const theme = {
  colors: {
    // Light mode (not actively used but kept for completeness)
    light: {
      background: lightColors.background,
      surface: lightColors.surface,
      surfaceElevated: lightColors.surfaceElevated,
      text: lightColors.textPrimary,
      textSecondary: lightColors.textSecondary,
      textTertiary: lightColors.textMuted,
      border: lightColors.border,
      primary: lightColors.accent,
      secondary: lightColors.glow.teal,
    },
    // Dark mode (primary)
    dark: {
      background: darkColors.background,
      surface: darkColors.surface,
      surfaceElevated: darkColors.surfaceElevated,
      text: darkColors.textPrimary,
      textSecondary: darkColors.textSecondary,
      textTertiary: darkColors.textMuted,
      border: darkColors.border,
      primary: darkColors.accent,
      secondary: darkColors.glow.teal,
    },
    // Current active colors (dark mode default)
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceElevated: darkColors.surfaceElevated,
    text: darkColors.textPrimary,
    textSecondary: darkColors.textSecondary,
    textTertiary: darkColors.textMuted,
    border: darkColors.border,
    primary: darkColors.accent,
    secondary: darkColors.glow.teal,
    // Degree colors for social distance
    degree0: darkColors.degree[0],
    degree1: darkColors.degree[1],
    degree2: darkColors.degree[2],
    degree3: darkColors.degree[3],
    degree4: darkColors.degree[4],
    // Content type indicators
    post: darkColors.textPrimary,
    message: darkColors.glow.cyan,
    notification: darkColors.glow.teal,
    // Semantic
    success: darkColors.success,
    warning: darkColors.warning,
    error: darkColors.danger,
    info: darkColors.info,
    // Glow accent
    glow: darkColors.glow.cyan,
  },
  spacing: {
    xs: rippleSpacing.xs,
    sm: rippleSpacing.sm,
    md: rippleSpacing.md,
    lg: rippleSpacing.lg,
    xl: rippleSpacing.xl,
    xxl: rippleSpacing.xxl,
  },
  radii: {
    sm: rippleRadii.sm,
    md: rippleRadii.md,
    lg: rippleRadii.lg,
    xl: rippleRadii.xl,
    pill: rippleRadii.pill,
    full: rippleRadii.pill,
  },
  typography: {
    title: rippleTypography.title,
    heading: rippleTypography.heading,
    body: rippleTypography.body,
    caption: rippleTypography.caption,
  },
  shadows: rippleEffects.shadow,
  animations: rippleSprings,
} as const;

export type Theme = typeof theme;

// Also export individual design system modules for direct access
export { ripplePalettes as colors };
export { rippleTypography as typography };
export { rippleRadii as borderRadius };
export { rippleEffects as effects };
export { rippleSprings as springs };
export { rippleSpacing as spacing };

// Export Unistyles tokens for registration
export { appThemes, appBreakpoints, appSettings } from './design-system';

/**
 * App Theme Configuration
 *
 * Imports themes from @ariob/ripple and configures app-specific settings.
 * Enables adaptive themes for automatic dark/light mode switching.
 */

import { rippleThemes, rippleBreakpoints } from '@ariob/ripple/styles';

// Inherit the modernized Apple-inspired themes directly from @ariob/ripple
export const appThemes = rippleThemes;

export type AppThemeName = keyof typeof appThemes;

export const appBreakpoints = rippleBreakpoints;

export const appSettings = {
  /** Enable automatic dark/light mode based on system preference */
  adaptiveThemes: true,
  /** Enable CSS variable generation for web */
  CSSVars: true,
};

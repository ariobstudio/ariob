import { rippleThemes, rippleBreakpoints } from '@ariob/ripple/styles';

export const appThemes = rippleThemes;

export type AppThemeName = keyof typeof appThemes;

export const appBreakpoints = rippleBreakpoints;

export const appSettings = {
  adaptiveThemes: false,
  initialTheme: 'dark' as AppThemeName,
  CSSVars: true,
};


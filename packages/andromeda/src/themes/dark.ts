/**
 * Dark Theme - Monochromatic
 *
 * Strict black and white palette. Deep blacks, crisp whites.
 * Compatible with both Andromeda and Ripple theme systems.
 */

import type { Data } from './types';

const shadowSm = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  elevation: 1,
};

const shadowMd = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 2,
};

const shadowLg = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.4,
  shadowRadius: 24,
  elevation: 8,
};

const shadowGlow = {
  shadowColor: '#FFFFFF',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.2,
  shadowRadius: 12,
  elevation: 4,
};

const typography = {
  title: { fontSize: 32, fontWeight: '600' as const, letterSpacing: -0.5 },
  heading: { fontSize: 24, fontWeight: '500' as const, letterSpacing: -0.3 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400' as const },
  mono: { fontSize: 12, fontWeight: '500' as const },
};

const springs = {
  snappy: { damping: 20, stiffness: 300, mass: 0.5 },
  smooth: { damping: 30, stiffness: 350, mass: 1 },
  bouncy: { damping: 15, stiffness: 200, mass: 1 },
  gentle: { damping: 25, stiffness: 120, mass: 1 },
};

const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

const shadows = {
  // Ripple naming
  subtle: shadowSm,
  medium: shadowMd,
  strong: shadowLg,
  glow: shadowGlow,
  // Andromeda naming
  sm: shadowSm,
  md: shadowMd,
  lg: shadowLg,
};

export const dark: Data = {
  colors: {
    // Ripple naming (primary)
    background: '#000000',
    surface: '#000000',
    surfaceElevated: '#121212',
    surfaceMuted: '#1A1A1A',
    textPrimary: '#FFFFFF',
    textSecondary: '#999999',
    textMuted: '#444444',
    accent: '#FFFFFF',
    accentSoft: 'rgba(255,255,255,0.1)',
    accentGlow: 'rgba(255,255,255,0.2)',
    success: '#FFFFFF',
    warning: '#999999',
    danger: '#FFFFFF',
    info: '#999999',
    border: '#333333',
    borderSubtle: '#1A1A1A',
    borderStrong: '#FFFFFF',
    glass: 'rgba(0,0,0,0.8)',
    overlay: 'rgba(255,255,255,0.1)',

    // Andromeda naming (aliases)
    bg: '#000000',
    elevated: '#121212',
    muted: '#1A1A1A',
    text: '#FFFFFF',
    textTertiary: '#444444',
    dim: '#999999',
    faint: '#444444',
    warn: '#999999',

    // Shared
    glow: {
      cyan: '#333333',
      teal: '#333333',
      blue: '#333333',
    },
    degree: {
      0: '#FFFFFF',
      1: '#CCCCCC',
      2: '#999999',
      3: '#666666',
      4: '#333333',
    },
    indicator: {
      profile: '#FFFFFF',
      message: '#FFFFFF',
      auth: '#FFFFFF',
      ai: '#FFFFFF',
      post: '#FFFFFF',
    },
  },

  // Ripple naming (primary)
  spacing,
  radii: {
    sm: 4,
    md: 12,
    lg: 20,
    xl: 32,
    pill: 999,
  },
  typography,
  effects: {
    divider: { subtle: 'rgba(255,255,255,0.05)', strong: 'rgba(255,255,255,0.1)' },
    outline: { focus: 'rgba(255,255,255,0.4)', glow: 'rgba(255,255,255,0.3)' },
    glow: { accent: 'rgba(255,255,255,0.2)', cyan: 'rgba(51,51,51,0.25)', success: 'rgba(255,255,255,0.2)', danger: 'rgba(255,255,255,0.2)' },
    shadow: shadows,
  },
  springs,

  // Andromeda naming (aliases)
  space: spacing,
  font: typography,
  spring: springs,
  shadow: shadows,
};

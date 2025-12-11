/**
 * Light Theme - Monochromatic
 *
 * Clean whites with subtle grays. Light and airy.
 * Compatible with both Andromeda and Ripple theme systems.
 */

import type { Data } from './types';

const shadowSm = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
};

const shadowMd = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 2,
};

const shadowLg = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 24,
  elevation: 8,
};

const shadowGlow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.08,
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

export const light: Data = {
  colors: {
    // Ripple naming (primary)
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#F5F5F5',
    textPrimary: '#000000',
    textSecondary: '#666666',
    textMuted: '#999999',
    accent: '#000000',
    accentSoft: 'rgba(0,0,0,0.05)',
    accentGlow: 'rgba(0,0,0,0.1)',
    success: '#000000',
    warning: '#666666',
    danger: '#000000',
    info: '#666666',
    border: '#E5E5E5',
    borderSubtle: '#F0F0F0',
    borderStrong: '#000000',
    glass: 'rgba(255,255,255,0.9)',
    overlay: 'rgba(0,0,0,0.1)',

    // Andromeda naming (aliases)
    bg: '#FFFFFF',
    elevated: '#FFFFFF',
    muted: '#F5F5F5',
    text: '#000000',
    textTertiary: '#999999',
    dim: '#666666',
    faint: '#999999',
    warn: '#666666',

    // Shared
    glow: {
      cyan: '#E0E0E0',
      teal: '#E0E0E0',
      blue: '#E0E0E0',
    },
    degree: {
      0: '#000000',
      1: '#333333',
      2: '#666666',
      3: '#999999',
      4: '#CCCCCC',
    },
    indicator: {
      profile: '#000000',
      message: '#000000',
      auth: '#000000',
      ai: '#000000',
      post: '#000000',
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
    divider: { subtle: 'rgba(0,0,0,0.03)', strong: 'rgba(0,0,0,0.08)' },
    outline: { focus: 'rgba(0,0,0,0.2)', glow: 'rgba(0,0,0,0.15)' },
    glow: { accent: 'rgba(0,0,0,0.1)', cyan: 'rgba(224,224,224,0.25)', success: 'rgba(0,0,0,0.1)', danger: 'rgba(0,0,0,0.1)' },
    shadow: shadows,
  },
  springs,

  // Andromeda naming (aliases)
  space: spacing,
  font: typography,
  spring: springs,
  shadow: shadows,
};

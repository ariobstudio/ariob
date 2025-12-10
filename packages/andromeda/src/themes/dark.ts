/**
 * Dark Theme - Monochromatic
 *
 * Strict black and white palette. Deep blacks, crisp whites.
 */

import type { Data } from './types';

export const dark: Data = {
  colors: {
    // Backgrounds
    bg: '#000000',
    surface: '#000000',
    elevated: '#121212',
    muted: '#1A1A1A',

    // Text
    text: '#FFFFFF',
    dim: '#999999',
    faint: '#444444',

    // Semantic
    accent: '#FFFFFF',    // White accent
    success: '#FFFFFF',
    warn: '#999999',
    danger: '#FFFFFF',
    info: '#999999',

    // Glow accents - Removed
    glow: {
      cyan: '#333333',
      teal: '#333333',
      blue: '#333333',
    },

    // Degree colors - Monochromatic
    degree: {
      0: '#FFFFFF',
      1: '#CCCCCC',
      2: '#999999',
      3: '#666666',
      4: '#333333',
    },

    // Content type indicators
    indicator: {
      profile: '#FFFFFF',
      message: '#FFFFFF',
      auth: '#FFFFFF',
      ai: '#FFFFFF',
      post: '#FFFFFF',
    },

    // Overlays
    border: '#333333',
    borderSubtle: '#1A1A1A',
    borderStrong: '#FFFFFF',
    glass: 'rgba(0,0,0,0.8)',
    overlay: 'rgba(255,255,255,0.1)',
  },

  space: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  radii: {
    sm: 4,
    md: 12,
    lg: 20,
    xl: 32,
    pill: 999,
  },

  font: {
    title: { size: 32, weight: '600', spacing: -0.5 },
    heading: { size: 24, weight: '500', spacing: -0.3 },
    body: { size: 16, weight: '400', height: 24 },
    caption: { size: 13, weight: '400' },
    mono: { size: 12, weight: '500' },
  },

  spring: {
    snappy: { damping: 20, stiffness: 300, mass: 0.5 },
    smooth: { damping: 30, stiffness: 350, mass: 1 },
    bouncy: { damping: 15, stiffness: 200, mass: 1 },
    gentle: { damping: 25, stiffness: 120, mass: 1 },
  },

  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 8,
    },
  },
};

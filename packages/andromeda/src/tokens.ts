/** Andromeda Design Tokens - Monochromatic System */

// ─────────────────────────────────────────────────────────────────────────────
// Colors - Base Palette (Semantic only)
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // Backgrounds
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  elevated: '#FFFFFF',
  muted: '#F5F5F5',

  // Text
  text: '#000000',
  dim: '#666666',
  faint: '#999999',

  // Semantic
  accent: '#000000',
  success: '#000000',
  warn: '#666666',
  danger: '#000000',
  info: '#666666',

  // Glow accents (Neutralized)
  glow: {
    cyan: '#E0E0E0',
    teal: '#E0E0E0',
    blue: '#E0E0E0',
  },

  // Degree colors
  degree: {
    0: '#000000',
    1: '#333333',
    2: '#666666',
    3: '#999999',
    4: '#CCCCCC',
  },

  // Content type indicators
  indicator: {
    profile: '#000000',
    message: '#000000',
    auth: '#000000',
    ai: '#000000',
    post: '#000000',
  },

  // Overlays
  border: '#E5E5E5',
  borderSubtle: '#F0F0F0',
  borderStrong: '#000000',
  glass: 'rgba(255,255,255,0.9)',
  overlay: 'rgba(0,0,0,0.1)',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Spacing
// ─────────────────────────────────────────────────────────────────────────────

export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Border Radii
// ─────────────────────────────────────────────────────────────────────────────

export const radii = {
  sm: 4,
  md: 12,
  lg: 20,
  xl: 32,
  pill: 999,
  full: 999,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────────────────────

export const font = {
  title: { size: 32, weight: '600' as const, spacing: -0.5 },
  heading: { size: 24, weight: '500' as const, spacing: -0.3 },
  body: { size: 16, weight: '400' as const, height: 24 },
  caption: { size: 13, weight: '400' as const, spacing: 0 },
  mono: { size: 12, weight: '500' as const, spacing: 0 },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Shadows
// ─────────────────────────────────────────────────────────────────────────────

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Animation
// ─────────────────────────────────────────────────────────────────────────────

export const timing = {
  fast: 200,
  normal: 350,
  slow: 500,
} as const;

export const spring = {
  snappy: { damping: 20, stiffness: 300, mass: 0.5 },
  smooth: { damping: 30, stiffness: 350, mass: 1 },
  bouncy: { damping: 15, stiffness: 200, mass: 1 },
  gentle: { damping: 25, stiffness: 120, mass: 1 },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Effects
// ─────────────────────────────────────────────────────────────────────────────

export const effects = {
  divider: {
    subtle: 'rgba(0,0,0,0.05)',
    strong: 'rgba(0,0,0,0.1)',
  },
  outline: {
    focus: 'rgba(0,0,0,0.2)',
    glow: 'rgba(0,0,0,0.1)',
  },
  glow: {
    accent: 'rgba(0,0,0,0.1)',
    cyan: 'rgba(0,0,0,0.1)',
    success: 'rgba(0,0,0,0.1)',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Theme (for Unistyles)
// ─────────────────────────────────────────────────────────────────────────────

export const theme = {
  colors,
  space,
  radii,
  font,
  shadow,
  timing,
  spring,
  effects,
} as const;

export type Theme = typeof theme;

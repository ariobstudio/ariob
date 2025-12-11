import type { TextStyle } from 'react-native';

export type RipplePalette = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  overlay: string;
  borderSubtle: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Shorthand aliases for convenience (Andromeda compatibility)
  bg: string;
  elevated: string;
  muted: string;
  dim: string;
  faint: string;
  text: string;
  textTertiary: string;
  warn: string;
  glow: {
    cyan: string;
    teal: string;
    blue: string;
  };
  accent: string;
  accentSoft: string;
  accentGlow: string; 
  success: string;
  warning: string;
  danger: string;
  info: string;
  glass: string;
  indicator: {
    profile: string;
    message: string;
    auth: string;
    ai: string;
    post: string;
  };
  degree: {
    0: string; // Me (Pink)
    1: string; // Friends (Blue)
    2: string; // World (Purple)
    3: string; // Discover (Yellow)
    4: string; // Noise (Gray)
  };
};

const darkPalette: RipplePalette = {
  background: '#000000',
  surface: '#1C1C1E',   // iOS System Gray 6 Dark
  surfaceElevated: '#2C2C2E',  // iOS System Gray 5 Dark
  surfaceMuted: '#151517',     // Slightly lighter than black
  overlay: 'rgba(0,0,0,0.7)',
  borderSubtle: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(255,255,255,0.2)',
  textPrimary: '#F5F5F7',      // Primary white
  textSecondary: '#98989D',    // Secondary gray
  textMuted: '#636366',        // Tertiary gray
  
  // Shorthand aliases (Andromeda compatibility)
  bg: '#000000',
  elevated: '#2C2C2E',
  muted: '#151517',
  dim: '#98989D',
  faint: '#636366',
  text: '#F5F5F7',
  textTertiary: '#636366',
  warn: '#FFD60A',
  
  glow: {
    cyan: '#64D2FF',
    teal: '#6AC4DC',
    blue: '#409CFF',
  },
  accent: '#0A84FF',    // Vivid Blue
  accentSoft: 'rgba(10,132,255,0.15)',
  accentGlow: 'rgba(10,132,255,0.3)',
  success: '#30D158',   // Green
  warning: '#FFD60A',   // Yellow
  danger: '#FF453A',    // Red
  info: '#5E5CE6',      // Indigo
  glass: 'rgba(30,30,30,0.8)',
  
  indicator: {
    profile: '#30D158',
    message: '#0A84FF',
    auth: '#5E5CE6',
    ai: '#FF9F0A',
    post: '#F5F5F7',
  },
  degree: {
    0: '#FF375F',
    1: '#64D2FF',
    2: '#BF5AF2',
    3: '#FFD60A',
    4: '#8E8E93',
  },
};

const lightPalette: RipplePalette = {
  background: '#F5F5F7',        // iOS System Gray 6
  surface: '#FFFFFF',           // Primary card background
  surfaceElevated: '#FFFFFF',   // Elevated surface
  surfaceMuted: '#F2F2F7',      // Secondary grouped background
  overlay: 'rgba(0,0,0,0.4)',
  borderSubtle: 'rgba(0,0,0,0.03)',
  border: 'rgba(0,0,0,0.05)',
  borderStrong: 'rgba(0,0,0,0.12)',
  textPrimary: '#1D1D1F',       // Primary text (Near black)
  textSecondary: '#86868B',     // Secondary text (Metal gray)
  textMuted: '#AEAEB2',         // Tertiary gray

  // Shorthand aliases (Andromeda compatibility)
  bg: '#F5F5F7',
  elevated: '#FFFFFF',
  muted: '#F2F2F7',
  dim: '#86868B',
  faint: '#AEAEB2',
  text: '#1D1D1F',
  textTertiary: '#AEAEB2',
  warn: '#FF9F0A',

  glow: {
    cyan: '#5AC8FA',
    teal: '#30B0C7',
    blue: '#007AFF',
  },
  accent: '#0071E3',    // Classic vibrant blue
  accentSoft: 'rgba(0,113,227,0.1)',
  accentGlow: 'rgba(0,113,227,0.2)',
  success: '#34C759',   // Green
  warning: '#FF9F0A',   // Orange
  danger: '#FF3B30',    // Red
  info: '#5856D6',      // Indigo
  glass: 'rgba(255,255,255,0.85)',

  indicator: {
    profile: '#34C759',
    message: '#007AFF',
    auth: '#5856D6',
    ai: '#FF9500',
    post: '#1D1D1F',
  },
  degree: {
    0: '#FF2D55',
    1: '#5AC8FA',
    2: '#AF52DE',
    3: '#FFCC00',
    4: '#8E8E93',
  },
};

export const ripplePalettes = {
  dark: darkPalette,
  light: lightPalette,
} as const;

export const rippleSpacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const rippleRadii = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

type TypographyScale = {
  fontSize: number;
  fontWeight: TextStyle['fontWeight'];
  letterSpacing?: number;
  lineHeight?: number;
};

export const rippleTypography: Record<
  'title' | 'heading' | 'body' | 'caption' | 'mono',
  TypographyScale
> = {
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
  },
  mono: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0,
  },
};

const shadowSubtle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 2,
} as const;

const shadowMedium = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4,
} as const;

const shadowStrong = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.12,
  shadowRadius: 24,
  elevation: 10,
} as const;

const shadowGlow = {
  shadowColor: '#007AFF',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 16,
  elevation: 8,
} as const;

export const rippleEffects = {
  divider: {
    subtle: 'rgba(0,0,0,0.05)',
    strong: 'rgba(0,0,0,0.1)',
  },
  outline: {
    focus: 'rgba(0,113,227,0.4)',
    glow: 'rgba(90,200,250,0.3)',
  },
  glow: {
    accent: 'rgba(0,113,227,0.2)',
    cyan: 'rgba(90,200,250,0.25)',
    success: 'rgba(52,199,89,0.2)',
    danger: 'rgba(255,59,48,0.2)',
  },
  shadow: {
    // Primary naming (Ripple)
    subtle: shadowSubtle,
    medium: shadowMedium,
    strong: shadowStrong,
    glow: shadowGlow,
    // Aliases for Andromeda compatibility
    sm: shadowSubtle,
    md: shadowMedium,
    lg: shadowStrong,
  },
} as const;

/**
 * Spring animation presets for consistent motion across the app
 */
export const rippleSprings = {
  /** Quick taps, button presses */
  snappy: { damping: 20, stiffness: 300, mass: 0.5 },
  /** Standard transitions - Apple style */
  smooth: { damping: 30, stiffness: 350, mass: 1 },
  /** Playful interactions */
  bouncy: { damping: 15, stiffness: 200, mass: 1 },
  /** Slow reveals, modals */
  gentle: { damping: 25, stiffness: 120, mass: 1 },
} as const;

export const rippleBreakpoints = {
  xs: 0,
  sm: 360,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const;

export type RippleThemeMode = keyof typeof ripplePalettes;

export interface RippleTheme {
  colors: RipplePalette;
  spacing: typeof rippleSpacing;
  radii: typeof rippleRadii;
  typography: typeof rippleTypography;
  effects: typeof rippleEffects;
  springs: typeof rippleSprings;
  // Andromeda compatibility aliases
  space: typeof rippleSpacing;
  shadow: typeof rippleEffects.shadow;
}

export const createRippleTheme = (mode: RippleThemeMode): RippleTheme => ({
  colors: ripplePalettes[mode],
  spacing: rippleSpacing,
  radii: rippleRadii,
  typography: rippleTypography,
  effects: rippleEffects,
  springs: rippleSprings,
  // Andromeda compatibility aliases
  space: rippleSpacing,
  shadow: rippleEffects.shadow,
});

export const rippleThemes: Record<RippleThemeMode, RippleTheme> = {
  dark: createRippleTheme('dark'),
  light: createRippleTheme('light'),
};

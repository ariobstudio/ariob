import type { TextStyle } from 'react-native';

type RipplePalette = {
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
  accent: string;
  accentSoft: string;
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
};

const darkPalette: RipplePalette = {
  background: '#000000',
  surface: '#0F1216',
  surfaceElevated: '#16181C',
  surfaceMuted: '#1F2226',
  overlay: 'rgba(0,0,0,0.85)',
  borderSubtle: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.15)',
  textPrimary: '#E7E9EA',
  textSecondary: '#A0A4AA',
  textMuted: '#6B6F76',
  accent: '#1D9BF0',
  accentSoft: 'rgba(29,155,240,0.15)',
  success: '#00BA7C',
  warning: '#F5A524',
  danger: '#F91880',
  info: '#7A7FFF',
  glass: 'rgba(16,18,22,0.9)',
  indicator: {
    profile: '#00BA7C',
    message: '#1D9BF0',
    auth: '#7856FF',
    ai: '#FACC15',
    post: '#E7E9EA',
  },
};

const lightPalette: RipplePalette = {
  background: '#F7F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#F2F3F7',
  surfaceMuted: '#E8E9F0',
  overlay: 'rgba(247,247,250,0.9)',
  borderSubtle: 'rgba(15,18,22,0.04)',
  border: 'rgba(15,18,22,0.08)',
  borderStrong: 'rgba(15,18,22,0.15)',
  textPrimary: '#1F2125',
  textSecondary: '#4A4D52',
  textMuted: '#6F737C',
  accent: '#0A84FF',
  accentSoft: 'rgba(10,132,255,0.15)',
  success: '#0A915E',
  warning: '#CB8600',
  danger: '#D7265E',
  info: '#3D5AFE',
  glass: 'rgba(255,255,255,0.9)',
  indicator: {
    profile: '#0A915E',
    message: '#0A84FF',
    auth: '#7C4DFF',
    ai: '#B8860B',
    post: '#1F2125',
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
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
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
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
  },
  mono: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
};

export const rippleEffects = {
  divider: {
    subtle: 'rgba(255,255,255,0.03)',
    strong: 'rgba(255,255,255,0.08)',
  },
  outline: {
    focus: 'rgba(29,155,240,0.45)',
  },
  glow: {
    accent: 'rgba(29,155,240,0.35)',
    success: 'rgba(0,186,124,0.35)',
  },
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
}

export const createRippleTheme = (mode: RippleThemeMode): RippleTheme => ({
  colors: ripplePalettes[mode],
  spacing: rippleSpacing,
  radii: rippleRadii,
  typography: rippleTypography,
  effects: rippleEffects,
});

export const rippleThemes: Record<RippleThemeMode, RippleTheme> = {
  dark: createRippleTheme('dark'),
  light: createRippleTheme('light'),
};


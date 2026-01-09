import { Platform } from 'react-native';

export const fonts = {
  mono: {
    regular: 'IBMPlexMono_400Regular',
    italic: 'IBMPlexMono_400Regular_Italic',
    medium: 'IBMPlexMono_500Medium',
    semibold: 'IBMPlexMono_600SemiBold',
    bold: 'IBMPlexMono_700Bold',
  },
} as const;

export const fontFamily = {
  mono: Platform.select({
    ios: 'IBMPlexMono_400Regular',
    android: 'IBMPlexMono_400Regular',
    default: "'IBM Plex Mono', monospace",
  }),
  monoMedium: Platform.select({
    ios: 'IBMPlexMono_500Medium',
    android: 'IBMPlexMono_500Medium',
    default: "'IBM Plex Mono', monospace",
  }),
  monoSemibold: Platform.select({
    ios: 'IBMPlexMono_600SemiBold',
    android: 'IBMPlexMono_600SemiBold',
    default: "'IBM Plex Mono', monospace",
  }),
  monoBold: Platform.select({
    ios: 'IBMPlexMono_700Bold',
    android: 'IBMPlexMono_700Bold',
    default: "'IBM Plex Mono', monospace",
  }),
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// Pre-composed text styles for common use cases
export const textStyles = {
  // Body text
  body: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.relaxed,
  },
  bodySmall: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.relaxed,
  },

  // Headings
  h1: {
    fontFamily: fontFamily.monoBold,
    fontSize: fontSize['3xl'],
    lineHeight: fontSize['3xl'] * lineHeight.tight,
  },
  h2: {
    fontFamily: fontFamily.monoSemibold,
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * lineHeight.snug,
  },
  h3: {
    fontFamily: fontFamily.monoSemibold,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.snug,
  },

  // UI elements
  label: {
    fontFamily: fontFamily.monoMedium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  caption: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
  button: {
    fontFamily: fontFamily.monoMedium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
} as const;

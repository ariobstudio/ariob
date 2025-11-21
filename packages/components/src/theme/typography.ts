/**
 * Typography System - Liquid Monochrome
 *
 * Pairing IBM Plex Serif (warmth, humanity) with DM Mono (precision, technical)
 * Creates tension between organic and systematic - perfect for social + data
 */

export const fonts = {
  // IBM Plex Serif - For content, warmth, readability
  serif: {
    light: 'IBMPlexSerif-Light',
    regular: 'IBMPlexSerif-Regular',
    medium: 'IBMPlexSerif-Medium',
    semibold: 'IBMPlexSerif-SemiBold',
    bold: 'IBMPlexSerif-Bold',
  },

  // DM Mono - For UI labels, technical info, metadata
  mono: {
    light: 'DMMono-Light',
    regular: 'DMMono-Regular',
    medium: 'DMMono-Medium',
  },
} as const;

export const fontSizes = {
  // Display sizes (Serif)
  hero: 48,      // Large headings
  display: 36,   // Section titles
  title: 28,     // Screen titles

  // Content sizes (Serif)
  large: 20,     // Emphasized content
  body: 16,      // Primary reading
  small: 14,     // Secondary content
  caption: 12,   // Captions, metadata

  // Technical sizes (Mono)
  mono: 11,      // Timestamps, IDs
  label: 10,     // UI labels, tags
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
} as const;

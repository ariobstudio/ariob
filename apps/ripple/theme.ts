/**
 * Grayscale Symphony Theme
 * Consistent with unistyles.config.ts
 */

export const theme = {
  colors: {
    // Light mode defaults (can be swapped/extended)
    light: {
      background: '#F5F5F0',
      surface: '#FFFFFF',
      surfaceElevated: '#FAFAFA',
      text: '#121212',
      textSecondary: '#6B6B6B',
      textTertiary: '#9E9E9E',
      border: '#E0E0E0',
      primary: '#2A2A2A',
      secondary: '#3A3A3A',
    },
    // Dark mode defaults
    dark: {
      background: '#121212',
      surface: '#1a1a1a',
      surfaceElevated: '#2a2a2a',
      text: '#F5F5F0',
      textSecondary: '#9E9E9E',
      textTertiary: '#6B6B6B',
      border: '#2a2a2a',
      primary: '#F5F5F0',
      secondary: '#E0E0E0',
    }
  },
  // Current active colors (defaulting to dark for safety/consistency with previous code)
  // In a real app, useUnistyles hook is preferred over this static object
  ...{
    colors: {
      background: '#121212',
      surface: '#1a1a1a',
      surfaceElevated: '#2a2a2a',
      text: '#F5F5F0',
      textSecondary: '#9E9E9E',
      textTertiary: '#6B6B6B',
      border: '#2a2a2a',
      primary: '#F5F5F0',
      secondary: '#E0E0E0',
      degree0: '#F5F5F0',
      degree1: '#E0E0E0',
      degree2: '#9E9E9E',
      post: '#121212',
      message: '#1a1a1a',
      notification: '#2a2a2a',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 18,
    xl: 24,
    full: 9999,
  },
  typography: {
    title: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
    },
    heading: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    caption: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
  },
};

export type Theme = typeof theme;

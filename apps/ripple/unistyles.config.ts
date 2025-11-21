import { StyleSheet } from 'react-native-unistyles';

// Grayscale Symphony - Ariob design system
const lightTheme = {
  colors: {
    // Base
    background: '#F5F5F0',    // Creamy white
    surface: '#FFFFFF',
    surfaceElevated: '#FAFAFA',
    text: '#121212',
    textSecondary: '#6B6B6B',
    textTertiary: '#9E9E9E',
    border: '#E0E0E0',

    // Accents
    primary: '#2A2A2A',
    secondary: '#3A3A3A',

    // Degrees (subtle grayscale)
    degree0: '#1a1a1a',      // Me - darkest
    degree1: '#2a2a2a',      // Friends - dark gray
    degree2: '#3a3a3a',      // Network - medium gray

    // Content types (subtle variations)
    post: '#121212',
    message: '#1a1a1a',
    notification: '#2a2a2a',

    // Feedback
    success: '#2A2A2A',
    warning: '#3A3A3A',
    error: '#4A4A4A',
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
    small: {
      fontSize: 11,
      fontWeight: '400' as const,
      lineHeight: 13,
    },
  },
} as const;

const darkTheme = {
  colors: {
    // Base - Grayscale Symphony dark mode
    background: '#121212',    // Deep black
    surface: '#1a1a1a',
    surfaceElevated: '#2a2a2a',
    text: '#F5F5F0',         // Creamy white
    textSecondary: '#9E9E9E',
    textTertiary: '#6B6B6B',
    border: '#2a2a2a',

    // Accents
    primary: '#F5F5F0',
    secondary: '#E0E0E0',

    // Degrees (subtle grayscale)
    degree0: '#F5F5F0',      // Me - brightest
    degree1: '#E0E0E0',      // Friends - light gray
    degree2: '#9E9E9E',      // Network - medium gray

    // Content types (subtle variations)
    post: '#121212',
    message: '#1a1a1a',
    notification: '#2a2a2a',

    // Feedback
    success: '#E0E0E0',
    warning: '#9E9E9E',
    error: '#6B6B6B',
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  typography: lightTheme.typography,
} as const;

// App themes object
const appThemes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

// Breakpoints (optional - can add if needed for responsive design)
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

// TypeScript module augmentation
type AppThemes = typeof appThemes;
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

// Configure Unistyles using StyleSheet.configure
StyleSheet.configure({
  themes: appThemes,
  breakpoints,
  settings: {
    adaptiveThemes: true,
  },
});

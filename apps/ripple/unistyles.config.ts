import { StyleSheet } from 'react-native-unistyles';

// Midnight Pro Theme - Ripple Protocol
// True OLED Black foundation with high-contrast content

const midnightTheme = {
  colors: {
    // Base
    background: '#000000',    // True OLED Black
    surface: '#16181C',       // Dark Grey for cards
    surfaceElevated: '#1F2226',
    
    // Borders
    border: '#2F3336',        // Subtle separation
    
    // Text
    text: '#E7E9EA',          // High readability white/grey
    textSecondary: '#71767B', // Muted grey
    textTertiary: '#536471',
    
    // Accents
    accent: '#1D9BF0',        // Electric Blue
    success: '#00BA7C',
    warning: '#F91880',       // Using red/pink for warning/alert
    error: '#F91880',
    
    // Node Indicators (Degree/Type)
    indicatorMe: '#00BA7C',      // Green for Me/Profile
    indicatorFriend: '#1D9BF0',  // Blue for DMs
    indicatorNetwork: '#E7E9EA', // White for Network/Posts
    indicatorAuth: '#7856FF',    // Purple for Auth
    
    // Special
    glass: 'rgba(22, 24, 28, 0.8)',
    overlay: 'rgba(0, 0, 0, 0.8)',
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
    lg: 16,
    xl: 24,
    pill: 9999,
  },
  typography: {
    title: {
      fontSize: 28,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    heading: {
      fontSize: 20,
      fontWeight: '700' as const,
    },
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 13,
      fontWeight: '400' as const,
      color: '#71767B',
    },
    mono: {
      fontSize: 12,
      fontFamily: 'monospace',
    }
  },
  zIndex: {
    feed: 10,
    notification: 40,
    header: 50,
    modal: 60,
    pill: 70,
  }
} as const;

// We only strictly enforce Dark Mode for Ripple
const appThemes = {
  dark: midnightTheme,
  light: midnightTheme, // Force dark mode even if system is light
} as const;

type AppThemes = typeof appThemes;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: appThemes,
  settings: {
    adaptiveThemes: false, // Disable adaptive, always use our config
    initialTheme: 'dark',
  },
});

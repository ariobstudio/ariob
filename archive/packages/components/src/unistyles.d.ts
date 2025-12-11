/**
 * Unistyles type declarations for @ariob/components
 * 
 * This file provides base theme types that components can use.
 * The actual theme is provided by the consuming app via Unistyles configuration.
 */

declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    light: {
      colors: {
        background: string;
        surface: string;
        surfaceElevated: string;
        text: string;
        textSecondary: string;
        textTertiary: string;
        border: string;
        primary: string;
        secondary: string;
        error?: string;
      };
      spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
      };
      borderRadius: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
        full: number;
      };
    };
    dark: {
      colors: {
        background: string;
        surface: string;
        surfaceElevated: string;
        text: string;
        textSecondary: string;
        textTertiary: string;
        border: string;
        primary: string;
        secondary: string;
        error?: string;
      };
      spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
      };
      borderRadius: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
        full: number;
      };
    };
  }
}

export {};


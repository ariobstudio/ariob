/**
 * Theme Implementation
 *
 * Implements the Theme protocol with Unistyles integration.
 * Provides runtime theme switching and React hook access.
 */

import { StyleSheet } from 'react-native-unistyles';
import type { Theme, Data } from './types';
import { dark } from './dark';
import { light } from './light';

// ─────────────────────────────────────────────────────────────────────────────
// Theme Registry
// ─────────────────────────────────────────────────────────────────────────────

const themes = { dark, light } as const;
let current: keyof typeof themes = 'dark';

// ─────────────────────────────────────────────────────────────────────────────
// Theme Protocol Implementation
// ─────────────────────────────────────────────────────────────────────────────

export const theme: Theme = {
  get: () => themes[current],

  set: (name: string) => {
    if (name in themes) {
      current = name as keyof typeof themes;
    }
  },

  use: () => {
    // This will be implemented with useUnistyles() in runtime
    // For now, return current theme for SSR/testing
    return themes[current];
  },

  list: () => Object.keys(themes),

  name: () => current,
};

// ─────────────────────────────────────────────────────────────────────────────
// Unistyles Configuration
// ─────────────────────────────────────────────────────────────────────────────

declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    dark: Data;
    light: Data;
  }
}

/**
 * Initialize the theme system with Unistyles.
 * Call this once at app startup before rendering.
 */
export function init() {
  StyleSheet.configure({
    themes,
    settings: {
      adaptiveThemes: true,
      initialTheme: 'dark',
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// React Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────

// Re-export useUnistyles for components to access theme
export { useUnistyles } from 'react-native-unistyles';

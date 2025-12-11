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

// NOTE: Type augmentation for UnistylesThemes is handled by the consuming app
// (e.g., apps/ripple/unistyles.d.ts) to avoid conflicts between packages.
// Andromeda provides themes as data; apps configure unistyles with their types.

/**
 * Initialize the theme system with Unistyles.
 * Call this once at app startup before rendering.
 *
 * @deprecated Use app-level unistyles.config.ts instead for proper type inference
 */
export function init() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  StyleSheet.configure({
    themes: themes as any, // Type handled by app-level augmentation
    settings: {
      adaptiveThemes: true,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// React Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────

// Re-export useUnistyles for components to access theme
export { useUnistyles } from 'react-native-unistyles';

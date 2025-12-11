/**
 * Settings Store
 *
 * Manages game settings with local persistence
 * Uses zustand for state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getStorage } from '@ariob/core';

export interface GameSettings {
  // Player
  displayName: string;
  hasCompletedOnboarding: boolean;

  // Board appearance
  boardTheme: 'indigo' | 'classic' | 'green' | 'blue' | 'purple' | 'gray';
  pieceSet: 'senterej';  // Future: 'standard', 'modern', etc.

  // Gameplay preferences
  showMoveHints: boolean;
  showCapturedPieces: boolean;
  enableSoundEffects: boolean;
  enableHaptics: boolean;

  // Advanced
  showCoordinates: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
}

interface SettingsStore extends GameSettings {
  // Actions
  updateSettings: (updates: Partial<GameSettings>) => void;
  updateDisplayName: (name: string) => void;
  updateBoardTheme: (theme: GameSettings['boardTheme']) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  displayName: 'Player',
  hasCompletedOnboarding: false,
  boardTheme: 'indigo',
  pieceSet: 'senterej',
  showMoveHints: true,
  showCapturedPieces: true,
  enableSoundEffects: false,
  enableHaptics: true,
  showCoordinates: false,
  animationSpeed: 'normal',
};

/**
 * Settings store with local persistence
 */
export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (updates) => {
        set((state) => ({ ...state, ...updates }));
      },

      updateDisplayName: (name) => {
        set({ displayName: name.trim() || 'Player' });
      },

      updateBoardTheme: (theme) => {
        set({ boardTheme: theme });

        // Apply theme to document root
        applyBoardTheme(theme);
      },

      resetSettings: () => {
        set(DEFAULT_SETTINGS);
        applyBoardTheme(DEFAULT_SETTINGS.boardTheme);
      },
    }),
    {
      name: 'senterej-settings',
      storage: createJSONStorage(() => getStorage()),
      partialize: (state) => ({
        // Only persist these fields
        displayName: state.displayName,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        boardTheme: state.boardTheme,
        pieceSet: state.pieceSet,
        showMoveHints: state.showMoveHints,
        showCapturedPieces: state.showCapturedPieces,
        enableSoundEffects: state.enableSoundEffects,
        enableHaptics: state.enableHaptics,
        showCoordinates: state.showCoordinates,
        animationSpeed: state.animationSpeed,
      }),
    }
  )
);

/**
 * Board theme configurations
 * Using hex values directly for LynxJS inline style compatibility
 */
export const BOARD_THEMES = {
  indigo: {
    id: 'indigo' as const,
    name: 'Senterej Indigo',
    lightSquare: '#c7d2fe',
    darkSquare: '#818cf8',
    description: 'Traditional Ethiopian colors',
  },
  classic: {
    id: 'classic' as const,
    name: 'Classic Brown',
    lightSquare: '#f0e6d2',
    darkSquare: '#b58863',
    description: 'Timeless chess.com style',
  },
  green: {
    id: 'green' as const,
    name: 'Forest Green',
    lightSquare: '#d4f4dd',
    darkSquare: '#86cb92',
    description: 'Fresh and natural',
  },
  blue: {
    id: 'blue' as const,
    name: 'Ocean Blue',
    lightSquare: '#dae3f3',
    darkSquare: '#8fadc7',
    description: 'Calm and focused',
  },
  purple: {
    id: 'purple' as const,
    name: 'Royal Purple',
    lightSquare: '#e9d5ff',
    darkSquare: '#c084fc',
    description: 'Elegant and regal',
  },
  gray: {
    id: 'gray' as const,
    name: 'Stone Gray',
    lightSquare: '#e5e7eb',
    darkSquare: '#9ca3af',
    description: 'Minimalist and clean',
  },
} as const;

/**
 * Apply board theme to document root
 *
 * Sets data-theme attribute on document element for CSS theme selectors
 * LynxJS doesn't support CSS variables in inline styles, so we use data attributes
 */
function applyBoardTheme(themeId: GameSettings['boardTheme']) {
  'background only';

  // Log theme change for debugging
  console.log('[Settings] Board theme set to:', themeId);

  // Apply data-theme attribute to document for CSS selectors
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', themeId);
    console.log('[Settings] Applied data-theme attribute:', themeId);
  }
}

/**
 * Initialize theme on app start
 */
export function initializeTheme() {
  const state = useSettings.getState();
  applyBoardTheme(state.boardTheme);
}

/**
 * Get animation duration based on speed setting
 */
export function getAnimationDuration(baseMs: number): number {
  const speed = useSettings.getState().animationSpeed;

  switch (speed) {
    case 'slow':
      return baseMs * 1.5;
    case 'fast':
      return baseMs * 0.7;
    default:
      return baseMs;
  }
}

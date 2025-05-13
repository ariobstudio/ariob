import { create } from 'zustand';

type Theme = 'Light' | 'Dark' | 'Auto';

interface ThemeState {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  withTheme: <T>(light: T, dark: T) => T;
}

export const useTheme = create<ThemeState>((set, get) => ({
  currentTheme: 'Auto',

  setTheme: (theme: Theme) => {
    const { currentTheme } = get();
    if (currentTheme === theme) {
      return;
    }

    set({ currentTheme: theme });
    NativeModules.ExplorerModule.saveThemePreferences('preferredTheme', theme);
  },

  withTheme: <T>(light: T, dark: T): T => {
    const { currentTheme } = get();
    if (currentTheme !== 'Auto') {
      return currentTheme === 'Light' ? light : dark;
    }
    // For Auto theme, you might want to use system theme or a default
    // This is a placeholder - you can modify this based on your needs
    return light;
  },
}));

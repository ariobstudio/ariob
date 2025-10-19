import { create } from 'zustand';

type Theme = 'Light' | 'Dark' | 'Auto';

interface ThemeState {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  withTheme: <T>(light: T, dark: T) => T;
  isDarkMode: () => boolean;
}

const applyThemeClass = (theme: Theme) => {
  // @ts-ignore lynx is provided by runtime
  if (typeof lynx === 'undefined') return;

  // @ts-ignore lynx is provided by runtime
  const isDark = theme === 'Dark' || (theme === 'Auto' && lynx.__globalProps?.theme === 'Dark');

  // @ts-ignore lynx is provided by runtime
  lynx
    .createSelectorQuery()
    .select('page')
    .setNativeProps({
      className: isDark ? 'dark bg-background' : 'bg-background',
    })
    .exec();
};

export const useTheme = create<ThemeState>((set, get) => ({
  currentTheme: 'Auto',

  setTheme: (theme: Theme) => {
    const { currentTheme } = get();
    if (currentTheme === theme) {
      return;
    }

    set({ currentTheme: theme });
    applyThemeClass(theme);
    NativeModules.ExplorerModule.saveThemePreferences('preferredTheme', theme);
  },

  withTheme: <T>(light: T, dark: T): T => {
    const { currentTheme } = get();
    if (currentTheme !== 'Auto') {
      return currentTheme === 'Light' ? light : dark;
    }
    // For Auto theme, detect system theme via Lynx global props
    // @ts-ignore lynx is provided by runtime
    const systemTheme = typeof lynx !== 'undefined' && lynx.__globalProps?.theme;
    return systemTheme === 'Dark' ? dark : light;
  },

  isDarkMode: (): boolean => {
    const { currentTheme } = get();
    if (currentTheme !== 'Auto') {
      return currentTheme === 'Dark';
    }
    // @ts-ignore lynx is provided by runtime
    const systemTheme = typeof lynx !== 'undefined' && lynx.__globalProps?.theme;
    return systemTheme === 'Dark';
  },
}));

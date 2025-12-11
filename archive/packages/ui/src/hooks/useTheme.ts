import { create } from 'zustand';

export enum Theme {
  Light = 'light',
  Dark = 'dark',
  Auto = 'auto',
}

type ThemeType = 'light' | 'dark' | 'auto';
interface ThemeState {
  currentTheme: Theme;
  theme: ThemeType;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  withTheme: <T>(light: T, dark: T) => T;
  isDarkMode: () => boolean;
}

const applyThemeClass = (theme: Theme) => {
  // @ts-ignore lynx is provided by runtime
  if (typeof lynx === 'undefined') return;

  // @ts-ignore lynx is provided by runtime
  const isDark = theme === Theme.Dark || (theme === Theme.Auto && lynx.__globalProps?.theme === Theme.Dark);

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
  currentTheme: Theme.Auto,

  get theme() {
    return get().isDarkMode() ? Theme.Dark : Theme.Light;
  },

  setTheme: (theme: Theme) => {
    const { currentTheme } = get();
    if (currentTheme === theme) {
      return;
    }

    set({ currentTheme: theme });
    applyThemeClass(theme);
    NativeModules.ExplorerModule.saveThemePreferences('preferredTheme', theme);
  },

  toggleTheme: () => {
    const { currentTheme } = get();
    const newTheme = currentTheme === Theme.Dark ? Theme.Light : Theme.Dark;
    get().setTheme(newTheme);
  },

  withTheme: <T>(light: T, dark: T): T => {
    const { currentTheme } = get();
    if (currentTheme !== Theme.Auto) {
      return currentTheme === Theme.Light ? light : dark;
    }
    // For Auto theme, detect system theme via Lynx global props
    // @ts-ignore lynx is provided by runtime
    const systemTheme = typeof lynx !== 'undefined' && lynx.__globalProps?.theme;
    return systemTheme === Theme.Dark ? dark : (light as unknown as T);
  },

  isDarkMode: (): boolean => {
    const { currentTheme } = get();
    if (currentTheme !== Theme.Auto) {
      return currentTheme === Theme.Dark;
    }
    // @ts-ignore lynx is provided by runtime
    const systemTheme = typeof lynx !== 'undefined' && lynx.__globalProps?.theme;
    return systemTheme === Theme.Dark;
  },
}));

type Theme = 'Light' | 'Dark' | 'Auto';
interface ThemeState {
    currentTheme: Theme;
    setTheme: (theme: Theme) => void;
    withTheme: <T>(light: T, dark: T) => T;
    isDarkMode: () => boolean;
}
export declare const useTheme: import("zustand").UseBoundStore<import("zustand").StoreApi<ThemeState>>;
export {};

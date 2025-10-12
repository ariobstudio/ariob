import { create } from 'zustand';
const applyThemeClass = (theme) => {
    // @ts-ignore lynx is provided by runtime
    if (typeof lynx === 'undefined')
        return;
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
export const useTheme = create((set, get) => ({
    currentTheme: 'Auto',
    setTheme: (theme) => {
        const { currentTheme } = get();
        if (currentTheme === theme) {
            return;
        }
        set({ currentTheme: theme });
        applyThemeClass(theme);
        NativeModules.ExplorerModule.saveThemePreferences('preferredTheme', theme);
    },
    withTheme: (light, dark) => {
        const { currentTheme } = get();
        if (currentTheme !== 'Auto') {
            return currentTheme === 'Light' ? light : dark;
        }
        // For Auto theme, detect system theme via Lynx global props
        // @ts-ignore lynx is provided by runtime
        const systemTheme = typeof lynx !== 'undefined' && lynx.__globalProps?.theme;
        return systemTheme === 'Dark' ? dark : light;
    },
    isDarkMode: () => {
        const { currentTheme } = get();
        if (currentTheme !== 'Auto') {
            return currentTheme === 'Dark';
        }
        // @ts-ignore lynx is provided by runtime
        const systemTheme = typeof lynx !== 'undefined' && lynx.__globalProps?.theme;
        return systemTheme === 'Dark';
    },
}));

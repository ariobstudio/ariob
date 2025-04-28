import { createContext, useContext, useState, ReactNode } from '@lynx-js/react';

type ThemeType = 'auto' | 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  setTheme: (theme: ThemeType) => void;
  withTheme: (lightClasses: string, darkClasses: string) => string;
  withNotchScreen: (className: string) => string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'auto',
  isDarkMode: false,
  setTheme: () => {},
  withTheme: (light, dark) => light,
  withNotchScreen: (className) => className,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme from lynx global props
  const initialTheme = (lynx.__globalProps as any).preferredTheme || 'auto';
  const [theme, setTheme] = useState<ThemeType>(initialTheme as ThemeType);
  
  // Determine if dark mode is active based on theme setting and system preference
  const isDarkMode = theme !== 'auto' 
    ? theme === 'dark'
    : (lynx.__globalProps as any).theme.toLowerCase() === 'dark';
  
  const handleSetTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    // Save the theme preference
    (NativeModules as any).ExplorerModule.saveThemePreferences('preferredTheme', newTheme);
  };
  
  // Helper function to apply theme classes - this is the key function for theming
  const withTheme = (lightClasses: string, darkClasses: string) => {
    return isDarkMode ? darkClasses : lightClasses;
  };
  
  // Helper function to handle notch screens
  const withNotchScreen = (className: string) => {
    return (lynx.__globalProps as any).isNotchScreen ? `${className} pb-safe` : className;
  };
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        setTheme: handleSetTheme,
        withTheme,
        withNotchScreen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext); 
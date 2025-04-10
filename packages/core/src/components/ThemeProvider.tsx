import React, { createContext, useContext } from 'react';

type ThemeContextType = {
  isDarkMode: boolean; // Note: This is now just for informational purposes
};

// Create context with a default value
const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false
});

export const useTheme = () => useContext(ThemeContext);

// Simple ThemeProvider that doesn't use window and doesn't try to control dark mode
// Instead relies on Tailwind's built-in dark mode detection via media queries
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // We're using a simpler approach now - let Tailwind handle dark mode
  // based on prefers-color-scheme media query

  // Instead of controlling isDarkMode, we're just including it for
  // component use if needed, but not actually changing theme state
  const contextValue = {
    isDarkMode: false // This is just a placeholder now
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
} 
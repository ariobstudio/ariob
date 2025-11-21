/**
 * Ripple Design System - "Liquid Trust"
 *
 * Aesthetic Direction: Organic minimalism with fluid, water-inspired interactions.
 * Deep navy depths with bioluminescent cyan accents, degree-based color coding.
 */

export const colors = {
  // Depth - Base backgrounds (dark water)
  depth: {
    deepest: '#0A0E14',    // Almost black, like deep ocean
    deep: '#111820',        // Primary background
    medium: '#1A2332',      // Elevated surfaces
    shallow: '#243447',     // Interactive surfaces
  },

  // Surface - Cards and containers
  surface: {
    primary: '#1C2533',
    elevated: '#252F42',
    overlay: 'rgba(28, 37, 51, 0.95)',
  },

  // Bioluminescence - Primary accents (cyan/teal glow)
  glow: {
    cyan: '#00E5FF',        // Electric cyan
    teal: '#1DE9B6',        // Bright teal
    blue: '#448AFF',        // Vivid blue
    gradient: 'linear-gradient(135deg, #00E5FF 0%, #1DE9B6 100%)',
  },

  // Degree Colors - Social distance visualization
  degree: {
    0: '#FF6B9D',  // Personal (warm pink)
    1: '#00E5FF',  // Direct connections (cyan)
    2: '#7C4DFF',  // Extended network (purple)
    3: '#FFC107',  // Public (amber)
    4: '#78909C',  // Spam filter (gray)
  },

  // Semantic colors
  text: {
    primary: '#ECEFF4',     // High contrast white
    secondary: '#9BA8B8',   // Muted blue-gray
    tertiary: '#5F6D7E',    // Subtle gray
    dim: '#3D4857',         // Very subtle
  },

  // State colors
  success: '#1DE9B6',
  warning: '#FFB74D',
  error: '#FF5252',
  info: '#448AFF',

  // Borders and dividers
  border: {
    subtle: 'rgba(155, 168, 184, 0.08)',
    medium: 'rgba(155, 168, 184, 0.15)',
    strong: 'rgba(155, 168, 184, 0.25)',
  },
};

export const typography = {
  // Display font: DM Sans - Geometric with character
  // Body font: Inter Variable - Clean and readable
  // Mono font: JetBrains Mono - For technical elements

  fonts: {
    display: 'DM Sans, system-ui, sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'JetBrains Mono, Menlo, monospace',
  },

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 56,
  },

  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  // Subtle depth shadows
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  // Glow effects for interactive elements
  glow: {
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const animations = {
  // Ripple effect timing
  ripple: {
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  // Quick interactions
  quick: {
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  // Standard transitions
  standard: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  // Smooth, flowing transitions
  smooth: {
    duration: 450,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
};

/**
 * Get degree color
 */
export function getDegreeColor(degree: '0' | '1' | '2' | '3' | '4'): string {
  return colors.degree[degree];
}

/**
 * Get degree glow style
 */
export function getDegreeGlow(degree: '0' | '1' | '2' | '3' | '4') {
  const color = getDegreeColor(degree);
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  };
}

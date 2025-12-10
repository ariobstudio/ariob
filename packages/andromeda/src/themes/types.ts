/**
 * Theme Protocol Definitions
 *
 * Defines the interface contracts for the theme system.
 * Every theme must implement the Data interface.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Color Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Glow {
  cyan: string;
  teal: string;
  blue: string;
}

export interface Degree {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
}

export interface Indicator {
  profile: string;
  message: string;
  auth: string;
  ai: string;
  post: string;
}

export interface Palette {
  bg: string;
  surface: string;
  elevated: string;
  muted: string;
  text: string;
  dim: string;
  faint: string;
  accent: string;
  success: string;
  warn: string;
  danger: string;
  info: string;
  glow: Glow;
  degree: Degree;
  indicator: Indicator;
  border: string;
  borderSubtle: string;
  borderStrong: string;
  glass: string;
  overlay: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scale Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Scale {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface Radii {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Typography Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FontStyle {
  size: number;
  weight: string;
  spacing?: number;
  height?: number;
}

export interface Font {
  title: FontStyle;
  heading: FontStyle;
  body: FontStyle;
  caption: FontStyle;
  mono: FontStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Animation Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Spring {
  damping: number;
  stiffness: number;
  mass: number;
}

export interface Springs {
  snappy: Spring;
  smooth: Spring;
  bouncy: Spring;
  gentle: Spring;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shadow Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Shadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Shadows {
  sm: Shadow;
  md: Shadow;
  lg: Shadow;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Data
// ─────────────────────────────────────────────────────────────────────────────

export interface Data {
  colors: Palette;
  space: Scale;
  radii: Radii;
  font: Font;
  spring: Springs;
  shadow: Shadows;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Protocol
// ─────────────────────────────────────────────────────────────────────────────

export interface Theme {
  /** Get current theme data */
  get(): Data;
  /** Set active theme by name */
  set(name: string): void;
  /** React hook to access current theme */
  use(): Data;
  /** List available theme names */
  list(): string[];
  /** Get current theme name */
  name(): string;
}

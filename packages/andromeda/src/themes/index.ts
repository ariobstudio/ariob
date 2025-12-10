/**
 * @ariob/andromeda Themes
 *
 * Modular theme system following UNIX protocol pattern.
 * Provides dark and light themes with Unistyles integration.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type {
  Theme,
  Data,
  Palette,
  Scale,
  Radii,
  Font,
  FontStyle,
  Spring,
  Springs,
  Shadow,
  Shadows,
  Glow,
  Degree,
  Indicator,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Theme Data
// ─────────────────────────────────────────────────────────────────────────────

export { dark } from './dark';
export { light } from './light';

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

export { theme, init, useUnistyles } from './impl';

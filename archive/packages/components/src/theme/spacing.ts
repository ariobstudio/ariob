/**
 * Spacing System - 4px base unit
 *
 * Creates rhythm and breathing room in the interface.
 * Generous spacing for refinement.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  // Shape language for content types
  sharp: 0,        // Notifications
  subtle: 4,       // Posts (square-ish)
  soft: 12,        // Messages (rounded)
  round: 24,       // Buttons, pills
  circle: 9999,    // Avatars, icons
} as const;

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;

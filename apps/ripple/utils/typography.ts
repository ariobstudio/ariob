/**
 * Typography utilities for the Ripple app
 *
 * Provides helper functions for dynamic typography sizing,
 * particularly for message bubbles and other animated text elements.
 */

/**
 * Bubble size variants for message components
 */
export type BubbleSize = 'small' | 'medium' | 'large';

/**
 * Typography style properties
 */
export interface TypographyStyle {
  fontSize: number;
  lineHeight: number;
}

/**
 * Get typography styles based on bubble size
 *
 * Used in MessageBubble.tsx for dynamic text sizing during
 * input focus/blur animations.
 *
 * @param size - The bubble size variant
 * @returns Typography style with fontSize and lineHeight
 *
 * @example
 * ```tsx
 * const { fontSize, lineHeight } = getTypographyForSize('large');
 * // { fontSize: 26, lineHeight: 32 }
 * ```
 */
export function getTypographyForSize(size: BubbleSize): TypographyStyle {
  switch (size) {
    case 'large':
      return { fontSize: 26, lineHeight: 32 };
    case 'small':
      return { fontSize: 18, lineHeight: 24 };
    default:
      return { fontSize: 22, lineHeight: 28 };
  }
}

/**
 * Typography scale presets matching the design system
 * These align with theme.typography from design-system.ts
 */
export const TYPOGRAPHY_SCALES = {
  small: { fontSize: 18, lineHeight: 24 },
  medium: { fontSize: 22, lineHeight: 28 },
  large: { fontSize: 26, lineHeight: 32 },
} as const;

/**
 * Message bubble height configurations
 * Maps bubble size to min/max heights for animated transitions
 */
export const BUBBLE_HEIGHTS = {
  small: { min: 70, max: 80 },
  medium: { min: 130, max: 140 },
  large: { min: 200, max: 220 },
} as const;

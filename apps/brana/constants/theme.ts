/**
 * Brana Design Tokens
 *
 * **PRIMARY SOURCE:** Uniwind theme variants in global.css
 * This file provides TypeScript references and helpers for accessing theme values.
 *
 * ## Usage Patterns
 *
 * ### Preferred: Tailwind Classes with Semantic Names
 * ```tsx
 * <View className="bg-background">
 *   <Text className="text-foreground">Primary text</Text>
 *   <Text className="text-muted">Secondary text</Text>
 * </View>
 * ```
 *
 * ### Alternative: useCSSVariable Hook (when JS access needed)
 * ```tsx
 * import { useThemeColor } from '@/constants/theme';
 * const bgColor = useThemeColor('background');
 * <View style={{ backgroundColor: bgColor }} />
 * ```
 *
 * ### Web: CSS Variables
 * ```css
 * .my-component {
 *   background-color: var(--background);
 *   color: var(--foreground);
 * }
 * ```
 *
 * @see global.css for theme variant definitions (@variant light, @variant dark)
 * @see global.web.css for web-specific theme variants
 */

import { useCSSVariable } from 'uniwind';

/**
 * Semantic color variable names (maps to CSS variables in global.css)
 * Use these with the useThemeColor hook for JavaScript access
 */
export const semanticColors = {
  background: '--background',
  foreground: '--foreground',
  muted: '--muted',
  'muted-foreground': '--muted-foreground',
  surface: '--surface',
  'surface-foreground': '--surface-foreground',
  overlay: '--overlay',
  'overlay-foreground': '--overlay-foreground',
  accent: '--accent',
  'accent-foreground': '--accent-foreground',
  success: '--success',
  'success-foreground': '--success-foreground',
  danger: '--danger',
  'danger-foreground': '--danger-foreground',
  divider: '--divider',
  border: '--border',
  'field-background': '--field-background',
  'field-foreground': '--field-foreground',
  'field-placeholder': '--field-placeholder',
} as const;

/**
 * Hook to access theme colors in JavaScript (alternative to Tailwind classes)
 * Returns the current theme's color value for the specified variable
 *
 * @example
 * const backgroundColor = useThemeColor('background');
 * const accentColor = useThemeColor('accent');
 * <View style={{ backgroundColor }} />
 */
export function useThemeColor(variable: keyof typeof semanticColors): string | number | undefined {
  return useCSSVariable(semanticColors[variable]);
}

/**
 * Spacing scale (design tokens)
 * These values are framework-agnostic and can be used everywhere
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/**
 * Border radius scale (design tokens)
 * These values are framework-agnostic and can be used everywhere
 */
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

/**
 * Icon - Ionicons wrapper atom with semantic colors
 *
 * A thin wrapper around Expo's Ionicons providing consistent sizing
 * and semantic color options using design tokens.
 *
 * @example
 * ```tsx
 * <Icon name="home" />
 * <Icon name="checkmark-circle" size="lg" color="success" />
 * <Icon name="warning" color="danger" />
 * ```
 *
 * @see https://ionic.io/ionicons for icon names
 */

import { Ionicons } from '@expo/vector-icons';
import { colors } from '../tokens';

/**
 * Available icon sizes
 */
export type IconSize = 'sm' | 'md' | 'lg';

/**
 * Available semantic colors
 */
export type IconColor = 'text' | 'dim' | 'faint' | 'accent' | 'success' | 'warn' | 'danger';

/**
 * Props for the Icon atom
 */
export interface IconProps {
  /** Ionicons icon name (e.g., "home", "settings-outline") */
  name: string;
  /** Size preset */
  size?: IconSize;
  /** Semantic color */
  color?: IconColor;
}

/** Size values in pixels */
const sizes: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 28,
};

/** Color values from tokens */
const colorMap: Record<IconColor, string> = {
  text: colors.text,
  dim: colors.dim,
  faint: colors.faint,
  accent: colors.accent,
  success: colors.success,
  warn: colors.warn,
  danger: colors.danger,
};

/**
 * Icon atom from Ionicons with semantic colors.
 * Uses design tokens - no hardcoded values.
 */
export function Icon({ name, size = 'md', color = 'text' }: IconProps) {
  return <Ionicons name={name as any} size={sizes[size]} color={colorMap[color]} />;
}

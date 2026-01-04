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
import { useUnistyles } from 'react-native-unistyles';

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

/**
 * Icon atom from Ionicons with semantic colors.
 * Uses theme-aware colors for dark/light mode support.
 */
export function Icon({ name, size = 'md', color = 'text' }: IconProps) {
  const { theme } = useUnistyles();

  // Map semantic color to theme color
  const colorMap: Record<IconColor, string> = {
    text: theme.colors.text,
    dim: theme.colors.dim,
    faint: theme.colors.faint,
    accent: theme.colors.accent,
    success: theme.colors.success,
    warn: theme.colors.warn,
    danger: theme.colors.danger,
  };

  return <Ionicons name={name as any} size={sizes[size]} color={colorMap[color]} />;
}

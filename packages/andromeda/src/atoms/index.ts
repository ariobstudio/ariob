/**
 * @ariob/andromeda Atoms
 *
 * Indivisible building blocks of the design system.
 * These components cannot be broken down further.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types (Protocol Definitions)
// ─────────────────────────────────────────────────────────────────────────────

export type {
  TextProps,
  TextSize,
  TextColor,
  IconProps,
  IconSize,
  IconColor,
  PressProps,
  HapticLevel,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  ButtonTint,
  InputProps,
  InputSize,
  InputVariant,
  LabelProps,
  BadgeProps,
  BadgeTint,
  DotProps,
  LineProps,
  DividerProps,
  DividerOrientation,
  DividerThickness,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Styles (Theme-aware)
// ─────────────────────────────────────────────────────────────────────────────

export * as styles from './styles';

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

export { Text } from './Text';
export { Icon } from './Icon';
export { Press } from './Press';
export { Button } from './Button';
export { Input } from './Input';
export { Label } from './Label';
export { Badge } from './Badge';
export { Dot } from './Dot';
export { Line } from './Line';
export { Divider } from './Divider';

/**
 * Atom Protocol Definitions
 *
 * Defines the interface contracts for all atomic components.
 * These are the indivisible building blocks of the design system.
 */

import type { ReactNode } from 'react';
import type {
  TextStyle,
  ViewStyle,
  TextProps as RNTextProps,
  TextInputProps as RNTextInputProps,
} from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Text Protocol
// ─────────────────────────────────────────────────────────────────────────────

export type TextSize = 'title' | 'heading' | 'body' | 'caption' | 'mono';
export type TextColor = 'text' | 'dim' | 'faint' | 'accent' | 'success' | 'warn' | 'danger';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  children: ReactNode;
  size?: TextSize;
  color?: TextColor;
  style?: TextStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon Protocol
// ─────────────────────────────────────────────────────────────────────────────

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconColor = 'text' | 'dim' | 'faint' | 'accent' | 'success' | 'warn' | 'danger';

export interface IconProps {
  name: string;
  size?: IconSize;
  color?: IconColor;
  style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Press Protocol
// ─────────────────────────────────────────────────────────────────────────────

export type HapticLevel = 'none' | 'light' | 'medium' | 'heavy';

export interface PressProps {
  children: ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  haptic?: HapticLevel;
  disabled?: boolean;
  style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Button Protocol
// ─────────────────────────────────────────────────────────────────────────────

export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonVariant = 'solid' | 'outline' | 'ghost';
export type ButtonTint = 'default' | 'accent' | 'success' | 'danger';

export interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  size?: ButtonSize;
  variant?: ButtonVariant;
  tint?: ButtonTint;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Input Protocol
// ─────────────────────────────────────────────────────────────────────────────

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'outline' | 'filled' | 'ghost';

export interface InputProps extends Omit<RNTextInputProps, 'style' | 'onChangeText' | 'onChange'> {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  size?: InputSize;
  variant?: InputVariant;
  error?: boolean;
  disabled?: boolean;
  multi?: boolean;
  style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Label Protocol
// ─────────────────────────────────────────────────────────────────────────────

export interface LabelProps {
  children: ReactNode;
  required?: boolean;
  style?: TextStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge Protocol
// ─────────────────────────────────────────────────────────────────────────────

export type BadgeTint = 'default' | 'accent' | 'success' | 'danger' | 'warn';

export interface BadgeProps {
  children: ReactNode;
  tint?: BadgeTint;
  style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dot Protocol
// ─────────────────────────────────────────────────────────────────────────────

export interface DotProps {
  color?: string;
  size?: number;
  glow?: boolean;
  style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Line Protocol
// ─────────────────────────────────────────────────────────────────────────────

export interface LineProps {
  color?: string;
  width?: number;
  style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Divider Protocol
// ─────────────────────────────────────────────────────────────────────────────

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerThickness = 'subtle' | 'default' | 'strong';

export interface DividerProps {
  orientation?: DividerOrientation;
  thickness?: DividerThickness;
  style?: ViewStyle;
}

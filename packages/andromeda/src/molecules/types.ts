/**
 * Molecule Protocol Definitions
 *
 * Defines the interface contracts for molecule components.
 * Molecules are simple combinations of atoms.
 */

import type { ReactNode } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Avatar Protocol
// ─────────────────────────────────────────────────────────────────────────────

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarTint = 'default' | 'accent' | 'success' | 'warn';

export interface AvatarProps {
  /** 1-2 character initials to display */
  char?: string;
  /** Icon name (overrides char) */
  icon?: string;
  /** Size preset */
  size?: AvatarSize;
  /** Color tint */
  tint?: AvatarTint;
  /** Press handler */
  onPress?: () => void;
  /** Additional styles */
  style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// IconButton Protocol
// ─────────────────────────────────────────────────────────────────────────────

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonTint = 'default' | 'accent' | 'success' | 'danger';

export interface IconButtonProps {
  /** Icon name */
  icon: string;
  /** Press handler */
  onPress: () => void;
  /** Size preset */
  size?: IconButtonSize;
  /** Color tint */
  tint?: IconButtonTint;
  /** Show loading state */
  loading?: boolean;
  /** Disable interaction */
  disabled?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// InputField Protocol
// ─────────────────────────────────────────────────────────────────────────────

export interface InputFieldProps {
  /** Field label */
  label: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helper?: string;
  /** Required indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Multi-line input */
  multi?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tag Protocol
// ─────────────────────────────────────────────────────────────────────────────

export type TagTint = 'default' | 'accent' | 'success' | 'warn' | 'danger';

export interface TagProps {
  /** Tag content */
  children: ReactNode;
  /** Color tint */
  tint?: TagTint;
  /** Removable callback */
  onRemove?: () => void;
  /** Additional styles */
  style?: ViewStyle;
}

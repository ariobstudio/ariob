/**
 * IconButton - Icon with Press molecule
 *
 * A pressable icon button combining Icon and Press atoms.
 * Single responsibility: icon-only interaction.
 *
 * @example
 * ```tsx
 * <IconButton icon="add" onPress={handleAdd} />
 * <IconButton icon="trash" tint="danger" onPress={handleDelete} />
 * <IconButton icon="settings" size="lg" onPress={openSettings} />
 * ```
 */

import { View, Pressable, Platform, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, space, radii } from '../tokens';

/**
 * IconButton sizes
 */
export type IconButtonSize = 'sm' | 'md' | 'lg';

/**
 * IconButton tints
 */
export type IconButtonTint = 'default' | 'accent' | 'success' | 'danger';

/**
 * Props for the IconButton molecule
 */
export interface IconButtonProps {
  /** Ionicons icon name */
  icon: string;
  /** Size preset */
  size?: IconButtonSize;
  /** Color tint */
  tint?: IconButtonTint;
  /** Press handler */
  onPress: () => void;
  /** Disable interaction */
  disabled?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

/** Size configurations */
const sizeConfig: Record<IconButtonSize, { dim: number; iconSize: number }> = {
  sm: { dim: 32, iconSize: 16 },
  md: { dim: 40, iconSize: 20 },
  lg: { dim: 48, iconSize: 24 },
};

/** Tint colors from tokens */
const tintColors: Record<IconButtonTint, string> = {
  default: colors.dim,
  accent: colors.accent,
  success: colors.success,
  danger: colors.danger,
};

/**
 * IconButton molecule - pressable icon.
 * Combines Icon and Press patterns.
 */
export function IconButton({
  icon,
  size = 'md',
  tint = 'default',
  onPress,
  disabled = false,
  style,
}: IconButtonProps) {
  const config = sizeConfig[size];
  const iconColor = tintColors[tint];

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          width: config.dim,
          height: config.dim,
          borderRadius: radii.md,
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Ionicons name={icon as any} size={config.iconSize} color={iconColor} />
    </Pressable>
  );
}

const styles = {
  button: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'transparent',
  } as ViewStyle,
  pressed: {
    opacity: 0.7,
    backgroundColor: colors.muted,
  } as ViewStyle,
  disabled: {
    opacity: 0.4,
  } as ViewStyle,
};

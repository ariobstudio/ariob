/**
 * Avatar - User identity molecule
 *
 * Displays user identity as initials (char) or an icon.
 * Combines Text/Icon atoms with a circular container.
 *
 * @example
 * ```tsx
 * <Avatar char="JD" />
 * <Avatar icon="person" tint="accent" />
 * <Avatar char="A" size="lg" onPress={openProfile} />
 * ```
 */

import { View, Pressable, type ViewStyle } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { colors, space } from '../tokens';

/**
 * Avatar sizes
 */
export type AvatarSize = 'sm' | 'md' | 'lg';

/**
 * Avatar tints
 */
export type AvatarTint = 'default' | 'accent' | 'success' | 'warn';

/**
 * Props for the Avatar molecule
 */
export interface AvatarProps {
  /** 1-2 character initials to display */
  char?: string;
  /** Ionicons icon name (overrides char if provided) */
  icon?: string;
  /** Size preset */
  size?: AvatarSize;
  /** Color tint variant */
  tint?: AvatarTint;
  /** Makes avatar pressable */
  onPress?: () => void;
  /** Additional styles */
  style?: ViewStyle;
}

/** Size configurations */
const sizeConfig: Record<AvatarSize, { dim: number; fontSize: number; iconSize: number }> = {
  sm: { dim: 24, fontSize: 10, iconSize: 14 },
  md: { dim: 32, fontSize: 14, iconSize: 18 },
  lg: { dim: 64, fontSize: 28, iconSize: 32 },
};

/** Tint styles using tokens */
const tintStyles: Record<AvatarTint, { bg: string; border: string; color: string }> = {
  default: {
    bg: colors.muted,
    border: colors.border,
    color: colors.text,
  },
  accent: {
    bg: `${colors.accent}25`,
    border: `${colors.accent}40`,
    color: colors.accent,
  },
  success: {
    bg: `${colors.success}25`,
    border: `${colors.success}40`,
    color: colors.success,
  },
  warn: {
    bg: `${colors.warn}25`,
    border: `${colors.warn}40`,
    color: colors.warn,
  },
};

/**
 * Avatar molecule - user identity display.
 * Combines Icon/Text atoms with a styled container.
 */
export function Avatar({
  char,
  icon,
  size = 'md',
  tint = 'default',
  onPress,
  style,
}: AvatarProps) {
  const config = sizeConfig[size];
  const tintStyle = tintStyles[tint];
  const Wrap = onPress ? Pressable : View;

  return (
    <Wrap
      onPress={onPress}
      style={[
        styles.avatar,
        {
          width: config.dim,
          height: config.dim,
          borderRadius: config.dim / 4,
          backgroundColor: tintStyle.bg,
          borderColor: tintStyle.border,
        },
        style,
      ]}
    >
      {icon ? (
        <Icon name={icon} size={size} color={tint === 'default' ? 'text' : tint} />
      ) : (
        <View>
          <Text
            size="body"
            style={{
              fontSize: config.fontSize,
              fontWeight: '700',
              color: tintStyle.color,
            }}
          >
            {char?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
    </Wrap>
  );
}

const styles = {
  avatar: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
  } as ViewStyle,
};

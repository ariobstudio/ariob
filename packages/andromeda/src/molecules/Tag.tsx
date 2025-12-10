/**
 * Tag - Badge with dismiss molecule
 *
 * A badge with optional remove action for tags, categories, or filters.
 * Combines Badge atom with dismiss functionality.
 *
 * @example
 * ```tsx
 * <Tag label="React" />
 * <Tag label="Design" tint="accent" onRemove={() => removeTag('design')} />
 * <Tag label="Important" tint="warn" />
 * ```
 */

import { View, Pressable, Platform, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '../atoms/Text';
import { colors, space, radii } from '../tokens';

/**
 * Tag tints
 */
export type TagTint = 'default' | 'accent' | 'success' | 'warn';

/**
 * Props for the Tag molecule
 */
export interface TagProps {
  /** Tag label text */
  label: string;
  /** Color tint */
  tint?: TagTint;
  /** Remove handler (shows X button when provided) */
  onRemove?: () => void;
  /** Additional styles */
  style?: ViewStyle;
}

/** Tint styles using tokens */
const tintStyles: Record<TagTint, { bg: string; border: string; color: string }> = {
  default: {
    bg: `${colors.text}15`,
    border: `${colors.text}30`,
    color: colors.text,
  },
  accent: {
    bg: `${colors.accent}15`,
    border: `${colors.accent}30`,
    color: colors.accent,
  },
  success: {
    bg: `${colors.success}15`,
    border: `${colors.success}30`,
    color: colors.success,
  },
  warn: {
    bg: `${colors.warn}15`,
    border: `${colors.warn}30`,
    color: colors.warn,
  },
};

/**
 * Tag molecule - badge with dismiss.
 * Combines Badge pattern with remove action.
 */
export function Tag({
  label,
  tint = 'default',
  onRemove,
  style,
}: TagProps) {
  const tintStyle = tintStyles[tint];

  const handleRemove = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onRemove?.();
  };

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: tintStyle.bg,
          borderColor: tintStyle.border,
        },
        style,
      ]}
    >
      <Text size="caption" style={{ color: tintStyle.color }}>
        {label}
      </Text>
      {onRemove && (
        <Pressable onPress={handleRemove} style={styles.removeButton}>
          <Ionicons name="close" size={12} color={tintStyle.color} />
        </Pressable>
      )}
    </View>
  );
}

const styles = {
  tag: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    gap: space.xs,
  } as ViewStyle,
  removeButton: {
    marginLeft: space.xxs,
  } as ViewStyle,
};

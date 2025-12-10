/**
 * Press - Pressable atom with haptic feedback
 *
 * A touch-responsive wrapper providing visual feedback (opacity) and
 * optional haptic feedback on iOS. The foundational interactive atom.
 *
 * @example
 * ```tsx
 * <Press onPress={() => doSomething()}>
 *   <Text>Tap me</Text>
 * </Press>
 *
 * <Press onPress={deleteItem} haptic="heavy">
 *   <Text color="danger">Delete</Text>
 * </Press>
 *
 * <Press onPress={quickAction} onLong={showContextMenu}>
 *   <Text>Tap or hold</Text>
 * </Press>
 * ```
 *
 * **Haptic Levels (iOS only):**
 * - `light`: Subtle tap feedback (default)
 * - `medium`: Standard interaction feedback
 * - `heavy`: Emphasized action feedback
 * - `none`: No haptic feedback
 */

import { Pressable, type ViewStyle, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';

/**
 * Available haptic feedback levels
 */
export type HapticLevel = 'light' | 'medium' | 'heavy' | 'none';

/**
 * Props for the Press atom
 */
export interface PressProps {
  /** Content to render inside the pressable area */
  children: ReactNode;
  /** Callback fired on tap */
  onPress?: () => void;
  /** Callback fired on long press (500ms) */
  onLong?: () => void;
  /** Haptic feedback intensity (iOS only) */
  haptic?: HapticLevel;
  /** Additional styles for the pressable container */
  style?: ViewStyle;
  /** Disables interaction and reduces opacity */
  disabled?: boolean;
}

/** Haptic feedback mapping */
const hapticMap = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

/**
 * Press atom with built-in haptic feedback.
 * The foundational interactive element.
 */
export function Press({
  children,
  onPress,
  onLong,
  haptic = 'light',
  style,
  disabled,
}: PressProps) {
  const tap = () => {
    if (disabled) return;
    if (haptic !== 'none' && Platform.OS === 'ios') {
      Haptics.impactAsync(hapticMap[haptic]);
    }
    onPress?.();
  };

  const hold = () => {
    if (disabled) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLong?.();
  };

  return (
    <Pressable
      onPress={tap}
      onLongPress={onLong ? hold : undefined}
      disabled={disabled}
      style={({ pressed }) => [
        styles.press,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = {
  press: {
    opacity: 1,
  } as ViewStyle,
  pressed: {
    opacity: 0.7,
  } as ViewStyle,
  disabled: {
    opacity: 0.4,
  } as ViewStyle,
};

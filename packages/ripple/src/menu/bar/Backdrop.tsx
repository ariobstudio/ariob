/**
 * Backdrop - Dismissable overlay for input/sheet modes
 *
 * A semi-transparent backdrop that appears during input and sheet modes,
 * allowing the user to tap outside to dismiss.
 *
 * @example
 * ```tsx
 * <Backdrop
 *   visible={mode === 'input'}
 *   onPress={handleDismiss}
 * />
 * ```
 */

import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { BackdropProps } from './types';
import { backdropStyles } from './backdrop.styles';

export function Backdrop({ visible, onPress }: BackdropProps) {
  if (!visible) return null;

  return (
    <Animated.View
      style={backdropStyles.backdrop}
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(100)}
    >
      <Pressable
        style={backdropStyles.pressable}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      />
    </Animated.View>
  );
}

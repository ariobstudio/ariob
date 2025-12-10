/**
 * AnimatedPressable - Pressable wrapper with spring animations and haptics
 *
 * A reusable touch target that combines spring scale animation with optional
 * haptic feedback. Wraps content in an Animated.View and handles press states
 * automatically.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AnimatedPressable onPress={() => console.log('Tapped!')}>
 *   <Text>Tap me</Text>
 * </AnimatedPressable>
 *
 * // Custom scale and haptics
 * <AnimatedPressable
 *   scaleDown={0.9}
 *   hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
 *   onPress={handleSubmit}
 * >
 *   <SubmitButton />
 * </AnimatedPressable>
 *
 * // Disable haptics
 * <AnimatedPressable haptics={false} onPress={handleTap}>
 *   <Card />
 * </AnimatedPressable>
 * ```
 *
 * **Props:**
 * - `scaleDown` - Scale factor on press (default: 0.95)
 * - `haptics` - Enable haptic feedback (default: true)
 * - `hapticStyle` - Haptic intensity (default: Light)
 *
 * @see usePressAnimation - Underlying animation hook
 * @see Bar - Context-aware floating action bar
 */

import { type ReactNode } from 'react';
import { Pressable, type PressableProps, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { usePressAnimation } from '../utils/animations';

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  style?: any;
  /** Scale down amount (default: 0.95) */
  scaleDown?: number;
  /** Enable haptic feedback (default: true) */
  haptics?: boolean;
  /** Haptic intensity */
  hapticStyle?: Haptics.ImpactFeedbackStyle;
}

export function AnimatedPressable({
  children,
  style,
  scaleDown = 0.95,
  haptics = true,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: AnimatedPressableProps) {
  const { style: animatedStyle, onPressIn: animateIn, onPressOut: animateOut } = usePressAnimation(scaleDown);

  const handlePressIn = (e: any) => {
    animateIn();
    if (haptics && Platform.OS === 'ios') {
      Haptics.impactAsync(hapticStyle);
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    animateOut();
    onPressOut?.(e);
  };

  const handlePress = (e: any) => {
    if (haptics && Platform.OS === 'android') {
      Haptics.impactAsync(hapticStyle);
    }
    onPress?.(e);
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

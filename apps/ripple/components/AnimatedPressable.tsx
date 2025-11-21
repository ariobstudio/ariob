/**
 * AnimatedPressable
 *
 * Reusable pressable component with built-in spring animations.
 * Provides haptic feedback and visual press states.
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

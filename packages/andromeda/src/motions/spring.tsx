/**
 * Spring - Spring physics animation utilities
 *
 * Components and hooks for spring-based animations. Provides natural,
 * physics-based motion that feels responsive and organic.
 *
 * @example
 * ```tsx
 * // Scale animation component
 * <Spring scale={isActive ? 1.1 : 1}>
 *   <Card>Scales smoothly</Card>
 * </Spring>
 *
 * // usePressScale hook (for buttons)
 * function MyButton() {
 *   const press = usePressScale(0.95);
 *   return (
 *     <Pressable onPressIn={press.onPressIn} onPressOut={press.onPressOut}>
 *       <Animated.View style={press.style}>
 *         <Text>Press me</Text>
 *       </Animated.View>
 *     </Pressable>
 *   );
 * }
 *
 * // useSpring hook (for custom animations)
 * function Counter() {
 *   const { value, set } = useSpring(0);
 *   return (
 *     <Pressable onPress={() => set(value.value + 1)}>
 *       <AnimatedNumber value={value} />
 *     </Pressable>
 *   );
 * }
 * ```
 *
 * **Spring Config:**
 * - Damping: 16 (smooth) / 20 (snappy for press)
 * - Stiffness: 180 (default) / 300 (press response)
 *
 * @see Fade - For opacity animations
 * @see Slide - For position animations
 */

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

/**
 * Props for the Spring component
 */
export interface SpringProps {
  /** Content to animate */
  children: ReactNode;
  /** Target scale value */
  scale?: number;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Animates scale with spring physics.
 */
export function Spring({ children, scale = 1, style }: SpringProps) {
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale, { damping: 16, stiffness: 180 }) }],
  }));

  return (
    <Animated.View style={[anim, style]}>
      {children}
    </Animated.View>
  );
}

/** Hook for spring value. */
export function useSpring(initial = 0) {
  const value = useSharedValue(initial);

  const set = (to: number) => {
    value.value = withSpring(to, { damping: 16, stiffness: 180 });
  };

  return { value, set };
}

/** Hook for scale animation on press. */
export function usePressScale(scale = 0.95) {
  const pressed = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value, { damping: 20, stiffness: 300 }) }],
  }));

  const onPressIn = () => { pressed.value = scale; };
  const onPressOut = () => { pressed.value = 1; };

  return { style, onPressIn, onPressOut };
}

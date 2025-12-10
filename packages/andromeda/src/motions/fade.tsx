/**
 * Fade - Opacity animation components
 *
 * Components for fade in/out animations using React Native Reanimated.
 * Includes both controlled (show prop) and mount-based variants.
 *
 * @example
 * ```tsx
 * // Controlled fade (toggle visibility)
 * <Fade show={isVisible}>
 *   <Text>Now you see me</Text>
 * </Fade>
 *
 * // Mount animation
 * <FadeEnter>
 *   <Card>Fades in when mounted</Card>
 * </FadeEnter>
 *
 * // Unmount animation
 * <FadeExit>
 *   <Notification>Fades out when removed</Notification>
 * </FadeExit>
 *
 * // Custom duration
 * <Fade show={active} duration={500}>
 *   <SlowReveal />
 * </Fade>
 * ```
 *
 * @see Slide - For position + opacity animations
 * @see Spring - For spring-based scale animations
 */

import Animated, {
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

/**
 * Props for the Fade component
 */
export interface FadeProps {
  /** Content to animate */
  children: ReactNode;
  /** Controls visibility (true = visible) */
  show?: boolean;
  /** Animation duration in ms */
  duration?: number;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Fades content in/out based on show prop.
 */
export function Fade({ children, show = true, duration = 250, style }: FadeProps) {
  const anim = useAnimatedStyle(() => ({
    opacity: withTiming(show ? 1 : 0, { duration }),
  }));

  return (
    <Animated.View style={[anim, style]}>
      {children}
    </Animated.View>
  );
}

/** Fade in on mount. */
export function FadeEnter({ children, duration = 250, style }: Omit<FadeProps, 'show'>) {
  return (
    <Animated.View entering={FadeIn.duration(duration)} style={style}>
      {children}
    </Animated.View>
  );
}

/** Fade out on unmount. */
export function FadeExit({ children, duration = 250, style }: Omit<FadeProps, 'show'>) {
  return (
    <Animated.View exiting={FadeOut.duration(duration)} style={style}>
      {children}
    </Animated.View>
  );
}

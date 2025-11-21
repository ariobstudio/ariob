/**
 * Animation Utilities
 *
 * Reusable animation helpers using Reanimated for consistent,
 * performant animations throughout the app.
 */

import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';
import { useEffect } from 'react';

// ============================================================================
// Spring Configurations
// ============================================================================

/**
 * Default spring config - smooth, natural motion
 */
export const SPRING_CONFIGS = {
  /** Smooth default spring - use for most UI interactions */
  default: {
    damping: 18,
    stiffness: 180,
    mass: 0.5,
  } as WithSpringConfig,

  /** Bouncy spring - use for playful interactions */
  bouncy: {
    damping: 12,
    stiffness: 200,
    mass: 0.8,
  } as WithSpringConfig,

  /** Snappy spring - use for quick feedback */
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.3,
  } as WithSpringConfig,

  /** Gentle spring - use for large elements */
  gentle: {
    damping: 22,
    stiffness: 120,
    mass: 0.7,
  } as WithSpringConfig,
};

/**
 * Timing configurations for eased animations
 */
export const TIMING_CONFIGS = {
  /** Fast timing - 200ms */
  fast: {
    duration: 200,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } as WithTimingConfig,

  /** Default timing - 300ms */
  default: {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } as WithTimingConfig,

  /** Slow timing - 500ms */
  slow: {
    duration: 500,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } as WithTimingConfig,

  /** Linear timing - for progress indicators */
  linear: {
    duration: 300,
    easing: Easing.linear,
  } as WithTimingConfig,
};

// ============================================================================
// Animation Hooks
// ============================================================================

/**
 * Press animation hook - scale down on press, back up on release
 *
 * @example
 * ```tsx
 * function Button() {
 *   const { style, onPressIn, onPressOut } = usePressAnimation();
 *   return (
 *     <Animated.View style={style}>
 *       <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
 *         <Text>Press me</Text>
 *       </Pressable>
 *     </Animated.View>
 *   );
 * }
 * ```
 */
export function usePressAnimation(
  scaleDown = 0.95,
  config: WithSpringConfig = SPRING_CONFIGS.snappy
) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(scaleDown, config);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, config);
  };

  return { style, onPressIn, onPressOut };
}

/**
 * Fade animation hook - fade in/out with optional delay
 *
 * @example
 * ```tsx
 * function FadeView() {
 *   const { style, fadeIn, fadeOut } = useFadeAnimation();
 *
 *   useEffect(() => {
 *     fadeIn();
 *   }, []);
 *
 *   return <Animated.View style={style}>...</Animated.View>;
 * }
 * ```
 */
export function useFadeAnimation(initialOpacity = 0) {
  const opacity = useSharedValue(initialOpacity);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const fadeIn = (delay = 0, config: WithTimingConfig = TIMING_CONFIGS.default) => {
    opacity.value = withDelay(delay, withTiming(1, config));
  };

  const fadeOut = (delay = 0, config: WithTimingConfig = TIMING_CONFIGS.default) => {
    opacity.value = withDelay(delay, withTiming(0, config));
  };

  const setOpacity = (value: number) => {
    opacity.value = value;
  };

  return { style, fadeIn, fadeOut, setOpacity };
}

/**
 * Ripple animation hook - expanding circle effect
 *
 * @example
 * ```tsx
 * function RippleButton() {
 *   const { style, trigger } = useRippleAnimation();
 *
 *   return (
 *     <View>
 *       <Animated.View style={style} />
 *       <Pressable onPress={trigger}>...</Pressable>
 *     </View>
 *   );
 * }
 * ```
 */
export function useRippleAnimation(maxScale = 3) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const trigger = (callback?: () => void) => {
    scale.value = 0;
    opacity.value = 0.6;

    scale.value = withTiming(maxScale, { duration: 600, easing: Easing.out(Easing.ease) });
    opacity.value = withSequence(
      withTiming(0.6, { duration: 100 }),
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished && callback) {
          runOnJS(callback)();
        }
      })
    );
  };

  const reset = () => {
    scale.value = 0;
    opacity.value = 0;
  };

  return { style, trigger, reset };
}

/**
 * Slide animation hook - slide in/out from direction
 *
 * @example
 * ```tsx
 * function SlidePanel() {
 *   const { style, slideIn, slideOut } = useSlideAnimation('right');
 *
 *   return <Animated.View style={style}>...</Animated.View>;
 * }
 * ```
 */
export function useSlideAnimation(
  direction: 'left' | 'right' | 'up' | 'down' = 'right',
  distance = 300
) {
  const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
  const translateY = useSharedValue(direction === 'up' ? -distance : direction === 'down' ? distance : 0);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const slideIn = (config: WithSpringConfig = SPRING_CONFIGS.default) => {
    translateX.value = withSpring(0, config);
    translateY.value = withSpring(0, config);
  };

  const slideOut = (config: WithSpringConfig = SPRING_CONFIGS.default) => {
    if (direction === 'left') {
      translateX.value = withSpring(-distance, config);
    } else if (direction === 'right') {
      translateX.value = withSpring(distance, config);
    } else if (direction === 'up') {
      translateY.value = withSpring(-distance, config);
    } else {
      translateY.value = withSpring(distance, config);
    }
  };

  return { style, slideIn, slideOut };
}

/**
 * Shake animation hook - shake horizontally for error feedback
 *
 * @example
 * ```tsx
 * function ErrorInput() {
 *   const { style, shake } = useShakeAnimation();
 *
 *   const onError = () => {
 *     shake();
 *   };
 *
 *   return <Animated.View style={style}>...</Animated.View>;
 * }
 * ```
 */
export function useShakeAnimation(intensity = 10) {
  const translateX = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shake = () => {
    translateX.value = withSequence(
      withTiming(intensity, { duration: 50 }),
      withTiming(-intensity, { duration: 50 }),
      withTiming(intensity, { duration: 50 }),
      withTiming(-intensity, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  return { style, shake };
}

/**
 * Rotation animation hook - rotate continuously or to specific angle
 *
 * @example
 * ```tsx
 * function LoadingSpinner() {
 *   const { style } = useRotateAnimation(true);
 *   return <Animated.View style={style}>...</Animated.View>;
 * }
 * ```
 */
export function useRotateAnimation(continuous = false) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (continuous) {
      rotation.value = withSequence(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        withTiming(0, { duration: 0 })
      );
    }
  }, [continuous]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const rotateTo = (angle: number, config: WithSpringConfig = SPRING_CONFIGS.default) => {
    rotation.value = withSpring(angle, config);
  };

  return { style, rotateTo };
}

/**
 * Mount/unmount animation hook - fade + slide on mount
 *
 * @example
 * ```tsx
 * function Card() {
 *   const { style } = useMountAnimation();
 *   return <Animated.View style={style}>...</Animated.View>;
 * }
 * ```
 */
export function useMountAnimation(delay = 0, fromDirection: 'up' | 'down' | 'left' | 'right' = 'down') {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(fromDirection === 'up' ? -20 : fromDirection === 'down' ? 20 : 0);
  const translateX = useSharedValue(fromDirection === 'left' ? -20 : fromDirection === 'right' ? 20 : 0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, TIMING_CONFIGS.default));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIGS.default));
    translateX.value = withDelay(delay, withSpring(0, SPRING_CONFIGS.default));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return { style };
}

/**
 * RefreshLogo
 *
 * Circular ripple pull-to-refresh animation.
 * Ripples expand from center like water drops as the user pulls down.
 */

import { StyleSheet, View } from 'react-native';
import React from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';

interface RefreshLogoProps {
  scrollY: SharedValue<number>;
  maxScrollY?: number;
}

const MAX_SCROLL_Y = 100;
const RIPPLE_SIZE = 60;

const completeFeedback = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export function RefreshLogo({
  scrollY,
  maxScrollY = MAX_SCROLL_Y,
}: RefreshLogoProps) {
  // Pull progress (0 to 1)
  const progress = useDerivedValue(() => {
    return Math.min(1, Math.max(0, -scrollY.value / maxScrollY));
  });

  // Haptic feedback at 100%
  useAnimatedReaction(
    () => progress.value,
    (curr) => {
      if (curr >= 1) {
        runOnJS(completeFeedback)();
      }
    }
  );

  // Core dot with smooth easing
  const coreStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.3, 1],
      [0, 1, 1],
      {
        extrapolateLeft: Extrapolation.CLAMP,
        extrapolateRight: Extrapolation.CLAMP,
      }
    );

    return {
      transform: [{ scale }],
      opacity: interpolate(
        progress.value,
        [0, 0.3, 1],
        [0, 1, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  // Ripple 1 (innermost) - smooth expansion
  const ripple1Style = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.3, 0.6, 1],
      [0.5, 0.7, 0.9, 1],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.2, 0.6, 1],
      [0, 0.7, 0.85, 0.9],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Ripple 2 (middle) - delayed smooth expansion
  const ripple2Style = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.2, 0.5, 0.8, 1],
      [0.3, 0.5, 0.7, 0.9, 1],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.3, 0.7, 1],
      [0, 0.5, 0.7, 0.75],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Ripple 3 (outermost) - most delayed, smooth expansion
  const ripple3Style = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.1, 0.4, 0.7, 1],
      [0.2, 0.4, 0.6, 0.85, 1],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.4, 0.8, 1],
      [0, 0.4, 0.6, 0.65],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.rippleContainer}>
        {/* Outermost ripple */}
        <Animated.View style={[styles.rippleCircle, styles.ripple3, ripple3Style]} />

        {/* Middle ripple */}
        <Animated.View style={[styles.rippleCircle, styles.ripple2, ripple2Style]} />

        {/* Innermost ripple */}
        <Animated.View style={[styles.rippleCircle, styles.ripple1, ripple1Style]} />

        {/* Core dot */}
        <Animated.View style={[styles.rippleCore, coreStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleContainer: {
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 9999,
  },
  ripple1: {
    width: 20,
    height: 20,
    borderColor: theme.colors.text,
  },
  ripple2: {
    width: 35,
    height: 35,
    borderColor: `${theme.colors.text}80`,
  },
  ripple3: {
    width: 50,
    height: 50,
    borderColor: `${theme.colors.text}60`,
  },
  rippleCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text,
  },
});

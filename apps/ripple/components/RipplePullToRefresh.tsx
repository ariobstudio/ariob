/**
 * RipplePullToRefresh - Pull-to-refresh with expanding ripple animation
 *
 * A custom pull-to-refresh implementation that replaces the standard spinner
 * with a branded expanding circle animation. The ripple grows as the user
 * pulls, providing satisfying visual feedback.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <RipplePullToRefresh onRefresh={fetchData}>
 *   <FeedContent />
 * </RipplePullToRefresh>
 *
 * // Custom ripple color
 * <RipplePullToRefresh
 *   onRefresh={fetchData}
 *   rippleColor="#00E5FF"
 * >
 *   <Content />
 * </RipplePullToRefresh>
 * ```
 *
 * **Animation Sequence:**
 * 1. Pull: Ripple scales 0 → 0.5x based on pull distance
 * 2. Release: Scale jumps to 1x, then expands to 2.5x
 * 3. Fade: Opacity pulses 0 → 0.8 → 0 during refresh
 *
 * **Configuration:**
 * - Pull distance threshold: 120px
 * - Ripple size: 60px diameter
 * - Medium haptic feedback on trigger (iOS)
 *
 * @see FeedView - Primary consumer of this component
 * @see theme.colors.text - Default ripple color
 */

// CRITICAL: Import Unistyles configuration first
import '../unistyles.config';

import { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  type ScrollViewProps,
  Platform,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const PULL_DISTANCE = 120; // Distance to pull before triggering refresh
const RIPPLE_SIZE = 60;

interface RipplePullToRefreshProps extends ScrollViewProps {
  onRefresh?: () => Promise<void> | void;
  /** Custom ripple color - defaults to theme.colors.text */
  rippleColor?: string;
}

export function RipplePullToRefresh({
  children,
  onRefresh,
  rippleColor,
  ...scrollViewProps
}: RipplePullToRefreshProps) {
  const { theme } = useUnistyles();
  // Use theme color if no custom color provided
  const actualRippleColor = rippleColor ?? theme.colors.text;
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const pullProgress = useSharedValue(0);

  const triggerRefresh = useCallback(async () => {
    if (refreshing || !onRefresh) return;

    setRefreshing(true);

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Trigger ripple animation
    rippleScale.value = withSequence(
      withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) }),
      withTiming(2.5, { duration: 400, easing: Easing.out(Easing.ease) })
    );

    rippleOpacity.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(0, { duration: 500 })
    );

    // Execute refresh
    await onRefresh();

    // Reset
    setRefreshing(false);
    pullProgress.value = withSpring(0);
  }, [refreshing, onRefresh]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;

      // Track pull distance when at top
      if (event.contentOffset.y < 0 && !refreshing) {
        const pull = Math.abs(event.contentOffset.y);
        pullProgress.value = Math.min(pull / PULL_DISTANCE, 1);

        // Scale ripple based on pull
        rippleScale.value = pullProgress.value * 0.5;
        rippleOpacity.value = pullProgress.value * 0.3;
      }
    },
    onEndDrag: (event) => {
      const pull = Math.abs(event.contentOffset.y);

      if (pull >= PULL_DISTANCE && !refreshing) {
        runOnJS(triggerRefresh)();
      } else {
        // Reset if not pulled far enough
        rippleScale.value = withSpring(0);
        rippleOpacity.value = withSpring(0);
        pullProgress.value = withSpring(0);
      }
    },
  });

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullProgress.value * 20 }],
  }));

  return (
    <View style={styles.container}>
      {/* Ripple indicator */}
      <View style={styles.rippleContainer} pointerEvents="none">
        <Animated.View
          style={[
            styles.ripple,
            rippleStyle,
            { backgroundColor: actualRippleColor },
          ]}
        />
      </View>

      {/* Scrollable content */}
      <Animated.ScrollView
        {...scrollViewProps}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={true}
        style={[scrollViewProps.style, containerStyle]}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rippleContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    height: RIPPLE_SIZE,
  },
  ripple: {
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    borderRadius: RIPPLE_SIZE / 2,
  },
});

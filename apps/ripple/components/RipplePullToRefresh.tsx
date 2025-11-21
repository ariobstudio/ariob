/**
 * RipplePullToRefresh
 *
 * Custom pull-to-refresh component with signature ripple animation
 * instead of the standard spinner.
 */

import { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  Platform,
} from 'react-native';
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
import { theme } from '../theme';

const PULL_DISTANCE = 120; // Distance to pull before triggering refresh
const RIPPLE_SIZE = 60;

interface RipplePullToRefreshProps extends ScrollViewProps {
  onRefresh?: () => Promise<void> | void;
  /** Custom ripple color */
  rippleColor?: string;
}

export function RipplePullToRefresh({
  children,
  onRefresh,
  rippleColor = theme.colors.text,
  ...scrollViewProps
}: RipplePullToRefreshProps) {
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
            { backgroundColor: rippleColor },
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

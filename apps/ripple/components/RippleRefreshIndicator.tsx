/**
 * RippleRefreshIndicator
 *
 * SVG-based pull-to-refresh indicator.
 * Uses RefreshLogo component for smooth path drawing animation.
 */

import { StyleSheet } from 'react-native';
import React from 'react';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { RefreshLogo } from './RefreshLogo';

interface RippleRefreshIndicatorProps {
  scrollY: SharedValue<number>;
  refreshing: boolean;
  maxScrollY?: number;
}

const MAX_SCROLL_Y = 100;
const CONTAINER_HEIGHT = 80;

export function RippleRefreshIndicator({
  scrollY,
  refreshing,
  maxScrollY = MAX_SCROLL_Y,
}: RippleRefreshIndicatorProps) {
  // Pull progress (0 to 1)
  const pullProgress = useDerivedValue(() => {
    if (refreshing) return 1;
    return Math.min(1, Math.max(0, -scrollY.value / maxScrollY));
  });

  // Container visibility
  const containerStyle = useAnimatedStyle(() => {
    const isVisible = pullProgress.value > 0;

    return {
      height: isVisible ? CONTAINER_HEIGHT : 0,
      opacity: isVisible ? 1 : 0,
    };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <RefreshLogo scrollY={scrollY} maxScrollY={maxScrollY} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

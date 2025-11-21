/**
 * ContentCard - Base card component for all content types
 *
 * Liquid Minimalism aesthetic with subtle depth and fluid interactions
 */

import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../../../../apps/ripple/theme';

interface ContentCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'flat';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ContentCard({
  children,
  onPress,
  onLongPress,
  style,
  variant = 'default',
}: ContentCardProps) {
  const scale = useSharedValue(1);
  const ripple = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 300,
    });

    // Ripple effect
    ripple.value = withSequence(
      withSpring(1, { damping: 10 }),
      withSpring(0, { damping: 10 })
    );
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: ripple.value * 0.1,
    transform: [{ scale: 1 + ripple.value * 0.05 }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, styles.container, variantStyles[variant], style]}
    >
      {/* Ripple effect overlay */}
      <Animated.View style={[styles.rippleOverlay, rippleStyle]} />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  rippleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.xl,
  },
});

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: theme.colors.surface,
    borderWidth: 0.5,
    borderColor: `${theme.colors.border}80`,
  },
  elevated: {
    backgroundColor: theme.colors.surfaceElevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  flat: {
    backgroundColor: 'transparent',
  },
});

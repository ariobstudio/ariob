/**
 * Button - Interactive element with ripple effect
 */

import React, { useRef } from 'react';
import { Pressable, PressableProps, View, Animated } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Text } from './Text';

export interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  children: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  children,
  style,
  ...props
}) => {
  const rippleAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.sequence([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.timing(rippleAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1.5],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.2, 0],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}
    >
      {({ pressed }) => (
        <>
          {/* Ripple effect */}
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />

          {/* Button content */}
          <Text
            variant={size === 'small' ? 'small' : size === 'large' ? 'large' : 'body'}
            weight="medium"
            color={variant === 'ghost' ? 'cream' : 'accent'}
            style={[pressed && styles.pressed]}
          >
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.round,
    overflow: 'hidden',
    position: 'relative',
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.cream,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.mist,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  size_small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 32,
  },
  size_medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  size_large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 56,
  },

  fullWidth: {
    width: '100%',
  },

  // Ripple effect (concentric circle)
  ripple: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.accent,
    top: 0,
    left: 0,
  },

  pressed: {
    opacity: 0.8,
  },
}));

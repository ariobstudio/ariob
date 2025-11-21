/**
 * Card - Container with depth and shadow
 */

import React from 'react';
import { View, ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  radius?: 'sharp' | 'subtle' | 'soft' | 'round';
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  radius = 'subtle',
  style,
  children,
  ...props
}) => {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        styles[`padding_${padding}`],
        styles[`radius_${radius}`],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    overflow: 'hidden',
  },

  // Variants
  elevated: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.soft,
  },
  outlined: {
    backgroundColor: theme.colors.depth,
    borderWidth: 1,
    borderColor: theme.colors.mist,
  },
  flat: {
    backgroundColor: theme.colors.surface,
  },

  // Padding
  padding_none: { padding: 0 },
  padding_small: { padding: theme.spacing.sm },
  padding_medium: { padding: theme.spacing.md },
  padding_large: { padding: theme.spacing.lg },

  // Border radius
  radius_sharp: { borderRadius: theme.borderRadius.sharp },
  radius_subtle: { borderRadius: theme.borderRadius.subtle },
  radius_soft: { borderRadius: theme.borderRadius.soft },
  radius_round: { borderRadius: theme.borderRadius.round },
}));

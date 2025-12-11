import React from 'react';
import { View, ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  radius?: number;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  radius,
  style,
  children,
  ...props
}) => {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'flat' && styles.flat,
        padding === 'none' && styles.paddingNone,
        padding === 'small' && styles.paddingSmall,
        padding === 'medium' && styles.paddingMedium,
        padding === 'large' && styles.paddingLarge,
        radius !== undefined && { borderRadius: radius },
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
  elevated: {
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  outlined: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flat: {
    backgroundColor: theme.colors.surface,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: theme.spacing.sm,
  },
  paddingMedium: {
    padding: theme.spacing.md,
  },
  paddingLarge: {
    padding: theme.spacing.lg,
  },
}));

import React from 'react';
import { Pressable, PressableProps } from 'react-native';
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
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        size === 'small' && styles.sizeSmall,
        size === 'medium' && styles.sizeMedium,
        size === 'large' && styles.sizeLarge,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        style,
      ]}
      {...props}
    >
      <Text
        variant={size === 'small' ? 'bodySmall' : 'body'}
        weight="600"
        style={[
          variant === 'primary' && styles.textPrimary,
          variant === 'secondary' && styles.textSecondary,
          variant === 'ghost' && styles.textGhost,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: theme.colors.text,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  textPrimary: {
    color: theme.colors.background,
  },
  textSecondary: {
    color: theme.colors.text,
  },
  textGhost: {
    color: theme.colors.text,
  },
  sizeSmall: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 32,
  },
  sizeMedium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 44,
  },
  sizeLarge: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.7,
  },
}));

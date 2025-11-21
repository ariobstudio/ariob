/**
 * Input - Text input with refined aesthetic
 */

import React, { useState } from 'react';
import { TextInput, TextInputProps, View, Animated } from 'react-native';
import { StyleSheet, useStyles } from 'react-native-unistyles';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  style,
  ...props
}) => {
  const { theme } = useStyles();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = React.useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.mist, theme.colors.cream],
  });

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      {label && (
        <Text variant="label" color="pearl" style={styles.label}>
          {label}
        </Text>
      )}

      <Animated.View style={[styles.inputWrapper, { borderColor }]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.ash}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>

      {error && (
        <Text variant="caption" color="pearl" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.xs,
  },

  fullWidth: {
    width: '100%',
  },

  label: {
    marginBottom: theme.spacing.xs,
  },

  inputWrapper: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.soft,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.mist,
  },

  input: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSizes.body,
    fontFamily: theme.fonts.serif.regular,
    color: theme.colors.cream,
    minHeight: 48,
  },

  error: {
    marginTop: theme.spacing.xs,
  },
}));

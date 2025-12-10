/**
 * Input - Clean, modern text entry
 *
 * Minimalist input field with Apple-inspired aesthetics.
 * Features smooth focus transitions and clear/action buttons.
 */

import { TextInput, View, Pressable, type TextInputProps, type ViewStyle } from 'react-native';
import { useState } from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  variant?: 'filled' | 'outline' | 'minimal';
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  variant = 'filled',
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { theme } = useUnistyles();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Dynamic colors
  const borderColor = error 
    ? theme.colors.danger 
    : isFocused 
      ? theme.colors.accent 
      : 'transparent';

  const backgroundColor = variant === 'filled' 
    ? (theme.colors.bg === '#000000' ? '#1C1C1E' : '#E5E5EA') // iOS System Gray 6 / Gray 2
    : 'transparent';
  
  const textColor = theme.colors.text;
  const placeholderColor = theme.colors.dim;
  const iconColor = isFocused ? theme.colors.accent : theme.colors.dim;

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(borderColor),
    backgroundColor: withTiming(backgroundColor),
  }));

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Animated.Text style={[styles.label, { color: theme.colors.dim }]}>{label}</Animated.Text>}
      
      <Animated.View style={[
        styles.container,
        containerAnimatedStyle,
        variant === 'outline' && { borderWidth: 1, borderColor: theme.colors.borderStrong },
        variant === 'minimal' && { borderBottomWidth: 1, borderRadius: 0, paddingHorizontal: 0 },
      ]}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={iconColor} 
            style={styles.leftIcon} 
          />
        )}

        <TextInput
          style={[
            styles.input,
            { color: textColor },
            style
          ]}
          placeholderTextColor={placeholderColor}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={theme.colors.accent}
          {...props}
        />

        {rightIcon && (
          <Pressable onPress={onRightIconPress} hitSlop={8}>
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={iconColor} 
              style={styles.rightIcon} 
            />
          </Pressable>
        )}
      </Animated.View>
      
      {error && (
        <Animated.Text style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48, // Standard touch target
    borderRadius: 12, // Rounded rect (iOS style)
    paddingHorizontal: 12,
    borderWidth: 1.5, // Subtle border width
    borderColor: 'transparent',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  input: {
    flex: 1,
    fontSize: 17, // iOS Standard Font Size
    height: '100%',
    paddingVertical: 0, // Reset default padding
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

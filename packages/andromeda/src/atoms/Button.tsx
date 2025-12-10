/**
 * Button - Primary interactive atom
 *
 * Modern capsule-style buttons with Apple-inspired aesthetics.
 * Supports solid, glass, and ghost variants.
 */

import { Pressable, Text, View, ActivityIndicator, type ViewStyle, type TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import type { ReactNode } from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * Button variants
 */
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'glass';

/**
 * Button semantic tints
 */
export type ButtonTint = 'default' | 'accent' | 'success' | 'danger' | 'warn';

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Button atom
 */
export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  tint?: ButtonTint;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function Button({
  children,
  variant = 'solid',
  tint = 'accent',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onPress,
  style,
}: ButtonProps) {
  const { theme } = useUnistyles();

  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
    onPress();
  };

  // Dynamic Styles Calculation
  const getDynamicStyles = () => {
    const isDark = theme.colors.bg === '#000000';
    let bg = 'transparent';
    let contentColor = theme.colors.text;
    let borderColor = 'transparent';
    let borderWidth = 0;

    // Tint color resolution
    const tintColor = tint === 'default' ? theme.colors.text : theme.colors[tint] || theme.colors.accent;
    
    switch (variant) {
      case 'solid':
        bg = tintColor;
        contentColor = '#FFFFFF'; // Solid buttons usually white text
        if (tint === 'default' && !isDark) contentColor = '#FFFFFF';
        if (tint === 'default' && isDark) {
             bg = '#FFFFFF';
             contentColor = '#000000';
        }
        break;
      case 'glass':
        bg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)';
        contentColor = tintColor;
        // Glass effect would ideally use BlurView, but simple translucent bg for now
        break;
      case 'outline':
        bg = 'transparent';
        borderColor = tintColor;
        borderWidth = 1.5; // Slightly thicker for modern look
        contentColor = tintColor;
        break;
      case 'ghost':
        bg = 'transparent';
        contentColor = tintColor;
        break;
    }

    // Disabled state
    if (disabled) {
      bg = isDark ? '#333' : '#E5E5EA';
      contentColor = '#8E8E93';
      borderColor = 'transparent';
    }

    return {
      container: {
        backgroundColor: bg,
        borderColor,
        borderWidth,
      } as ViewStyle,
      text: {
        color: contentColor,
      } as TextStyle,
      icon: contentColor,
    };
  };

  const dynamic = getDynamicStyles();

  // Size Configuration
  const sizeConfig = {
    sm: { height: 32, px: 12, fontSize: 13, iconSize: 14 },
    md: { height: 44, px: 20, fontSize: 16, iconSize: 18 }, // Taller, touch-friendly
    lg: { height: 54, px: 24, fontSize: 18, iconSize: 22 },
  };
  const config = sizeConfig[size];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.container,
        {
          height: config.height,
          paddingHorizontal: config.px,
          borderRadius: 999, // Capsule shape always
        },
        dynamic.container,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={dynamic.icon} 
            style={iconPosition === 'left' ? { marginRight: 8 } : { marginLeft: 8 }}
          />
        ) : icon && iconPosition === 'left' ? (
          <Ionicons
            name={icon}
            size={config.iconSize}
            color={dynamic.icon}
            style={{ marginRight: 6 }}
          />
        ) : null}

        <Text style={[
          styles.text, 
          { fontSize: config.fontSize }, 
          dynamic.text
        ]}>
          {children}
        </Text>

        {icon && iconPosition === 'right' && !loading && (
          <Ionicons
            name={icon}
            size={config.iconSize}
            color={dynamic.icon}
            style={{ marginLeft: 6 }}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: -0.3, // Tighter tracking for modern look
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }], // Subtle press scale
  },
});

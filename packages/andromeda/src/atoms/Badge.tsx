/**
 * Badge - Semantic status indicator
 *
 * Compact pill-shaped indicators with pastel backgrounds and darker text.
 * Inspired by iOS/macOS system badges.
 */

import { View, Text, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export type BadgeVariant = 'default' | 'accent' | 'success' | 'warn' | 'danger' | 'info' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export function Badge({ 
  label, 
  variant = 'default', 
  size = 'md',
  style 
}: BadgeProps) {
  const { theme } = useUnistyles();

  // Color Logic: Pastel BG + Darker Text
  const getColors = () => {
    // Helper for alpha backgrounds
    const alpha = (color: string, opacity: number) => {
      // Simple alpha approximation or use hex logic if available
      // For now, assuming standard hex colors and returning transparent equivalents handled by style
      // Since we don't have a color utility here, we'll map to theme values or approximate
      return color; 
    };

    const isDark = theme.colors.bg === '#000000';
    
    // In dark mode: 20% opacity BG, 100% opacity text
    // In light mode: 15% opacity BG, 100% opacity text (darker shade)
    
    let baseColor = theme.colors.text;

    switch (variant) {
      case 'accent': baseColor = theme.colors.accent; break;
      case 'success': baseColor = theme.colors.success; break;
      case 'warn': baseColor = theme.colors.warn; break;
      case 'danger': baseColor = theme.colors.danger; break;
      case 'info': baseColor = theme.colors.info; break;
      case 'default': baseColor = theme.colors.dim; break;
    }

    if (variant === 'outline') {
      return {
        bg: 'transparent',
        text: baseColor,
        border: baseColor,
      };
    }

    // Modern Pastel Pill Style
    return {
      bg: isDark ? baseColor : baseColor, // Will apply opacity in style
      text: baseColor,
      border: 'transparent',
      opacity: isDark ? 0.2 : 0.15, // Background opacity
    };
  };

  const colors = getColors();
  const isOutline = variant === 'outline';

  const sizeConfig = {
    sm: { height: 20, px: 6, fontSize: 11 },
    md: { height: 24, px: 10, fontSize: 13 },
  };
  const config = sizeConfig[size];

  return (
    <View style={[
      styles.container, 
      { 
        height: config.height, 
        paddingHorizontal: config.px,
        borderColor: colors.border,
        borderWidth: isOutline ? 1 : 0,
        backgroundColor: isOutline ? 'transparent' : 'transparent', // Handled via underlay if needed, or composite
      },
      style
    ]}>
      {/* Pastel Background Layer */}
      {!isOutline && (
        <View style={[
          StyleSheet.absoluteFill, 
          { 
            backgroundColor: colors.bg, 
            opacity: colors.opacity,
            borderRadius: 999 
          }
        ]} />
      )}
      
      <Text style={[
        styles.text, 
        { 
          color: colors.text, 
          fontSize: config.fontSize 
        }
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999, // Pill shape
    overflow: 'hidden', // Contain background layer
  },
  text: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});

/**
 * Card - Content container
 *
 * Clean, modern surface for grouping content.
 * Uses shadow for elevation in light mode, surface lightness in dark mode.
 */

import { View, Pressable, type ViewStyle, type ViewProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export type CardVariant = 'elevated' | 'flat' | 'outlined' | 'glass';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  onPress?: () => void;
  noPadding?: boolean;
}

export function Card({ 
  children, 
  variant = 'elevated', 
  onPress,
  noPadding = false,
  style,
  ...props 
}: CardProps) {
  const { theme } = useUnistyles();

  const getVariantStyle = () => {
    const isDark = theme.colors.bg === '#000000';

    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.surface,
          ...theme.shadow.sm, // Soft shadow
          borderWidth: 0,
        };
      case 'flat':
        return {
          backgroundColor: theme.colors.muted,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.borderStrong,
        };
      case 'glass':
        return {
          backgroundColor: theme.colors.glass,
          borderWidth: 0.5,
          borderColor: 'rgba(255,255,255,0.1)',
        };
      default:
        return {};
    }
  };

  const Container = onPress ? Pressable : View;

  return (
    <Container
      style={[
        styles.card,
        {
          padding: noPadding ? 0 : theme.space.lg,
          borderRadius: theme.radii.md,
        },
        getVariantStyle(),
        style
      ]}
      onPress={onPress}
      {...(onPress ? { android_ripple: { color: theme.colors.overlay } } : {})}
      {...props}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    width: '100%',
  },
});

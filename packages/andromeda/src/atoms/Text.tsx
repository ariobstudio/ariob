/**
 * Text - Typography atom with semantic scales
 *
 * The foundational text atom using design tokens for colors and typography.
 * Cannot be broken down further - a true atomic component.
 *
 * @example
 * ```tsx
 * <Text size="title">Welcome Back</Text>
 * <Text color="dim">Secondary information</Text>
 * <Text size="caption" color="success">Saved successfully</Text>
 * ```
 */

import { Text as RNText, type TextStyle, type TextProps as RNTextProps } from 'react-native';
import type { ReactNode } from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { font } from '../tokens';

/**
 * Available typography sizes
 */
export type TextSize = 'title' | 'heading' | 'body' | 'caption' | 'mono';

/**
 * Available semantic colors
 */
export type TextColor = 'text' | 'dim' | 'faint' | 'accent' | 'success' | 'warn' | 'danger';

/**
 * Props for the Text atom
 */
export interface TextProps extends Omit<RNTextProps, 'style'> {
  /** Text content to display */
  children: ReactNode;
  /** Typography scale preset */
  size?: TextSize;
  /** Semantic color variant */
  color?: TextColor;
  /** Additional text styles */
  style?: TextStyle;
}

/** Size styles using tokens */
const sizeStyles: Record<TextSize, TextStyle> = {
  title: {
    fontSize: font.title.size,
    fontWeight: font.title.weight,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: font.heading.size,
    fontWeight: font.heading.weight,
  },
  body: {
    fontSize: font.body.size,
    fontWeight: font.body.weight,
    lineHeight: 20,
  },
  caption: {
    fontSize: font.caption.size,
    fontWeight: font.caption.weight,
  },
  mono: {
    fontSize: font.mono.size,
    fontWeight: font.mono.weight,
    letterSpacing: 0.4,
    fontFamily: 'monospace',
  },
};

/**
 * Text atom with predefined typography scales and semantic colors.
 * Uses theme-aware colors for dark/light mode support.
 */
export function Text({
  children,
  size = 'body',
  color = 'text',
  style,
  ...rest
}: TextProps) {
  const { theme } = useUnistyles();

  // Map semantic color to theme color
  const colorMap: Record<TextColor, string> = {
    text: theme.colors.text,
    dim: theme.colors.dim,
    faint: theme.colors.faint,
    accent: theme.colors.accent,
    success: theme.colors.success,
    warn: theme.colors.warn,
    danger: theme.colors.danger,
  };

  return (
    <RNText
      style={[
        { fontWeight: '500' as const },
        sizeStyles[size],
        { color: colorMap[color] },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

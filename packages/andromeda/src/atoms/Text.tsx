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
import { colors, font } from '../tokens';

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

/** Color styles using tokens */
const colorStyles: Record<TextColor, TextStyle> = {
  text: { color: colors.text },
  dim: { color: colors.dim },
  faint: { color: colors.faint },
  accent: { color: colors.accent },
  success: { color: colors.success },
  warn: { color: colors.warn },
  danger: { color: colors.danger },
};

/**
 * Text atom with predefined typography scales and semantic colors.
 * Uses design tokens - no hardcoded values.
 */
export function Text({
  children,
  size = 'body',
  color = 'text',
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[
        { fontWeight: '500' as const },
        sizeStyles[size],
        colorStyles[color],
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

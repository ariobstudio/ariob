/**
 * Text - Primitive text component with Liquid Monochrome typography
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface TextProps extends RNTextProps {
  variant?: 'hero' | 'display' | 'title' | 'large' | 'body' | 'small' | 'caption' | 'mono' | 'label';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'cream' | 'pearl' | 'ash' | 'shadow' | 'accent';
  align?: 'left' | 'center' | 'right';
  mono?: boolean;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight = 'regular',
  color = 'cream',
  align = 'left',
  mono = false,
  style,
  ...props
}) => {
  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        styles[`weight_${weight}`],
        styles[`color_${color}`],
        { textAlign: align },
        mono && styles.mono,
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.serif.regular,
    letterSpacing: theme.letterSpacing.normal,
  },

  // Variants
  hero: {
    fontSize: theme.fontSizes.hero,
    lineHeight: theme.fontSizes.hero * theme.lineHeights.tight,
    fontFamily: theme.fonts.serif.bold,
    letterSpacing: theme.letterSpacing.tight,
  },
  display: {
    fontSize: theme.fontSizes.display,
    lineHeight: theme.fontSizes.display * theme.lineHeights.tight,
    fontFamily: theme.fonts.serif.semibold,
  },
  title: {
    fontSize: theme.fontSizes.title,
    lineHeight: theme.fontSizes.title * theme.lineHeights.normal,
    fontFamily: theme.fonts.serif.semibold,
  },
  large: {
    fontSize: theme.fontSizes.large,
    lineHeight: theme.fontSizes.large * theme.lineHeights.relaxed,
  },
  body: {
    fontSize: theme.fontSizes.body,
    lineHeight: theme.fontSizes.body * theme.lineHeights.relaxed,
  },
  small: {
    fontSize: theme.fontSizes.small,
    lineHeight: theme.fontSizes.small * theme.lineHeights.normal,
  },
  caption: {
    fontSize: theme.fontSizes.caption,
    lineHeight: theme.fontSizes.caption * theme.lineHeights.normal,
  },
  mono: {
    fontFamily: theme.fonts.mono.regular,
    fontSize: theme.fontSizes.mono,
    lineHeight: theme.fontSizes.mono * theme.lineHeights.normal,
    letterSpacing: theme.letterSpacing.wide,
  },
  label: {
    fontFamily: theme.fonts.mono.medium,
    fontSize: theme.fontSizes.label,
    lineHeight: theme.fontSizes.label * theme.lineHeights.tight,
    letterSpacing: theme.letterSpacing.widest,
    textTransform: 'uppercase',
  },

  // Weights
  weight_light: { fontFamily: theme.fonts.serif.light },
  weight_regular: { fontFamily: theme.fonts.serif.regular },
  weight_medium: { fontFamily: theme.fonts.serif.medium },
  weight_semibold: { fontFamily: theme.fonts.serif.semibold },
  weight_bold: { fontFamily: theme.fonts.serif.bold },

  // Colors
  color_cream: { color: theme.colors.cream },
  color_pearl: { color: theme.colors.pearl },
  color_ash: { color: theme.colors.ash },
  color_shadow: { color: theme.colors.shadow },
  color_accent: { color: theme.colors.accent },
}));

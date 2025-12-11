/**
 * Text - Primitive text component using Unistyles theme
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface TextProps extends RNTextProps {
  variant?: 
    | 'h1' | 'h2' | 'h3' | 'h4'
    | 'bodyLarge' | 'body' | 'bodySmall'
    | 'label' | 'caption';
  weight?: '300' | '400' | '500' | '600' | '700';
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight,
  style,
  ...props
}) => {
  return (
    <RNText
      style={[
        styles.base,
        variant && styles[variant],
        weight && { fontWeight: weight },
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    color: theme.colors.text,
  },

  // Heading Variants
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
  },
  h4: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },

  // Body Variants
  bodyLarge: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },

  // Label & Caption
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
}));

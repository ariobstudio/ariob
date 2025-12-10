/**
 * Label - Form label atom
 *
 * A text label for form elements with optional required indicator.
 * Cannot be broken down further - a true atomic component.
 *
 * @example
 * ```tsx
 * <Label>Email Address</Label>
 * <Label required>Password</Label>
 * <Label error>Invalid username</Label>
 * ```
 */

import { Text, View, type ViewStyle, type TextStyle } from 'react-native';
import type { ReactNode } from 'react';
import { colors, space, font } from '../tokens';

/**
 * Props for the Label atom
 */
export interface LabelProps {
  /** Label text content */
  children: ReactNode;
  /** Show required indicator (*) */
  required?: boolean;
  /** Show error state (red color) */
  error?: boolean;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Label atom for form elements.
 * Uses design tokens - no hardcoded values.
 */
export function Label({ children, required = false, error = false, style }: LabelProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, error && styles.error]}>
        {children}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
    </View>
  );
}

const styles = {
  container: {
    marginBottom: space.xs,
  } as ViewStyle,
  label: {
    fontSize: font.caption.size,
    fontWeight: font.caption.weight,
    color: colors.dim,
  } as TextStyle,
  required: {
    color: colors.danger,
  } as TextStyle,
  error: {
    color: colors.danger,
  } as TextStyle,
};

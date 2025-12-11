/**
 * InputField - Label + Input molecule
 *
 * A complete form field combining Label and Input atoms
 * with error state and hint text.
 *
 * @example
 * ```tsx
 * <InputField
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   placeholder="Enter email..."
 * />
 *
 * <InputField
 *   label="Password"
 *   value={password}
 *   onChangeText={setPassword}
 *   error="Password is too short"
 *   required
 * />
 * ```
 */

import { View, type ViewStyle, type TextStyle } from 'react-native';
import { Label } from '../atoms/Label';
import { Input, type InputProps } from '../atoms/Input';
import { Text } from '../atoms/Text';
import { space } from '../tokens';

/**
 * Props for the InputField molecule
 * Extends InputProps but overrides `error` to accept a string message
 */
export interface InputFieldProps extends Omit<InputProps, 'error'> {
  /** Field label */
  label: string;
  /** Error message (shows error state when provided) */
  error?: string;
  /** Hint text below input */
  hint?: string;
  /** Show required indicator */
  required?: boolean;
}

/**
 * InputField molecule - complete form field.
 * Combines Label and Input atoms.
 */
export function InputField({
  label,
  error,
  hint,
  required,
  ...inputProps
}: InputFieldProps) {
  const hasError = Boolean(error);

  return (
    <View style={styles.field}>
      <Label required={required} error={hasError}>
        {label}
      </Label>
      <Input {...inputProps} error={hasError} />
      {error && (
        <Text size="caption" color="danger" style={styles.message}>
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text size="caption" color="faint" style={styles.message}>
          {hint}
        </Text>
      )}
    </View>
  );
}

const styles = {
  field: {
    marginBottom: space.md,
  } as ViewStyle,
  message: {
    marginTop: space.xs,
  } as TextStyle,
};

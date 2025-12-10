/** Toast Parts - Composable sub-components with runtime theme colors */

import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUnistyles } from 'react-native-unistyles';
import { createContext, useContext, type ReactNode } from 'react';
import { toastStyles, type ToastVariant } from './styles';

// ─────────────────────────────────────────────────────────────────────────────
// Context for variant propagation
// ─────────────────────────────────────────────────────────────────────────────

interface ToastPartContext {
  variant: ToastVariant;
  onDismiss?: () => void;
}

const PartContext = createContext<ToastPartContext>({ variant: 'default' });

export function useToastPart() {
  return useContext(PartContext);
}

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────

interface RootProps {
  children: ReactNode;
  variant?: ToastVariant;
  onDismiss?: () => void;
  style?: any;
}

export function Root({ children, variant = 'default', onDismiss, style }: RootProps) {
  const { theme } = useUnistyles();

  // Apply dynamic colors
  const rootStyle = {
    backgroundColor: theme.colors.surfaceElevated ?? theme.colors.elevated,
    borderColor: theme.colors.border,
  };

  return (
    <PartContext.Provider value={{ variant, onDismiss }}>
      <View style={[toastStyles.root, rootStyle, style]}>
        {children}
      </View>
    </PartContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon
// ─────────────────────────────────────────────────────────────────────────────

interface IconProps {
  name?: string;
}

export function Icon({ name }: IconProps) {
  const { variant } = useToastPart();
  const { theme } = useUnistyles();

  if (!name) return null;

  const iconStyle =
    variant === 'success' ? toastStyles.iconSuccess :
    variant === 'warning' ? toastStyles.iconWarning :
    variant === 'danger' ? toastStyles.iconDanger : null;

  const iconColor =
    variant === 'success' ? theme.colors.success :
    variant === 'warning' ? (theme.colors.warning ?? theme.colors.warn) :
    variant === 'danger' ? theme.colors.danger : (theme.colors.textPrimary ?? theme.colors.text);

  const baseIconStyle = {
    backgroundColor: theme.colors.border,
  };

  return (
    <View style={[toastStyles.icon, baseIconStyle, iconStyle]}>
      <Ionicons name={name as any} size={18} color={iconColor} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Content wrapper
// ─────────────────────────────────────────────────────────────────────────────

interface ContentProps {
  children: ReactNode;
}

export function Content({ children }: ContentProps) {
  return <View style={toastStyles.content}>{children}</View>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Label (title)
// ─────────────────────────────────────────────────────────────────────────────

interface LabelProps {
  children: ReactNode;
}

export function Label({ children }: LabelProps) {
  const { variant } = useToastPart();
  const { theme } = useUnistyles();

  const labelColor =
    variant === 'success' ? theme.colors.success :
    variant === 'warning' ? (theme.colors.warning ?? theme.colors.warn) :
    variant === 'danger' ? theme.colors.danger : (theme.colors.textPrimary ?? theme.colors.text);

  return <Text style={[toastStyles.label, { color: labelColor }]}>{children}</Text>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Description
// ─────────────────────────────────────────────────────────────────────────────

interface DescriptionProps {
  children: ReactNode;
}

export function Description({ children }: DescriptionProps) {
  const { theme } = useUnistyles();
  const color = theme.colors.textSecondary ?? theme.colors.dim;
  return <Text style={[toastStyles.description, { color }]}>{children}</Text>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Action button
// ─────────────────────────────────────────────────────────────────────────────

interface ActionProps {
  children: ReactNode;
  onPress: () => void;
}

export function Action({ children, onPress }: ActionProps) {
  const { theme } = useUnistyles();
  const bgColor = theme.colors.textPrimary ?? theme.colors.text;
  const textColor = theme.colors.background ?? theme.colors.bg;

  return (
    <Pressable style={[toastStyles.action, { backgroundColor: bgColor }]} onPress={onPress}>
      <Text style={[toastStyles.actionLabel, { color: textColor }]}>{children}</Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Close button
// ─────────────────────────────────────────────────────────────────────────────

export function Close() {
  const { onDismiss } = useToastPart();
  const { theme } = useUnistyles();

  if (!onDismiss) return null;

  const iconColor = theme.colors.textSecondary ?? theme.colors.dim;

  return (
    <Pressable style={toastStyles.close} onPress={onDismiss}>
      <Ionicons name="close" size={18} color={iconColor} />
    </Pressable>
  );
}

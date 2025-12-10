/**
 * Organism Protocol Definitions
 *
 * Defines the interface contracts for organism components.
 * Organisms are complex UI sections made of molecules and atoms.
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Card Protocol
// ─────────────────────────────────────────────────────────────────────────────

export type CardVariant = 'elevated' | 'outline' | 'ghost';

export interface CardProps {
  /** Card body content */
  children: ReactNode;
  /** Header section */
  header?: ReactNode;
  /** Footer section */
  footer?: ReactNode;
  /** Visual variant */
  variant?: CardVariant;
  /** Press handler */
  onPress?: () => void;
  /** Additional styles */
  style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast Protocol
// ─────────────────────────────────────────────────────────────────────────────

export type ToastVariant = 'default' | 'success' | 'danger' | 'warning' | 'accent';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastConfig {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  icon?: string;
  action?: ToastAction;
  duration: number;
  dismissible: boolean;
}

export type ToastOptions = Partial<Omit<ToastConfig, 'id' | 'title'>> & {
  title?: string;
};

export interface ToastProps {
  config: ToastConfig;
  onDismiss: () => void;
}

export interface ToastContainerProps {
  topInset?: number;
  placement?: 'top' | 'bottom';
}

export interface ToastProviderProps {
  children: ReactNode;
  duration?: number;
  placement?: 'top' | 'bottom';
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast Imperative API
// ─────────────────────────────────────────────────────────────────────────────

export interface ToastAPI {
  (title: string, options?: ToastOptions): string;
  success(title: string, options?: Omit<ToastOptions, 'variant'>): string;
  error(title: string, options?: Omit<ToastOptions, 'variant'>): string;
  warning(title: string, options?: Omit<ToastOptions, 'variant'>): string;
  info(title: string, options?: Omit<ToastOptions, 'variant'>): string;
  dismiss(id: string): void;
}

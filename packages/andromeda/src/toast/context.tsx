/** Toast Context - Provider and imperative API */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { ToastVariant } from './styles';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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

interface ToastContextValue {
  toasts: ToastConfig[];
  add: (title: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToasts must be used within ToastProvider');
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface ToastProviderProps {
  children: ReactNode;
  duration?: number;
  placement?: 'top' | 'bottom';
}

export function ToastProvider({
  children,
  duration = 4000,
  placement = 'top',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const add = useCallback(
    (title: string, options?: ToastOptions): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const config: ToastConfig = {
        id,
        title,
        variant: options?.variant ?? 'default',
        description: options?.description,
        icon: options?.icon,
        action: options?.action,
        duration: options?.duration ?? duration,
        dismissible: options?.dismissible ?? true,
      };

      setToasts((prev) => [...prev, config]);
      return id;
    },
    [duration]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, add, dismiss, dismissAll }}>
      {children}
    </ToastContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Imperative API
// ─────────────────────────────────────────────────────────────────────────────

let globalAdd: ToastContextValue['add'] | null = null;
let globalDismiss: ToastContextValue['dismiss'] | null = null;

/** Connect imperative API to provider (called internally by Container) */
export function connectToastAPI(api: ToastContextValue) {
  globalAdd = api.add;
  globalDismiss = api.dismiss;
}

/** Disconnect imperative API */
export function disconnectToastAPI() {
  globalAdd = null;
  globalDismiss = null;
}

/** Show a toast with default variant */
function show(title: string, options?: ToastOptions): string {
  if (!globalAdd) {
    console.warn('[Toast] No ToastProvider found');
    return '';
  }
  return globalAdd(title, options);
}

/** Show a success toast */
function success(title: string, options?: Omit<ToastOptions, 'variant'>): string {
  return show(title, { ...options, variant: 'success', icon: 'checkmark-circle' });
}

/** Show an error toast */
function error(title: string, options?: Omit<ToastOptions, 'variant'>): string {
  return show(title, { ...options, variant: 'danger', icon: 'close-circle' });
}

/** Show a warning toast */
function warning(title: string, options?: Omit<ToastOptions, 'variant'>): string {
  return show(title, { ...options, variant: 'warning', icon: 'alert-circle' });
}

/** Show an info toast */
function info(title: string, options?: Omit<ToastOptions, 'variant'>): string {
  return show(title, { ...options, variant: 'accent', icon: 'information-circle' });
}

/** Dismiss a toast by ID */
function dismiss(id: string): void {
  globalDismiss?.(id);
}

/** Imperative toast API */
export const toast = Object.assign(show, {
  success,
  error,
  warning,
  info,
  dismiss,
});

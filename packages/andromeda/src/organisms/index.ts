/**
 * @ariob/andromeda Organisms
 *
 * Complex UI sections made of molecules and atoms.
 * These represent complete interface patterns.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types (Protocol Definitions)
// ─────────────────────────────────────────────────────────────────────────────

export type {
  CardProps,
  CardVariant,
  ToastVariant,
  ToastAction,
  ToastConfig,
  ToastOptions,
  ToastProps,
  ToastContainerProps,
  ToastProviderProps,
  ToastAPI,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Styles (Theme-aware)
// ─────────────────────────────────────────────────────────────────────────────

export * as styles from './styles';

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

export { Card } from './Card';

// Toast (from separate directory until consolidated)
export { Toast, ToastItem } from '../toast/toast';
export { ToastContainer } from '../toast/container';
export { ToastProvider, useToasts, toast } from '../toast/context';

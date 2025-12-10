/**
 * Bar - Context-aware floating action bar
 *
 * A morphing bottom bar that transitions between action, input, and sheet modes.
 * Uses a dispatch-based state machine for explicit state transitions.
 *
 * @example
 * ```tsx
 * import { Bar, useBar, useBarMode, SheetRegistryProvider } from '@ariob/ripple';
 *
 * function App() {
 *   return (
 *     <SheetRegistryProvider
 *       sheets={{ account: AccountSheet }}
 *       titles={{ account: 'Create Account' }}
 *       selfHeadered={['account']}
 *     >
 *       <Bar />
 *     </SheetRegistryProvider>
 *   );
 * }
 * ```
 */

// Main Component
export { Bar, useBar, useBarMode, useBarVisible, type ActionType } from './Bar';

// Sheet Registry (for apps to provide custom sheets)
export { SheetRegistryProvider, useSheetRegistry, type SheetComponentProps, type SheetRegistry, type SheetTitles } from './SheetRegistry';

// Sub-components (for custom compositions)
export { ActionButton } from './ActionButtons';
export { InputMode } from './InputMode';
export { SheetContent } from './SheetContent';
export { Backdrop } from './Backdrop';

// Types
export type {
  BarProps,
  ActionButtonProps,
  InputModeProps,
  SheetContentProps,
  BackdropProps,
  Act,
  Acts,
  SheetType,
} from './types';

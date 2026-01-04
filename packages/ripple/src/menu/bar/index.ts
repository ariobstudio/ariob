/**
 * Bar - Stack-based morphing action bar
 *
 * A floating capsule that transitions between action, input, and sheet modes.
 * Uses stack-based navigation for nested interactions.
 *
 * @example
 * ```tsx
 * import { Bar, useBar } from '@ariob/ripple';
 *
 * function App() {
 *   const bar = useBar();
 *
 *   useEffect(() => {
 *     bar.setActions({
 *       primary: { icon: 'add', onPress: () => bar.openSheet(<MySheet />) }
 *     });
 *   }, []);
 *
 *   return <Bar />;
 * }
 * ```
 */

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export {
  Bar,
  useBar,
  useBarMode,
  useBarInputValue,
  useBarVisible,
  useCurrentFrame,
  useCanGoBack,
  useStackDepth,
} from './Bar';
export type {
  BarProps,
  BarMode,
  BarFrame,
  ActionSlot,
  BarButtonProps,
  BarActionsProps,
  BarInputProps,
  BarSheetProps,
} from './Bar';

// ─────────────────────────────────────────────────────────────────────────────
// Individual Slot Components (for direct import if needed)
// ─────────────────────────────────────────────────────────────────────────────

export { BarButton } from './Bar.Button';
export { BarActions } from './Bar.Actions';
export { BarInput } from './Bar.Input';
export { BarSheet } from './Bar.Sheet';

// ─────────────────────────────────────────────────────────────────────────────
// Store (for advanced usage)
// ─────────────────────────────────────────────────────────────────────────────

export { useBarStore } from './store';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (for custom compositions)
// ─────────────────────────────────────────────────────────────────────────────

export { ActionButton } from './ActionButtons';
export { InputMode } from './InputMode';
export { SheetContent } from './SheetContent';
export { Backdrop } from './Backdrop';

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Exports (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export { SheetRegistryProvider, useSheetRegistry } from './SheetRegistry';
export type { SheetComponentProps, SheetRegistry, SheetTitles, SheetHeights } from './SheetRegistry';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type {
  // New slot-based types
  NewBarProps,
  NewBarButtonProps,
  NewBarActionsProps,
  NewBarInputProps,
  NewBarSheetProps,
  // Legacy types
  ActionButtonProps,
  InputModeProps,
  SheetContentProps,
  BackdropProps,
  Act,
  Acts,
  SheetType,
  SheetHeightConstraints,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Node-Aware Bar Hook
// ─────────────────────────────────────────────────────────────────────────────

export { useNodeBar, type NodeBarConfig, type NodeBarState } from './hook';
export { NodeBarProvider, NodeBarContext, useNodeBarContext, useNodeBarContextSafe, type NodeBarProviderProps } from './context';

/** @ariob/ripple Menu System */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type { View, Full, Act, Acts, Pick } from './types';

// Provider types
export type {
  ActionsConfig,
  ActionContext,
  FeedConfig as ActionFeedConfig,
  NodeMenu as ActionNodeMenu,
} from './provider';

// ─────────────────────────────────────────────────────────────────────────────
// Provider (customizable action system)
// ─────────────────────────────────────────────────────────────────────────────

export {
  ActionsProvider,
  useActionsConfig,
  useActionsConfigSafe,
  useAction,
  useActionLookup,
  useNodeMenu,
  useFeedConfig,
  useActionHandler,
  useActions,
  useActions as useMetaActions, // Legacy alias
  createFeedConfigs,
  createNodeMenus,
} from './provider';

// ─────────────────────────────────────────────────────────────────────────────
// Make Helper (UNIX-style factory) - for backward compatibility
// ─────────────────────────────────────────────────────────────────────────────

export { make, type Def } from './make';

// ─────────────────────────────────────────────────────────────────────────────
// Menu State (context menu state management)
// ─────────────────────────────────────────────────────────────────────────────

export { useMenu, useMenuOpen, useMenuNode, type NodeRef } from './state';

// ─────────────────────────────────────────────────────────────────────────────
// UI Components - Bar (context-aware floating action bar)
// ─────────────────────────────────────────────────────────────────────────────

export {
  Bar,
  useBar,
  useBarMode,
  useBarVisible,
  ActionButton,
  InputMode,
  SheetContent,
  Backdrop,
  // Sheet Registry for custom sheets
  SheetRegistryProvider,
  useSheetRegistry,
} from './bar';
export type {
  BarProps,
  BarMode,
  BarButtonProps,
  BarActionsProps,
  BarInputProps,
  BarSheetProps,
  ActionButtonProps,
  InputModeProps,
  SheetContentProps,
  BackdropProps,
  SheetComponentProps,
  SheetRegistry,
  SheetTitles,
} from './bar';

// ─────────────────────────────────────────────────────────────────────────────
// UI Components - Context Menu (long-press floating menu)
// ─────────────────────────────────────────────────────────────────────────────

export { Context } from './context';

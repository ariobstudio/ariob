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
// Provider (NEW - customizable action system)
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
} from './provider';

// ─────────────────────────────────────────────────────────────────────────────
// Make Helper (UNIX-style factory)
// ─────────────────────────────────────────────────────────────────────────────

export { make, type Def } from './make';

// ─────────────────────────────────────────────────────────────────────────────
// Factory Utilities (for creating configs)
// ─────────────────────────────────────────────────────────────────────────────

export {
  createAction,
  createActions,
  createPicker,
  createNodeMenu,
  createNodeMenus,
  createFeedConfig,
  createFeedConfigs,
  type ActionDef,
} from './create';

// ─────────────────────────────────────────────────────────────────────────────
// Actions (legacy - kept for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export { acts, get, type ActName } from './acts';

// ─────────────────────────────────────────────────────────────────────────────
// Node Menus (legacy - kept for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export {
  nodeMenus,
  getNodeMenu,
  getQuickActions,
  getDetailAction,
  getOptsActions,
  type NodeMenu as NodeMenuLegacy,
} from './nodes';

// ─────────────────────────────────────────────────────────────────────────────
// Pickers (uses context when available, falls back to defaults)
// ─────────────────────────────────────────────────────────────────────────────

export { resolve, useActs, getFeedConfig, type FeedConfig as FeedConfigLegacy } from './pick';

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
  type ActionType,
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

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Aliases (deprecated, use new names)
// ─────────────────────────────────────────────────────────────────────────────

export { useActs as useMetaActions } from './pick';
export type { Acts as MetaActions, Act as MetaAction } from './types';
export type { ActName as ActionType_ } from './acts';

/**
 * Action Factory Utilities
 *
 * Helper functions for creating action definitions, pickers,
 * node menus, and feed configs in a type-safe way.
 *
 * @example
 * ```ts
 * import { createActions, createNodeMenu, createFeedConfig } from '@ariob/ripple';
 *
 * const actions = createActions({
 *   post: { icon: 'add', label: 'Post' },
 *   reply: { icon: 'arrow-undo', label: 'Reply' },
 * });
 *
 * const nodeMenu = createNodeMenu({
 *   quick: ['reply', 'save'],
 *   detail: ['reply'],
 *   opts: ['save', 'share'],
 * });
 * ```
 */

import type { Act, Acts, View, Pick } from './types';
import type { FeedConfig, NodeMenu } from './provider';

// ─────────────────────────────────────────────────────────────────────────────
// Action Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a single action definition
 */
export function createAction(
  name: string,
  config: { icon: string; label: string; sub?: Act[] }
): Act {
  return { name, ...config };
}

/**
 * Action definition without the name (for createActions)
 */
export interface ActionDef {
  icon: string;
  label: string;
  sub?: Act[];
}

/**
 * Create a set of actions from an object definition.
 *
 * @example
 * ```ts
 * const actions = createActions({
 *   post: { icon: 'add', label: 'Post' },
 *   reply: { icon: 'arrow-undo', label: 'Reply' },
 *   config: {
 *     icon: 'settings',
 *     label: 'Settings',
 *     sub: [
 *       { name: 'profile', icon: 'person', label: 'Profile' },
 *       { name: 'theme', icon: 'color-palette', label: 'Theme' },
 *     ],
 *   },
 * });
 * ```
 */
export function createActions(
  defs: Record<string, ActionDef>
): Record<string, Act> {
  return Object.fromEntries(
    Object.entries(defs).map(([name, config]) => [
      name,
      createAction(name, config),
    ])
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Picker Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a custom picker for advanced action resolution.
 *
 * Pickers determine which actions to show based on the current view state.
 * They are evaluated in order, with the first matching picker used.
 *
 * @example
 * ```ts
 * const detailPicker = createPicker(
 *   'detail',
 *   (view) => !!view.full,
 *   (view, get) => ({
 *     left: get('back'),
 *     main: get('reply'),
 *     right: get('opts'),
 *   })
 * );
 * ```
 */
export function createPicker(
  name: string,
  match: (view: View) => boolean,
  acts: (view: View, get: (name: string) => Act) => Acts
): Pick {
  return { name, match, acts };
}

// ─────────────────────────────────────────────────────────────────────────────
// Node Menu Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a node menu configuration.
 *
 * @example
 * ```ts
 * const postMenu = createNodeMenu({
 *   quick: ['reply', 'save', 'share'],
 *   detail: ['reply'],
 *   opts: ['save', 'share', 'report'],
 * });
 * ```
 */
export function createNodeMenu(config: NodeMenu): NodeMenu {
  return {
    quick: config.quick ?? [],
    detail: config.detail ?? [],
    opts: config.opts ?? [],
  };
}

/**
 * Create a set of node menus from an object definition.
 *
 * @example
 * ```ts
 * const nodeMenus = createNodeMenus({
 *   post: { quick: ['reply', 'save'], detail: ['reply'], opts: ['report'] },
 *   message: { quick: ['forward'], detail: ['reply'], opts: ['delete'] },
 *   default: { quick: [], detail: [], opts: [] },
 * });
 * ```
 */
export function createNodeMenus(
  defs: Record<string, NodeMenu>
): Record<string, NodeMenu> {
  return Object.fromEntries(
    Object.entries(defs).map(([type, config]) => [type, createNodeMenu(config)])
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feed Config Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a feed configuration for a degree.
 *
 * @example
 * ```ts
 * const degree0Config = createFeedConfig({
 *   main: 'post',
 *   mainUnauthenticated: 'create',
 *   left: 'config',
 *   right: 'more',
 * });
 * ```
 */
export function createFeedConfig(config: FeedConfig): FeedConfig {
  return {
    main: config.main,
    mainUnauthenticated: config.mainUnauthenticated,
    left: config.left,
    right: config.right,
  };
}

/**
 * Create a set of feed configs from an object definition.
 *
 * @example
 * ```ts
 * const feedConfig = createFeedConfigs({
 *   0: { main: 'post', mainUnauthenticated: 'create', left: 'config', right: 'more' },
 *   1: { main: 'post', right: 'find' },
 *   2: { main: 'post', left: 'trend', right: 'search' },
 * });
 * ```
 */
export function createFeedConfigs(
  defs: Record<number, FeedConfig>
): Record<number, FeedConfig> {
  return Object.fromEntries(
    Object.entries(defs).map(([degree, config]) => [
      Number(degree),
      createFeedConfig(config),
    ])
  );
}

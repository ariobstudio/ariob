/**
 * Actions Provider - Configurable action system
 *
 * Allows applications to define their own actions, feed configs,
 * and node menus instead of using hardcoded defaults.
 *
 * @example
 * ```tsx
 * import { ActionsProvider, createActions } from '@ariob/ripple';
 *
 * const actions = createActions({
 *   post: { icon: 'add', label: 'Post' },
 *   reply: { icon: 'arrow-undo', label: 'Reply' },
 * });
 *
 * function App() {
 *   return (
 *     <ActionsProvider
 *       config={{
 *         actions,
 *         feedConfig: { 0: { main: 'post' } },
 *         nodeMenus: { default: { quick: ['reply'], detail: ['reply'], opts: [] } },
 *         onAction: (action, ctx) => console.log(action),
 *       }}
 *     >
 *       <Bar />
 *     </ActionsProvider>
 *   );
 * }
 * ```
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Act, View, Pick } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Feed configuration for a degree level
 */
export interface FeedConfig {
  /** Main center action (authenticated) */
  main: string;
  /** Main center action (unauthenticated) - defaults to main */
  mainUnauthenticated?: string;
  /** Left action */
  left?: string | null;
  /** Right action */
  right?: string | null;
}

/**
 * Node menu configuration
 */
export interface NodeMenu {
  /** Quick actions shown on long-press */
  quick: string[];
  /** Detail actions shown when viewing node */
  detail: string[];
  /** Options menu actions */
  opts: string[];
}

/**
 * Context passed to action handlers
 */
export interface ActionContext {
  /** Current view state */
  view: View;
  /** Node data (if action was triggered from a node) */
  node?: {
    id: string;
    type: string;
    author?: string;
    [key: string]: unknown;
  };
}

/**
 * Full actions configuration
 */
export interface ActionsConfig {
  /** Action definitions: name → { icon, label, sub? } */
  actions: Record<string, Act>;

  /** Feed config per degree: degree → FeedConfig */
  feedConfig: Record<number, FeedConfig>;

  /** Node menus per type: type → NodeMenu */
  nodeMenus: Record<string, NodeMenu>;

  /** Custom pickers (optional, for advanced use) */
  pickers?: Pick[];

  /** Action handler (application-level routing) */
  onAction: (action: string, context: ActionContext) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ActionsContext = createContext<ActionsConfig | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface ActionsProviderProps {
  children: ReactNode;
  config: ActionsConfig;
}

/**
 * Provides action configuration to the application.
 *
 * Wrap your app with this provider to configure:
 * - Which actions exist (icons, labels)
 * - Which actions appear for each degree
 * - Which actions appear for each node type
 * - How actions are handled (routing, side effects)
 */
export function ActionsProvider({ children, config }: ActionsProviderProps) {
  // Memoize the config to prevent unnecessary re-renders
  const value = useMemo(() => config, [config]);

  return (
    <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Access the full actions configuration.
 * @throws Error if used outside ActionsProvider
 */
export function useActionsConfig(): ActionsConfig {
  const ctx = useContext(ActionsContext);
  if (!ctx) {
    throw new Error(
      'useActionsConfig must be used within an ActionsProvider. ' +
        'Wrap your app with <ActionsProvider config={{...}}>.'
    );
  }
  return ctx;
}

/**
 * Access the actions configuration safely (returns null if no provider).
 * Useful for components that can work with or without the provider.
 */
export function useActionsConfigSafe(): ActionsConfig | null {
  return useContext(ActionsContext);
}

/**
 * Get a single action by name.
 * Returns undefined if action doesn't exist.
 */
export function useAction(name: string): Act | undefined {
  const ctx = useActionsConfigSafe();
  return ctx?.actions[name];
}

/**
 * Get the action lookup function.
 * Useful for resolving action names to definitions.
 */
export function useActionLookup(): (name: string) => Act {
  const ctx = useActionsConfigSafe();

  return useMemo(() => {
    if (!ctx) {
      // Fallback: return a placeholder action
      return (name: string): Act => ({
        name,
        icon: 'help',
        label: name,
      });
    }

    return (name: string): Act => {
      const action = ctx.actions[name];
      if (action) return action;

      // Warn in development
      if (__DEV__) {
        console.warn(`[actions] Unknown action: ${name}`);
      }

      return { name, icon: 'help', label: name };
    };
  }, [ctx]);
}

/**
 * Get the node menu for a specific node type.
 */
export function useNodeMenu(type: string): NodeMenu {
  const ctx = useActionsConfigSafe();

  return useMemo(() => {
    if (!ctx) {
      return { quick: [], detail: [], opts: [] };
    }

    return ctx.nodeMenus[type] || ctx.nodeMenus.default || { quick: [], detail: [], opts: [] };
  }, [ctx, type]);
}

/**
 * Get the feed config for a specific degree.
 */
export function useFeedConfig(degree: number): FeedConfig {
  const ctx = useActionsConfigSafe();

  return useMemo(() => {
    if (!ctx) {
      return { main: 'post' };
    }

    return ctx.feedConfig[degree] || ctx.feedConfig[0] || { main: 'post' };
  }, [ctx, degree]);
}

/**
 * Get the action handler function.
 */
export function useActionHandler(): (action: string, context: ActionContext) => void {
  const ctx = useActionsConfigSafe();

  return useMemo(() => {
    if (!ctx) {
      return (action: string) => {
        if (__DEV__) {
          console.warn(`[actions] No handler for action: ${action}`);
        }
      };
    }

    return ctx.onAction;
  }, [ctx]);
}

/**
 * Convenience hook that returns both action lookup and handler.
 */
export function useActions() {
  const ctx = useActionsConfigSafe();
  const getAction = useActionLookup();
  const handleAction = useActionHandler();

  return useMemo(
    () => ({
      actions: ctx?.actions ?? {},
      feedConfig: ctx?.feedConfig ?? {},
      nodeMenus: ctx?.nodeMenus ?? {},
      getAction,
      handleAction,
      hasConfig: ctx !== null,
    }),
    [ctx, getAction, handleAction]
  );
}

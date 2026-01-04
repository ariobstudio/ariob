/**
 * useNodeBar Hook
 *
 * Node-aware hook that provides schema-driven actions.
 * This replaces the pattern of manually building action arrays.
 *
 * Usage:
 * ```tsx
 * function ProfileCard({ node, userId }) {
 *   const bar = useNodeBar({
 *     node,
 *     userId,
 *     degree: '1',
 *     variant: 'card',
 *     onNavigate: (route) => router.navigate(route),
 *   });
 *
 *   return (
 *     <View>
 *       {bar.primary.map(action => (
 *         <Button
 *           key={action.meta.verb}
 *           variant={action.meta.variant}
 *           onPress={() => bar.execute(action.meta.verb)}
 *           loading={bar.loading[action.meta.verb]}
 *         >
 *           {action.meta.label}
 *         </Button>
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import { registry, type RegisteredAction, type RegistryContext, type ActionResult } from '../../nodes/_shared';
import type { Degree, Variant, Node } from '../../schemas';

/** Get actions from node, with fallback for types that don't define actions */
function getNodeActions(node: Node): string[] {
  // Use type narrowing to access actions safely
  if ('actions' in node && Array.isArray(node.actions)) {
    return node.actions;
  }
  return [];
}

/**
 * Configuration for useNodeBar
 */
export interface NodeBarConfig {
  /** The node to build actions for */
  node: Node;

  /** Current user ID (public key) */
  userId?: string;

  /** Current degree scope */
  degree: Degree;

  /** Current rendering variant */
  variant: Variant;

  /** Navigation callback */
  onNavigate?: (route: string, params?: Record<string, unknown>) => void;

  /** Action completion callback */
  onAction?: (verb: string, result: ActionResult) => void;
}

/**
 * State returned by useNodeBar
 */
export interface NodeBarState {
  /** All available actions (filtered by context) */
  actions: RegisteredAction[];

  /** Primary actions (solid/prominent buttons) */
  primary: RegisteredAction[];

  /** Secondary actions (ghost/subtle buttons) */
  secondary: RegisteredAction[];

  /** Execute an action by verb */
  execute: (verb: string, payload?: Record<string, unknown>) => Promise<void>;

  /** Check if an action is available */
  available: (verb: string) => boolean;

  /** Loading state per action */
  loading: Record<string, boolean>;

  /** The built RegistryContext */
  context: RegistryContext;
}

/**
 * useNodeBar - Node-aware action hook
 *
 * Builds RegistryContext from node and config, queries registry
 * for available actions, and provides execute callback.
 */
export function useNodeBar(config: NodeBarConfig): NodeBarState {
  const { node, userId, degree, variant, onNavigate, onAction } = config;

  // Build RegistryContext
  const context: RegistryContext = useMemo(
    () => ({
      nodeId: node['#'] || '',
      nodeType: node.type,
      userId,
      isOwner: userId !== undefined && node.type === 'profile' && 'pub' in node && node.pub === userId,
      degree,
      variant,
    }),
    [node, userId, degree, variant]
  );

  // Get available actions from registry
  const actions = useMemo(() => {
    const nodeActions = getNodeActions(node);
    return registry.forNode(nodeActions, context);
  }, [node, context]);

  // Split into primary/secondary
  const { primary, secondary } = useMemo(() => {
    const p: RegisteredAction[] = [];
    const s: RegisteredAction[] = [];

    for (const action of actions) {
      if (action.meta.category === 'primary' || action.meta.category === 'navigation') {
        p.push(action);
      } else {
        s.push(action);
      }
    }

    return { primary: p, secondary: s };
  }, [actions]);

  // Loading state per verb
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Check availability
  const available = useCallback(
    (verb: string) => registry.available(verb, context),
    [context]
  );

  // Execute action
  const execute = useCallback(
    async (verb: string, payload?: Record<string, unknown>) => {
      setLoading((prev) => ({ ...prev, [verb]: true }));

      try {
        const ctxWithPayload: RegistryContext = payload ? { ...context, payload } : context;
        const result = await registry.execute(verb, ctxWithPayload);

        if (result.ok) {
          const actionResult = result.value;

          // Handle navigation
          if (actionResult.status === 'success' && actionResult.navigate && onNavigate) {
            onNavigate(actionResult.navigate, actionResult.params);
          }

          // Callback
          onAction?.(verb, actionResult);
        } else {
          // Error from registry
          onAction?.(verb, { status: 'error', error: result.error });
        }
      } finally {
        setLoading((prev) => ({ ...prev, [verb]: false }));
      }
    },
    [context, onNavigate, onAction]
  );

  return {
    actions,
    primary,
    secondary,
    execute,
    available,
    loading,
    context,
  };
}

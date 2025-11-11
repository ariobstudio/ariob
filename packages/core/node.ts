/**
 * Node Store
 *
 * Custom store for managing Gun node subscriptions (LynxJS-compatible).
 * Follows Gun's simple get/put/on API with Result-based error handling.
 */

import { useEffect, useCallback } from 'react';
import { createStore, useStoreSelector } from './utils/createStore';
import type { IGunChainReference } from './graph';
import { Result } from './result';
import type { z } from 'zod';

/**
 * Node data state
 */
interface NodeData<T = any> {
  /** Current node data */
  data: T | null;
  /** Whether data is loading */
  loading: boolean;
  /** Error if any */
  error: Error | null;
}

/**
 * Node configuration
 */
export interface NodeConfig {
  /** Enable localStorage persistence */
  persist?: boolean;
  /** Gun graph instance to use (defaults to singleton) */
  graph?: IGunChainReference;
}

/**
 * Node store state
 */
interface NodeStore {
  /** Map of node key to node data */
  nodes: Record<string, NodeData>;
  /** Active subscriptions cleanup functions */
  subs: Map<string, () => void>;
}

/**
 * Create a node store
 */
function createNodeStore() {
  const store = createStore<NodeStore>({
    nodes: {},
    subs: new Map(),
  });

  return {
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,

    /**
     * Subscribe to a Gun node
     */
    on: <T>(key: string, ref: IGunChainReference, schema?: z.ZodSchema<T>) => {
      const state = store.getState();

      // Cleanup existing subscription
      const existing = state.subs.get(key);
      if (existing) existing();

      // Set loading state
      store.setState({
        nodes: {
          ...state.nodes,
          [key]: { data: null, loading: true, error: null },
        },
      });

      console.log('[Node] Subscribing:', key);

      // Subscribe to Gun node
      ref.on((raw: any) => {
        console.log('[Node] Data received:', key, raw);

        try {
          // Handle null/undefined
          if (raw === null || raw === undefined) {
            const currentState = store.getState();
            store.setState({
              nodes: {
                ...currentState.nodes,
                [key]: { data: null, loading: false, error: null },
              },
            });
            return;
          }

          // Clean Gun metadata
          const clean: any = {};
          for (const prop in raw) {
            if (!prop.startsWith('_')) {
              clean[prop] = raw[prop];
            }
          }

          // Validate with schema if provided
          let data = clean;
          if (schema) {
            const result = Result.parse(schema, clean);
            if (!result.ok) {
              throw new Error(`Schema validation failed: ${result.error.message}`);
            }
            data = result.value;
          }

          // Update store
          const currentState = store.getState();
          store.setState({
            nodes: {
              ...currentState.nodes,
              [key]: { data, loading: false, error: null },
            },
          });
        } catch (err) {
          console.error('[Node] Error processing data:', key, err);
          const currentState = store.getState();
          store.setState({
            nodes: {
              ...currentState.nodes,
              [key]: {
                data: null,
                loading: false,
                error: err instanceof Error ? err : new Error(String(err)),
              },
            },
          });
        }
      });

      // Store cleanup
      const cleanup = () => {
        console.log('[Node] Cleanup:', key);
        const currentState = store.getState();
        const { [key]: _, ...rest } = currentState.nodes;
        store.setState({ nodes: rest });
      };

      const currentState = store.getState();
      currentState.subs.set(key, cleanup);
    },

    /**
     * Unsubscribe from a Gun node
     */
    off: (key: string) => {
      console.log('[Node] Unsubscribing:', key);

      const state = store.getState();
      const cleanup = state.subs.get(key);
      if (cleanup) {
        cleanup();
        state.subs.delete(key);
      }
    },

    /**
     * Get data for a specific node
     */
    get: (key: string) => {
      return store.getState().nodes[key]?.data ?? null;
    },

    /**
     * Put data to a Gun node
     */
    put: async <T>(key: string, ref: IGunChainReference, data: T, schema?: z.ZodSchema<T>) => {
      try {
        // Validate with schema if provided
        if (schema) {
          const result = Result.parse(schema, data);
          if (!result.ok) {
            return Result.error(new Error(`Schema validation failed: ${result.error.message}`));
          }
        }

        // Save to Gun
        await new Promise<void>((resolve, reject) => {
          ref.put(data as any, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
        });

        console.log('[Node] Data saved:', key);
        return Result.ok(undefined);
      } catch (err) {
        console.error('[Node] Error saving data:', key, err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Get loading state
     */
    loading: (key: string) => {
      return store.getState().nodes[key]?.loading ?? false;
    },

    /**
     * Get error state
     */
    error: (key: string) => {
      return store.getState().nodes[key]?.error ?? null;
    },
  };
}

/**
 * Default node store (no persistence)
 */
const useNodeStore = createNodeStore();

/**
 * Node API - Simple interface for Gun nodes
 *
 * @example
 * ```typescript
 * import { node, graph } from '@ariob/core';
 * import { z } from 'zod';
 *
 * const TodoSchema = z.object({
 *   title: z.string(),
 *   done: z.boolean()
 * });
 *
 * // Subscribe to node
 * const g = graph();
 * const ref = g.get('todos').get('todo-1');
 * node('todo-1').on(ref, TodoSchema);
 *
 * // In component
 * const todo = node('todo-1').get();
 * const loading = node('todo-1').loading();
 *
 * // Put data
 * await node('todo-1').put(ref, { title: 'Buy milk', done: false }, TodoSchema);
 *
 * // Unsubscribe
 * node('todo-1').off();
 * ```
 */
export function node<T = any>(key: string, config?: NodeConfig) {
  const store = useNodeStore;

  return {
    /**
     * Subscribe to this node's data
     */
    on: (ref: IGunChainReference, schema?: z.ZodSchema<T>) => {
      store.on(key, ref, schema);
    },

    /**
     * Unsubscribe from this node
     */
    off: () => {
      store.off(key);
    },

    /**
     * Get current data
     */
    get: (): T | null => {
      return store.get(key);
    },

    /**
     * Put data to Gun node
     */
    put: async (ref: IGunChainReference, data: T, schema?: z.ZodSchema<T>): Promise<Result<void, Error>> => {
      return store.put(key, ref, data, schema);
    },

    /**
     * Get loading state
     */
    loading: (): boolean => {
      return store.loading(key);
    },

    /**
     * Get error state
     */
    error: (): Error | null => {
      return store.error(key);
    },
  };
}

/**
 * Hook for using node in React components
 */
export function useNode<T = any>(key: string, config?: NodeConfig) {
  const store = useNodeStore;

  const data = useStoreSelector(
    { getState: store.getState, setState: store.setState, subscribe: store.subscribe },
    (s) => s.nodes[key]?.data ?? null
  );
  const loading = useStoreSelector(
    { getState: store.getState, setState: store.setState, subscribe: store.subscribe },
    (s) => s.nodes[key]?.loading ?? false
  );
  const error = useStoreSelector(
    { getState: store.getState, setState: store.setState, subscribe: store.subscribe },
    (s) => s.nodes[key]?.error ?? null
  );

  return {
    data: data as T | null,
    loading,
    error,
    on: (ref: IGunChainReference, schema?: z.ZodSchema<T>) => {
      store.on(key, ref, schema);
    },
    off: () => {
      store.off(key);
    },
    put: async (ref: IGunChainReference, data: T, schema?: z.ZodSchema<T>) => {
      return store.put(key, ref, data, schema);
    },
  };
}

/**
 * Create a reactive node hook factory
 *
 * @param key - Gun node key
 * @param schema - Optional Zod schema for validation
 * @returns React hook that auto-subscribes to the node
 *
 * @example
 * ```typescript
 * const useMessages = createNode('messages', MessageSchema);
 *
 * function Component() {
 *   const { data, loading, error, put } = useMessages();
 *
 *   return <Text>{data?.text}</Text>;
 * }
 * ```
 */
export function createNode<T = any>(key: string, schema?: z.ZodSchema<T>) {
  return function useCreatedNode() {
    const store = useNodeStore;

    // Auto-subscribe on mount
    useEffect(() => {
      // Import graph at runtime to avoid circular deps
      const { graph } = require('./graph');
      const g = graph();
      const ref = g.get(key);

      store.on(key, ref, schema);
      return () => store.off(key);
    }, []);

    // Reactive selectors
    const data = useStoreSelector(
      { getState: store.getState, setState: store.setState, subscribe: store.subscribe },
      (s: any) => s.nodes[key]?.data ?? null
    );
    const loading = useStoreSelector(
      { getState: store.getState, setState: store.setState, subscribe: store.subscribe },
      (s: any) => s.nodes[key]?.loading ?? false
    );
    const error = useStoreSelector(
      { getState: store.getState, setState: store.setState, subscribe: store.subscribe },
      (s: any) => s.nodes[key]?.error ?? null
    );

    const put = useCallback(async (data: T) => {
      const { graph } = require('./graph');
      const g = graph();
      const ref = g.get(key);

      return store.put(key, ref, data, schema);
    }, []);

    return { data: data as T | null, loading, error, put };
  };
}

// Export store for advanced use
export { useNodeStore, createNodeStore };

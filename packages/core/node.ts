/**
 * Node - Production-ready reactive Gun node management
 *
 * Inspired by React Query and Convex for exceptional DX:
 * - Hook-first API with automatic subscriptions
 * - Type-safe with Zod schema validation
 * - Built-in loading, error, and sync states
 * - Optimistic updates support
 * - No manual Gun reference management
 *
 * @example Basic usage
 * ```tsx
 * import { useNode, z } from '@ariob/core';
 *
 * const TodoSchema = z.object({
 *   title: z.string(),
 *   done: z.boolean()
 * });
 *
 * function TodoItem() {
 *   const todo = useNode({
 *     path: 'todos/todo-1',
 *     schema: TodoSchema,
 *   });
 *
 *   if (todo.isLoading) return <Text>Loading...</Text>;
 *   if (todo.isError) return <Text>Error: {todo.error?.message}</Text>;
 *
 *   return (
 *     <View>
 *       <Text>{todo.data?.title}</Text>
 *       <Button onPress={() => todo.mutate({ ...todo.data, done: true })}>
 *         Complete
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */

import { useEffect, useCallback, useRef } from 'react';
import { define } from './utils/store';
import { graph as getGraph } from './graph';
import type { IGunChainReference } from './graph';
import { Result } from './result';
import type { z } from 'zod';

// ============================================================================
// Types
// ============================================================================

/**
 * Node data state
 */
interface NodeData<T = any> {
  /** Current node data */
  data: T | null;
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Whether there's an error */
  isError: boolean;
  /** Error if any */
  error: Error | null;
  /** Whether data is synced with peers */
  isSynced: boolean;
}

/**
 * Configuration for useNode hook
 *
 * @template T - The type of data stored in this node
 */
export interface NodeConfig<T = any> {
  /**
   * Gun node path (e.g., 'todos/todo-1' or 'users/alice/profile')
   */
  path: string;

  /**
   * Optional Zod schema for runtime validation
   * Highly recommended for type safety and data integrity
   */
  schema?: z.ZodSchema<T>;

  /**
   * Enable/disable the subscription
   * @default true
   */
  enabled?: boolean;

  /**
   * Refetch data when component mounts
   * @default false
   */
  refetchOnMount?: boolean;

  /**
   * Custom Gun graph instance
   * @default uses singleton graph instance
   */
  graph?: IGunChainReference;
}

/**
 * Node store state
 */
interface NodeStore {
  /** Map of node path to node data */
  nodes: Record<string, NodeData>;
  /** Active subscriptions cleanup functions */
  subs: Map<string, () => void>;
}

// ============================================================================
// Store
// ============================================================================

/**
 * Create a node store
 */
function createNodeStore() {
  const store = define<NodeStore>({
    nodes: {},
    subs: new Map(),
  });

  return {
    // Expose the Zustand store hook
    useStore: store,
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,

    /**
     * Subscribe to a Gun node
     *
     * @internal
     */
    on: <T>(path: string, ref: IGunChainReference, schema?: z.ZodSchema<T>) => {
      const state = store.getState();

      // Cleanup existing subscription
      const existing = state.subs.get(path);
      if (existing) existing();

      // Set loading state
      store.setState({
        nodes: {
          ...state.nodes,
          [path]: {
            data: null,
            isLoading: true,
            isError: false,
            error: null,
            isSynced: false,
          },
        },
      });

      console.log('[Node] 🔔 Subscribing:', path);

      // Subscribe to Gun node
      ref.on((raw: any) => {
        console.log('[Node] 📦 Data received:', path, raw);

        try {
          // Handle null/undefined
          if (raw === null || raw === undefined) {
            const currentState = store.getState();
            store.setState({
              nodes: {
                ...currentState.nodes,
                [path]: {
                  data: null,
                  isLoading: false,
                  isError: false,
                  error: null,
                  isSynced: true,
                },
              },
            });
            return;
          }

          // Clean Gun metadata (remove _ prefixed properties)
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
              [path]: {
                data,
                isLoading: false,
                isError: false,
                error: null,
                isSynced: true,
              },
            },
          });
        } catch (err) {
          console.error('[Node] ❌ Error processing data:', path, err);
          const currentState = store.getState();
          store.setState({
            nodes: {
              ...currentState.nodes,
              [path]: {
                data: null,
                isLoading: false,
                isError: true,
                error: err instanceof Error ? err : new Error(String(err)),
                isSynced: false,
              },
            },
          });
        }
      });

      // Store cleanup
      const cleanup = () => {
        console.log('[Node] 🧹 Cleanup:', path);
        const currentState = store.getState();
        const { [path]: _, ...rest } = currentState.nodes;
        store.setState({ nodes: rest });
      };

      const currentState = store.getState();
      currentState.subs.set(path, cleanup);
    },

    /**
     * Unsubscribe from a Gun node
     *
     * @internal
     */
    off: (path: string) => {
      console.log('[Node] 🔕 Unsubscribing:', path);

      const state = store.getState();
      const cleanup = state.subs.get(path);
      if (cleanup) {
        cleanup();
        state.subs.delete(path);
      }
    },

    /**
     * Get data for a specific node
     *
     * @internal
     */
    getData: (path: string) => {
      return store.getState().nodes[path]?.data ?? null;
    },

    /**
     * Put data to a Gun node
     *
     * @internal
     */
    put: async <T>(path: string, ref: IGunChainReference, data: T, schema?: z.ZodSchema<T>) => {
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

        console.log('[Node] ✅ Data saved:', path);
        return Result.ok(undefined);
      } catch (err) {
        console.error('[Node] ❌ Error saving data:', path, err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Update node with partial data
     *
     * @internal
     */
    update: async <T>(path: string, ref: IGunChainReference, updates: Partial<T>) => {
      try {
        // Get current data
        const current = store.getState().nodes[path]?.data;
        if (!current) {
          return Result.error(new Error('Cannot update: no existing data'));
        }

        // Merge updates
        const merged = { ...current, ...updates };

        // Save merged data
        await new Promise<void>((resolve, reject) => {
          ref.put(merged as any, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
        });

        console.log('[Node] ✅ Data updated:', path);
        return Result.ok(undefined);
      } catch (err) {
        console.error('[Node] ❌ Error updating data:', path, err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Get node state
     *
     * @internal
     */
    getNodeState: (path: string): NodeData => {
      return (
        store.getState().nodes[path] ?? {
          data: null,
          isLoading: false,
          isError: false,
          error: null,
          isSynced: false,
        }
      );
    },
  };
}

/**
 * Global node store singleton
 */
const nodeStore = createNodeStore();

// ============================================================================
// Hook API (Primary)
// ============================================================================

/**
 * Hook for reactive Gun node management
 *
 * Automatically subscribes to the node and provides reactive data, loading, and error states.
 * Inspired by React Query and Convex for excellent developer experience.
 *
 * @template T - The type of data stored in this node
 * @param config - Node configuration
 * @returns Node state and mutation methods
 *
 * @example Basic usage
 * ```tsx
 * const todo = useNode({
 *   path: 'todos/todo-1',
 *   schema: TodoSchema,
 * });
 *
 * if (todo.isLoading) return <Text>Loading...</Text>;
 * return <Text>{todo.data?.title}</Text>;
 * ```
 *
 * @example With mutations
 * ```tsx
 * const profile = useNode({
 *   path: 'users/alice/profile',
 *   schema: ProfileSchema,
 * });
 *
 * // Full replace
 * await profile.mutate({ name: 'Alice', bio: 'Developer' });
 *
 * // Partial update
 * await profile.update({ bio: 'Senior Developer' });
 * ```
 *
 * @example Conditional subscription
 * ```tsx
 * const message = useNode({
 *   path: `messages/${messageId}`,
 *   schema: MessageSchema,
 *   enabled: !!messageId, // Only subscribe when messageId exists
 * });
 * ```
 */
export function useNode<T = any>(config: NodeConfig<T>) {
  const { path, schema, enabled = true, refetchOnMount = false, graph } = config;

  // Track if this is the initial mount
  const isInitialMount = useRef(true);

  // Subscribe/unsubscribe on mount/unmount
  useEffect(() => {
    if (!enabled) return;

    const g = graph || getGraph();
    const ref = g.get(path);

    // Subscribe
    nodeStore.on(path, ref, schema);

    // Cleanup on unmount
    return () => nodeStore.off(path);
  }, [path, enabled]);

  // Refetch on mount if requested
  useEffect(() => {
    if (refetchOnMount && !isInitialMount.current && enabled) {
      const g = graph || getGraph();
      const ref = g.get(path);
      nodeStore.on(path, ref, schema);
    }
    isInitialMount.current = false;
  }, [path, refetchOnMount, enabled]);

  // Reactive selectors
  const nodeState = nodeStore.useStore((s) => s.nodes[path]);

  const data = nodeState?.data ?? null;
  const isLoading = nodeState?.isLoading ?? false;
  const isError = nodeState?.isError ?? false;
  const error = nodeState?.error ?? null;
  const isSynced = nodeState?.isSynced ?? false;

  /**
   * Replace node data entirely
   */
  const mutate = useCallback(
    async (newData: T) => {
      const g = graph || getGraph();
      const ref = g.get(path);
      return nodeStore.put(path, ref, newData, schema);
    },
    [path, schema, graph]
  );

  /**
   * Partially update node data
   */
  const update = useCallback(
    async (updates: Partial<T>) => {
      const g = graph || getGraph();
      const ref = g.get(path);
      return nodeStore.update(path, ref, updates);
    },
    [path, graph]
  );

  /**
   * Refresh data from Gun
   */
  const refetch = useCallback(() => {
    const g = graph || getGraph();
    const ref = g.get(path);
    nodeStore.on(path, ref, schema);
  }, [path, schema, graph]);

  return {
    /** Current node data (null if not loaded) */
    data: data as T | null,

    /** Whether initial data is loading */
    isLoading,

    /** Whether there's an error */
    isError,

    /** Error object if isError is true */
    error,

    /** Whether data is synced with Gun peers */
    isSynced,

    /** Replace node data entirely */
    mutate,

    /** Partially update node data */
    update,

    /** Refresh data from Gun */
    refetch,
  };
}

// ============================================================================
// Factory API
// ============================================================================

/**
 * Create a typed node hook factory
 *
 * Useful for creating reusable node hooks with pre-configured schemas.
 *
 * @template T - The type of data stored in this node
 * @param path - Gun node path
 * @param schema - Zod schema for validation
 * @returns A React hook factory that auto-subscribes
 *
 * @example
 * ```tsx
 * // Create factory
 * const TodoSchema = z.object({
 *   title: z.string(),
 *   done: z.boolean(),
 * });
 *
 * const useTodo = createNode('todos/todo-1', TodoSchema);
 *
 * // Use in component
 * function TodoItem() {
 *   const todo = useTodo();
 *
 *   return (
 *     <View>
 *       <Text>{todo.data?.title}</Text>
 *       <Button onPress={() => todo.update({ done: true })}>
 *         Complete
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */
export function createNode<T = any>(path: string, schema?: z.ZodSchema<T>) {
  return function useCreatedNode(options?: Omit<NodeConfig<T>, 'path' | 'schema'>) {
    return useNode<T>({
      path,
      ...(schema ? { schema } : {}),
      ...options,
    });
  };
}

// ============================================================================
// Imperative API (Advanced)
// ============================================================================

/**
 * Imperative node operations (advanced usage)
 *
 * For most use cases, prefer the `useNode` hook.
 * Use these methods for non-reactive contexts or advanced scenarios.
 *
 * @namespace node
 */
export const node = {
  /**
   * Write data to a Gun node
   *
   * @template T - The type of data
   * @param path - Gun node path
   * @param data - Data to write
   * @param schema - Optional Zod schema for validation
   * @returns Result indicating success or error
   *
   * @example
   * ```ts
   * import { node } from '@ariob/core';
   *
   * const result = await node.put('todos/todo-1', {
   *   title: 'Buy milk',
   *   done: false
   * }, TodoSchema);
   *
   * if (result.ok) {
   *   console.log('Saved successfully');
   * } else {
   *   console.error('Error:', result.error);
   * }
   * ```
   */
  put: async <T>(path: string, data: T, schema?: z.ZodSchema<T>) => {
    const g = getGraph();
    const ref = g.get(path);
    return nodeStore.put(path, ref, data, schema);
  },

  /**
   * Read data from a Gun node (one-time fetch)
   *
   * @template T - The type of data
   * @param path - Gun node path
   * @param schema - Optional Zod schema for validation
   * @returns Promise with data or null
   *
   * @example
   * ```ts
   * const todo = await node.get('todos/todo-1', TodoSchema);
   * console.log(todo?.title);
   * ```
   */
  get: async <T>(path: string, schema?: z.ZodSchema<T>): Promise<T | null> => {
    return new Promise((resolve) => {
      const g = getGraph();
      const ref = g.get(path);

      ref.once((raw: any) => {
        if (!raw) {
          resolve(null);
          return;
        }

        try {
          // Clean Gun metadata
          const clean: any = {};
          for (const prop in raw) {
            if (!prop.startsWith('_')) {
              clean[prop] = raw[prop];
            }
          }

          // Validate with schema if provided
          if (schema) {
            const result = Result.parse(schema, clean);
            if (!result.ok) {
              console.error('[Node] Schema validation failed:', result.error);
              resolve(null);
              return;
            }
            resolve(result.value);
          } else {
            resolve(clean as T);
          }
        } catch (err) {
          console.error('[Node] Error reading data:', err);
          resolve(null);
        }
      });
    });
  },

  /**
   * Update node with partial data
   *
   * @template T - The type of data
   * @param path - Gun node path
   * @param updates - Partial data to update
   * @returns Result indicating success or error
   *
   * @example
   * ```ts
   * await node.update('todos/todo-1', { done: true });
   * ```
   */
  update: async <T>(path: string, updates: Partial<T>) => {
    const g = getGraph();
    const ref = g.get(path);
    return nodeStore.update(path, ref, updates);
  },

  /**
   * Delete a node by setting all properties to null (tombstoning)
   *
   * Note: Gun doesn't support true deletion. This reads current data and sets each property to null.
   *
   * @param path - Gun node path
   * @returns Result indicating success or error
   *
   * @example
   * ```ts
   * await node.delete('todos/todo-1');
   * ```
   */
  delete: async (path: string) => {
    const g = getGraph();
    const ref = g.get(path);

    try {
      // First, get current data to know what properties to null out
      const currentData = await new Promise<any>((resolve) => {
        ref.once((data: any) => resolve(data));
      });

      if (!currentData) {
        // Node doesn't exist, consider it deleted
        console.log('[Node] ℹ️ Node already empty or doesn\'t exist:', path);
        return Result.ok(undefined);
      }

      // Create a tombstone object with all properties set to null
      const tombstone: Record<string, null> = {};
      for (const key in currentData) {
        if (key !== '_') { // Skip Gun metadata
          tombstone[key] = null;
        }
      }

      // Put the tombstone
      await new Promise<void>((resolve, reject) => {
        ref.put(tombstone, (ack: any) => {
          if (ack.err) {
            reject(new Error(ack.err));
          } else {
            resolve();
          }
        });
      });

      console.log('[Node] ✅ Node deleted (tombstoned):', path);
      return Result.ok(undefined);
    } catch (err) {
      console.error('[Node] ❌ Error deleting node:', path, err);
      return Result.error(err instanceof Error ? err : new Error(String(err)));
    }
  },
};

// Export store for advanced use
export { nodeStore, createNodeStore };

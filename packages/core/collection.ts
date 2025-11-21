/**
 * Collection - Production-ready reactive Gun collection management
 *
 * Inspired by React Query and Convex for exceptional DX:
 * - Hook-first API with automatic subscriptions
 * - Type-safe with Zod schema validation
 * - Built-in loading, error, and sync states
 * - Lexical ordering integration for sorted collections
 * - No manual Gun reference management
 *
 * @example Basic usage
 * ```tsx
 * import { useCollection, lex, z } from '@ariob/core';
 *
 * const TodoSchema = z.object({
 *   title: z.string(),
 *   done: z.boolean()
 * });
 *
 * function TodoList() {
 *   const todos = useCollection({
 *     path: 'todos',
 *     schema: TodoSchema,
 *   });
 *
 *   if (todos.isLoading) return <Text>Loading...</Text>;
 *   if (todos.isError) return <Text>Error: {todos.error?.message}</Text>;
 *
 *   return (
 *     <View>
 *       {todos.items.map(item => (
 *         <Text key={item.id}>{item.data.title}</Text>
 *       ))}
 *       <Button onPress={() => todos.add({
 *         title: 'New task',
 *         done: false
 *       }, lex.random('task'))}>
 *         Add Task
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 *
 * @example With lexical ordering
 * ```tsx
 * // Messages sorted newest first
 * const messages = useCollection({
 *   path: 'chat/messages',
 *   schema: MessageSchema,
 *   sort: 'asc', // Lex order (use reverse for newest first)
 * });
 *
 * // Add message with reverse timestamp
 * await messages.add(
 *   { text: 'Hello!', user: 'alice' },
 *   lex.reverse()
 * );
 * ```
 */

import { useEffect, useCallback } from 'react';
import { define } from './utils/store';
import { graph as getGraph } from './graph';
import type { IGunChainReference } from './graph';
import { Result } from './result';
import type { z } from 'zod';
import { lex } from './lex';

// ============================================================================
// Types
// ============================================================================

/**
 * Collection item with ID and data
 */
export interface Item<T = any> {
  /** Unique soul/ID of the item (lexicographically sorted by Gun) */
  id: string;
  /** Item data */
  data: T;
}

/**
 * Collection data state
 */
interface CollectionData<T = any> {
  /** Array of items (Gun maintains lexical order) */
  items: Item<T>[];
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Whether there's an error */
  isError: boolean;
  /** Error if any */
  error: Error | null;
  /** Whether collection is synced with peers */
  isSynced: boolean;
  /** Whether collection is empty */
  isEmpty: boolean;
}

/**
 * Sort direction for collections
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Configuration for useCollection hook
 *
 * @template T - The type of items in this collection
 */
export interface CollectionConfig<T = any> {
  /**
   * Gun collection path (e.g., 'todos' or 'users/alice/posts')
   */
  path: string;

  /**
   * Optional Zod schema for runtime validation
   * Highly recommended for type safety and data integrity
   */
  schema?: z.ZodSchema<T>;

  /**
   * Sort direction for items
   * - 'asc': Ascending lexical order (default)
   * - 'desc': Descending lexical order
   *
   * @default 'asc'
   */
  sort?: SortDirection;

  /**
   * Enable/disable the subscription
   * @default true
   */
  enabled?: boolean;

  /**
   * Custom Gun graph instance
   * @default uses singleton graph instance
   */
  graph?: IGunChainReference;
}

/**
 * Collection store state
 */
interface CollectionStore {
  /** Map of collection path to collection data */
  collections: Record<string, CollectionData>;
  /** Active subscriptions cleanup functions */
  subs: Map<string, () => void>;
}

// ============================================================================
// Store
// ============================================================================

/**
 * Create a collection store
 */
function createCollectionStore() {
  const store = define<CollectionStore>({
    collections: {},
    subs: new Map(),
  });

  return {
    // Expose the Zustand store hook
    useStore: store,
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,

    /**
     * Subscribe to a Gun collection
     *
     * @internal
     */
    map: <T>(path: string, ref: IGunChainReference, schema?: z.ZodSchema<T>, sort: SortDirection = 'asc') => {
      const state = store.getState();

      // Cleanup existing subscription
      const existing = state.subs.get(path);
      if (existing) existing();

      // Set loading state
      store.setState({
        collections: {
          ...state.collections,
          [path]: {
            items: [],
            isLoading: true,
            isError: false,
            error: null,
            isSynced: false,
            isEmpty: true,
          },
        },
      });

      console.log('[Collection] 🔔 Subscribing:', path);

      // Check if collection is initially empty
      ref.once((initialData: any) => {
        if (!initialData || Object.keys(initialData).filter(k => !k.startsWith('_')).length === 0) {
          console.log('[Collection] 📭 Initial state: empty');
          const currentState = store.getState();
          store.setState({
            collections: {
              ...currentState.collections,
              [path]: {
                items: [],
                isLoading: false,
                isError: false,
                error: null,
                isSynced: true,
                isEmpty: true,
              },
            },
          });
        }
      });

      // Subscribe to collection for reactive updates
      ref.map().on((raw: any, id: string) => {
        console.log('[Collection] 📦 Item received:', path, id, raw);

        try {
          const currentState = store.getState();
          const coll = currentState.collections[path];
          if (!coll) return;

          // Handle item deletion
          if (raw === null || raw === undefined) {
            const newItems = coll.items.filter((item) => item.id !== id);
            store.setState({
              collections: {
                ...currentState.collections,
                [path]: {
                  ...coll,
                  items: newItems,
                  isLoading: false,
                  isSynced: true,
                  isEmpty: newItems.length === 0,
                },
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

          // Update or add item
          const existingIndex = coll.items.findIndex((item) => item.id === id);
          const newItem: Item = { id, data };

          let newItems: Item[];
          if (existingIndex >= 0) {
            // Update existing
            newItems = [...coll.items];
            newItems[existingIndex] = newItem;
          } else {
            // Add new (Gun maintains lexical order, but we sort client-side for consistency)
            newItems = [...coll.items, newItem];
          }

          // Sort items by ID (lexical order)
          newItems.sort((a, b) => {
            if (sort === 'desc') {
              return b.id.localeCompare(a.id);
            }
            return a.id.localeCompare(b.id);
          });

          store.setState({
            collections: {
              ...currentState.collections,
              [path]: {
                items: newItems,
                isLoading: false,
                isError: false,
                error: null,
                isSynced: true,
                isEmpty: false,
              },
            },
          });
        } catch (err) {
          console.error('[Collection] ❌ Error processing item:', path, id, err);
          const currentState = store.getState();
          const coll = currentState.collections[path];
          store.setState({
            collections: {
              ...currentState.collections,
              [path]: {
                items: coll?.items ?? [],
                isEmpty: coll?.isEmpty ?? true,
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
        console.log('[Collection] 🧹 Cleanup:', path);
        const currentState = store.getState();
        const { [path]: _, ...rest } = currentState.collections;
        store.setState({ collections: rest });
      };

      const currentState = store.getState();
      currentState.subs.set(path, cleanup);
    },

    /**
     * Unsubscribe from a Gun collection
     *
     * @internal
     */
    off: (path: string) => {
      console.log('[Collection] 🔕 Unsubscribing:', path);

      const state = store.getState();
      const cleanup = state.subs.get(path);
      if (cleanup) {
        cleanup();
        state.subs.delete(path);
      }
    },

    /**
     * Add item to a Gun collection
     *
     * @internal
     */
    add: async <T>(
      path: string,
      ref: IGunChainReference,
      data: T,
      id?: string,
      schema?: z.ZodSchema<T>
    ) => {
      try {
        // Validate with schema if provided
        if (schema) {
          const result = Result.parse(schema, data);
          if (!result.ok) {
            return Result.error(new Error(`Schema validation failed: ${result.error.message}`));
          }
        }

        // Generate ID if not provided (use timestamp for lexical ordering)
        const itemId = id || lex.time();

        // Add to Gun set with specific ID
        await new Promise<void>((resolve, reject) => {
          ref.get(itemId).put(data as any, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
        });

        console.log('[Collection] ✅ Item added:', path, itemId);
        return Result.ok(itemId);
      } catch (err) {
        console.error('[Collection] ❌ Error adding item:', path, err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Update item in collection
     *
     * @internal
     */
    update: async <T>(
      path: string,
      ref: IGunChainReference,
      id: string,
      data: Partial<T>,
      schema?: z.ZodSchema<T>
    ) => {
      try {
        // Get current data
        const current = await new Promise<any>((resolve) => {
          ref.get(id).once((d: any) => resolve(d));
        });

        if (!current) {
          return Result.error(new Error('Item not found'));
        }

        // Merge updates
        const merged = { ...current, ...data };

        // Validate with schema if provided
        if (schema) {
          const result = Result.parse(schema, merged);
          if (!result.ok) {
            return Result.error(new Error(`Schema validation failed: ${result.error.message}`));
          }
        }

        // Update Gun node
        await new Promise<void>((resolve, reject) => {
          ref.get(id).put(merged as any, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
        });

        console.log('[Collection] ✅ Item updated:', path, id);
        return Result.ok(undefined);
      } catch (err) {
        console.error('[Collection] ❌ Error updating item:', path, id, err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Remove item from collection
     *
     * @internal
     */
    remove: async (path: string, ref: IGunChainReference, id: string) => {
      try {
        // Delete by setting to null
        await new Promise<void>((resolve, reject) => {
          ref.get(id).put(null, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
        });

        console.log('[Collection] ✅ Item removed:', path, id);
        return Result.ok(undefined);
      } catch (err) {
        console.error('[Collection] ❌ Error removing item:', path, id, err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Get collection state
     *
     * @internal
     */
    getCollectionState: (path: string): CollectionData => {
      return (
        store.getState().collections[path] ?? {
          items: [],
          isLoading: false,
          isError: false,
          error: null,
          isSynced: false,
          isEmpty: true,
        }
      );
    },
  };
}

/**
 * Global collection store singleton
 */
const collectionStore = createCollectionStore();

// ============================================================================
// Hook API (Primary)
// ============================================================================

/**
 * Hook for reactive Gun collection management
 *
 * Automatically subscribes to the collection and provides reactive items, loading, and error states.
 * Inspired by React Query and Convex for excellent developer experience.
 *
 * @template T - The type of items in this collection
 * @param config - Collection configuration
 * @returns Collection state and mutation methods
 *
 * @example Basic usage
 * ```tsx
 * const todos = useCollection({
 *   path: 'todos',
 *   schema: TodoSchema,
 * });
 *
 * if (todos.isLoading) return <Text>Loading...</Text>;
 * return todos.items.map(item => <Text key={item.id}>{item.data.title}</Text>);
 * ```
 *
 * @example With mutations
 * ```tsx
 * const messages = useCollection({
 *   path: 'chat/messages',
 *   schema: MessageSchema,
 *   sort: 'asc', // Use lex.reverse() for newest first
 * });
 *
 * // Add with automatic ID
 * await messages.add({ text: 'Hello!', user: 'alice' });
 *
 * // Add with custom lex ID (newest first)
 * await messages.add(
 *   { text: 'Hi!', user: 'bob' },
 *   lex.reverse()
 * );
 *
 * // Update item
 * await messages.update('msg_123', { text: 'Updated!' });
 *
 * // Remove item
 * await messages.remove('msg_123');
 * ```
 *
 * @example Conditional subscription
 * ```tsx
 * const posts = useCollection({
 *   path: `users/${userId}/posts`,
 *   schema: PostSchema,
 *   enabled: !!userId, // Only subscribe when userId exists
 * });
 * ```
 */
export function useCollection<T = any>(config: CollectionConfig<T>) {
  const { path, schema, sort = 'asc', enabled = true, graph } = config;

  // Subscribe/unsubscribe on mount/unmount
  useEffect(() => {
    if (!enabled) return;

    const g = graph || getGraph();
    const ref = g.get(path);

    // Subscribe
    collectionStore.map(path, ref, schema, sort);

    // Cleanup on unmount
    return () => collectionStore.off(path);
  }, [path, enabled, sort]);

  // Reactive selectors
  const collState = collectionStore.useStore((s) => s.collections[path]);

  const items = collState?.items ?? [];
  const isLoading = collState?.isLoading ?? false;
  const isError = collState?.isError ?? false;
  const error = collState?.error ?? null;
  const isSynced = collState?.isSynced ?? false;
  const isEmpty = collState?.isEmpty ?? true;

  /**
   * Add item to collection
   */
  const add = useCallback(
    async (data: T, id?: string) => {
      const g = graph || getGraph();
      const ref = g.get(path);
      return collectionStore.add(path, ref, data, id, schema);
    },
    [path, schema, graph]
  );

  /**
   * Update item in collection
   */
  const update = useCallback(
    async (id: string, data: Partial<T>) => {
      const g = graph || getGraph();
      const ref = g.get(path);
      return collectionStore.update(path, ref, id, data, schema);
    },
    [path, schema, graph]
  );

  /**
   * Remove item from collection
   */
  const remove = useCallback(
    async (id: string) => {
      const g = graph || getGraph();
      const ref = g.get(path);
      return collectionStore.remove(path, ref, id);
    },
    [path, graph]
  );

  /**
   * Refresh data from Gun
   */
  const refetch = useCallback(() => {
    const g = graph || getGraph();
    const ref = g.get(path);
    collectionStore.map(path, ref, schema, sort);
  }, [path, schema, sort, graph]);

  return {
    /** Array of items (sorted by ID lexicographically) */
    items: items as Item<T>[],

    /** Whether initial data is loading */
    isLoading,

    /** Whether there's an error */
    isError,

    /** Error object if isError is true */
    error,

    /** Whether collection is synced with Gun peers */
    isSynced,

    /** Whether collection is empty */
    isEmpty,

    /** Number of items in collection */
    count: items.length,

    /** Add item to collection */
    add,

    /** Update item in collection */
    update,

    /** Remove item from collection */
    remove,

    /** Refresh data from Gun */
    refetch,
  };
}

// ============================================================================
// Factory API
// ============================================================================

/**
 * Create a typed collection hook factory
 *
 * Useful for creating reusable collection hooks with pre-configured schemas.
 *
 * @template T - The type of items in this collection
 * @param path - Gun collection path
 * @param schema - Zod schema for validation
 * @param sort - Default sort direction
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
 * const useTodos = createCollection('todos', TodoSchema);
 *
 * // Use in component
 * function TodoList() {
 *   const todos = useTodos();
 *
 *   return (
 *     <View>
 *       {todos.items.map(item => (
 *         <Text key={item.id}>{item.data.title}</Text>
 *       ))}
 *       <Button onPress={() => todos.add({
 *         title: 'New task',
 *         done: false
 *       })}>
 *         Add
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */
export function createCollection<T = any>(
  path: string,
  schema?: z.ZodSchema<T>,
  sort: SortDirection = 'asc'
) {
  return function useCreatedCollection(options?: Omit<CollectionConfig<T>, 'path' | 'schema' | 'sort'>) {
    return useCollection<T>({
      path,
      ...(schema ? { schema } : {}),
      sort,
      ...options,
    });
  };
}

// ============================================================================
// Imperative API (Advanced)
// ============================================================================

/**
 * Imperative collection operations (advanced usage)
 *
 * For most use cases, prefer the `useCollection` hook.
 * Use these methods for non-reactive contexts or advanced scenarios.
 *
 * @namespace collection
 */
export const collection = {
  /**
   * Add item to a Gun collection
   *
   * @template T - The type of the item
   * @param path - Gun collection path
   * @param data - Item data
   * @param id - Optional item ID (auto-generated if not provided)
   * @param schema - Optional Zod schema for validation
   * @returns Result with item ID or error
   *
   * @example
   * ```ts
   * import { collection, lex } from '@ariob/core';
   *
   * // Add with auto-generated ID
   * const result = await collection.add('todos', {
   *   title: 'Buy milk',
   *   done: false
   * }, undefined, TodoSchema);
   *
   * // Add with custom lex ID (newest first)
   * await collection.add(
   *   'messages',
   *   { text: 'Hello!', user: 'alice' },
   *   lex.reverse(),
   *   MessageSchema
   * );
   * ```
   */
  add: async <T>(path: string, data: T, id?: string, schema?: z.ZodSchema<T>) => {
    const g = getGraph();
    const ref = g.get(path);
    return collectionStore.add(path, ref, data, id, schema);
  },

  /**
   * Update item in a Gun collection
   *
   * @template T - The type of the item
   * @param path - Gun collection path
   * @param id - Item ID
   * @param data - Partial item data to update
   * @param schema - Optional Zod schema for validation
   * @returns Result indicating success or error
   *
   * @example
   * ```ts
   * await collection.update('todos', 'todo-1', { done: true }, TodoSchema);
   * ```
   */
  update: async <T>(path: string, id: string, data: Partial<T>, schema?: z.ZodSchema<T>) => {
    const g = getGraph();
    const ref = g.get(path);
    return collectionStore.update(path, ref, id, data, schema);
  },

  /**
   * Remove item from a Gun collection
   *
   * @param path - Gun collection path
   * @param id - Item ID
   * @returns Result indicating success or error
   *
   * @example
   * ```ts
   * await collection.remove('todos', 'todo-1');
   * ```
   */
  remove: async (path: string, id: string) => {
    const g = getGraph();
    const ref = g.get(path);
    return collectionStore.remove(path, ref, id);
  },

  /**
   * Get all items from a Gun collection (one-time fetch)
   *
   * @template T - The type of items
   * @param path - Gun collection path
   * @param schema - Optional Zod schema for validation
   * @param sort - Sort direction ('asc' or 'desc')
   * @returns Promise with array of items
   *
   * @example
   * ```ts
   * const todos = await collection.list('todos', TodoSchema);
   * console.log(todos.map(item => item.data.title));
   * ```
   */
  list: async <T>(
    path: string,
    schema?: z.ZodSchema<T>,
    sort: SortDirection = 'asc'
  ): Promise<Item<T>[]> => {
    return new Promise((resolve) => {
      const g = getGraph();
      const ref = g.get(path);
      const items: Item<T>[] = [];

      ref.map().once((raw: any, id: string) => {
        if (!raw) return;

        try {
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
              console.error('[Collection] Schema validation failed:', result.error);
              return;
            }
            data = result.value;
          }

          items.push({ id, data });
        } catch (err) {
          console.error('[Collection] Error reading item:', err);
        }
      });

      // Wait a bit for all items to arrive, then sort and resolve
      setTimeout(() => {
        items.sort((a, b) => {
          if (sort === 'desc') {
            return b.id.localeCompare(a.id);
          }
          return a.id.localeCompare(b.id);
        });
        resolve(items);
      }, 100);
    });
  },

  /**
   * Clear all items from a collection
   *
   * @param path - Gun collection path
   * @returns Result indicating success or error
   *
   * @example
   * ```ts
   * await collection.clear('todos');
   * ```
   */
  clear: async (path: string) => {
    try {
      const g = getGraph();
      const ref = g.get(path);

      // Get all item IDs
      const items = await collection.list(path);

      // Delete each item
      for (const item of items) {
        await collectionStore.remove(path, ref, item.id);
      }

      console.log('[Collection] ✅ Collection cleared:', path);
      return Result.ok(undefined);
    } catch (err) {
      console.error('[Collection] ❌ Error clearing collection:', path, err);
      return Result.error(err instanceof Error ? err : new Error(String(err)));
    }
  },
};

// Export store for advanced use
export { collectionStore, createCollectionStore };

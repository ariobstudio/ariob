/**
 * Collection Store
 *
 * Custom store for managing Gun collections (LynxJS-compatible).
 * Follows Gun's map/set API with Result-based error handling.
 */

import { useEffect, useCallback } from 'react';
import { createStore, useStoreSelector } from './utils/createStore';
import type { IGunChainReference } from './graph';
import { Result } from './result';
import type { z } from 'zod';

/**
 * Collection item with ID and data
 */
export interface Item<T = any> {
  /** Unique soul/ID of the item */
  id: string;
  /** Item data */
  data: T;
}

/**
 * Collection data state
 */
interface CollectionData<T = any> {
  /** Array of items */
  items: Item<T>[];
  /** Whether data is loading */
  loading: boolean;
  /** Error if any */
  error: Error | null;
}

/**
 * Collection configuration
 */
export interface CollectionConfig {
  /** Enable localStorage persistence */
  persist?: boolean;
  /** Gun graph instance to use (defaults to singleton) */
  graph?: IGunChainReference;
}

/**
 * Collection store state
 */
interface CollectionStore {
  /** Map of collection key to collection data */
  collections: Record<string, CollectionData>;
  /** Active subscriptions cleanup functions */
  subs: Map<string, () => void>;
}

/**
 * Create a collection store
 */
function createCollectionStore() {
  'background only';

  const store = createStore<CollectionStore>({
    collections: {},
    subs: new Map(),
  });

  return {
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,

    /**
     * Subscribe to a Gun collection
     */
    map: <T>(key: string, ref: IGunChainReference, schema?: z.ZodSchema<T>) => {
      'background only';

      const state = store.getState();

      // Cleanup existing subscription
      const existing = state.subs.get(key);
      if (existing) existing();

      // Set loading state
      store.setState({
        collections: {
          ...state.collections,
          [key]: { items: [], loading: true, error: null },
        },
      });

      console.log('[Collection] Subscribing:', key);

      // Subscribe to Gun collection
      ref.map().on((raw: any, id: string) => {
        'background only';
        console.log('[Collection] Item received:', key, id, raw);

        try {
          // Handle item deletion
          if (raw === null || raw === undefined) {
            const currentState = store.getState();
            const coll = currentState.collections[key];
            if (!coll) return;

            store.setState({
              collections: {
                ...currentState.collections,
                [key]: {
                  ...coll,
                  items: coll.items.filter((item) => item.id !== id),
                  loading: false,
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

          // Update store
          const currentState = store.getState();
          const coll = currentState.collections[key];
          if (!coll) return;

          const existingIndex = coll.items.findIndex((item) => item.id === id);
          const newItem: Item = { id, data };

          let newItems: Item[];
          if (existingIndex >= 0) {
            // Update existing
            newItems = [...coll.items];
            newItems[existingIndex] = newItem;
          } else {
            // Add new
            newItems = [...coll.items, newItem];
          }

          store.setState({
            collections: {
              ...currentState.collections,
              [key]: {
                items: newItems,
                loading: false,
                error: null,
              },
            },
          });
        } catch (err) {
          console.error('[Collection] Error processing item:', key, id, err);
          const currentState = store.getState();
          store.setState({
            collections: {
              ...currentState.collections,
              [key]: {
                ...currentState.collections[key],
                loading: false,
                error: err instanceof Error ? err : new Error(String(err)),
              },
            },
          });
        }
      });

      // Store cleanup
      const cleanup = () => {
        console.log('[Collection] Cleanup:', key);
        const currentState = store.getState();
        const { [key]: _, ...rest } = currentState.collections;
        store.setState({ collections: rest });
      };

      const currentState = store.getState();
      currentState.subs.set(key, cleanup);
    },

    /**
     * Unsubscribe from a Gun collection
     */
    off: (key: string) => {
      'background only';
      console.log('[Collection] Unsubscribing:', key);

      const state = store.getState();
      const cleanup = state.subs.get(key);
      if (cleanup) {
        cleanup();
        state.subs.delete(key);
      }
    },

    /**
     * Get items for a collection
     */
    get: (key: string) => {
      return store.getState().collections[key]?.items ?? [];
    },

    /**
     * Add item to a Gun collection
     */
    set: async <T>(key: string, ref: IGunChainReference, data: T, schema?: z.ZodSchema<T>) => {
      'background only';

      try {
        // Validate with schema if provided
        if (schema) {
          const result = Result.parse(schema, data);
          if (!result.ok) {
            return Result.error(new Error(`Schema validation failed: ${result.error.message}`));
          }
        }

        // Add to Gun set
        await new Promise<void>((resolve, reject) => {
          ref.set(data as any, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
        });

        console.log('[Collection] Item added:', key);
        return Result.ok(undefined);
      } catch (err) {
        console.error('[Collection] Error adding item:', key, err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Update item in collection
     */
    update: async <T>(key: string, ref: IGunChainReference, id: string, data: T, schema?: z.ZodSchema<T>) => {
      'background only';

      try {
        // Validate with schema if provided
        if (schema) {
          const result = Result.parse(schema, data);
          if (!result.ok) {
            return Result.error(new Error(`Schema validation failed: ${result.error.message}`));
          }
        }

        // Update specific item
        await new Promise<void>((resolve, reject) => {
          ref.get(id).put(data as any, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
        });

        console.log('[Collection] Item updated:', key, id);
        return Result.ok(undefined);
      } catch (err) {
        console.error('[Collection] Error updating item:', key, id, err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Delete item from collection
     */
    del: async (key: string, ref: IGunChainReference, id: string) => {
      'background only';

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

        console.log('[Collection] Item deleted:', key, id);
        return Result.ok(undefined);
      } catch (err) {
        console.error('[Collection] Error deleting item:', key, id, err);
        return Result.error(err instanceof Error ? err : new Error(String(err)));
      }
    },

    /**
     * Get loading state
     */
    loading: (key: string) => {
      return store.getState().collections[key]?.loading ?? false;
    },

    /**
     * Get error state
     */
    error: (key: string) => {
      return store.getState().collections[key]?.error ?? null;
    },
  };
}

/**
 * Default collection store (no persistence)
 */
const useCollectionStore = createCollectionStore();

/**
 * Collection API - Simple interface for Gun collections
 *
 * @example
 * ```typescript
 * import { collection, graph } from '@ariob/core';
 * import { z } from 'zod';
 *
 * const TodoSchema = z.object({
 *   title: z.string(),
 *   done: z.boolean()
 * });
 *
 * // Subscribe to collection
 * const g = graph();
 * const ref = g.get('todos');
 * collection('todos').map(ref, TodoSchema);
 *
 * // In component
 * const todos = collection('todos').get();
 * const loading = collection('todos').loading();
 *
 * // Add item
 * await collection('todos').set(ref, { title: 'Buy milk', done: false }, TodoSchema);
 *
 * // Update item
 * await collection('todos').update(ref, 'item-id', { title: 'Buy milk', done: true }, TodoSchema);
 *
 * // Delete item
 * await collection('todos').del(ref, 'item-id');
 *
 * // Unsubscribe
 * collection('todos').off();
 * ```
 */
export function collection<T = any>(key: string, config?: CollectionConfig) {
  'background only';

  const store = useCollectionStore;

  return {
    /**
     * Subscribe to this collection's items
     */
    map: (ref: IGunChainReference, schema?: z.ZodSchema<T>) => {
      store.map(key, ref, schema);
    },

    /**
     * Unsubscribe from this collection
     */
    off: () => {
      store.off(key);
    },

    /**
     * Get current items
     */
    get: (): Item<T>[] => {
      return store.get(key);
    },

    /**
     * Add item to collection
     */
    set: async (ref: IGunChainReference, data: T, schema?: z.ZodSchema<T>): Promise<Result<void, Error>> => {
      return store.set(key, ref, data, schema);
    },

    /**
     * Update item in collection
     */
    update: async (ref: IGunChainReference, id: string, data: T, schema?: z.ZodSchema<T>): Promise<Result<void, Error>> => {
      return store.update(key, ref, id, data, schema);
    },

    /**
     * Delete item from collection
     */
    del: async (ref: IGunChainReference, id: string): Promise<Result<void, Error>> => {
      return store.del(key, ref, id);
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
 * Hook for using collection in React components
 */
export function useCollection<T = any>(key: string, config?: CollectionConfig) {
  'background only';

  const store = useCollectionStore;

  const items = useStoreSelector(
    { getState: store.getState, setState: store.setState, subscribe: store.subscribe },
    (s) => s.collections[key]?.items ?? []
  );
  const loading = useStoreSelector(
    { getState: store.getState, setState: store.setState, subscribe: store.subscribe },
    (s) => s.collections[key]?.loading ?? false
  );
  const error = useStoreSelector(
    { getState: store.getState, setState: store.setState, subscribe: store.subscribe },
    (s) => s.collections[key]?.error ?? null
  );

  return {
    items: items as Item<T>[],
    loading,
    error,
    map: (ref: IGunChainReference, schema?: z.ZodSchema<T>) => {
      store.map(key, ref, schema);
    },
    off: () => {
      store.off(key);
    },
    set: async (ref: IGunChainReference, data: T, schema?: z.ZodSchema<T>) => {
      return store.set(key, ref, data, schema);
    },
    update: async (ref: IGunChainReference, id: string, data: T, schema?: z.ZodSchema<T>) => {
      return store.update(key, ref, id, data, schema);
    },
    del: async (ref: IGunChainReference, id: string) => {
      return store.del(key, ref, id);
    },
  };
}

/**
 * Create a reactive collection hook factory
 *
 * @param key - Gun collection key
 * @param schema - Optional Zod schema for validation
 * @returns React hook that auto-subscribes to the collection
 *
 * @example
 * ```typescript
 * const useMessages = createCollection('messages', MessageSchema);
 *
 * function Component() {
 *   const { items, loading, error, set, del } = useMessages();
 *
 *   return items.map(item => <Text key={item.id}>{item.data.text}</Text>);
 * }
 * ```
 */
export function createCollection<T = any>(key: string, schema?: z.ZodSchema<T>) {
  'background only';

  return function useCreatedCollection() {
    'background only';

    const store = useCollectionStore;

    // Auto-subscribe on mount
    useEffect(() => {
      'background only';
      // Import graph at runtime to avoid circular deps
      const { graph } = require('./graph');
      const g = graph();
      const ref = g.get(key);

      store.map(key, ref, schema);
      return () => store.off(key);
    }, []);

    // Reactive selectors
    const items = useStoreSelector(
      { getState: store.getState, setState: store.setState, subscribe: store.subscribe },
      (s: any) => s.collections[key]?.items ?? []
    );
    const loading = useStoreSelector(
      { getState: store.getState, setState: store.setState, subscribe: store.subscribe },
      (s: any) => s.collections[key]?.loading ?? false
    );
    const error = useStoreSelector(
      { getState: store.getState, setState: store.setState, subscribe: store.subscribe },
      (s: any) => s.collections[key]?.error ?? null
    );

    const set = useCallback(async (data: T) => {
      'background only';
      const { graph } = require('./graph');
      const g = graph();
      const ref = g.get(key);

      return store.set(key, ref, data, schema);
    }, []);

    const update = useCallback(async (id: string, data: T) => {
      'background only';
      const { graph } = require('./graph');
      const g = graph();
      const ref = g.get(key);

      return store.update(key, ref, id, data, schema);
    }, []);

    const del = useCallback(async (id: string) => {
      'background only';
      const { graph } = require('./graph');
      const g = graph();
      const ref = g.get(key);

      return store.del(key, ref, id);
    }, []);

    return { items: items as Item<T>[], loading, error, set, update, del };
  };
}

// Export store for advanced use
export { useCollectionStore, createCollectionStore };

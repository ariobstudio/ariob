/**
 * useSet Hook
 *
 * React hook for subscribing to and managing Gun collections (sets).
 * Handles real-time updates, encryption/decryption, and provides
 * add/update/remove operations for collection items.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { IGunChainReference, KeyPair } from '../gun/graph';
import { encryptData, decryptData, debounce } from '../utils/helpers';


/**
 * Collection item with metadata
 */
export interface CollectionItem<T = any> {
  /** Unique soul/ID of the item */
  id: string;
  /** Item data */
  data: T;
}

/**
 * Result object returned by useSet hook
 */
export interface UseSetResult<T = any> {
  /** Array of items in the collection */
  items: CollectionItem<T>[];
  /** Function to add a new item to the collection */
  add: (data: T) => Promise<void>;
  /** Function to update an existing item */
  update: (id: string, data: Partial<T>) => Promise<void>;
  /** Function to remove an item from the collection */
  remove: (id: string) => Promise<void>;
  /** Whether data is currently being loaded */
  isLoading: boolean;
  /** Error that occurred during operations */
  error: Error | null;
}

/**
 * Hook for managing a Gun collection with real-time updates.
 *
 * Subscribes to a Gun set/collection and provides reactive state updates.
 * Automatically handles encryption/decryption when keys are provided.
 *
 * @param ref - Gun chain reference to the collection (null to disable)
 * @param keys - Optional key pair for encryption/decryption
 * @returns Object containing items, operations, loading state, and errors
 *
 * @example
 * ```typescript
 * const graph = createGraph();
 * const todosRef = graph.get('todos');
 * const { items, add, update, remove, isLoading } = useSet(todosRef);
 *
 * // Add new item
 * await add({ title: 'New task', done: false });
 *
 * // Update item
 * await update('item-id', { done: true });
 *
 * // Remove item
 * await remove('item-id');
 *
 * // With encryption
 * const { items, add } = useSet(todosRef, userKeys);
 * await add({ secret: 'encrypted' }); // Automatically encrypted
 * ```
 */
export function useSet<T = any>(
  ref: IGunChainReference | null,
  keys?: KeyPair
): UseSetResult<T> {
  const [items, setItems] = useState<CollectionItem<T>[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const itemsMapRef = useRef<Map<string, CollectionItem<T>>>(new Map());

  // Debounced state setter to prevent rapid updates
  const debouncedSetItems = useRef(
    debounce(() => {
      if (isMountedRef.current) {
        const itemsArray = Array.from(itemsMapRef.current.values());
        setItems(itemsArray);
        setIsLoading(false);
      }
    }, 100)
  ).current;

  useEffect(() => {
    isMountedRef.current = true;
    itemsMapRef.current.clear();

    // Reset state when ref changes
    setIsLoading(true);
    setError(null);
    setItems([]);

    if (!ref) {
      setIsLoading(false);
      return;
    }


    // Subscribe to collection updates using map().on()
    const unsubscribe = ref.map().on(async (nodeData: any, nodeId: string) => {
      if (!isMountedRef.current) return;

      try {
        // Handle item deletion
        if (nodeData === null || nodeData === undefined) {
          itemsMapRef.current.delete(nodeId);
          debouncedSetItems();
          return;
        }

        // Remove Gun metadata (keys starting with _)
        const cleaned = { ...nodeData };
        Object.keys(cleaned).forEach((k) => {
          if (k.startsWith('_')) {
            delete cleaned[k];
          }
        });


        // Decrypt if keys are provided
        let processedData: T = cleaned as T;

        if (keys) {
          // Decrypt each field that looks encrypted
          const decrypted: any = {};
          for (const [fieldKey, value] of Object.entries(cleaned)) {
            try {
              decrypted[fieldKey] = await decryptData(value, keys);
            } catch (err) {
              // If decryption fails, use original value
              decrypted[fieldKey] = value;
            }
          }
          processedData = decrypted as T;
        }

        // Update items map
        itemsMapRef.current.set(nodeId, {
          id: nodeId,
          data: processedData,
        });

        debouncedSetItems();
      } catch (err) {
        if (isMountedRef.current) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setIsLoading(false);
        }
      }
    });

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (unsubscribe && typeof unsubscribe.off === 'function') {
        unsubscribe.off();
      }
    };
  }, [ref, keys]);

  /**
   * Adds a new item to the collection.
   * Automatically encrypts data if keys are provided.
   */
  const add = useCallback(
    async (data: T): Promise<void> => {
      if (!ref) {
        const error = new Error('Cannot add item: no Gun reference provided');
        throw error;
      }

      try {
        setError(null);

        let dataToSave = data;

        // Encrypt if keys are provided
        if (keys) {
          const encrypted: any = {};
          for (const [key, value] of Object.entries(data as any)) {
            encrypted[key] = await encryptData(value, keys);
          }
          dataToSave = encrypted;
        }

        // Add to Gun set
        await new Promise<void>((resolve, reject) => {
          ref.set(dataToSave, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    [ref, keys]
  );

  /**
   * Updates an existing item in the collection.
   * Automatically encrypts data if keys are provided.
   */
  const update = useCallback(
    async (id: string, data: Partial<T>): Promise<void> => {
      if (!ref) {
        const error = new Error('Cannot update item: no Gun reference provided');
        throw error;
      }

      try {
        setError(null);

        let dataToSave = data;

        // Encrypt if keys are provided
        if (keys) {
          const encrypted: any = {};
          for (const [key, value] of Object.entries(data)) {
            encrypted[key] = await encryptData(value, keys);
          }
          dataToSave = encrypted;
        }

        // Update specific item in the collection
        await new Promise<void>((resolve, reject) => {
          ref.get(id).put(dataToSave, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    [ref, keys]
  );

  /**
   * Removes an item from the collection by setting it to null.
   */
  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (!ref) {
        const error = new Error('Cannot remove item: no Gun reference provided');
        throw error;
      }

      try {
        setError(null);

        await new Promise<void>((resolve, reject) => {
          ref.get(id).put(null, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve();
            }
          });
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    [ref]
  );

  return {
    items,
    add,
    update,
    remove,
    isLoading,
    error,
  };
}

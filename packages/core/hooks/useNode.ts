/**
 * useNode Hook
 *
 * React hook for subscribing to and managing a single Gun node.
 * Handles real-time updates, encryption/decryption, and provides
 * put/remove operations.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { IGunChainReference, KeyPair } from '../gun/graph';
import { encryptData, decryptData, debounce } from '../utils/helpers';

/**
 * Result object returned by useNode hook
 */
export interface UseNodeResult<T = any> {
  /** Current node data (null if not loaded yet) */
  data: T | null;
  /** Function to update node data */
  put: (data: Partial<T> | null) => Promise<void>;
  /** Function to remove/delete the node */
  remove: () => Promise<void>;
  /** Whether data is currently being loaded */
  isLoading: boolean;
  /** Error that occurred during operations */
  error: Error | null;
}

/**
 * Hook for managing a single Gun node with real-time updates.
 *
 * Subscribes to a Gun node reference and provides reactive state updates.
 * Automatically handles encryption/decryption when keys are provided.
 *
 * @param ref - Gun chain reference to the node (null to disable)
 * @param keys - Optional key pair for encryption/decryption
 * @returns Object containing data, operations, loading state, and errors
 *
 * @example
 * ```typescript
 * const graph = createGraph();
 * const userRef = graph.get('users').get('alice');
 * const { data, put, remove, isLoading, error } = useNode(userRef);
 *
 * // Update node data
 * await put({ name: 'Alice', age: 30 });
 *
 * // With encryption
 * const { data, put } = useNode(userRef, userKeys);
 * await put({ secret: 'encrypted value' }); // Automatically encrypted
 * ```
 */
export function useNode<T = any>(
  ref: IGunChainReference | null,
  keys?: KeyPair
): UseNodeResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Debounced state setter to prevent rapid updates
  const debouncedSetData = useRef(
    debounce((newData: T | null) => {
      if (isMountedRef.current) {
        setData(newData);
        setIsLoading(false);
      }
    }, 100)
  ).current;

  useEffect(() => {
    isMountedRef.current = true;

    // Reset state when ref changes
    setIsLoading(true);
    setError(null);

    if (!ref) {
      setIsLoading(false);
      setData(null);
      return;
    }

    // Subscribe to node updates
    const unsubscribe = ref.on(async (nodeData: any) => {
      if (!isMountedRef.current) return;

      try {
        // Handle null/undefined data
        if (nodeData === null || nodeData === undefined) {
          debouncedSetData(null);
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

        debouncedSetData(processedData);
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
   * Updates the node with new data.
   * Automatically encrypts data if keys are provided.
   */
  const put = useCallback(
    async (newData: Partial<T> | null): Promise<void> => {
      if (!ref) {
        throw new Error('Cannot put data: no Gun reference provided');
      }

      try {
        setError(null);

        let dataToSave = newData;

        // Encrypt if keys are provided and data is not null
        if (keys && newData !== null) {
          const encrypted: any = {};
          for (const [key, value] of Object.entries(newData)) {
            encrypted[key] = await encryptData(value, keys);
          }
          dataToSave = encrypted;
        }

        // Save to Gun
        await new Promise<void>((resolve, reject) => {
          ref.put(dataToSave, (ack: any) => {
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
   * Removes the node by setting it to null.
   */
  const remove = useCallback(async (): Promise<void> => {
    await put(null);
  }, [put]);

  return {
    data,
    put,
    remove,
    isLoading,
    error,
  };
}

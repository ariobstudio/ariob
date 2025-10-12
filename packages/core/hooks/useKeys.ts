/**
 * useKeys Hook
 *
 * React hook for generating and managing cryptographic key pairs.
 * Automatically generates new keys if none are provided.
 */

import { useState, useEffect } from 'react';
import SEA from '../gun/lib/sea.js';
import type { KeyPair } from '../gun/graph';


/**
 * Hook for managing cryptographic key pairs.
 *
 * Generates a new key pair using SEA if no existing keys are provided.
 * The key generation happens asynchronously on mount.
 *
 * @param existingKeys - Optional existing key pair to use instead of generating new ones
 * @returns Key pair or null while keys are being generated
 *
 * @example
 * ```typescript
 * // Generate new keys
 * const keys = useKeys();
 * if (keys) {
 *   console.log('Public key:', keys.pub);
 * }
 *
 * // Use existing keys
 * const savedKeys = { pub, priv, epub, epriv };
 * const keys = useKeys(savedKeys);
 *
 * // Use with encryption
 * const keys = useKeys();
 * const { data, put } = useNode(nodeRef, keys);
 * await put({ secret: 'value' }); // Automatically encrypted with keys
 * ```
 */
export function useKeys(existingKeys?: KeyPair | null): KeyPair | null {
  const [keys, setKeys] = useState<KeyPair | null>(existingKeys || null);

  useEffect(() => {
    // If existing keys provided, use them
    if (existingKeys) {
      setKeys(existingKeys);
      return;
    }

    // Generate new keys if none provided
    let cancelled = false;

    const generateKeys = async () => {
      try {
        const pair = await SEA.pair();

        if (!cancelled && pair) {
          setKeys(pair);
        }
      } catch (error) {
        if (!cancelled) {
          setKeys(null);
        }
      }
    };

    generateKeys();

    // Cleanup function to prevent state updates after unmount
    return () => {
      cancelled = true;
    };
  }, [existingKeys]);

  return keys;
}

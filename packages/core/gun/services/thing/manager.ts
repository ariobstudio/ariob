/**
 * Subscription manager interface
 * Handles real-time subscription lifecycle
 * Following UNIX philosophy: one-word verbs
 */
export interface Manager {
  /**
   * Add a subscription
   * @param key - Unique key for the subscription
   * @param unsubscribe - Function to call when unsubscribing
   */
  add(key: string, unsubscribe: () => void): void;

  /**
   * Remove a subscription
   * @param key - Subscription key
   */
  remove(key: string): void;

  /**
   * Clean up all subscriptions
   */
  cleanup(): void;

  /**
   * Get number of active subscriptions
   */
  size(): number;
}

/**
 * Create a subscription manager
 * Tracks and manages real-time subscriptions
 * Following UNIX philosophy: one-word noun
 *
 * @example
 * ```typescript
 * const subscriptions = manager();
 *
 * // Add subscription
 * const unsubscribe = gun.get('path').on(...);
 * subscriptions.add('path', unsubscribe);
 *
 * // Remove subscription
 * subscriptions.remove('path');
 *
 * // Cleanup all
 * subscriptions.cleanup();
 * ```
 *
 * @returns Manager instance
 */
export const manager = (): Manager => {
  const subscriptions = new Map<string, () => void>();

  return {
    add: (key: string, unsubscribe: () => void): void => {
      // Remove existing subscription if present
      const existing = subscriptions.get(key);
      if (existing) {
        existing();
      }
      subscriptions.set(key, unsubscribe);
    },

    remove: (key: string): void => {
      const unsubscribe = subscriptions.get(key);
      if (unsubscribe) {
        unsubscribe();
        subscriptions.delete(key);
      }
    },

    cleanup: (): void => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
      subscriptions.clear();
    },

    size: (): number => {
      return subscriptions.size;
    },
  };
};

/**
 * Storage utilities for @ariob/store
 *
 * Provides simple helpers for creating persistent storage
 * with AsyncStorage in React Native.
 *
 * @example
 * ```ts
 * import { createLocalStorage } from '@ariob/store';
 * import { create } from 'zustand';
 * import { persist } from 'zustand/middleware';
 *
 * const useStore = create(
 *   persist(
 *     (set) => ({ count: 0 }),
 *     { name: '@ariob/my-store', storage: createLocalStorage() }
 *   )
 * );
 * ```
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Create a local storage adapter for Zustand persist middleware.
 * Uses AsyncStorage under the hood for React Native compatibility.
 *
 * @returns Storage adapter compatible with Zustand persist
 *
 * @example
 * ```ts
 * const storage = createLocalStorage();
 * // Use with persist middleware
 * persist(creator, { name: 'key', storage })
 * ```
 */
export function createLocalStorage() {
  return createJSONStorage(() => AsyncStorage);
}

/**
 * Storage keys used by @ariob stores.
 * Useful for debugging or manual storage operations.
 */
export const STORAGE_KEYS = {
  AI: '@ariob/ai',
  BAR: '@ariob/bar',
  CONVERSATION: '@ariob/conversation',
  PREFERENCES: '@ariob/preferences',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

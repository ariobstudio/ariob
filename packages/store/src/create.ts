/**
 * Store factory utilities for @ariob/store
 *
 * Provides simple helpers for creating Zustand stores
 * with optional persistence.
 *
 * @example
 * ```ts
 * import { define, persisted } from '@ariob/store';
 *
 * // Non-persisted store
 * const useCounter = define((set) => ({
 *   count: 0,
 *   inc: () => set((s) => ({ count: s.count + 1 })),
 * }));
 *
 * // Persisted store
 * const useSettings = persisted('@ariob/settings', (set) => ({
 *   theme: 'dark',
 *   setTheme: (theme) => set({ theme }),
 * }));
 * ```
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createLocalStorage } from './storage';

/**
 * Define a simple (non-persisted) Zustand store.
 *
 * @param creator - Store creator function
 * @returns Zustand hook
 *
 * @example
 * ```ts
 * const useUI = define((set) => ({
 *   isOpen: false,
 *   toggle: () => set((s) => ({ isOpen: !s.isOpen })),
 * }));
 * ```
 */
export function define<T>(
  creator: (
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    get: () => T
  ) => T
) {
  return create<T>()((set, get) => creator(set, get));
}

/**
 * Define a persisted Zustand store with AsyncStorage.
 * Data is automatically saved and restored across app sessions.
 *
 * @param name - Unique storage key (e.g., '@ariob/ai')
 * @param creator - Store creator function
 * @param options - Optional persist middleware options
 * @returns Zustand hook with persistence
 *
 * @example
 * ```ts
 * const useAI = persisted('@ariob/ai', (set) => ({
 *   modelId: 'smollm-135m',
 *   setModel: (id) => set({ modelId: id }),
 * }));
 * ```
 */
export function persisted<T>(
  name: string,
  creator: (
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    get: () => T
  ) => T,
  options?: {
    partialize?: (state: T) => Partial<T>;
  }
) {
  return create<T>()(
    persist((set, get) => creator(set, get), {
      name,
      storage: createLocalStorage(),
      ...options,
    })
  );
}

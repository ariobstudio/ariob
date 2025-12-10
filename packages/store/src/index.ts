/**
 * @ariob/store - Simple Zustand stores for React Native
 *
 * A lightweight store package providing:
 * - `createLocalStorage()` - AsyncStorage adapter for Zustand
 * - `define()` - Create non-persisted stores
 * - `persisted()` - Create stores with automatic persistence
 *
 * ## Quick Start
 *
 * ```tsx
 * import { persisted } from '@ariob/store';
 *
 * // Define a persisted store
 * const useSettings = persisted('@ariob/settings', (set) => ({
 *   theme: 'dark',
 *   setTheme: (theme: string) => set({ theme }),
 * }));
 *
 * // Use in components
 * function Settings() {
 *   const { theme, setTheme } = useSettings();
 *   return <Button onPress={() => setTheme('light')}>Toggle</Button>;
 * }
 * ```
 *
 * ## Pre-built Stores
 *
 * ```tsx
 * import { useAIStore, useBarStore } from '@ariob/store/stores';
 *
 * const { modelId, setModel } = useAIStore();
 * const { mode, dispatch } = useBarStore();
 * ```
 *
 * @see https://github.com/pmndrs/zustand
 */

// Core utilities
export { createLocalStorage, STORAGE_KEYS, type StorageKey } from './storage';
export { define, persisted } from './create';

// Re-export Zustand for convenience
export { create } from 'zustand';
export { persist, createJSONStorage } from 'zustand/middleware';

/**
 * LocalStorage Module
 *
 * Provides a consistent localStorage API that works in both web and native environments.
 * Automatically initializes the native bridge when needed.
 *
 * Note: In React Native/Expo, localStorage may not be available.
 * Use AsyncStorage instead for those environments.
 */

// Conditionally import native localStorage bridge only in LynxJS environment
(() => {
  try {
    if (typeof globalThis !== 'undefined' &&
        (globalThis as any).lynx !== undefined) {
      require('./gun/native/localStorage');
      console.log('[LocalStorage] Loaded LynxJS native bridge');
    } else {
      console.log('[LocalStorage] Using platform-native localStorage (web/Expo)');
    }
  } catch (e) {
    console.warn('[LocalStorage] Could not load native bridge:', e);
  }
})();

// Type declaration for global with localStorage
declare var global: {
  localStorage?: Storage;
};

/**
 * Get the localStorage instance
 * This ensures the native bridge is initialized before use
 */
export function getLocalStorage(): Storage {
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }

  throw new Error('[LocalStorage] localStorage not available');
}

/**
 * Storage wrapper for Zustand persist middleware
 * Use this with createJSONStorage(() => getStorage())
 */
export function getStorage(): Storage {
  return getLocalStorage();
}

/**
 * Safe localStorage operations with error handling
 */
export const LocalStorage = {
  /**
   * Get an item from localStorage
   */
  getItem(key: string): string | null {
    try {
      return getLocalStorage().getItem(key);
    } catch (error) {
      console.error('[LocalStorage] getItem error:', key, error);
      return null;
    }
  },

  /**
   * Set an item in localStorage
   */
  setItem(key: string, value: string): void {
    try {
      getLocalStorage().setItem(key, value);
    } catch (error) {
      console.error('[LocalStorage] setItem error:', key, error);
    }
  },

  /**
   * Remove an item from localStorage
   */
  removeItem(key: string): void {
    try {
      getLocalStorage().removeItem(key);
    } catch (error) {
      console.error('[LocalStorage] removeItem error:', key, error);
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    try {
      getLocalStorage().clear();
    } catch (error) {
      console.error('[LocalStorage] clear error:', error);
    }
  },
};

/**
 * Hook-like API for localStorage (without React hooks dependency)
 * Use this in your components for a cleaner API
 */
export function useLocalStorage() {
  return LocalStorage;
}

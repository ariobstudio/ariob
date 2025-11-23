/**
 * LocalStorage Module
 *
 * Provides a consistent localStorage API that works in both web and native environments.
 * Automatically initializes the native bridge when needed.
 *
 * Note: In React Native/Expo, localStorage may not be available.
 * Use AsyncStorage or SecureStore instead for those environments.
 */

// Expo SecureStore detection
let ExpoSecureStore: any;
try {
  // Try to load expo-secure-store if available in the environment
  ExpoSecureStore = require('expo-secure-store');
  if (ExpoSecureStore) {
    console.log('[LocalStorage] Loaded Expo SecureStore');
  }
} catch {
  // Not available
}

// Conditionally import native localStorage bridge only in LynxJS environment
(() => {
  try {
    if (typeof globalThis !== 'undefined' &&
        (globalThis as any).lynx !== undefined) {
      require('./gun/native/localStorage');
      console.log('[LocalStorage] Loaded LynxJS native bridge');
    } else if (!ExpoSecureStore) {
      // Only log this if we didn't find SecureStore, to avoid confusion
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

  // Return a dummy storage if not available to prevent crashes
  console.warn('[LocalStorage] localStorage not available, using memory fallback');
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0
  };
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
 * supporting both Synchronous (Web/Lynx) and Asynchronous (Expo SecureStore)
 */
export const LocalStorage = {
  /**
   * Get an item synchronously (Web/Lynx)
   */
  getItemSync(key: string): string | null {
    try {
      return getLocalStorage().getItem(key);
    } catch (error) {
      console.error('[LocalStorage] getItemSync error:', key, error);
      return null;
    }
  },

  /**
   * Set an item synchronously (Web/Lynx)
   */
  setItemSync(key: string, value: string): void {
    try {
      getLocalStorage().setItem(key, value);
    } catch (error) {
      console.error('[LocalStorage] setItemSync error:', key, error);
    }
  },

  /**
   * Remove an item synchronously (Web/Lynx)
   */
  removeItemSync(key: string): void {
    try {
      getLocalStorage().removeItem(key);
    } catch (error) {
      console.error('[LocalStorage] removeItemSync error:', key, error);
    }
  },

  /**
   * Legacy alias for sync getItem
   */
  getItem(key: string): string | null {
    return this.getItemSync(key);
  },

  /**
   * Legacy alias for sync setItem
   */
  setItem(key: string, value: string): void {
    this.setItemSync(key, value);
  },

  /**
   * Legacy alias for sync removeItem
   */
  removeItem(key: string): void {
    this.removeItemSync(key);
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

  // ==========================================================================
  // Async / Secure Methods
  // ==========================================================================

  /**
   * Get an item asynchronously.
   * Prefers Expo SecureStore if available, otherwise falls back to sync storage.
   */
  async getItemAsync(key: string): Promise<string | null> {
    if (ExpoSecureStore) {
      try {
        return await ExpoSecureStore.getItemAsync(key);
      } catch (e) {
        console.warn('[LocalStorage] SecureStore get error, falling back to sync:', e);
      }
    }
    return this.getItemSync(key);
  },

  /**
   * Set an item asynchronously.
   * Prefers Expo SecureStore if available, otherwise falls back to sync storage.
   */
  async setItemAsync(key: string, value: string): Promise<void> {
    if (ExpoSecureStore) {
      try {
        await ExpoSecureStore.setItemAsync(key, value);
        return;
      } catch (e) {
        console.error('[LocalStorage] SecureStore set error:', e);
        // Fallback? Usually if SecureStore fails, we might not want to use insecure storage for sensitive data.
        // But for compatibility, let's fallback or just log.
        // For now, we won't fallback silently for security reasons.
        return;
      }
    }
    this.setItemSync(key, value);
  },

  /**
   * Remove an item asynchronously.
   * Prefers Expo SecureStore if available.
   */
  async removeItemAsync(key: string): Promise<void> {
    if (ExpoSecureStore) {
      try {
        await ExpoSecureStore.deleteItemAsync(key);
        return;
      } catch (e) {
        console.error('[LocalStorage] SecureStore delete error:', e);
      }
    }
    this.removeItemSync(key);
  }
};

/**
 * Hook-like API for localStorage (without React hooks dependency)
 * Use this in your components for a cleaner API
 */
export function useLocalStorage() {
  return LocalStorage;
}

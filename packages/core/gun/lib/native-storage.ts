/**
 * Native Storage Abstraction Layer
 * Provides a unified interface for storage operations using NativeLocalStorageModule
 */

// Type definitions for NativeModules
declare const NativeModules: {
  NativeLocalStorageModule?: {
    setStorageItem(key: string, value: string): void;
    getStorageItem(key: string): string | null;
    clearStorage(): void;
  };
};

// Storage interface
export interface IStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// Native storage implementation
class NativeStorage implements IStorage {
  private getModule() {
    if (typeof NativeModules !== 'undefined' && NativeModules.NativeLocalStorageModule) {
      return NativeModules.NativeLocalStorageModule;
    }
    // Fallback to localStorage for development/testing
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
    // Mock storage for environments without any storage
    return {
      items: {} as Record<string, string>,
      getStorageItem: function(key: string) { return this.items[key] || null; },
      setStorageItem: function(key: string, value: string) { this.items[key] = value; },
      clearStorage: function() { this.items = {}; },
      removeItem: function(key: string) { delete this.items[key]; }
    };
  }

  getItem(key: string): string | null {
    const module = this.getModule();
    if ('getStorageItem' in module) {
      return module.getStorageItem(key);
    }
    return module.getItem(key);
  }

  setItem(key: string, value: string): void {
    const module = this.getModule();
    if ('setStorageItem' in module) {
      module.setStorageItem(key, value);
    } else {
      module.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    const module = this.getModule();
    if ('removeItem' in module) {
      module.removeItem(key);
    } else {
      // For NativeLocalStorageModule, we need to implement removeItem manually
      // by setting an empty value or using clearStorage for specific keys
      this.setItem(key, '');
    }
  }

  clear(): void {
    const module = this.getModule();
    if ('clearStorage' in module) {
      module.clearStorage();
    } else {
      module.clear();
    }
  }
}

// Export singleton instance
export const nativeStorage = new NativeStorage();

// Utility functions for common storage operations
export const storage = {
  // Get and parse JSON data
  getJSON<T>(key: string, defaultValue: T): T {
    try {
      const item = nativeStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to parse JSON from storage key "${key}":`, error);
      return defaultValue;
    }
  },

  // Set JSON data
  setJSON(key: string, value: any): void {
    try {
      nativeStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to store JSON for key "${key}":`, error);
    }
  },

  // Get string data
  getString(key: string, defaultValue?: string): string | null {
    return nativeStorage.getItem(key) || defaultValue || null;
  },

  // Set string data
  setString(key: string, value: string): void {
    nativeStorage.setItem(key, value);
  },

  // Remove item
  remove(key: string): void {
    nativeStorage.removeItem(key);
  },

  // Clear all storage
  clear(): void {
    nativeStorage.clear();
  }
}; 
/**
 * Platform-agnostic storage interface
 * Single responsibility: abstract storage operations
 * One-word nouns and verbs following UNIX philosophy
 */

/**
 * Storage interface for key-value storage
 * Abstracts platform differences (Web vs React Native)
 */
export interface Storage {
  /**
   * Get value by key
   * @param key - Storage key
   * @returns Value or null if not found
   */
  get(key: string): Promise<string | null>;

  /**
   * Set value by key
   * @param key - Storage key
   * @param value - Value to store
   */
  set(key: string, value: string): Promise<void>;

  /**
   * Remove value by key
   * @param key - Storage key
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all storage
   */
  clear(): Promise<void>;
}

/**
 * Web implementation using localStorage
 *
 * @example
 * ```typescript
 * const store = new Web();
 * await store.set('key', 'value');
 * const value = await store.get('key');
 * ```
 */
export class Web implements Storage {
  async get(key: string): Promise<string | null> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  }

  async remove(key: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  }
}

/**
 * Native implementation for React Native
 * Uses NativeLocalStorageModule from native bridge
 *
 * @example
 * ```typescript
 * const store = new Native();
 * await store.set('key', 'value');
 * const value = await store.get('key');
 * ```
 */
export class Native implements Storage {
  private get module() {
    if (typeof globalThis === 'undefined') return null;
    return (globalThis as any).NativeModules?.NativeLocalStorageModule || null;
  }

  async get(key: string): Promise<string | null> {
    if (!this.module) return null;
    try {
      return await this.module.getStorageItem(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    if (!this.module) return;
    try {
      await this.module.setStorageItem(key, value);
    } catch {
      // Silent failure - storage not available
    }
  }

  async remove(key: string): Promise<void> {
    if (!this.module) return;
    try {
      await this.module.setStorageItem(key, '');
    } catch {
      // Silent failure - storage not available
    }
  }

  async clear(): Promise<void> {
    if (!this.module) return;
    // Native implementation would need to support this
    // For now, this is a no-op
  }
}

/**
 * Factory function to create appropriate storage implementation
 * Automatically detects platform (Web vs React Native)
 *
 * @example
 * ```typescript
 * const store = storage();
 * await store.set('user', JSON.stringify(userData));
 * const data = await store.get('user');
 * ```
 *
 * @returns Storage implementation for current platform
 */
export const storage = (): Storage => {
  // Check for browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return new Web();
  }

  // Check for React Native environment
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as any).NativeModules?.NativeLocalStorageModule
  ) {
    return new Native();
  }

  // Default to Web (will be no-op if localStorage unavailable)
  return new Web();
};

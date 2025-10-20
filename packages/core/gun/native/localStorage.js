/**
 * Native localStorage Bridge for LynxJS
 *
 * Polyfills global.localStorage by bridging to NativeLocalStorageModule.
 *
 * CRITICAL: This MUST run in the background thread where NativeModules is available.
 */

(() => {
  'background only'; // ← MTS: This MUST run in background thread

  console.log('[localStorage Bridge] Initializing...');

  // Get reference to native localStorage module
  const native = NativeModules?.NativeLocalStorageModule;

  if (!native) {
    console.error(
      '[localStorage Bridge] ✗ NativeLocalStorageModule not available!',
      '\n  typeof NativeModules:',
      typeof NativeModules
    );
    return;
  }

  console.log('[localStorage Bridge] ✓ NativeLocalStorageModule found');

  // Polyfill global.localStorage with native bridge
  global.localStorage = {
    /**
     * Store an item in native storage
     * @param {string} key - Storage key
     * @param {string} value - Value to store
     */
    setItem(key, value) {
      console.log(
        '[localStorage Bridge] setItem:',
        key,
        '=',
        value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : 'null'
      );
      try {
        native.setStorageItem(key, value);
        console.log('[localStorage Bridge] ✓ setItem succeeded:', key);
      } catch (e) {
        console.error('[localStorage Bridge] ✗ setItem failed:', key, e);
      }
    },

    /**
     * Retrieve an item from native storage (synchronous)
     * @param {string} key - Storage key
     * @returns {string|null} - Stored value or null
     */
    getItem(key) {
      try {
        const value = native.getStorageItem(key);
        if (value !== null && value !== undefined) {
          console.log(
            '[localStorage Bridge] getItem:',
            key,
            '=',
            value.length > 100 ? value.substring(0, 100) + '...' : value
          );
          return value;
        } else {
          console.log('[localStorage Bridge] getItem:', key, '= null (not found)');
          return null;
        }
      } catch (e) {
        console.error('[localStorage Bridge] ✗ getItem failed:', key, e);
        return null;
      }
    },

    /**
     * Remove an item from native storage
     * @param {string} key - Storage key
     */
    removeItem(key) {
      console.log('[localStorage Bridge] removeItem:', key);
      try {
        // Set to empty string to remove (native implementation detail)
        native.setStorageItem(key, '');
        console.log('[localStorage Bridge] ✓ removeItem succeeded:', key);
      } catch (e) {
        console.error('[localStorage Bridge] ✗ removeItem failed:', key, e);
      }
    },

    /**
     * Clear all storage
     */
    clear() {
      console.log('[localStorage Bridge] clear()');
      try {
        native.clearStorage();
        console.log('[localStorage Bridge] ✓ clear succeeded');
      } catch (e) {
        console.error('[localStorage Bridge] ✗ clear failed:', e);
      }
    },
  };

  console.log('[localStorage Bridge] ✓ localStorage polyfill installed');
  console.log('[localStorage Bridge] typeof global.localStorage:', typeof global.localStorage);
})();

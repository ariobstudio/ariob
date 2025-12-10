/**
 * WebCrypto Bridge - Expo/Web Only
 *
 * Provides WebCrypto API for GUN/SEA in Expo and Web environments.
 * - Web: Uses native browser crypto.subtle
 * - Expo: Uses @ariob/webcrypto native module
 */

(() => {
  /** Check if browser crypto is available */
  function hasWebCrypto() {
    try {
      return typeof globalThis?.crypto?.subtle !== 'undefined';
    } catch {
      return false;
    }
  }

  /** Check if @ariob/webcrypto is available (Expo) */
  function hasExpoCrypto() {
    if (typeof require === 'undefined') return false;
    try {
      return require('@ariob/webcrypto') != null;
    } catch {
      return false;
    }
  }

  /** Add randomBytes shim for SEA compatibility */
  function addRandomBytesShim() {
    if (globalThis.crypto && !globalThis.crypto.randomBytes) {
      globalThis.crypto.randomBytes = (size) => {
        const buf = new Uint8Array(size);
        globalThis.crypto.getRandomValues(buf);
        return buf;
      };
    }
  }

  // Initialize crypto bridge
  if (hasWebCrypto()) {
    // Web environment - use native crypto
    addRandomBytesShim();
  } else if (hasExpoCrypto()) {
    // Expo environment - load bridge
    require('./crypto.expo.js');
  } else {
    console.warn('[crypto] No WebCrypto available');
  }

  // Export for debugging
  if (typeof module !== 'undefined') {
    module.exports = {
      environment: hasWebCrypto() ? 'web' : hasExpoCrypto() ? 'expo' : 'none',
      ready: hasWebCrypto() || hasExpoCrypto(),
    };
  }
})();

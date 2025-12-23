/**
 * WebCrypto Bridge - Expo/Web
 *
 * Provides WebCrypto API for GUN/SEA.
 * - Web: Uses native browser crypto.subtle
 * - Expo: Uses @ariob/webcrypto native module
 */

(() => {
  const LOG_PREFIX = '[Crypto]';

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

  // Check if browser crypto is already available
  if (typeof globalThis?.crypto?.subtle !== 'undefined') {
    console.log(LOG_PREFIX, '✓ Using browser WebCrypto');
    addRandomBytesShim();
    return;
  }

  // Expo environment - load @ariob/webcrypto
  console.log(LOG_PREFIX, 'Loading @ariob/webcrypto...');
  try {
    const mod = require('@ariob/webcrypto');
    console.log(LOG_PREFIX, 'Module loaded:', Object.keys(mod || {}));

    const { crypto } = mod;
    console.log(LOG_PREFIX, 'crypto object:', crypto ? 'exists' : 'undefined');
    console.log(LOG_PREFIX, 'crypto.subtle:', crypto?.subtle ? 'exists' : 'undefined');
    console.log(LOG_PREFIX, 'crypto.getRandomValues:', typeof crypto?.getRandomValues);

    if (!crypto?.subtle) {
      throw new Error('crypto.subtle not available');
    }

    globalThis.crypto = crypto;
    addRandomBytesShim();
    console.log(LOG_PREFIX, '✓ Ready');
  } catch (e) {
    console.error(LOG_PREFIX, '✗ Failed:', e.message);
    console.error(LOG_PREFIX, 'Stack:', e.stack);
  }
})();

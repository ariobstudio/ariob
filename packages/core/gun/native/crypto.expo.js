/**
 * WebCrypto Bridge for Expo/React Native
 *
 * This module loads the complete WebCrypto API from @ariob/webcrypto and
 * assigns it to globalThis.crypto for use with Gun.js SEA.
 *
 * ARCHITECTURE:
 * - @ariob/webcrypto: Exports complete crypto object with full WebCrypto API
 * - This file: Simply imports and assigns to globalThis
 *
 * USAGE:
 * This module is automatically loaded by crypto.js when running in Expo/React Native.
 * No manual imports needed in application code.
 *
 * @example
 * import '@ariob/core'; // crypto is automatically available
 * const hash = await crypto.subtle.digest('SHA-256', data);
 */

(() => {
  try {
    // Import the complete crypto object from @ariob/webcrypto
    const { crypto } = require('@ariob/webcrypto');

    if (!crypto) {
      throw new Error('@ariob/webcrypto loaded but crypto object is undefined');
    }

    // Validate that crypto has the required API
    if (!crypto.subtle) {
      throw new Error('@ariob/webcrypto.crypto missing subtle property');
    }

    if (!crypto.getRandomValues) {
      throw new Error('@ariob/webcrypto.crypto missing getRandomValues property');
    }

    // Add Node.js crypto.randomBytes compatibility shim for SEA
    if (!crypto.randomBytes) {
      crypto.randomBytes = function(size) {
        const buffer = new Uint8Array(size);
        crypto.getRandomValues(buffer);
        return buffer;
      };
    }

    // Assign to globalThis
    globalThis.crypto = crypto;
  } catch (error) {
    throw error;
  }
})();

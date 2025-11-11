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
  console.log('[WebCrypto Expo Bridge] Loading @ariob/webcrypto...');

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

    console.log('[WebCrypto Expo Bridge] ✓ Successfully loaded @ariob/webcrypto');
    console.log('[WebCrypto Expo Bridge] ✓ crypto.subtle available:', !!crypto.subtle);
    console.log('[WebCrypto Expo Bridge] ✓ crypto.getRandomValues available:', !!crypto.getRandomValues);
    console.log('[WebCrypto Expo Bridge] ✓ crypto.randomBytes shim added:', !!crypto.randomBytes);
  } catch (error) {
    console.error('[WebCrypto Expo Bridge] ✗ Failed to load @ariob/webcrypto:', error.message);
    console.error('[WebCrypto Expo Bridge] Ensure the package is installed:');
    console.error('[WebCrypto Expo Bridge]   npm install @ariob/webcrypto');
    console.error('[WebCrypto Expo Bridge]   npx pod-install  # iOS only');
    throw error;
  }
})();

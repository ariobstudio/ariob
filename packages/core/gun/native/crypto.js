/**
 * WebCrypto Bridge - Environment-Aware Auto-Detection Loader
 *
 * This module provides a factory-based approach to loading the appropriate crypto
 * bridge based on the runtime environment. It follows clean architecture principles
 * with separation of concerns between detection, initialization, and error handling.
 *
 * ARCHITECTURE:
 * - Detection Layer: Identifies runtime environment (LynxJS, Expo, Web)
 * - Factory Layer: Loads appropriate bridge implementation
 * - Error Handling: Provides graceful degradation and clear diagnostics
 *
 * SUPPORTED ENVIRONMENTS:
 * - LynxJS: Uses crypto.lynx.js with NativeModules.NativeWebCryptoModule
 * - Expo/React Native: Uses crypto.expo.js with @ariob/webcrypto
 * - Web/Browser: Uses native browser WebCrypto API
 * - Fallback: Provides clear error messages when crypto is unavailable
 *
 * USAGE:
 * ```javascript
 * import '@ariob/core/gun/native/crypto';
 * // Crypto bridge is automatically configured on globalThis.crypto
 * ```
 *
 * DEBUGGING:
 * Access environment information via module.exports:
 * ```javascript
 * const { environment, initialized, bridge } = require('@ariob/core/gun/native/crypto');
 * console.log(`Environment: ${environment}, Initialized: ${initialized}`);
 * ```
 */

(() => {
  // ============================================================================
  // Environment Detection
  // ============================================================================

  /**
   * Detects whether code is running in LynxJS environment.
   *
   * LynxJS provides NativeModules with NativeWebCryptoModule for crypto operations.
   * This is the most specific environment check and should be performed first.
   *
   * @returns {boolean} True if LynxJS environment detected
   */
  function isLynxEnvironment() {
    try {
      return typeof NativeModules !== 'undefined' &&
             NativeModules.NativeWebCryptoModule !== undefined &&
             NativeModules.NativeWebCryptoModule !== null;
    } catch (e) {
      return false;
    }
  }

  /**
   * Detects whether @ariob/webcrypto module is available (Expo/React Native).
   *
   * Attempts to require the @ariob/webcrypto module without throwing errors.
   * This indicates an Expo or React Native environment with crypto support.
   *
   * @returns {boolean} True if @ariob/webcrypto module is available
   */
  function isExpoEnvironment() {
    if (typeof require !== 'undefined') {
      try {
        const webcryptoModule = require('@ariob/webcrypto');
        return webcryptoModule !== null && webcryptoModule !== undefined;
      } catch (e) {
        // Module not found or load error
        return false;
      }
    }
    return false;
  }

  /**
   * Detects whether native browser WebCrypto API is available.
   *
   * Checks for globalThis.crypto.subtle which is the standard WebCrypto API
   * available in modern browsers and some Node.js versions.
   *
   * @returns {boolean} True if browser crypto API is available
   */
  function isWebEnvironment() {
    try {
      return typeof globalThis !== 'undefined' &&
             typeof globalThis.crypto !== 'undefined' &&
             typeof globalThis.crypto.subtle !== 'undefined' &&
             globalThis.crypto.subtle !== null;
    } catch (e) {
      return false;
    }
  }

  // ============================================================================
  // Bridge Loading
  // ============================================================================

  /**
   * Loads the LynxJS crypto bridge.
   *
   * Requires and initializes crypto.lynx.js which provides a comprehensive
   * WebCrypto polyfill with native LynxJS module integration.
   *
   * @returns {{success: boolean, bridge: any, error: Error|null}}
   */
  function loadLynxBridge() {
    try {
      const bridge = require('./crypto.lynx.js');
      console.log('[WebCrypto Bridge] ✓ Loaded LynxJS polyfill');
      return { success: true, bridge, error: null };
    } catch (e) {
      console.error('[WebCrypto Bridge] ✗ Failed to load LynxJS polyfill:', e.message);
      return { success: false, bridge: null, error: e };
    }
  }

  /**
   * Loads the Expo/React Native crypto bridge.
   *
   * Requires and initializes crypto.expo.js which provides a lightweight
   * bridge to the @ariob/webcrypto native module.
   *
   * @returns {{success: boolean, bridge: any, error: Error|null}}
   */
  function loadExpoBridge() {
    try {
      const bridge = require('./crypto.expo.js');
      console.log('[WebCrypto Bridge] ✓ Loaded Expo bridge');
      return { success: true, bridge, error: null };
    } catch (e) {
      console.error('[WebCrypto Bridge] ✗ Failed to load Expo bridge:', e.message);
      return { success: false, bridge: null, error: e };
    }
  }

  /**
   * Validates that browser crypto is properly initialized.
   *
   * Ensures that the native browser crypto API has all required methods.
   * This is a sanity check for web environments.
   *
   * @returns {{success: boolean, error: Error|null}}
   */
  function validateWebCrypto() {
    try {
      const requiredMethods = [
        'digest',
        'generateKey',
        'importKey',
        'exportKey',
        'sign',
        'verify',
        'encrypt',
        'decrypt'
      ];

      const missingMethods = requiredMethods.filter(
        method => typeof globalThis.crypto.subtle[method] !== 'function'
      );

      if (missingMethods.length > 0) {
        throw new Error(`Browser crypto missing methods: ${missingMethods.join(', ')}`);
      }

      // Add Node.js crypto.randomBytes compatibility shim for SEA
      if (!globalThis.crypto.randomBytes) {
        globalThis.crypto.randomBytes = function(size) {
          const buffer = new Uint8Array(size);
          globalThis.crypto.getRandomValues(buffer);
          return buffer;
        };
        console.log('[WebCrypto Bridge] ✓ Added crypto.randomBytes shim');
      }

      console.log('[WebCrypto Bridge] ✓ Using native browser WebCrypto API');
      return { success: true, error: null };
    } catch (e) {
      console.error('[WebCrypto Bridge] ✗ Browser crypto validation failed:', e.message);
      return { success: false, error: e };
    }
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Main initialization function that detects environment and loads appropriate bridge.
   *
   * This follows the factory pattern, selecting the appropriate bridge based on
   * environment detection results. Order matters: LynxJS is most specific, then Web
   * (to prefer native browser crypto in Expo Web), then Expo/React Native fallback.
   *
   * @returns {{environment: string, initialized: boolean, bridge: any, error: Error|null}}
   */
  function initializeCryptoBridge() {
    console.log('[WebCrypto Bridge] Starting environment detection...');

    // Priority 1: LynxJS (most specific)
    if (isLynxEnvironment()) {
      console.log('[WebCrypto Bridge] Detected LynxJS environment');
      const result = loadLynxBridge();
      return {
        environment: 'lynx',
        initialized: result.success,
        bridge: result.bridge,
        error: result.error
      };
    }

    // Priority 2: Web/Browser (prefer native browser crypto when available)
    // This must come before Expo check because Expo Web has both browser crypto
    // AND @ariob/webcrypto available, but we should use native browser crypto
    if (isWebEnvironment()) {
      console.log('[WebCrypto Bridge] Detected Web/Browser environment');
      const result = validateWebCrypto();
      return {
        environment: 'web',
        initialized: result.success,
        bridge: 'native-browser',
        error: result.error
      };
    }

    // Priority 3: Expo/React Native (fallback for native mobile apps)
    if (isExpoEnvironment()) {
      console.log('[WebCrypto Bridge] Detected Expo/React Native environment');
      const result = loadExpoBridge();
      return {
        environment: 'expo',
        initialized: result.success,
        bridge: result.bridge,
        error: result.error
      };
    }

    // Fallback: No crypto available
    console.warn('[WebCrypto Bridge] ⚠ No crypto implementation available');
    console.warn('[WebCrypto Bridge] For Expo/React Native, install: @ariob/webcrypto');
    console.warn('[WebCrypto Bridge] For LynxJS, ensure NativeWebCryptoModule is configured');

    return {
      environment: 'none',
      initialized: false,
      bridge: null,
      error: new Error('No crypto implementation available in this environment')
    };
  }

  // ============================================================================
  // Execute Initialization
  // ============================================================================

  const initResult = initializeCryptoBridge();

  // Log final status
  console.log('[WebCrypto Bridge] Environment:', initResult.environment);
  console.log('[WebCrypto Bridge] Initialized:', initResult.initialized);

  if (initResult.error) {
    console.error('[WebCrypto Bridge] Error:', initResult.error.message);
  }

  // ============================================================================
  // Module Exports (for debugging and testing)
  // ============================================================================

  /**
   * Export environment information and utilities.
   *
   * This provides external access to environment detection results and
   * allows for debugging and testing of the bridge initialization.
   */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      /**
       * The detected environment type.
       * @type {'lynx'|'expo'|'web'|'none'}
       */
      environment: initResult.environment,

      /**
       * Whether crypto bridge was successfully initialized.
       * @type {boolean}
       */
      initialized: initResult.initialized,

      /**
       * Reference to the loaded bridge (or 'native-browser' for web).
       * @type {any}
       */
      bridge: initResult.bridge,

      /**
       * Any error that occurred during initialization.
       * @type {Error|null}
       */
      error: initResult.error,

      /**
       * Detection utilities (exposed for testing).
       */
      _internal: {
        isLynxEnvironment,
        isExpoEnvironment,
        isWebEnvironment
      }
    };
  }
})();

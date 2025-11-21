/**
 * LynxJS Environment Detection
 *
 * Utilities for detecting and loading LynxJS-specific native bridges.
 * This module is only used when running in a LynxJS environment.
 */

/**
 * Check if code is running in LynxJS environment
 *
 * @returns True if in LynxJS environment, false otherwise
 *
 * @example
 * ```typescript
 * if (isLynxJS()) {
 *   // Load Lynx-specific modules
 * }
 * ```
 */
export function isLynxJS(): boolean {
  return typeof globalThis !== 'undefined' &&
         (globalThis as any).lynx !== undefined;
}

/**
 * Load LynxJS-specific native bridges
 *
 * Conditionally loads WebSocket and localStorage bridges only in LynxJS environment.
 * React Native/Expo have built-in WebSocket and don't use synchronous localStorage.
 *
 * @example
 * ```typescript
 * // In your initialization code
 * loadLynxBridges();
 * ```
 */
export function loadLynxBridges(): void {
  try {
    if (isLynxJS()) {
      // Only import these in LynxJS environment
      require('../gun/native/websocket.js');
      require('../gun/native/localStorage.js');
      console.log('[Lynx] Loaded LynxJS native bridges');
    } else {
      console.log('[Lynx] Skipping LynxJS native bridges (not in Lynx environment)');
    }
  } catch (e) {
    console.warn('[Lynx] Could not load Lynx native bridges:', e);
  }
}

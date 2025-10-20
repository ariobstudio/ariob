/**
 * Internal Utility Helpers
 *
 * Internal utilities for debouncing, validation, and other
 * common operations used throughout the Gun wrapper.
 *
 * Note: Cryptography functions have been moved to utils/crypto.ts
 * to ensure they are lazy-loaded and only run on the background thread.
 */

/**
 * Creates a debounced version of a function that delays execution until
 * after the specified wait time has elapsed since the last call.
 *
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```typescript
 * const debouncedSave = debounce((data) => {
 *   console.log('Saving:', data);
 * }, 500);
 *
 * debouncedSave('test'); // Will only execute after 500ms of no calls
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      func(...args);
    }, wait);
  };
}

/**
 * Validates that a node ID is a non-empty string.
 *
 * @param nodeID - Node ID to validate
 * @throws Error if node ID is invalid
 *
 * @example
 * ```typescript
 * validateNodeID('users/alice'); // OK
 * validateNodeID(''); // Throws error
 * validateNodeID(null); // Throws error
 * ```
 */
export function validateNodeID(nodeID: string): void {
  if (!nodeID || typeof nodeID !== 'string') {
    throw new Error('Invalid node ID: must be a non-empty string');
  }

  if (nodeID.trim() === '') {
    throw new Error('Invalid node ID: cannot be empty or whitespace');
  }
}

/**
 * Safely stringifies data, handling circular references and errors.
 *
 * @param data - Data to stringify
 * @returns Stringified data or error message
 *
 * @internal
 */
export function safeStringify(data: any): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    return '[Circular or Invalid Data]';
  }
}

/**
 * Creates a safe reducer function that only executes if the component is still mounted.
 *
 * @param isMounted - Ref or function that returns mount status
 * @param reducer - Reducer function to execute
 * @returns Safe reducer that checks mount status
 *
 * @internal
 */
export function createSafeReducer<T>(
  isMounted: () => boolean,
  reducer: (state: T) => T
): (state: T) => T {
  return (state: T) => {
    if (!isMounted()) {
      return state;
    }
    return reducer(state);
  };
}

/**
 * Generates a unique ID using timestamp and random value.
 *
 * @returns Unique ID string
 *
 * @internal
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep equality check for objects and arrays.
 *
 * @param a - First value
 * @param b - Second value
 * @returns True if values are deeply equal
 *
 * @internal
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => deepEqual(a[key], b[key]));
  }

  return false;
}

/**
 * Internal Utility Helpers
 *
 * Internal utilities for encryption, debouncing, validation, and other
 * common operations used throughout the Gun wrapper.
 */

import SEA from '../gun/lib/sea.js';
import type { KeyPair } from '../gun/graph';
import { Result } from './result';


/**
 * Encrypts data using SEA encryption with optional key pair.
 *
 * @param data - Data to encrypt
 * @param keys - Optional key pair for encryption (uses epriv key)
 * @returns Encrypted data or original data if no keys provided
 *
 * @example
 * ```typescript
 * const encrypted = await encryptData({ secret: 'value' }, userKeys);
 * ```
 */
export async function encryptData(data: any, keys?: KeyPair): Promise<any> {
  if (!keys) {
    return data;
  }

  try {
    const encrypted = await SEA.encrypt(data, keys.epriv);
    return encrypted;
  } catch (error) {
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data using SEA decryption with optional key pair.
 *
 * @param data - Data to decrypt
 * @param keys - Optional key pair for decryption (uses epriv key)
 * @returns Decrypted data or original data if no keys provided or data is not encrypted
 *
 * @example
 * ```typescript
 * const decrypted = await decryptData(encryptedValue, userKeys);
 * ```
 */
export async function decryptData(data: any, keys?: KeyPair): Promise<any> {
  if (!keys || !data) {
    return data;
  }

  // Check if data looks like encrypted SEA data
  if (typeof data === 'string' && data.startsWith('SEA{')) {
    try {
      const decrypted = await SEA.decrypt(data, keys.epriv);
      return decrypted !== undefined ? decrypted : data;
    } catch (error) {
      // If decryption fails, return original data
      return data;
    }
  }

  return data;
}

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
 * Checks if data appears to be encrypted SEA data.
 *
 * @param data - Data to check
 * @returns True if data looks like encrypted SEA format
 *
 * @internal
 */
export function isEncrypted(data: any): boolean {
  return typeof data === 'string' && data.startsWith('SEA{');
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

// ============================================================================
// SEA Cryptography Helpers (Result-based API)
// ============================================================================

/**
 * Encrypts data using SEA encryption.
 *
 * @param data - Data to encrypt
 * @param keys - Key pair for encryption (uses epriv key)
 * @returns Result containing encrypted data or error
 *
 * @example
 * ```typescript
 * const result = await encrypt({ secret: 'value' }, userKeys);
 * if (result.ok) {
 *   console.log('Encrypted:', result.value);
 * }
 * ```
 */
export async function encrypt(data: any, keys: KeyPair): Promise<Result<any, Error>> {
  try {
    const encrypted = await SEA.encrypt(data, keys.epriv);
    if (encrypted === undefined) {
      return Result.error(new Error('Encryption failed: returned undefined'));
    }
    return Result.ok(encrypted);
  } catch (error) {
    return Result.error(error instanceof Error ? error : new Error('Encryption failed'));
  }
}

/**
 * Decrypts data using SEA decryption.
 *
 * @param data - Data to decrypt
 * @param keys - Key pair for decryption (uses epriv key)
 * @returns Result containing decrypted data or error
 *
 * @example
 * ```typescript
 * const result = await decrypt(encryptedData, userKeys);
 * if (result.ok) {
 *   console.log('Decrypted:', result.value);
 * }
 * ```
 */
export async function decrypt(data: any, keys: KeyPair): Promise<Result<any, Error>> {
  try {
    const decrypted = await SEA.decrypt(data, keys.epriv);
    if (decrypted === undefined) {
      return Result.error(new Error('Decryption failed: returned undefined'));
    }
    return Result.ok(decrypted);
  } catch (error) {
    return Result.error(error instanceof Error ? error : new Error('Decryption failed'));
  }
}

/**
 * Performs proof of work hashing using SEA.work.
 *
 * @param data - Data to hash
 * @param salt - Optional salt for hashing
 * @returns Result containing hash string or error
 *
 * @example
 * ```typescript
 * const result = await work('password123', 'optional-salt');
 * if (result.ok) {
 *   console.log('Hash:', result.value);
 * }
 * ```
 */
export async function work(data: any, salt?: string): Promise<Result<string, Error>> {
  try {
    const hash = await SEA.work(data, salt);
    if (typeof hash !== 'string') {
      return Result.error(new Error('Work failed: returned non-string value'));
    }
    return Result.ok(hash);
  } catch (error) {
    return Result.error(error instanceof Error ? error : new Error('Work failed'));
  }
}

/**
 * Generates a shared secret using ECDH (Elliptic Curve Diffie-Hellman).
 *
 * @param theirEpub - Their public encryption key
 * @param myPair - Your key pair (uses epriv key)
 * @returns Result containing shared secret or error
 *
 * @example
 * ```typescript
 * const result = await secret(theirPublicKey, myKeys);
 * if (result.ok) {
 *   console.log('Shared secret:', result.value);
 * }
 * ```
 */
export async function secret(theirEpub: string, myPair: KeyPair): Promise<Result<string, Error>> {
  try {
    const sharedSecret = await SEA.secret(theirEpub, myPair);
    if (typeof sharedSecret !== 'string') {
      return Result.error(new Error('Secret generation failed: returned non-string value'));
    }
    return Result.ok(sharedSecret);
  } catch (error) {
    return Result.error(error instanceof Error ? error : new Error('Secret generation failed'));
  }
}

/**
 * Signs data using SEA.sign with a key pair.
 *
 * @param data - Data to sign
 * @param pair - Key pair for signing (uses priv key)
 * @returns Result containing signed data or error
 *
 * @example
 * ```typescript
 * const result = await sign({ message: 'hello' }, userKeys);
 * if (result.ok) {
 *   console.log('Signature:', result.value);
 * }
 * ```
 */
export async function sign(data: any, pair: KeyPair): Promise<Result<any, Error>> {
  try {
    const signature = await SEA.sign(data, pair);
    if (signature === undefined) {
      return Result.error(new Error('Signing failed: returned undefined'));
    }
    return Result.ok(signature);
  } catch (error) {
    return Result.error(error instanceof Error ? error : new Error('Signing failed'));
  }
}

/**
 * Verifies a signature using SEA.verify.
 *
 * @param signature - Signed data to verify
 * @param pub - Public key or key pair for verification
 * @returns Result containing verified data or error
 *
 * @example
 * ```typescript
 * const result = await verify(signedData, publicKey);
 * if (result.ok) {
 *   console.log('Verified data:', result.value);
 * }
 * ```
 */
export async function verify(signature: any, pub: string | KeyPair): Promise<Result<any, Error>> {
  try {
    const verified = await SEA.verify(signature, pub);
    // verify returns the original data if valid, or false/undefined if invalid
    if (verified === false || verified === undefined) {
      return Result.error(new Error('Verification failed: signature is invalid'));
    }
    return Result.ok(verified);
  } catch (error) {
    return Result.error(error instanceof Error ? error : new Error('Verification failed'));
  }
}

/**
 * Generates a new cryptographic key pair using SEA.pair.
 *
 * @returns Result containing key pair or error
 *
 * @example
 * ```typescript
 * const result = await pair();
 * if (result.ok) {
 *   console.log('New key pair:', result.value);
 *   // { pub, priv, epub, epriv }
 * }
 * ```
 */
export async function pair(): Promise<Result<KeyPair, Error>> {
  try {
    const keyPair = await SEA.pair();
    if (!keyPair || typeof keyPair !== 'object') {
      return Result.error(new Error('Pair generation failed: returned invalid value'));
    }
    // Validate that all required keys are present
    if (!keyPair.pub || !keyPair.priv || !keyPair.epub || !keyPair.epriv) {
      return Result.error(new Error('Pair generation failed: missing required keys'));
    }
    return Result.ok(keyPair as KeyPair);
  } catch (error) {
    return Result.error(error instanceof Error ? error : new Error('Pair generation failed'));
  }
}

/**
 * Creates a certificate using SEA.certify for selective authorization.
 *
 * @param certificants - Certificate recipients (public keys or patterns)
 * @param policy - Access policy configuration
 * @param authority - Authority key pair for signing the certificate
 * @param cb - Optional callback for certificate result
 * @returns Result containing certificate or error
 *
 * @example
 * ```typescript
 * const result = await certify(
 *   ['*'], // all users
 *   { '+': '*', '.': 'example' }, // can write to 'example' path
 *   authorityKeys
 * );
 * if (result.ok) {
 *   console.log('Certificate:', result.value);
 * }
 * ```
 */
export async function certify(
  certificants: any,
  policy: any,
  authority: KeyPair,
  cb?: any
): Promise<Result<any, Error>> {
  try {
    const certificate = await new Promise((resolve, reject) => {
      SEA.certify(certificants, policy, authority, (cert: any) => {
        if (cb) cb(cert);
        if (cert && cert.err) {
          reject(new Error(cert.err));
        } else {
          resolve(cert);
        }
      });
    });

    if (certificate === undefined) {
      return Result.error(new Error('Certification failed: returned undefined'));
    }
    return Result.ok(certificate);
  } catch (error) {
    return Result.error(error instanceof Error ? error : new Error('Certification failed'));
  }
}

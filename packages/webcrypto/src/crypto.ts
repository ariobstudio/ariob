/**
 * WebCrypto API Implementation for Expo/React Native
 *
 * This module provides a complete W3C WebCrypto API implementation using native
 * cryptography via the @ariob/webcrypto native module. It handles all conversions
 * between JavaScript types and native bridge formats.
 *
 * ARCHITECTURE:
 * - Validation Layer: Input/output validation with clear error messages
 * - Conversion Layer: ArrayBuffer ↔ base64 conversions for bridge safety
 * - API Layer: Complete WebCrypto API (crypto.subtle.*)
 * - Error Handling: Comprehensive error detection and recovery
 *
 * USAGE:
 * ```typescript
 * import { crypto } from '@ariob/webcrypto';
 * const hash = await crypto.subtle.digest('SHA-256', data);
 * ```
 */

import ExpoWebcryptoModule from './ExpoWebcryptoModule';

// ============================================================================
// Input Validation
// ============================================================================

/**
 * Validates that a value is a valid TypedArray or ArrayBuffer.
 */
function validateBinaryData(value: any, paramName: string): void {
  if (
    !(value instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(value)
  ) {
    throw new TypeError(
      `${paramName} must be ArrayBuffer or TypedArray, got ${typeof value}`
    );
  }
}

/**
 * Validates that a value is a non-empty TypedArray.
 */
function validateTypedArray(value: any, paramName: string): void {
  if (!value || !ArrayBuffer.isView(value)) {
    throw new TypeError(`${paramName} must be a TypedArray`);
  }
  if (value.byteLength === 0) {
    throw new Error(`${paramName} cannot be empty`);
  }
}

/**
 * Validates that a value is a valid CryptoKey.
 */
function validateCryptoKey(key: any, paramName: string): void {
  if (!(key instanceof CryptoKey)) {
    throw new TypeError(`${paramName} must be a CryptoKey`);
  }
}

/**
 * Validates algorithm specification.
 */
function validateAlgorithm(algorithm: any, paramName: string): void {
  if (!algorithm) {
    throw new TypeError(`${paramName} is required`);
  }

  const alg = normalizeAlgorithm(algorithm);

  if (!alg.name || typeof alg.name !== 'string') {
    throw new TypeError(`${paramName}.name must be a non-empty string`);
  }
}

// ============================================================================
// Output Validation
// ============================================================================

/**
 * Validates native module response and checks for errors.
 */
function validateNativeResult(result: any, operation: string): any {
  if (result === null || result === undefined) {
    throw new Error(`${operation} failed: Native module returned ${result}`);
  }

  if (result.error) {
    throw new Error(`${operation} failed: ${result.error}`);
  }

  // Check for error string patterns
  if (typeof result === 'string') {
    const errorPatterns = ['error', 'Error', 'failed', 'Failed', 'invalid', 'Invalid', 'bad', 'Bad'];
    const hasError = errorPatterns.some(pattern => result.includes(pattern));

    if (hasError) {
      throw new Error(`${operation} failed: ${result}`);
    }
  }

  return result;
}

/**
 * Validates that a string is valid base64.
 */
function validateBase64(value: string, paramName: string): void {
  if (typeof value !== 'string') {
    throw new TypeError(`${paramName} must be a string, got ${typeof value}`);
  }

  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;

  if (!base64Pattern.test(value)) {
    throw new Error(`${paramName} is not valid base64`);
  }
}

// ============================================================================
// Type Conversion Utilities
// ============================================================================

/**
 * Converts ArrayBuffer or TypedArray to base64 string.
 */
function arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferView): string {
  validateBinaryData(buffer, 'buffer');

  let uint8Array: Uint8Array;
  if (buffer instanceof ArrayBuffer) {
    uint8Array = new Uint8Array(buffer);
  } else if (ArrayBuffer.isView(buffer)) {
    uint8Array = buffer instanceof Uint8Array
      ? buffer
      : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else {
    throw new TypeError('Expected ArrayBuffer or TypedArray');
  }

  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }

  return btoa(binary);
}

/**
 * Converts base64 string to ArrayBuffer.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  validateBase64(base64, 'base64');

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

// ============================================================================
// Algorithm Processing
// ============================================================================

/**
 * Normalizes algorithm specification to object format.
 */
function normalizeAlgorithm(algorithm: string | object): any {
  if (typeof algorithm === 'string') {
    return { name: algorithm };
  }
  if (typeof algorithm === 'object' && algorithm !== null) {
    return { ...algorithm };
  }
  throw new TypeError('Algorithm must be a string or object');
}

/**
 * Prepares algorithm for native module by converting binary parameters.
 */
function prepareAlgorithm(algorithm: any): any {
  const alg = normalizeAlgorithm(algorithm);

  if (alg.hash) {
    alg.hash = normalizeAlgorithm(alg.hash);
  }

  if (alg.public && alg.public instanceof CryptoKey) {
    alg.public = alg.public._handle;
  }

  const binaryParams = ['iv', 'additionalData', 'counter', 'salt', 'info'];
  for (const param of binaryParams) {
    if (alg[param]) {
      try {
        validateBinaryData(alg[param], `algorithm.${param}`);
        alg[param] = arrayBufferToBase64(alg[param]);
      } catch (e: any) {
        throw new Error(`Invalid algorithm.${param}: ${e.message}`);
      }
    }
  }

  return alg;
}

// ============================================================================
// CryptoKey Implementation
// ============================================================================

/**
 * CryptoKey wrapper class conforming to WebCrypto API.
 */
class CryptoKey {
  readonly _handle: string;
  readonly algorithm: any;
  readonly type: string;
  readonly extractable: boolean;
  readonly usages: string[];

  constructor(
    handle: string,
    algorithm: any,
    type: string,
    extractable: boolean,
    usages: string[]
  ) {
    this._handle = handle;
    this.algorithm = algorithm;
    this.type = type;
    this.extractable = extractable;
    this.usages = usages;
  }
}

function createCryptoKey(
  handle: string,
  algorithm: any,
  type: string,
  extractable: boolean,
  usages: string[]
): CryptoKey {
  if (typeof handle !== 'string' || handle.length === 0) {
    throw new Error('Invalid key handle');
  }

  return new CryptoKey(handle, algorithm, type, extractable, usages);
}

function determineKeyType(format: string, keyData: any): string {
  if (format === 'jwk') {
    if (keyData.kty === 'EC') {
      return keyData.d ? 'private' : 'public';
    } else if (keyData.kty === 'oct') {
      return 'secret';
    }
  } else if (format === 'spki') {
    return 'public';
  } else if (format === 'pkcs8') {
    return 'private';
  }
  return 'secret';
}

function extractHandle(key: CryptoKey | string): string {
  if (key instanceof CryptoKey) {
    return key._handle;
  }
  if (typeof key === 'string') {
    return key;
  }
  throw new TypeError('Expected CryptoKey or string handle');
}

// ============================================================================
// SubtleCrypto API Implementation
// ============================================================================

const subtle = {
  /**
   * Computes a cryptographic hash (digest) of data.
   */
  async digest(algorithm: string | object, data: BufferSource): Promise<ArrayBuffer> {
    try {
      validateAlgorithm(algorithm, 'algorithm');
      validateBinaryData(data, 'data');

      const alg = normalizeAlgorithm(algorithm);
      const dataBase64 = arrayBufferToBase64(data as any);

      const hashBase64 = ExpoWebcryptoModule.digest(alg, dataBase64);
      validateNativeResult(hashBase64, 'digest');

      return base64ToArrayBuffer(hashBase64);
    } catch (error: any) {
      throw new Error(`digest operation failed: ${error.message}`);
    }
  },

  /**
   * Generates a new cryptographic key or key pair.
   */
  async generateKey(
    algorithm: any,
    extractable: boolean,
    usages: KeyUsage[]
  ): Promise<CryptoKey | CryptoKeyPair> {
    try {
      validateAlgorithm(algorithm, 'algorithm');

      const alg = prepareAlgorithm(algorithm);
      const usageArray = Array.from(usages || []);

      const result = ExpoWebcryptoModule.generateKey(alg, !!extractable, usageArray);
      validateNativeResult(result, 'generateKey');

      // Handle key pair (ECDSA, ECDH)
      if ('privateKey' in result && 'publicKey' in result && result.privateKey && result.publicKey) {
        const privateKey = createCryptoKey(
          result.privateKey,
          alg,
          'private',
          extractable,
          usageArray.filter(u => ['sign', 'deriveBits', 'deriveKey', 'decrypt', 'unwrapKey'].includes(u))
        );

        const publicKey = createCryptoKey(
          result.publicKey,
          alg,
          'public',
          extractable,
          usageArray.filter(u => ['verify', 'encrypt', 'wrapKey'].includes(u))
        );

        return { privateKey, publicKey };
      }

      // Handle symmetric key (AES-GCM)
      if ('secretKeyHandle' in result && result.secretKeyHandle) {
        return createCryptoKey(
          result.secretKeyHandle,
          alg,
          'secret',
          extractable,
          usageArray
        );
      }

      throw new Error('Unexpected generateKey result format');
    } catch (error: any) {
      throw new Error(`generateKey operation failed: ${error.message}`);
    }
  },

  /**
   * Imports a key from external format.
   */
  async importKey(
    format: KeyFormat,
    keyData: any,
    algorithm: any,
    extractable: boolean,
    usages: KeyUsage[]
  ): Promise<CryptoKey> {
    try {
      validateAlgorithm(algorithm, 'algorithm');

      const alg = prepareAlgorithm(algorithm);
      const usageArray = Array.from(usages || []);

      let param = keyData;

      if (format === 'raw' && (keyData instanceof ArrayBuffer || ArrayBuffer.isView(keyData))) {
        validateBinaryData(keyData, 'keyData');
        param = { raw: arrayBufferToBase64(keyData as any) };
      }

      const handle = ExpoWebcryptoModule.importKey(format as any, param, alg, !!extractable, usageArray);
      validateNativeResult(handle, 'importKey');

      const type = determineKeyType(format, keyData);

      return createCryptoKey(handle, alg, type, extractable, usageArray);
    } catch (error: any) {
      throw new Error(`importKey operation failed: ${error.message}`);
    }
  },

  /**
   * Exports a key to external format.
   */
  async exportKey(format: KeyFormat, key: CryptoKey): Promise<JsonWebKey | ArrayBuffer> {
    try {
      validateCryptoKey(key, 'key');

      if (!key.extractable) {
        throw new Error('Key is not extractable');
      }

      const handle = extractHandle(key);
      const result = ExpoWebcryptoModule.exportKey(format as any, handle);
      validateNativeResult(result, 'exportKey');

      if (format === 'raw') {
        if (!result.raw) {
          throw new Error('Native module did not return raw key data');
        }
        return base64ToArrayBuffer(result.raw);
      } else if (format === 'jwk') {
        const { raw, error, ...jwk } = result;
        return jwk;
      }

      throw new Error(`Unsupported export format: ${format}`);
    } catch (error: any) {
      throw new Error(`exportKey operation failed: ${error.message}`);
    }
  },

  /**
   * Creates a digital signature.
   */
  async sign(algorithm: any, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer> {
    try {
      validateAlgorithm(algorithm, 'algorithm');
      validateCryptoKey(key, 'key');
      validateBinaryData(data, 'data');

      if (key.type !== 'private') {
        throw new Error('Sign operation requires a private key');
      }

      const alg = prepareAlgorithm(algorithm);

      if (alg.name === 'ECDSA') {
        alg.format = 'raw';
      }

      const handle = extractHandle(key);
      const dataBase64 = arrayBufferToBase64(data as any);

      const signatureBase64 = ExpoWebcryptoModule.sign(alg, handle, dataBase64);
      validateNativeResult(signatureBase64, 'sign');

      return base64ToArrayBuffer(signatureBase64);
    } catch (error: any) {
      throw new Error(`sign operation failed: ${error.message}`);
    }
  },

  /**
   * Verifies a digital signature.
   */
  async verify(
    algorithm: any,
    key: CryptoKey,
    signature: BufferSource,
    data: BufferSource
  ): Promise<boolean> {
    try {
      validateAlgorithm(algorithm, 'algorithm');
      validateCryptoKey(key, 'key');
      validateBinaryData(signature, 'signature');
      validateBinaryData(data, 'data');

      if (key.type !== 'public') {
        throw new Error('Verify operation requires a public key');
      }

      const alg = prepareAlgorithm(algorithm);

      if (alg.name === 'ECDSA') {
        alg.format = 'raw';
      }

      const handle = extractHandle(key);
      const signatureBase64 = arrayBufferToBase64(signature as any);
      const dataBase64 = arrayBufferToBase64(data as any);

      const result = ExpoWebcryptoModule.verify(alg, handle, signatureBase64, dataBase64);

      // Native module returns 1 for true, 0 for false
      return Boolean(result);
    } catch (error: any) {
      console.warn('[WebCrypto] Verify failed:', error.message);
      return false;
    }
  },

  /**
   * Encrypts data.
   */
  async encrypt(algorithm: any, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer> {
    try {
      validateAlgorithm(algorithm, 'algorithm');
      validateCryptoKey(key, 'key');
      validateBinaryData(data, 'data');

      if (key.type !== 'secret') {
        throw new Error('Encrypt operation requires a secret key');
      }

      const alg = prepareAlgorithm(algorithm);
      const handle = extractHandle(key);
      const dataBase64 = arrayBufferToBase64(data as any);

      const ciphertextBase64 = ExpoWebcryptoModule.encrypt(alg, handle, dataBase64);
      validateNativeResult(ciphertextBase64, 'encrypt');

      return base64ToArrayBuffer(ciphertextBase64);
    } catch (error: any) {
      throw new Error(`encrypt operation failed: ${error.message}`);
    }
  },

  /**
   * Decrypts data.
   */
  async decrypt(algorithm: any, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer> {
    try {
      validateAlgorithm(algorithm, 'algorithm');
      validateCryptoKey(key, 'key');
      validateBinaryData(data, 'data');

      if (key.type !== 'secret') {
        throw new Error('Decrypt operation requires a secret key');
      }

      const alg = prepareAlgorithm(algorithm);
      const handle = extractHandle(key);
      const dataBase64 = arrayBufferToBase64(data as any);

      const plaintextBase64 = ExpoWebcryptoModule.decrypt(alg, handle, dataBase64);
      validateNativeResult(plaintextBase64, 'decrypt');

      return base64ToArrayBuffer(plaintextBase64);
    } catch (error: any) {
      throw new Error(`decrypt operation failed: ${error.message}`);
    }
  },

  /**
   * Derives raw bits from a base key.
   */
  async deriveBits(algorithm: any, baseKey: CryptoKey, length: number): Promise<ArrayBuffer> {
    try {
      validateAlgorithm(algorithm, 'algorithm');

      if (typeof length !== 'number' || length <= 0) {
        throw new TypeError('length must be a positive number');
      }

      const alg = prepareAlgorithm(algorithm);
      const handle = extractHandle(baseKey);

      const bitsBase64 = ExpoWebcryptoModule.deriveBits(alg, handle, length);
      validateNativeResult(bitsBase64, 'deriveBits');

      return base64ToArrayBuffer(bitsBase64);
    } catch (error: any) {
      throw new Error(`deriveBits operation failed: ${error.message}`);
    }
  },

  /**
   * Derives a key from a base key.
   */
  async deriveKey(
    algorithm: any,
    baseKey: CryptoKey,
    derivedKeyAlgorithm: any,
    extractable: boolean,
    usages: KeyUsage[]
  ): Promise<CryptoKey> {
    try {
      validateAlgorithm(algorithm, 'algorithm');
      validateAlgorithm(derivedKeyAlgorithm, 'derivedKeyAlgorithm');

      const keyLength = derivedKeyAlgorithm.length || 256;

      const bits = await subtle.deriveBits(algorithm, baseKey, keyLength);

      return subtle.importKey('raw', bits, derivedKeyAlgorithm, extractable, usages);
    } catch (error: any) {
      throw new Error(`deriveKey operation failed: ${error.message}`);
    }
  },
};

// ============================================================================
// Crypto API Implementation
// ============================================================================

/**
 * Fills a TypedArray with cryptographically secure random values.
 */
function getRandomValues<T extends ArrayBufferView>(typedArray: T): T {
  try {
    validateTypedArray(typedArray, 'typedArray');

    const length = typedArray.byteLength;

    if (length > 65536) {
      throw new Error('Requested length exceeds 65536 bytes');
    }

    const randomBase64 = ExpoWebcryptoModule.getRandomValues(length);
    validateNativeResult(randomBase64, 'getRandomValues');

    const randomBytes = base64ToArrayBuffer(randomBase64);
    (typedArray as any).set(new Uint8Array(randomBytes));

    return typedArray;
  } catch (error: any) {
    throw new Error(`getRandomValues operation failed: ${error.message}`);
  }
}

/**
 * Generates random bytes (Node.js-style API).
 */
function randomBytes(length: number): Uint8Array {
  try {
    if (typeof length !== 'number' || length <= 0) {
      throw new TypeError('length must be a positive number');
    }

    if (length > 65536) {
      throw new Error('Requested length exceeds 65536 bytes');
    }

    const randomBase64 = ExpoWebcryptoModule.getRandomValues(length);
    validateNativeResult(randomBase64, 'randomBytes');

    const randomBuffer = base64ToArrayBuffer(randomBase64);
    return new Uint8Array(randomBuffer);
  } catch (error: any) {
    throw new Error(`randomBytes operation failed: ${error.message}`);
  }
}

// ============================================================================
// Export Complete Crypto Object
// ============================================================================

/**
 * Complete WebCrypto API implementation.
 *
 * This object can be used directly or assigned to globalThis.crypto.
 *
 * @example
 * import { crypto } from '@ariob/webcrypto';
 * const hash = await crypto.subtle.digest('SHA-256', data);
 */
export const crypto = {
  subtle,
  getRandomValues,
  randomBytes,
};

// Export types for TypeScript
export type { CryptoKey };
export type BufferSource = ArrayBuffer | ArrayBufferView;
export type KeyFormat = 'raw' | 'pkcs8' | 'spki' | 'jwk';
export type KeyUsage = 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'deriveKey' | 'deriveBits' | 'wrapKey' | 'unwrapKey';

export interface CryptoKeyPair {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
}

export interface JsonWebKey {
  kty?: string;
  use?: string;
  key_ops?: string[];
  alg?: string;
  ext?: boolean;
  // EC keys
  crv?: string;
  x?: string;
  y?: string;
  d?: string;
  // RSA keys
  n?: string;
  e?: string;
  // Symmetric keys
  k?: string;
}

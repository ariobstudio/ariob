(() => {
  'background only';
  /*
 * WebCrypto Polyfill - Bridge to Native Cryptography Module
 *
 * This implementation exposes a subset of the WebCrypto API by bridging JavaScript
 * calls to a native Swift module (NativeWebCryptoModule). The polyfill supports
 * cryptographic algorithms commonly used by SEA.js and modern web applications.
 *
 * ARCHITECTURE:
 * - JavaScript Layer: Exposes standard WebCrypto API (crypto.subtle.*)
 * - Bridge Layer: Converts JS types to native-compatible formats (ArrayBuffer ↔ base64)
 * - Native Layer: Swift/Objective-C module performing actual cryptographic operations
 *
 * SUPPORTED ALGORITHMS:
 * - Symmetric: AES-GCM (128, 192, 256-bit)
 * - Asymmetric: ECDSA, ECDH (P-256 curve)
 * - Key Derivation: PBKDF2 (with SHA-256), ECDH
 * - Hashing: SHA-1, SHA-256, SHA-384, SHA-512
 *
 * KEY FORMATS:
 * - JWK (JSON Web Key): For interoperability and SEA.js compatibility
 * - Raw: Binary key material for symmetric keys and ECDH public keys
 *
 * DATA FLOW:
 * 1. JS receives ArrayBuffer/TypedArray data
 * 2. Convert to base64 string (pure JS to avoid UTF-8 corruption)
 * 3. Pass base64 string across React Native bridge to Swift
 * 4. Swift performs cryptographic operation
 * 5. Swift returns base64 result
 * 6. Convert base64 back to ArrayBuffer
 * 7. Return to caller as ArrayBuffer/TypedArray
 *
 * CRITICAL DESIGN DECISION - Pure JS Base64:
 * We implement base64 encoding/decoding in pure JavaScript rather than using
 * native btoa/atob or passing binary strings across the bridge because:
 * - Binary data (bytes > 127) gets corrupted by UTF-8 encoding across the bridge
 * - JavaScript strings use UTF-16, Swift uses UTF-8
 * - Converting binary data to strings causes data loss
 * - Pure JS base64 ensures byte-perfect round-trips across the bridge
 */

// ============================================================================
// Native Module Initialization
// ============================================================================

const native = NativeModules.NativeWebCryptoModule;
console.log('[WebCrypto Bridge] Installing native crypto bridge');

// ============================================================================
// CryptoKey Wrapper Class
// ============================================================================

/**
 * CryptoKey class that wraps native key handles.
 *
 * This class conforms to the Web Crypto API CryptoKey interface. Internally,
 * it stores a UUID handle that references a key stored in the native KeyStore.
 * The native module maintains the actual key material securely.
 *
 * @class CryptoKey
 * @property {string} _handle - Internal UUID handle referencing the native key
 * @property {Object} algorithm - Algorithm specification (name, length, etc.)
 * @property {string} type - Key type: 'public', 'private', or 'secret'
 * @property {boolean} extractable - Whether the key can be exported
 * @property {string[]} usages - Array of permitted operations (e.g., ['sign', 'verify'])
 *
 * @example
 * // CryptoKey objects are created internally by generateKey, importKey, etc.
 * const keyPair = await crypto.subtle.generateKey(
 *   { name: 'ECDSA', namedCurve: 'P-256' },
 *   true,
 *   ['sign', 'verify']
 * );
 * console.log(keyPair.privateKey.type); // 'private'
 * console.log(keyPair.privateKey.usages); // ['sign']
 */
class CryptoKey {
  /**
   * Creates a new CryptoKey instance.
   *
   * @param {string} handle - Native key handle (UUID string)
   * @param {Object} algorithm - Algorithm specification object
   * @param {string} type - Key type ('public', 'private', or 'secret')
   * @param {boolean} extractable - Whether key can be exported
   * @param {string[]} usages - Permitted key operations
   */
  constructor(handle, algorithm, type, extractable, usages) {
    this._handle = handle;
    this.algorithm = algorithm;
    this.type = type;
    this.extractable = extractable;
    this.usages = usages;
  }
}

// ============================================================================
// Base64 Encoding/Decoding (Pure JavaScript Implementation)
// ============================================================================

/**
 * Base64 character set used for encoding/decoding.
 * @constant {string}
 */
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Encodes a binary string to base64 using pure JavaScript.
 *
 * This pure JS implementation is critical to avoid data corruption when passing
 * binary data across the React Native bridge. Native implementations or passing
 * raw binary strings would result in UTF-8 encoding issues for bytes > 127.
 *
 * ALGORITHM:
 * 1. Process input in 3-byte chunks
 * 2. Convert each 3 bytes (24 bits) into 4 base64 characters (6 bits each)
 * 3. Pad with '=' if input length is not divisible by 3
 *
 * @param {string} binaryString - Binary string (each char represents one byte)
 * @returns {string} Base64-encoded string
 *
 * @example
 * pureJsBtoa('\x00\x01\x02'); // Returns: 'AAEC'
 */
function pureJsBtoa(binaryString) {
  let result = '';

  // Process 3 bytes at a time (24 bits -> 4 base64 chars)
  for (let i = 0; i < binaryString.length; i += 3) {
    const byte1 = binaryString.charCodeAt(i);
    const byte2 = i + 1 < binaryString.length ? binaryString.charCodeAt(i + 1) : 0;
    const byte3 = i + 2 < binaryString.length ? binaryString.charCodeAt(i + 2) : 0;

    // Split 24 bits into four 6-bit groups
    const a = byte1 >> 2;
    const b = ((byte1 & 3) << 4) | (byte2 >> 4);
    const c = ((byte2 & 15) << 2) | (byte3 >> 6);
    const d = byte3 & 63;

    // Convert to base64 characters
    result += BASE64_CHARS[a];
    result += BASE64_CHARS[b];
    result += i + 1 < binaryString.length ? BASE64_CHARS[c] : '=';
    result += i + 2 < binaryString.length ? BASE64_CHARS[d] : '=';
  }

  return result;
}

/**
 * Decodes a base64 string to binary string using pure JavaScript.
 *
 * This pure JS implementation avoids UTF-8 corruption when converting base64
 * data back to binary format. Each character in the returned string represents
 * one byte (0-255).
 *
 * ALGORITHM:
 * 1. Remove padding and whitespace
 * 2. Process input in 4-character chunks
 * 3. Convert each 4 base64 characters (24 bits) into 3 bytes
 *
 * @param {string} base64 - Base64-encoded string
 * @returns {string} Binary string (each char represents one byte)
 * @throws {Error} If base64 string contains invalid characters
 *
 * @example
 * pureJsAtob('AAEC'); // Returns: '\x00\x01\x02'
 */
function pureJsAtob(base64) {
  let str = '';

  // Remove padding and whitespace
  base64 = base64.replace(/[^A-Za-z0-9+/]/g, '');

  // Process 4 base64 chars at a time (24 bits -> 3 bytes)
  for (let i = 0; i < base64.length; i += 4) {
    const a = BASE64_CHARS.indexOf(base64[i]);
    const b = BASE64_CHARS.indexOf(base64[i + 1]);
    const c = BASE64_CHARS.indexOf(base64[i + 2]);
    const d = BASE64_CHARS.indexOf(base64[i + 3]);

    // Combine four 6-bit groups into three 8-bit bytes
    const byte1 = (a << 2) | (b >> 4);
    const byte2 = ((b & 15) << 4) | (c >> 2);
    const byte3 = ((c & 3) << 6) | d;

    str += String.fromCharCode(byte1);
    if (c !== -1) str += String.fromCharCode(byte2);
    if (d !== -1) str += String.fromCharCode(byte3);
  }

  return str;
}

// ============================================================================
// Data Type Conversion Utilities
// ============================================================================

/**
 * Converts binary data to binary string representation.
 *
 * Takes various binary data formats and converts them to a string where each
 * character represents one byte. This intermediate format is required before
 * base64 encoding.
 *
 * @param {Uint8Array} uint8Array - Binary data as Uint8Array
 * @returns {string} Binary string (each char code is 0-255)
 */
function uint8ArrayToBinaryString(uint8Array) {
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  return binaryString;
}

/**
 * Converts binary string to Uint8Array.
 *
 * Takes a string where each character represents one byte and converts it
 * back to a typed array format.
 *
 * @param {string} binaryString - Binary string (each char code is 0-255)
 * @returns {Uint8Array} Binary data as Uint8Array
 */
function binaryStringToUint8Array(binaryString) {
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts ArrayBuffer or TypedArray to base64 string.
 *
 * This function is the primary interface for converting JavaScript binary data
 * to a format safe for passing across the React Native bridge. All binary data
 * sent to the native module MUST go through this conversion.
 *
 * PROCESS:
 * 1. Normalize input to Uint8Array
 * 2. Convert to binary string
 * 3. Encode to base64 using pure JS implementation
 *
 * @param {ArrayBuffer|TypedArray} buffer - Binary data to encode
 * @returns {string} Base64-encoded string safe for bridge transport
 * @throws {TypeError} If input is not ArrayBuffer or TypedArray
 *
 * @example
 * const data = new Uint8Array([1, 2, 3, 4]);
 * const base64 = arrayBufferToBase64(data);
 * // Can now safely pass base64 across React Native bridge
 */
function arrayBufferToBase64(buffer) {
  // Normalize to Uint8Array
  let uint8Array;
  if (buffer instanceof ArrayBuffer) {
    uint8Array = new Uint8Array(buffer);
  } else if (ArrayBuffer.isView(buffer)) {
    uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer.buffer);
  } else if (Array.isArray(buffer) || (buffer && typeof buffer.length === 'number')) {
    // Handle array-like objects (SEA.js SafeBuffer/SeaArray)
    // Ensure we create a proper Uint8Array from array-like data
    uint8Array = new Uint8Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      uint8Array[i] = buffer[i] & 0xFF;
    }
  } else {
    throw new TypeError('Expected ArrayBuffer or TypedArray');
  }

  // Convert to binary string then base64
  const binaryString = uint8ArrayToBinaryString(uint8Array);
  const result = pureJsBtoa(binaryString);

  return result;
}

/**
 * Converts base64 string to ArrayBuffer.
 *
 * This function converts base64 strings received from the native module back
 * to JavaScript binary format. All binary data received from the native module
 * MUST go through this conversion.
 *
 * PROCESS:
 * 1. Decode base64 to binary string using pure JS
 * 2. Convert binary string to Uint8Array
 * 3. Return the underlying ArrayBuffer
 *
 * WHY PURE JS DECODING:
 * Binary strings cannot safely cross the JS-Swift bridge due to UTF-8 encoding
 * issues. Bytes with values > 127 get corrupted during string conversion between
 * JavaScript's UTF-16 and Swift's UTF-8. Base64 encoding ensures all characters
 * are in the safe ASCII range (A-Z, a-z, 0-9, +, /).
 *
 * @param {string} base64 - Base64-encoded string from native module
 * @returns {ArrayBuffer} Decoded binary data
 *
 * @example
 * const base64 = 'AQIDBA=='; // From native module
 * const buffer = base64ToArrayBuffer(base64);
 * const uint8 = new Uint8Array(buffer); // [1, 2, 3, 4]
 */
function base64ToArrayBuffer(base64) {
  // Decode base64 in pure JavaScript (avoids bridge corruption)
  const binaryString = pureJsAtob(base64);

  // Convert binary string to Uint8Array
  const bytes = binaryStringToUint8Array(binaryString);

  return bytes.buffer;
}

// ============================================================================
// Algorithm and Key Processing Utilities
// ============================================================================

/**
 * Extracts native key handle from CryptoKey object.
 *
 * CryptoKey objects wrap UUID handles that reference keys in the native KeyStore.
 * This function unwraps the handle for passing to native methods. It also accepts
 * raw string handles for backwards compatibility.
 *
 * @param {CryptoKey|string} key - CryptoKey object or raw handle string
 * @returns {string} Native key handle (UUID format)
 * @throws {TypeError} If key is neither CryptoKey nor string
 *
 * @example
 * const handle = extractHandle(cryptoKey); // Returns: 'abc-123-def-456'
 */
function extractHandle(key) {
  if (key instanceof CryptoKey) {
    return key._handle;
  }
  if (typeof key === 'string') {
    return key;
  }
  throw new TypeError('Expected CryptoKey object or string handle');
}

/**
 * Normalizes algorithm specification to object format.
 *
 * WebCrypto API accepts algorithms as either strings or objects. This function
 * ensures we always work with the object format for consistency.
 *
 * @param {string|Object} alg - Algorithm specification
 * @returns {Object} Normalized algorithm object
 *
 * @example
 * normalizeAlgorithm('SHA-256'); // Returns: { name: 'SHA-256' }
 * normalizeAlgorithm({ name: 'AES-GCM', length: 256 }); // Returns copy of object
 */
function normalizeAlgorithm(alg) {
  if (typeof alg === 'string') {
    return { name: alg };
  }
  // Return shallow copy to avoid mutating original
  return { ...alg };
}

/**
 * Validates and converts algorithm parameters for native module consumption.
 *
 * This function transforms algorithm specifications from JavaScript format to
 * a format compatible with the native module. It handles:
 * - Converting binary parameters (iv, salt, etc.) to base64
 * - Extracting key handles from nested CryptoKey objects
 * - Normalizing nested hash algorithm specifications
 *
 * BINARY PARAMETERS:
 * The following algorithm parameters contain binary data and are converted:
 * - iv: Initialization vector (AES-GCM)
 * - additionalData: Additional authenticated data (AES-GCM)
 * - counter: Counter value (AES-CTR)
 * - salt: Salt for key derivation (PBKDF2)
 * - info: Context information (HKDF)
 *
 * @param {Object} algorithm - Algorithm specification from WebCrypto API call
 * @returns {Object} Algorithm object with base64-encoded parameters
 *
 * @example
 * prepareAlgorithm({
 *   name: 'AES-GCM',
 *   iv: new Uint8Array([1, 2, 3, 4]),
 *   tagLength: 128
 * });
 * // Returns: { name: 'AES-GCM', iv: 'AQIDBA==', tagLength: 128 }
 */
function prepareAlgorithm(algorithm) {
  const alg = normalizeAlgorithm(algorithm);

  // Convert nested hash algorithm (e.g., PBKDF2.hash, ECDSA.hash)
  if (alg.hash) {
    alg.hash = normalizeAlgorithm(alg.hash);
  }

  // Convert CryptoKey objects to handles
  // This is needed for ECDH where algorithm.public is a CryptoKey
  if (alg.public instanceof CryptoKey) {
    alg.public = alg.public._handle;
  }

  // Convert binary parameters to base64
  const binaryParams = ['iv', 'additionalData', 'counter', 'salt', 'info'];
  for (const param of binaryParams) {
    if (alg[param] && (alg[param] instanceof ArrayBuffer || ArrayBuffer.isView(alg[param]))) {
      alg[param] = arrayBufferToBase64(alg[param]);
    }
  }

  return alg;
}

/**
 * Validates that native module result is not an error.
 *
 * The native module returns error messages as strings. This function detects
 * error conditions by checking for error-indicating keywords in the response.
 *
 * @param {string} result - Result string from native module
 * @param {string} operation - Operation name for error messages
 * @throws {Error} If result contains error indicators
 */
function validateNativeResult(result, operation) {
  const errorIndicators = ['Error', 'error', 'Invalid', 'bad', 'Size'];
  const hasError = errorIndicators.some(indicator => result.includes(indicator));

  if (hasError) {
    throw new Error(`${operation} failed: ${result}`);
  }
}

/**
 * Validates that a key handle has correct UUID format.
 *
 * Native module returns key handles as UUIDs (36 characters with hyphens).
 * This function verifies the handle format is valid.
 *
 * @param {string} handle - Key handle to validate
 * @returns {boolean} True if handle is valid UUID format
 *
 * @example
 * isValidHandle('550e8400-e29b-41d4-a716-446655440000'); // true
 * isValidHandle('Error: Invalid key'); // false
 */
function isValidHandle(handle) {
  return (
    typeof handle === 'string' &&
    handle.length === 36 &&
    handle.includes('-') &&
    !handle.includes('Error') &&
    !handle.includes('error')
  );
}

/**
 * Determines key type from import format and key data.
 *
 * WebCrypto API requires knowing if a key is 'public', 'private', or 'secret'.
 * This function infers the type based on the import format and key structure.
 *
 * @param {string} format - Key format ('jwk', 'raw', 'spki', 'pkcs8')
 * @param {Object|ArrayBuffer} keyData - Key data being imported
 * @returns {string} Key type: 'public', 'private', or 'secret'
 *
 * @example
 * determineKeyType('jwk', { kty: 'EC', d: '...' }); // 'private'
 * determineKeyType('jwk', { kty: 'EC', x: '...' }); // 'public'
 * determineKeyType('jwk', { kty: 'oct', k: '...' }); // 'secret'
 */
function determineKeyType(format, keyData) {
  if (format === 'jwk') {
    if (keyData.kty === 'EC') {
      // EC keys: private keys have 'd' parameter
      return keyData.d ? 'private' : 'public';
    } else if (keyData.kty === 'oct') {
      // Symmetric (octet) keys
      return 'secret';
    }
  } else if (format === 'spki') {
    return 'public';
  } else if (format === 'pkcs8') {
    return 'private';
  }

  // Default to secret for raw format
  return 'secret';
}

/**
 * Filters key usages based on key type.
 *
 * Different key types support different operations. This function filters the
 * requested usages to only those appropriate for the key type.
 *
 * @param {string[]} usages - Requested key usages
 * @param {string} keyType - Key type ('public', 'private', 'secret')
 * @returns {string[]} Filtered usages appropriate for key type
 *
 * @example
 * filterUsagesByKeyType(['sign', 'verify'], 'private'); // ['sign']
 * filterUsagesByKeyType(['sign', 'verify'], 'public'); // ['verify']
 */
function filterUsagesByKeyType(usages, keyType) {
  if (keyType === 'private') {
    return usages.filter(u => ['sign', 'deriveBits', 'deriveKey', 'decrypt', 'unwrapKey'].includes(u));
  } else if (keyType === 'public') {
    return usages.filter(u => ['verify', 'encrypt', 'wrapKey'].includes(u));
  }
  // Secret keys support all symmetric operations
  return usages;
}

// ============================================================================
// Initialize Global Crypto Object
// ============================================================================

if (!globalThis.crypto) globalThis.crypto = {};
if (!globalThis.crypto.subtle) globalThis.crypto.subtle = {};

// ============================================================================
// SubtleCrypto Methods - Hashing
// ============================================================================

/**
 * Computes a cryptographic hash (digest) of data.
 *
 * Supported algorithms: SHA-1, SHA-256, SHA-384, SHA-512
 *
 * @param {string|Object} algorithm - Hash algorithm name or specification
 * @param {ArrayBuffer|TypedArray} data - Data to hash
 * @returns {Promise<ArrayBuffer>} Hash digest
 * @throws {Error} If hashing fails or algorithm is unsupported
 *
 * @example
 * const data = new TextEncoder().encode('Hello, World!');
 * const hash = await crypto.subtle.digest('SHA-256', data);
 * console.log(new Uint8Array(hash)); // Hash bytes
 *
 * @example
 * // Using algorithm object
 * const hash = await crypto.subtle.digest(
 *   { name: 'SHA-512' },
 *   data
 * );
 */
crypto.subtle.digest = (algorithm, data) => {
  'background only';

  const alg = normalizeAlgorithm(algorithm);
  const dataBase64 = arrayBufferToBase64(data);

  const resultBase64 = native.digest(alg, dataBase64);

  validateNativeResult(resultBase64, 'Digest');

  const result = base64ToArrayBuffer(resultBase64);
  return Promise.resolve(result);
};

// ============================================================================
// SubtleCrypto Methods - Key Generation and Management
// ============================================================================

/**
 * Generates a new cryptographic key or key pair.
 *
 * SUPPORTED ALGORITHMS:
 * - AES-GCM: Symmetric encryption (128, 192, 256-bit)
 *   Returns: CryptoKey (type: 'secret')
 * - ECDSA: Asymmetric signing (P-256 curve)
 *   Returns: { privateKey: CryptoKey, publicKey: CryptoKey }
 * - ECDH: Asymmetric key agreement (P-256 curve)
 *   Returns: { privateKey: CryptoKey, publicKey: CryptoKey }
 *
 * @param {Object} algorithm - Algorithm specification
 * @param {string} algorithm.name - Algorithm name ('AES-GCM', 'ECDSA', 'ECDH')
 * @param {number} [algorithm.length] - Key length in bits (AES-GCM: 128, 192, 256)
 * @param {string} [algorithm.namedCurve] - Curve name (ECDSA/ECDH: 'P-256')
 * @param {boolean} extractable - Whether key can be exported
 * @param {string[]} usages - Permitted operations (e.g., ['sign', 'verify'])
 * @returns {Promise<CryptoKey|{privateKey: CryptoKey, publicKey: CryptoKey}>}
 * @throws {Error} If key generation fails
 *
 * @example
 * // Generate symmetric AES key
 * const aesKey = await crypto.subtle.generateKey(
 *   { name: 'AES-GCM', length: 256 },
 *   true,
 *   ['encrypt', 'decrypt']
 * );
 *
 * @example
 * // Generate ECDSA key pair
 * const keyPair = await crypto.subtle.generateKey(
 *   { name: 'ECDSA', namedCurve: 'P-256' },
 *   true,
 *   ['sign', 'verify']
 * );
 * console.log(keyPair.privateKey.type); // 'private'
 * console.log(keyPair.publicKey.type); // 'public'
 */
crypto.subtle.generateKey = (algorithm, extractable, usages) => {
  const alg = prepareAlgorithm(algorithm);
  const usageArray = Array.from(usages || []);

  console.log('[crypto.js] 🔑 generateKey() called:', alg.name);

  const result = native.generateKey(alg, !!extractable, usageArray);

  if (result.error) {
    throw new Error(`generateKey failed: ${result.error}`);
  }

  // Handle asymmetric key pair (ECDSA, ECDH)
  if (result.privateKey && result.publicKey) {
    console.log('[crypto.js] ✓ Generated key pair handles:', {
      priv: result.privateKey,
      pub: result.publicKey
    });

    const privateKey = new CryptoKey(
      result.privateKey,
      alg,
      'private',
      extractable,
      filterUsagesByKeyType(usageArray, 'private')
    );

    const publicKey = new CryptoKey(
      result.publicKey,
      alg,
      'public',
      extractable,
      filterUsagesByKeyType(usageArray, 'public')
    );

    return Promise.resolve({ privateKey, publicKey });
  }

  // Handle symmetric key (AES-GCM)
  if (result.secretKeyHandle) {
    const secretKey = new CryptoKey(
      result.secretKeyHandle,
      alg,
      'secret',
      extractable,
      usageArray
    );

    return Promise.resolve(secretKey);
  }

  throw new Error('Unexpected generateKey result format');
};

/**
 * Imports a key from external format.
 *
 * SUPPORTED FORMATS:
 * - 'jwk': JSON Web Key format (most interoperable)
 * - 'raw': Raw key bytes (symmetric keys, ECDH public keys)
 * - 'spki': SubjectPublicKeyInfo (public keys) - limited support
 * - 'pkcs8': PrivateKeyInfo (private keys) - limited support
 *
 * @param {string} format - Key format ('jwk', 'raw', 'spki', 'pkcs8')
 * @param {Object|ArrayBuffer|TypedArray} keyData - Key data in specified format
 * @param {string|Object} algorithm - Algorithm specification
 * @param {boolean} extractable - Whether imported key can be exported
 * @param {string[]} usages - Permitted key operations
 * @returns {Promise<CryptoKey>} Imported key
 * @throws {Error} If import fails or format is invalid
 *
 * @example
 * // Import JWK symmetric key
 * const jwk = { kty: 'oct', k: 'base64-encoded-key...', alg: 'A256GCM' };
 * const key = await crypto.subtle.importKey(
 *   'jwk',
 *   jwk,
 *   { name: 'AES-GCM' },
 *   true,
 *   ['encrypt', 'decrypt']
 * );
 *
 * @example
 * // Import raw ECDH public key
 * const publicKeyBytes = new Uint8Array([...]); // 65 bytes for P-256
 * const publicKey = await crypto.subtle.importKey(
 *   'raw',
 *   publicKeyBytes,
 *   { name: 'ECDH', namedCurve: 'P-256' },
 *   true,
 *   []
 * );
 */
crypto.subtle.importKey = (format, keyData, algorithm, extractable, usages) => {
  const alg = prepareAlgorithm(algorithm);
  const usageArray = Array.from(usages || []);

  let param = keyData;

  // Convert raw binary format to base64
  if (format === 'raw' || format === 'spki' || format === 'pkcs8') {
    param = arrayBufferToBase64(keyData);
  }
  // Parse JWK string if needed
  else if (format === 'jwk' && typeof keyData === 'string') {
    try {
      param = JSON.parse(keyData);
    } catch (e) {
      throw new Error('Invalid JWK format: ' + e.message);
    }
  }

  console.log('[crypto.js] 📥 importKey() called:', { format, hasD: !!(param?.d), x: param?.x?.substring(0, 20) + '...' });

  const handle = native.importKey(format, param, alg, !!extractable, usageArray);

  // Validate handle format
  if (!isValidHandle(handle)) {
    throw new Error(`importKey failed: ${handle}`);
  }

  console.log('[crypto.js] ✓ Imported key handle:', handle);

  // Determine key type from format and data
  const type = determineKeyType(format, param);
  const filteredUsages = filterUsagesByKeyType(usageArray, type);

  const key = new CryptoKey(handle, alg, type, extractable, filteredUsages);

  return Promise.resolve(key);
};

/**
 * Exports a key to external format.
 *
 * The key must have been created or imported with extractable = true.
 *
 * SUPPORTED FORMATS:
 * - 'jwk': JSON Web Key format (returns Object)
 * - 'raw': Raw key bytes (returns ArrayBuffer)
 *
 * @param {string} format - Export format ('jwk' or 'raw')
 * @param {CryptoKey} key - Key to export
 * @returns {Promise<Object|ArrayBuffer>} Exported key data
 * @throws {Error} If key is not extractable or export fails
 *
 * @example
 * // Export as JWK
 * const jwk = await crypto.subtle.exportKey('jwk', key);
 * console.log(jwk); // { kty: 'EC', crv: 'P-256', x: '...', y: '...' }
 *
 * @example
 * // Export as raw bytes
 * const rawKey = await crypto.subtle.exportKey('raw', symmetricKey);
 * console.log(new Uint8Array(rawKey)); // Key bytes
 */
crypto.subtle.exportKey = (format, key) => {
  if (!key.extractable) {
    throw new Error('Key is not extractable');
  }

  const handle = extractHandle(key);
  console.log('[crypto.js] 📤 exportKey() called:', { format, keyType: key.type, handle });

  const result = native.exportKey(format, handle);

  if (result.error) {
    throw new Error(`exportKey failed: ${result.error}`);
  }

  // Handle raw format - convert base64 to ArrayBuffer
  if (format === 'raw' && result.raw) {
    const arrayBuffer = base64ToArrayBuffer(result.raw);
    return Promise.resolve(arrayBuffer);
  }

  // Handle JWK format - return the JWK object
  if (format === 'jwk') {
    // Remove internal fields from result
    const { raw, error, ...jwk } = result;
    console.log('[crypto.js] ✓ Exported JWK:', {
      kty: jwk.kty,
      crv: jwk.crv,
      hasD: !!jwk.d,
      d: jwk.d ? jwk.d.substring(0, 20) + '...' : undefined,
      x: jwk.x?.substring(0, 20) + '...',
      y: jwk.y?.substring(0, 20) + '...'
    });
    return Promise.resolve(jwk);
  }

  throw new Error('Unsupported export format or invalid result');
};

// ============================================================================
// SubtleCrypto Methods - Signing and Verification
// ============================================================================

/**
 * Creates a digital signature.
 *
 * Supported algorithm: ECDSA with SHA-256/384/512 on P-256 curve
 *
 * @param {Object} algorithm - Signing algorithm specification
 * @param {string} algorithm.name - Algorithm name ('ECDSA')
 * @param {string|Object} algorithm.hash - Hash algorithm ('SHA-256', 'SHA-384', 'SHA-512')
 * @param {CryptoKey} key - Private key for signing
 * @param {ArrayBuffer|TypedArray} data - Data to sign
 * @returns {Promise<ArrayBuffer>} Digital signature
 * @throws {Error} If signing fails or key type is incorrect
 *
 * @example
 * const signature = await crypto.subtle.sign(
 *   { name: 'ECDSA', hash: 'SHA-256' },
 *   privateKey,
 *   messageData
 * );
 */
crypto.subtle.sign = (algorithm, key, data) => {

  if (key.type !== 'private') {
    throw new Error('Sign operation requires a private key');
  }

  const alg = prepareAlgorithm(algorithm);

  // CRITICAL: For ECDSA, use raw format (IEEE P1363) to match WebCrypto standard
  // GUN SEA expects 64-byte raw signatures (32-byte r + 32-byte s), not DER format
  if (alg.name === 'ECDSA') {
    alg.format = 'raw';
  }

  const handle = extractHandle(key);

  // Log the data being signed (it's the hash from SEA.js)
  const dataBytes = new Uint8Array(data);
  const dataHex = Array.from(dataBytes.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join('');

  const dataBase64 = arrayBufferToBase64(data);

  const signatureBase64 = native.sign(alg, handle, dataBase64);


  validateNativeResult(signatureBase64, 'Sign');

  const signature = base64ToArrayBuffer(signatureBase64);
  const sigBytes = new Uint8Array(signature);

  return Promise.resolve(signature);
};

/**
 * Verifies a digital signature.
 *
 * Supported algorithm: ECDSA with SHA-256/384/512 on P-256 curve
 *
 * @param {Object} algorithm - Verification algorithm specification
 * @param {string} algorithm.name - Algorithm name ('ECDSA')
 * @param {string|Object} algorithm.hash - Hash algorithm ('SHA-256', 'SHA-384', 'SHA-512')
 * @param {CryptoKey} key - Public key for verification
 * @param {ArrayBuffer|TypedArray} signature - Signature to verify
 * @param {ArrayBuffer|TypedArray} data - Original data that was signed
 * @returns {Promise<boolean>} True if signature is valid, false otherwise
 *
 * @example
 * const isValid = await crypto.subtle.verify(
 *   { name: 'ECDSA', hash: 'SHA-256' },
 *   publicKey,
 *   signature,
 *   messageData
 * );
 * if (isValid) {
 *   console.log('Signature is valid!');
 * }
 */
crypto.subtle.verify = (algorithm, key, signature, data) => {
  if (key.type !== 'public') {
    throw new Error('Verify operation requires a public key');
  }

  const alg = prepareAlgorithm(algorithm);

  // CRITICAL: For ECDSA, use raw format (IEEE P1363) to match WebCrypto standard
  // GUN SEA expects 64-byte raw signatures (32-byte r + 32-byte s), not DER format
  if (alg.name === 'ECDSA') {
    alg.format = 'raw';
  }

  const handle = extractHandle(key);
  const signatureBase64 = arrayBufferToBase64(signature);
  const dataBase64 = arrayBufferToBase64(data);

  const result = native.verify(alg, handle, signatureBase64, dataBase64);

  // Handle different return types from bridge (boolean, number, boxed number)
  const isValid = result === 1 || result === true || result?.valueOf?.() === 1;

  return Promise.resolve(isValid);
};

// ============================================================================
// SubtleCrypto Methods - Encryption and Decryption
// ============================================================================

/**
 * Encrypts data.
 *
 * Supported algorithm: AES-GCM with 128, 192, or 256-bit keys
 *
 * IMPORTANT: For AES-GCM:
 * - IV (initialization vector) must be unique for each encryption operation
 * - Recommended IV length is 12 bytes (96 bits)
 * - Tag length is typically 128 bits (default)
 *
 * @param {Object} algorithm - Encryption algorithm specification
 * @param {string} algorithm.name - Algorithm name ('AES-GCM')
 * @param {ArrayBuffer|TypedArray} algorithm.iv - Initialization vector (12 bytes recommended)
 * @param {number} [algorithm.tagLength=128] - Authentication tag length in bits
 * @param {ArrayBuffer|TypedArray} [algorithm.additionalData] - Additional authenticated data (AAD)
 * @param {CryptoKey} key - Encryption key (type: 'secret')
 * @param {ArrayBuffer|TypedArray} data - Data to encrypt
 * @returns {Promise<ArrayBuffer>} Encrypted data (ciphertext + authentication tag)
 * @throws {Error} If encryption fails
 *
 * @example
 * const iv = crypto.getRandomValues(new Uint8Array(12));
 * const ciphertext = await crypto.subtle.encrypt(
 *   { name: 'AES-GCM', iv: iv, tagLength: 128 },
 *   key,
 *   plaintext
 * );
 */
crypto.subtle.encrypt = (algorithm, key, data) => {
  if (key.type !== 'secret') {
    throw new Error('Encrypt operation requires a secret key');
  }

  const alg = prepareAlgorithm(algorithm);
  const handle = extractHandle(key);
  const dataBase64 = arrayBufferToBase64(data);

  const ciphertextBase64 = native.encrypt(alg, handle, dataBase64);

  validateNativeResult(ciphertextBase64, 'Encrypt');

  const ciphertext = base64ToArrayBuffer(ciphertextBase64);

  return Promise.resolve(ciphertext);
};

/**
 * Decrypts data.
 *
 * Supported algorithm: AES-GCM with 128, 192, or 256-bit keys
 *
 * IMPORTANT: For AES-GCM:
 * - IV must be the same value used during encryption
 * - If additionalData was provided during encryption, it must be provided here
 * - Authentication tag is verified automatically
 *
 * @param {Object} algorithm - Decryption algorithm specification
 * @param {string} algorithm.name - Algorithm name ('AES-GCM')
 * @param {ArrayBuffer|TypedArray} algorithm.iv - Same IV used during encryption
 * @param {number} [algorithm.tagLength=128] - Authentication tag length in bits
 * @param {ArrayBuffer|TypedArray} [algorithm.additionalData] - Same AAD used during encryption
 * @param {CryptoKey} key - Decryption key (type: 'secret')
 * @param {ArrayBuffer|TypedArray} data - Encrypted data (ciphertext + tag)
 * @returns {Promise<ArrayBuffer>} Decrypted plaintext
 * @throws {Error} If decryption fails or authentication tag is invalid
 *
 * @example
 * const plaintext = await crypto.subtle.decrypt(
 *   { name: 'AES-GCM', iv: iv, tagLength: 128 },
 *   key,
 *   ciphertext
 * );
 */
crypto.subtle.decrypt = (algorithm, key, data) => {
  if (key.type !== 'secret') {
    throw new Error('Decrypt operation requires a secret key');
  }

  const alg = prepareAlgorithm(algorithm);
  const handle = extractHandle(key);
  const dataBase64 = arrayBufferToBase64(data);

  const plaintextBase64 = native.decrypt(alg, handle, dataBase64);

  validateNativeResult(plaintextBase64, 'Decrypt');

  const plaintext = base64ToArrayBuffer(plaintextBase64);

  return Promise.resolve(plaintext);
};

// ============================================================================
// SubtleCrypto Methods - Key Derivation
// ============================================================================

/**
 * Derives raw bits from a base key using a key derivation algorithm.
 *
 * SUPPORTED ALGORITHMS:
 * - ECDH: Elliptic Curve Diffie-Hellman key agreement
 *   Requires: baseKey (private), algorithm.public (CryptoKey)
 * - PBKDF2: Password-Based Key Derivation Function 2
 *   Requires: password (as JWK with 'k' field), salt, iterations, hash
 *
 * @param {Object} algorithm - Derivation algorithm specification
 * @param {string} algorithm.name - Algorithm name ('ECDH' or 'PBKDF2')
 * @param {CryptoKey} [algorithm.public] - Other party's public key (ECDH only)
 * @param {ArrayBuffer|TypedArray} [algorithm.salt] - Salt value (PBKDF2 only)
 * @param {number} [algorithm.iterations] - Iteration count (PBKDF2 only)
 * @param {string|Object} [algorithm.hash] - Hash algorithm (PBKDF2 only)
 * @param {CryptoKey|Object} baseKey - Base key for derivation
 * @param {number} length - Number of bits to derive
 * @returns {Promise<ArrayBuffer>} Derived bits
 * @throws {Error} If derivation fails
 *
 * @example
 * // ECDH key agreement
 * const sharedSecret = await crypto.subtle.deriveBits(
 *   { name: 'ECDH', public: theirPublicKey },
 *   myPrivateKey,
 *   256
 * );
 *
 * @example
 * // PBKDF2 key derivation
 * const passwordKey = { k: btoa('my-password') }; // JWK format
 * const salt = crypto.getRandomValues(new Uint8Array(16));
 * const derivedBits = await crypto.subtle.deriveBits(
 *   { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
 *   passwordKey,
 *   256
 * );
 */
crypto.subtle.deriveBits = (algorithm, baseKey, length) => {
  const alg = prepareAlgorithm(algorithm);

  // Special handling for PBKDF2 - extract key material from JWK if needed
  let keyParam = baseKey;
  if (alg.name?.toUpperCase() === 'PBKDF2' && baseKey && baseKey.k) {
    keyParam = { rawData: baseKey.k };
  } else {
    keyParam = extractHandle(baseKey);
  }

  const bitsBase64 = native.deriveBits(alg, keyParam, length);

  validateNativeResult(bitsBase64, 'deriveBits');

  const bits = base64ToArrayBuffer(bitsBase64);

  return Promise.resolve(bits);
};

/**
 * Derives a key from a base key using a key derivation algorithm.
 *
 * This is a convenience method that calls deriveBits and then imports the
 * result as a new CryptoKey.
 *
 * SUPPORTED ALGORITHMS:
 * - ECDH: Derive shared encryption key from ECDH agreement
 * - PBKDF2: Derive encryption key from password
 *
 * @param {Object} algorithm - Derivation algorithm specification
 * @param {string} algorithm.name - Algorithm name ('ECDH' or 'PBKDF2')
 * @param {CryptoKey} [algorithm.public] - Other party's public key (ECDH)
 * @param {ArrayBuffer|TypedArray} [algorithm.salt] - Salt value (PBKDF2)
 * @param {number} [algorithm.iterations] - Iteration count (PBKDF2)
 * @param {string|Object} [algorithm.hash] - Hash algorithm (PBKDF2)
 * @param {CryptoKey|Object} baseKey - Base key for derivation
 * @param {Object} derivedKeyAlgorithm - Algorithm for derived key (e.g., AES-GCM)
 * @param {boolean} extractable - Whether derived key can be exported
 * @param {string[]} usages - Permitted operations for derived key
 * @returns {Promise<CryptoKey>} Derived key
 * @throws {Error} If derivation fails
 *
 * @example
 * // Derive AES-GCM key from ECDH
 * const sharedKey = await crypto.subtle.deriveKey(
 *   { name: 'ECDH', public: theirPublicKey },
 *   myPrivateKey,
 *   { name: 'AES-GCM', length: 256 },
 *   true,
 *   ['encrypt', 'decrypt']
 * );
 *
 * @example
 * // Derive AES-GCM key from password using PBKDF2
 * const passwordKey = { k: btoa('my-password') };
 * const salt = crypto.getRandomValues(new Uint8Array(16));
 * const encryptionKey = await crypto.subtle.deriveKey(
 *   { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
 *   passwordKey,
 *   { name: 'AES-GCM', length: 256 },
 *   false,
 *   ['encrypt', 'decrypt']
 * );
 */
crypto.subtle.deriveKey = (algorithm, baseKey, derivedKeyAlgorithm, extractable, usages) => {
  const alg = prepareAlgorithm(algorithm);
  const derivedAlg = prepareAlgorithm(derivedKeyAlgorithm);

  // Special handling for PBKDF2
  let keyParam = baseKey;
  if (alg.name?.toUpperCase() === 'PBKDF2' && baseKey && baseKey.k) {
    keyParam = { rawData: baseKey.k };
  } else {
    keyParam = extractHandle(baseKey);
  }

  // Calculate derived key length from algorithm
  const keyLength = derivedAlg.length || 256;

  const bitsBase64 = native.deriveBits(alg, keyParam, keyLength);

  validateNativeResult(bitsBase64, 'deriveKey');

  const bits = base64ToArrayBuffer(bitsBase64);

  // Import the derived bits as a new key
  return crypto.subtle.importKey(
    'raw',
    bits,
    derivedKeyAlgorithm,
    extractable,
    usages
  );
};

// ============================================================================
// Crypto Utility Methods - Random Number Generation
// ============================================================================

/**
 * Fills a TypedArray with cryptographically secure random values.
 *
 * This is the standard WebCrypto API method for generating random data.
 * Maximum supported length is 65,536 bytes per call.
 *
 * @param {TypedArray} typedArray - Array to fill with random values
 * @returns {TypedArray} The same array, filled with random values
 * @throws {TypeError} If argument is not a TypedArray
 * @throws {DOMException} If requested length exceeds 65,536 bytes
 *
 * @example
 * const randomBytes = new Uint8Array(16);
 * crypto.getRandomValues(randomBytes);
 * console.log(randomBytes); // 16 random bytes
 *
 * @example
 * // Generate random IV for AES-GCM
 * const iv = crypto.getRandomValues(new Uint8Array(12));
 */
crypto.getRandomValues = (typedArray) => {
  if (!typedArray || !typedArray.length) {
    throw new TypeError('Argument must be a TypedArray');
  }

  const length = typedArray.length;
  if (length > 65536) {
    throw new DOMException('Requested length exceeds 65536', 'QuotaExceededError');
  }

  const randomBase64 = native.getRandomValues(length);
  const randomBytes = base64ToArrayBuffer(randomBase64);

  typedArray.set(new Uint8Array(randomBytes));

  return typedArray;
};

/**
 * Generates cryptographically secure random bytes (Node.js-style API).
 *
 * This provides a Node.js-compatible interface for SEA.js and other libraries
 * that expect Node-style crypto.randomBytes().
 *
 * @param {number} length - Number of random bytes to generate
 * @returns {Uint8Array} Array of random bytes
 * @throws {Error} If requested length exceeds 65,536 bytes
 *
 * @example
 * const salt = crypto.randomBytes(16);
 * console.log(salt); // Uint8Array of 16 random bytes
 */
crypto.randomBytes = (length) => {
  if (length > 65536) {
    throw new Error('Requested length exceeds 65536');
  }

  const randomBase64 = native.getRandomValues(length);
  const randomBytes = base64ToArrayBuffer(randomBase64);

  return new Uint8Array(randomBytes);
};

// ============================================================================
// Global Utility Functions - Base64 Encoding/Decoding
// ============================================================================

/**
 * Encodes binary data to base64 string (global function).
 *
 * This implements the standard btoa() function using pure JavaScript to avoid
 * UTF-8 corruption across the React Native bridge. Supports multiple input types
 * for maximum compatibility with various libraries.
 *
 * SUPPORTED INPUT TYPES:
 * - string: Binary string (each char represents one byte)
 * - ArrayBuffer: Raw binary buffer
 * - TypedArray: Uint8Array, Int8Array, etc.
 * - Array-like: SEA.js SafeBuffer, plain arrays of numbers
 *
 * @param {string|ArrayBuffer|TypedArray|Array} input - Data to encode
 * @returns {string} Base64-encoded string
 *
 * @example
 * btoa('Hello'); // Returns: 'SGVsbG8='
 *
 * @example
 * const bytes = new Uint8Array([72, 101, 108, 108, 111]);
 * btoa(bytes); // Returns: 'SGVsbG8='
 */
globalThis.btoa = (input) => {
  let str;

  if (typeof input === 'string') {
    str = input;
  } else if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input.buffer || input);
    str = uint8ArrayToBinaryString(bytes);
  } else if (Array.isArray(input) || (input && typeof input.length === 'number' && typeof input[0] === 'number')) {
    // Handle array-like objects (including SEA.js SafeBuffer/SeaArray)
    str = '';
    for (let i = 0; i < input.length; i++) {
      str += String.fromCharCode(input[i] & 0xFF);
    }
  } else {
    str = String(input);
  }

  // Use pure JS implementation (no bridge call)
  return pureJsBtoa(str);
};

/**
 * Decodes base64 string to binary string (global function).
 *
 * This implements the standard atob() function using pure JavaScript to avoid
 * UTF-8 corruption. The returned string has each character representing one byte.
 *
 * @param {string} input - Base64-encoded string
 * @returns {string} Binary string (each char code is 0-255)
 *
 * @example
 * const binary = atob('SGVsbG8=');
 * console.log(binary); // 'Hello'
 *
 * @example
 * // Convert to Uint8Array
 * const binary = atob('AQIDBA==');
 * const bytes = new Uint8Array(binary.length);
 * for (let i = 0; i < binary.length; i++) {
 *   bytes[i] = binary.charCodeAt(i);
 * }
 * console.log(bytes); // Uint8Array [1, 2, 3, 4]
 */
globalThis.atob = (input) => {
  // Use pure JS implementation (no bridge call)
  return pureJsAtob(String(input));
};

// ============================================================================
// Global Utility Classes - Text Encoding/Decoding
// ============================================================================

/**
 * TextEncoder class for converting strings to UTF-8 bytes.
 *
 * This implements the standard TextEncoder interface, delegating actual
 * encoding to the native module which properly handles UTF-8 encoding.
 *
 * @class TextEncoder
 *
 * @example
 * const encoder = new TextEncoder();
 * const bytes = encoder.encode('Hello, 世界!');
 * console.log(bytes); // Uint8Array with UTF-8 encoded bytes
 */
globalThis.TextEncoder = globalThis.TextEncoder || class TextEncoder {
  /**
   * Encodes a string to UTF-8 bytes.
   *
   * @param {string} str - String to encode
   * @returns {Uint8Array} UTF-8 encoded bytes
   *
   * @example
   * const encoder = new TextEncoder();
   * const bytes = encoder.encode('Test');
   * // bytes is Uint8Array [84, 101, 115, 116]
   */
  encode(str) {
    const encoded = native.textEncode(str);
    const bytes = base64ToArrayBuffer(encoded);
    return new Uint8Array(bytes);
  }
};

/**
 * TextDecoder class for converting UTF-8 bytes to strings.
 *
 * This implements the standard TextDecoder interface, delegating actual
 * decoding to the native module which properly handles UTF-8 decoding.
 *
 * @class TextDecoder
 *
 * @example
 * const decoder = new TextDecoder();
 * const bytes = new Uint8Array([72, 101, 108, 108, 111]);
 * const str = decoder.decode(bytes); // 'Hello'
 */
globalThis.TextDecoder = globalThis.TextDecoder || class TextDecoder {
  /**
   * Decodes UTF-8 bytes to string.
   *
   * @param {ArrayBuffer|TypedArray} buffer - UTF-8 encoded bytes
   * @returns {string} Decoded string
   * @throws {Error} If decoding fails
   *
   * @example
   * const decoder = new TextDecoder();
   * const bytes = new Uint8Array([84, 101, 115, 116]);
   * const str = decoder.decode(bytes); // 'Test'
   */
  decode(buffer) {
    const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const base64 = arrayBufferToBase64(data);
    const result = native.textDecode(base64);

    validateNativeResult(result, 'TextDecoder');

    return result;
  }
};

// ============================================================================
// Finalization
// ============================================================================

// Make crypto available globally
globalThis.crypto = crypto;

})();
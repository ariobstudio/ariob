import { NativeModule, requireNativeModule } from 'expo';

// ============================================================================
// Algorithm Parameter Types
// ============================================================================

/**
 * Base algorithm identifier.
 */
export interface Algorithm {
  name: string;
}

/**
 * Hash algorithm specification.
 * Supports SHA-256, SHA-384, and SHA-512.
 */
export interface HashAlgorithm extends Algorithm {
  name: 'SHA-256' | 'SHA-384' | 'SHA-512';
}

/**
 * AES-GCM algorithm specification for key generation.
 */
export interface AesGcmKeyGenParams extends Algorithm {
  name: 'AES-GCM';
  /** Key length in bits (128, 192, or 256) */
  length: 128 | 192 | 256;
}

/**
 * AES-GCM algorithm specification for encryption/decryption.
 */
export interface AesGcmParams extends Algorithm {
  name: 'AES-GCM';
  /** Initialization vector (nonce) as base64 string. Should be 12 bytes for optimal performance. */
  iv: string;
}

/**
 * ECDSA algorithm specification for key generation.
 */
export interface EcdsaKeyGenParams extends Algorithm {
  name: 'ECDSA';
  /** Named elliptic curve (only P-256 supported) */
  namedCurve: 'P-256';
}

/**
 * ECDSA algorithm specification for signing/verification.
 */
export interface EcdsaParams extends Algorithm {
  name: 'ECDSA';
  /** Hash algorithm to use */
  hash: HashAlgorithm;
  /** Signature format: 'der' (default) or 'raw' (IEEE P1363) */
  format?: 'der' | 'raw';
}

/**
 * ECDH algorithm specification for key generation.
 */
export interface EcdhKeyGenParams extends Algorithm {
  name: 'ECDH';
  /** Named elliptic curve (only P-256 supported) */
  namedCurve: 'P-256';
}

/**
 * ECDH algorithm specification for key derivation.
 */
export interface EcdhKeyDerivationParams extends Algorithm {
  name: 'ECDH';
  /** Public key handle of the other party */
  public: string;
}

/**
 * PBKDF2 algorithm specification for key derivation.
 */
export interface Pbkdf2Params extends Algorithm {
  name: 'PBKDF2';
  /** Salt as base64 string (minimum 16 bytes recommended) */
  salt: string;
  /** Number of iterations (minimum 100,000 recommended) */
  iterations: number;
  /** PRF hash algorithm */
  hash: HashAlgorithm;
}

// ============================================================================
// Key Types
// ============================================================================

/**
 * Result of symmetric key generation (AES-GCM).
 */
export interface SymmetricKeyResult {
  /** Handle to the generated symmetric key */
  secretKeyHandle: string;
}

/**
 * Result of asymmetric key pair generation (ECDSA, ECDH).
 */
export interface KeyPairResult {
  /** Handle to the private key */
  privateKey: string;
  /** Handle to the public key */
  publicKey: string;
}

/**
 * Error result from key generation.
 */
export interface KeyGenerationError {
  /** Error message */
  error: string;
}

/**
 * Union type for key generation results.
 */
export type KeyGenerationResult = SymmetricKeyResult | KeyPairResult | KeyGenerationError;

/**
 * JWK (JSON Web Key) for symmetric keys.
 */
export interface JwkSymmetricKey {
  kty: 'oct';
  k: string;
  alg: 'A128GCM' | 'A192GCM' | 'A256GCM';
  ext: boolean;
}

/**
 * JWK (JSON Web Key) for EC public keys.
 */
export interface JwkEcPublicKey {
  kty: 'EC';
  crv: 'P-256';
  x: string;
  y: string;
  ext: boolean;
}

/**
 * JWK (JSON Web Key) for EC private keys.
 */
export interface JwkEcPrivateKey extends JwkEcPublicKey {
  d: string;
}

/**
 * Union type for JWK formats.
 */
export type JsonWebKey = JwkSymmetricKey | JwkEcPublicKey | JwkEcPrivateKey;

/**
 * Result of key export operation.
 */
export interface ExportKeyResult {
  /** Raw key bytes as base64 (for raw format) */
  raw?: string;
  /** Error message (if export failed) */
  error?: string;
  /** JWK fields (for jwk format) */
  [key: string]: any;
}

// ============================================================================
// Main Module Interface
// ============================================================================

/**
 * Native Web Crypto module interface.
 *
 * Provides comprehensive cryptographic operations using native iOS CryptoKit
 * and Security frameworks. Implements a subset of the W3C Web Crypto API.
 *
 * # Security Features
 * - Hardware-accelerated cryptography (CryptoKit)
 * - In-memory key storage (never persisted)
 * - Thread-safe key management
 * - FIPS 140-2 validated cryptographic modules
 *
 * # Supported Operations
 * - **Hashing**: SHA-256, SHA-384, SHA-512
 * - **Symmetric Encryption**: AES-GCM (128/192/256-bit keys)
 * - **Digital Signatures**: ECDSA with P-256 curve
 * - **Key Agreement**: ECDH with P-256 curve
 * - **Key Derivation**: PBKDF2 with SHA-256/SHA-512
 * - **Random Generation**: Cryptographically secure random bytes
 *
 * @example
 * ```typescript
 * import * as Webcrypto from 'expo-webcrypto';
 *
 * // Hash data
 * const hash = Webcrypto.digest(
 *   { name: 'SHA-256' },
 *   btoa('hello world')
 * );
 *
 * // Generate AES key
 * const key = Webcrypto.generateKey(
 *   { name: 'AES-GCM', length: 256 },
 *   true,
 *   ['encrypt', 'decrypt']
 * ) as SymmetricKeyResult;
 *
 * // Encrypt data
 * const iv = Webcrypto.getRandomValues(12);
 * const ciphertext = Webcrypto.encrypt(
 *   { name: 'AES-GCM', iv },
 *   key.secretKeyHandle,
 *   btoa('secret message')
 * );
 * ```
 */
declare class ExpoWebcryptoModule extends NativeModule {
  /**
   * Computes cryptographic hash digest of data.
   *
   * @param algorithm - Hash algorithm specification
   * @param dataB64 - Base64-encoded data to hash
   * @returns Base64-encoded hash digest, or error string on failure
   *
   * @example
   * ```typescript
   * const hash = Webcrypto.digest(
   *   { name: 'SHA-256' },
   *   btoa('hello world')
   * );
   * ```
   */
  digest(algorithm: HashAlgorithm, dataB64: string): string;

  /**
   * Generates a new cryptographic key or key pair.
   *
   * Creates symmetric keys (AES-GCM) or asymmetric key pairs (ECDSA, ECDH).
   * Keys are stored in memory and referenced by unique UUID handles.
   *
   * @param algorithm - Algorithm specification with parameters
   * @param extractable - Whether key can be exported (currently informational)
   * @param keyUsages - Array of intended key usage strings
   * @returns Key handle(s) or error object
   *
   * @example
   * ```typescript
   * // Generate AES-GCM key
   * const aesKey = Webcrypto.generateKey(
   *   { name: 'AES-GCM', length: 256 },
   *   true,
   *   ['encrypt', 'decrypt']
   * ) as SymmetricKeyResult;
   *
   * // Generate ECDSA key pair
   * const ecdsaKeys = Webcrypto.generateKey(
   *   { name: 'ECDSA', namedCurve: 'P-256' },
   *   true,
   *   ['sign', 'verify']
   * ) as KeyPairResult;
   * ```
   */
  generateKey(
    algorithm: AesGcmKeyGenParams | EcdsaKeyGenParams | EcdhKeyGenParams,
    extractable: boolean,
    keyUsages: string[]
  ): KeyGenerationResult;

  /**
   * Imports a cryptographic key from external format.
   *
   * Supports both raw binary and JWK (JSON Web Key) formats for various
   * key types including symmetric and asymmetric keys.
   *
   * @param format - Key format ('raw' or 'jwk')
   * @param keyData - Key material ({ raw: base64 } for raw format, JWK object for jwk format)
   * @param algorithm - Algorithm specification
   * @param extractable - Whether key can be exported
   * @param keyUsages - Array of intended usages
   * @returns Key handle string, or error string on failure
   *
   * @example
   * ```typescript
   * // Import raw AES key
   * const keyHandle = Webcrypto.importKey(
   *   'raw',
   *   { raw: keyBytesBase64 },
   *   { name: 'AES-GCM' },
   *   true,
   *   ['encrypt', 'decrypt']
   * );
   *
   * // Import JWK EC public key
   * const pubKeyHandle = Webcrypto.importKey(
   *   'jwk',
   *   { kty: 'EC', crv: 'P-256', x: '...', y: '...' },
   *   { name: 'ECDSA', namedCurve: 'P-256' },
   *   true,
   *   ['verify']
   * );
   * ```
   */
  importKey(
    format: 'raw' | 'jwk',
    keyData: { raw: string } | JsonWebKey,
    algorithm: Algorithm,
    extractable: boolean,
    keyUsages: string[]
  ): string;

  /**
   * Exports a cryptographic key to external format.
   *
   * Converts internal key representations to standard formats (raw binary or JWK)
   * suitable for storage, transmission, or interoperability.
   *
   * @param format - Export format ('raw' or 'jwk')
   * @param keyHandle - Handle to key to export
   * @returns Object with exported key data, or error object on failure
   *
   * @example
   * ```typescript
   * // Export as JWK
   * const jwk = Webcrypto.exportKey('jwk', keyHandle);
   *
   * // Export as raw bytes
   * const raw = Webcrypto.exportKey('raw', symmetricKeyHandle);
   * ```
   */
  exportKey(format: 'raw' | 'jwk', keyHandle: string): ExportKeyResult;

  /**
   * Encrypts data using AES-GCM authenticated encryption.
   *
   * Provides authenticated encryption with associated data (AEAD). The resulting
   * ciphertext includes an authentication tag for integrity verification.
   *
   * @param algorithm - AES-GCM parameters including IV
   * @param keyHandle - Handle to AES symmetric key
   * @param plainB64 - Base64-encoded plaintext data
   * @returns Base64-encoded ciphertext with authentication tag, or error string
   *
   * @example
   * ```typescript
   * const iv = Webcrypto.getRandomValues(12);  // 96-bit nonce
   * const ciphertext = Webcrypto.encrypt(
   *   { name: 'AES-GCM', iv },
   *   keyHandle,
   *   btoa('secret message')
   * );
   * ```
   *
   * @important Never reuse the same IV with the same key
   */
  encrypt(algorithm: AesGcmParams, keyHandle: string, plainB64: string): string;

  /**
   * Decrypts AES-GCM authenticated ciphertext.
   *
   * Verifies authentication tag and decrypts data. Fails if tag is invalid,
   * indicating tampering or corruption.
   *
   * @param algorithm - AES-GCM parameters including IV
   * @param keyHandle - Handle to AES symmetric key
   * @param cipherB64 - Base64-encoded ciphertext with authentication tag
   * @returns Base64-encoded plaintext, or error string on failure
   *
   * @example
   * ```typescript
   * const plaintext = Webcrypto.decrypt(
   *   { name: 'AES-GCM', iv },
   *   keyHandle,
   *   ciphertext
   * );
   * ```
   */
  decrypt(algorithm: AesGcmParams, keyHandle: string, cipherB64: string): string;

  /**
   * Creates ECDSA digital signature over data.
   *
   * Generates signature using P-256 elliptic curve with SHA-256 hash.
   * Signature is deterministic (RFC 6979) for security.
   *
   * @param algorithm - ECDSA parameters including hash algorithm
   * @param keyHandle - Handle to ECDSA private signing key
   * @param msgB64 - Base64-encoded message to sign
   * @returns Base64-encoded signature (DER or raw format), or error string
   *
   * @example
   * ```typescript
   * const signature = Webcrypto.sign(
   *   { name: 'ECDSA', hash: { name: 'SHA-256' } },
   *   privateKeyHandle,
   *   btoa('message to sign')
   * );
   * ```
   */
  sign(algorithm: EcdsaParams, keyHandle: string, msgB64: string): string;

  /**
   * Verifies ECDSA digital signature.
   *
   * Validates signature over data using P-256 public key.
   *
   * @param algorithm - ECDSA parameters including hash algorithm
   * @param keyHandle - Handle to ECDSA public verification key
   * @param sigB64 - Base64-encoded signature
   * @param msgB64 - Base64-encoded message that was signed
   * @returns 1 if signature is valid, 0 if invalid or error
   *
   * @example
   * ```typescript
   * const isValid = Webcrypto.verify(
   *   { name: 'ECDSA', hash: { name: 'SHA-256' } },
   *   publicKeyHandle,
   *   signature,
   *   btoa('message to verify')
   * );
   * // isValid === 1 means signature is valid
   * ```
   */
  verify(algorithm: EcdsaParams, keyHandle: string, sigB64: string, msgB64: string): number;

  /**
   * Derives cryptographic key material using PBKDF2 or ECDH.
   *
   * Supports two key derivation methods:
   * - **PBKDF2**: Password-based key derivation with configurable iterations
   * - **ECDH**: Elliptic curve Diffie-Hellman shared secret generation
   *
   * @param algorithm - Derivation algorithm specification with parameters
   * @param baseKeyHandle - Handle to base key (password for PBKDF2, private key for ECDH)
   * @param length - Output length in bytes (defaults to 32)
   * @returns Base64-encoded derived key material, or error string
   *
   * @example
   * ```typescript
   * // PBKDF2 derivation
   * const salt = Webcrypto.getRandomValues(16);
   * const derivedKey = Webcrypto.deriveBits(
   *   {
   *     name: 'PBKDF2',
   *     salt,
   *     iterations: 100000,
   *     hash: { name: 'SHA-256' }
   *   },
   *   passwordHandle,
   *   32  // 256 bits
   * );
   *
   * // ECDH key agreement
   * const sharedSecret = Webcrypto.deriveBits(
   *   { name: 'ECDH', public: otherPartyPublicKeyHandle },
   *   myPrivateKeyHandle,
   *   32
   * );
   * ```
   */
  deriveBits(
    algorithm: Pbkdf2Params | EcdhKeyDerivationParams,
    baseKeyHandle: string,
    length?: number
  ): string;

  /**
   * Generates cryptographically secure random bytes.
   *
   * Uses system's secure random number generator suitable for cryptographic
   * operations including key generation, nonce creation, and salt generation.
   *
   * @param length - Number of random bytes to generate (max: 65536)
   * @returns Base64-encoded random bytes, or error string if length exceeds limit
   *
   * @example
   * ```typescript
   * // Generate 32 random bytes for key material
   * const randomKey = Webcrypto.getRandomValues(32);
   *
   * // Generate 12-byte nonce for AES-GCM
   * const nonce = Webcrypto.getRandomValues(12);
   *
   * // Generate 16-byte salt for PBKDF2
   * const salt = Webcrypto.getRandomValues(16);
   * ```
   *
   * @important Maximum length is 65536 bytes (64 KiB)
   */
  getRandomValues(length: number): string;
}

/**
 * Expo Web Crypto module instance.
 *
 * Provides native cryptographic operations for React Native applications.
 * All data is exchanged as base64-encoded strings for JavaScript compatibility.
 *
 * @example
 * ```typescript
 * import * as Webcrypto from 'expo-webcrypto';
 *
 * // Generate secure random bytes
 * const randomBytes = Webcrypto.getRandomValues(32);
 *
 * // Hash data
 * const hash = Webcrypto.digest({ name: 'SHA-256' }, btoa('data'));
 * ```
 */
export default requireNativeModule<ExpoWebcryptoModule>('ExpoWebcrypto');

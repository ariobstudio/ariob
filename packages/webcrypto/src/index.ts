/**
 * @ariob/webcrypto - Native WebCrypto API for React Native and Expo
 *
 * This package provides a complete W3C WebCrypto API implementation using
 * platform-native cryptography (CryptoKit on iOS, KeyStore on Android).
 *
 * USAGE:
 * ```typescript
 * import { crypto } from '@ariob/webcrypto';
 *
 * // Hashing
 * const hash = await crypto.subtle.digest('SHA-256', data);
 *
 * // Symmetric encryption
 * const key = await crypto.subtle.generateKey(
 *   { name: 'AES-GCM', length: 256 },
 *   true,
 *   ['encrypt', 'decrypt']
 * );
 *
 * // Random generation
 * const random = crypto.getRandomValues(new Uint8Array(32));
 * ```
 */

import { crypto } from './crypto';

// Export the complete crypto object (default and named)
export { crypto };
export default crypto;

// Re-export types for TypeScript users
export type {
  CryptoKey,
  CryptoKeyPair,
  BufferSource,
  KeyFormat,
  KeyUsage,
  JsonWebKey,
} from './crypto';

// Re-export native module types for advanced users
export type {
  Algorithm,
  HashAlgorithm,
  AesGcmKeyGenParams,
  AesGcmParams,
  EcdsaKeyGenParams,
  EcdsaParams,
  EcdhKeyGenParams,
  EcdhKeyDerivationParams,
  Pbkdf2Params,
  SymmetricKeyResult,
  KeyPairResult,
  KeyGenerationError,
  KeyGenerationResult,
  JwkSymmetricKey,
  JwkEcPublicKey,
  JwkEcPrivateKey,
  ExportKeyResult,
} from './ExpoWebcryptoModule';

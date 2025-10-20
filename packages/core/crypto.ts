"background only";
/**
 * Crypto - SEA Cryptography Primitives
 *
 * Pure functions for all Gun SEA operations.
 * Background-only, Result-based error handling.
 */
import "./gun/native/crypto.js";
import SEA from './gun/lib/sea.js';
import type { KeyPair } from './graph';
import { Result } from './result';

/**
 * Get SEA instance (directly imported, no lazy loading)
 *
 * @returns SEA instance
 * @internal
 */
function getSEA(): any {
  'background only';
  return SEA;
}

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
  'background only';
  if (!keys) {
    return data;
  }

  try {
    const SEA = getSEA();
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
  'background only';
  if (!keys || !data) {
    return data;
  }

  // Check if data looks like encrypted SEA data
  if (typeof data === 'string' && data.startsWith('SEA{')) {
    try {
      const SEA = getSEA();
      const decrypted = await SEA.decrypt(data, keys.epriv);
      return decrypted !== undefined ? decrypted : data;
    } catch (error) {
      // If decryption fails, return original data
      return data;
    }
  }

  return data;
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
  'background only';
  try {
    const SEA = getSEA();
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
  'background only';
  try {
    const SEA = getSEA();
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
  'background only';
  try {
    const SEA = getSEA();
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
  'background only';
  try {
    const SEA = getSEA();
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
  'background only';
  try {
    const SEA = getSEA();
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
  'background only';
  try {
    const SEA = getSEA();
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
  'background only';
  try {
    const SEA = getSEA();
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
  'background only';
  try {
    const SEA = getSEA();
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

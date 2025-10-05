import type { Result } from 'neverthrow';
import { ok, err } from 'neverthrow';
import type { Storage } from '../../lib/storage';
import type { Credentials } from '../../schema/who.schema';
import type { AppError } from '../../schema/errors';
import * as Err from '../../schema/errors';
import type { SEA } from '../../core/types';

/**
 * Credentials manager interface
 * Handles secure storage of user credentials
 * Following UNIX philosophy: one-word verbs
 */
export interface CredentialsManager {
  /**
   * Save credentials to encrypted storage
   * @param creds - Credentials to save
   * @returns Result with void or error
   */
  save(creds: Credentials): Promise<Result<void, AppError>>;

  /**
   * Load credentials from encrypted storage
   * @returns Result with credentials or null if not found
   */
  load(): Promise<Result<Credentials | null, AppError>>;

  /**
   * Clear credentials from storage
   * @returns Result with void or error
   */
  clear(): Promise<Result<void, AppError>>;
}

/**
 * Storage key for credentials
 * Using versioned key to allow migration if needed
 */
const CREDENTIALS_KEY = 'ariob:credentials-v1';

/**
 * Encryption key for local storage
 * In production, this should be derived from device-specific data
 * or use hardware-backed encryption
 */
const ENCRYPTION_KEY = 'local-storage-key';

/**
 * Create a credentials manager
 * Handles encryption/decryption of credentials using SEA
 * Following UNIX philosophy: one-word noun
 *
 * @example
 * ```typescript
 * import { credentials } from '@ariob/core';
 * import { storage } from '@ariob/core';
 * import { sea } from '@ariob/core';
 *
 * const creds = credentials(storage(), sea);
 *
 * // Save credentials
 * await creds.save({
 *   pub: 'public-key',
 *   priv: 'private-key',
 *   alias: 'user',
 *   authMethod: 'keypair'
 * });
 *
 * // Load credentials
 * const result = await creds.load();
 *
 * // Clear credentials
 * await creds.clear();
 * ```
 *
 * @param store - Storage implementation
 * @param sea - SEA encryption library
 * @returns Credentials manager
 */
export const credentials = (store: Storage, sea: SEA): CredentialsManager => {
  return {
    save: async (creds: Credentials): Promise<Result<void, AppError>> => {
      try {
        // Serialize credentials
        const serialized = JSON.stringify(creds);

        // Encrypt using SEA
        const encrypted = await sea.encrypt(serialized, ENCRYPTION_KEY);

        // Store encrypted data
        await store.set(CREDENTIALS_KEY, encrypted);

        return ok(undefined);
      } catch (error) {
        return err(Err.unknown('Failed to save credentials', error));
      }
    },

    load: async (): Promise<Result<Credentials | null, AppError>> => {
      try {
        // Get encrypted data
        const encrypted = await store.get(CREDENTIALS_KEY);

        // Return null if no credentials stored
        if (!encrypted) {
          return ok(null);
        }

        // Decrypt using SEA
        const decrypted = await sea.decrypt(encrypted, ENCRYPTION_KEY);

        // Parse and return credentials
        const creds = JSON.parse(decrypted) as Credentials;
        return ok(creds);
      } catch (error) {
        return err(Err.unknown('Failed to load credentials', error));
      }
    },

    clear: async (): Promise<Result<void, AppError>> => {
      try {
        await store.remove(CREDENTIALS_KEY);
        return ok(undefined);
      } catch (error) {
        return err(Err.unknown('Failed to clear credentials', error));
      }
    },
  };
};

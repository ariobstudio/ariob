import { gun, sea } from '../core/gun';
import { Result, ok, err } from 'neverthrow';
import * as Err from '../schema/errors';

/**
 * Frozen data structure
 * Represents immutable data stored with content-addressable hash
 */
export interface Frozen<T = any> {
  /**
   * SHA-256 hash of the data
   * Used as the content-addressable key
   */
  hash: string;

  /**
   * The frozen data
   */
  data: T;
}

/**
 * Options for freezing data
 */
export interface FreezeOptions {
  /**
   * Optional prefix for organizing frozen data
   * Stored as `#prefix/hash` instead of `#hash`
   *
   * @example
   * ```typescript
   * freeze(data, { prefix: 'messages' });
   * // Stored at: gun.get('#messages').get(hash)
   * ```
   */
  prefix?: string;

  /**
   * Optional metadata to store alongside the hash
   * Useful for searchability without exposing content
   *
   * @example
   * ```typescript
   * freeze(message, {
   *   prefix: 'inbox',
   *   metadata: { to: 'alice', timestamp: Date.now() }
   * });
   * ```
   */
  metadata?: Record<string, any>;
}

/**
 * Options for thawing data
 */
export interface ThawOptions {
  /**
   * Optional prefix used when freezing
   * Must match the prefix used in freeze()
   */
  prefix?: string;

  /**
   * Verify hash matches data
   * @default true
   */
  verify?: boolean;
}

/**
 * Hash data using SEA.work with SHA-256
 * Pure function that computes content-addressable hash
 *
 * Following UNIX philosophy: one-word verb, one responsibility
 *
 * @example
 * ```typescript
 * const hash = await hash('hello world');
 * // Returns: SHA-256 hash string
 * ```
 *
 * @param data - Data to hash (will be stringified if not a string)
 * @returns Promise resolving to hash string
 */
export const hash = async <T = any>(data: T): Promise<string> => {
  // Convert data to string for hashing
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);

  // Use SEA.work with SHA-256 (same as Gun's frozen data pattern)
  return sea.work(stringData, undefined, undefined, { name: 'SHA-256' });
};

/**
 * Freeze data to immutable storage
 * Stores data at `#hash` or `#prefix/hash` using content-addressable pattern
 *
 * Following Gun's immutable data pattern from FROZEN.md:
 * - Hash the data using SEA.work with SHA-256
 * - Store at gun.get('#').get(hash)
 * - Verification prevents data tampering
 *
 * Following UNIX philosophy: one-word verb, clear purpose
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await freeze('hello world');
 * result.match(
 *   ({ hash, data }) => console.log('Frozen at hash:', hash),
 *   (error) => console.error(error)
 * );
 * ```
 *
 * @example
 * ```typescript
 * // With prefix for organization
 * const message = { text: 'Hello!', from: 'alice' };
 * const result = await freeze(message, { prefix: 'messages' });
 * // Stored at: gun.get('#messages').get(hash)
 * ```
 *
 * @example
 * ```typescript
 * // With metadata for searchability
 * const notification = { title: 'New message', body: 'You have mail' };
 * const result = await freeze(notification, {
 *   prefix: 'notify@alice',
 *   metadata: { timestamp: Date.now(), read: false }
 * });
 * ```
 *
 * @param data - Data to freeze (any JSON-serializable value)
 * @param options - Freeze options
 * @returns Result with frozen data and hash
 */
export const freeze = async <T = any>(
  data: T,
  options: FreezeOptions = {}
): Promise<Result<Frozen<T>, Err.AppError>> => {
  try {
    // Hash the data
    const dataHash = await hash(data);

    // Prepare storage data
    const storageData = typeof data === 'string' ? data : JSON.stringify(data);

    // Determine storage path
    const basePath = options.prefix ? `#${options.prefix}` : '#';

    // Store the data with error handling
    return new Promise((resolve) => {
      gun
        .get(basePath)
        .get(dataHash)
        .put(storageData as unknown as Partial<any>, (ack: any) => {
          if (ack.err) {
            // Check if error is due to hash mismatch (expected behavior)
            if (ack.err.includes('hash')) {
              // Data already exists with correct hash, this is OK
              resolve(ok({ hash: dataHash, data }));
            } else {
              resolve(err(Err.db(ack.err)));
            }
          } else {
            // Store metadata if provided
            if (options.metadata) {
              gun
                .get(`${basePath}#meta`)
                .get(dataHash)
                .put(options.metadata);
            }

            resolve(ok({ hash: dataHash, data }));
          }
        });
    });
  } catch (error: any) {
    return err(Err.unknown('Failed to freeze data', error));
  }
};

/**
 * Thaw frozen data from immutable storage
 * Retrieves data from `#hash` or `#prefix/hash`
 * Optionally verifies hash matches content
 *
 * Following UNIX philosophy: one-word verb, clear purpose
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await thaw('abc123...');
 * result.match(
 *   ({ hash, data }) => console.log('Thawed:', data),
 *   (error) => console.error(error)
 * );
 * ```
 *
 * @example
 * ```typescript
 * // With prefix (must match freeze prefix)
 * const result = await thaw('abc123...', { prefix: 'messages' });
 * ```
 *
 * @example
 * ```typescript
 * // Without verification (faster but less safe)
 * const result = await thaw('abc123...', { verify: false });
 * ```
 *
 * @param dataHash - Hash of the frozen data
 * @param options - Thaw options
 * @returns Result with frozen data structure
 */
export const thaw = async <T = any>(
  dataHash: string,
  options: ThawOptions = {}
): Promise<Result<Frozen<T>, Err.AppError>> => {
  try {
    // Determine storage path
    const basePath = options.prefix ? `#${options.prefix}` : '#';
    const shouldVerify = options.verify !== false;

    // Retrieve the data
    return new Promise((resolve) => {
      gun
        .get(basePath)
        .get(dataHash)
        .once(async (storageData: any) => {
          if (!storageData) {
            resolve(err(Err.notFound(`No frozen data found for hash: ${dataHash}`)));
            return;
          }

          try {
            // Parse data if it's JSON
            let data: T;
            try {
              data = JSON.parse(storageData) as T;
            } catch {
              // Not JSON, use as-is
              data = storageData as T;
            }

            // Verify hash if requested
            if (shouldVerify) {
              const computedHash = await hash(data);
              if (computedHash !== dataHash) {
                resolve(
                  err(
                    Err.validate(
                      `Hash mismatch: expected ${dataHash}, got ${computedHash}`
                    )
                  )
                );
                return;
              }
            }

            resolve(ok({ hash: dataHash, data }));
          } catch (error: any) {
            resolve(err(Err.unknown('Failed to parse frozen data', error)));
          }
        });
    });
  } catch (error: any) {
    return err(Err.unknown('Failed to thaw data', error));
  }
};

/**
 * List frozen data with a given prefix
 * Useful for iterating over collections of frozen data
 *
 * Following UNIX philosophy: one-word verb
 *
 * @example
 * ```typescript
 * // List all frozen messages
 * const messages = await list('messages');
 * messages.match(
 *   (hashes) => console.log('Found hashes:', hashes),
 *   (error) => console.error(error)
 * );
 * ```
 *
 * @param prefix - Prefix to list from
 * @param timeout - Timeout in ms to wait for data (default: 300)
 * @returns Result with array of hashes
 */
export const list = async (
  prefix: string,
  timeout: number = 300
): Promise<Result<string[], Err.AppError>> => {
  try {
    const hashes: string[] = [];

    return new Promise((resolve) => {
      gun
        .get(`#${prefix}`)
        .map()
        .once((data: any, key: string) => {
          if (data && key) {
            hashes.push(key);
          }
        });

      // Gun doesn't have a "done" callback
      setTimeout(() => resolve(ok(hashes)), timeout);
    });
  } catch (error: any) {
    return err(Err.unknown('Failed to list frozen data', error));
  }
};

/**
 * Create immutable link to mutable user content
 * Stores a soul (user graph path) in frozen storage
 * Others can access via the hash without being able to edit
 *
 * Following Gun's pattern from FROZEN.md for immutable links
 *
 * @example
 * ```typescript
 * // User creates a message and freezes its soul
 * gun.user().get('messages').set({ text: 'hello' }).on(async (data) => {
 *   const soul = data._['#'];
 *   const result = await link(soul, 'messages');
 *   // Others can now read via the hash
 * });
 * ```
 *
 * @param soul - Gun soul/path to freeze
 * @param prefix - Optional prefix for organization
 * @returns Result with frozen link (hash of soul)
 */
export const link = async (
  soul: string,
  prefix?: string
): Promise<Result<Frozen<string>, Err.AppError>> => {
  return freeze(soul, { prefix: prefix ? `${prefix}#links` : 'links' });
};

/**
 * Resolve an immutable link to get the underlying soul
 * Retrieves the soul stored by link()
 *
 * @example
 * ```typescript
 * // Resolve link and read message
 * const result = await resolve(hash, 'messages');
 * result.match(
 *   ({ data: soul }) => {
 *     gun.get(soul).once(message => console.log(message));
 *   },
 *   (error) => console.error(error)
 * );
 * ```
 *
 * @param hash - Hash of the frozen link
 * @param prefix - Optional prefix (must match link prefix)
 * @returns Result with soul string
 */
export const resolve = async (
  hash: string,
  prefix?: string
): Promise<Result<Frozen<string>, Err.AppError>> => {
  return thaw<string>(hash, { prefix: prefix ? `${prefix}#links` : 'links' });
};

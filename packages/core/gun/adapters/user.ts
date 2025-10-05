import type { Result } from 'neverthrow';
import { ok, err } from 'neverthrow';
import type { z } from 'zod';
import type { GunUser } from '../core/types';
import type { AppError } from '../schema/errors';
import * as Err from '../schema/errors';
import type { Adapter } from './adapter';

/**
 * User-scoped Gun adapter for private data
 * All operations are scoped to the authenticated user's graph
 * Following UNIX philosophy: one-word verbs for actions
 *
 * @template T - The type of data this adapter handles
 *
 * @example
 * ```typescript
 * import { who } from '../services/who';
 * import { NoteSchema } from '../schema/note';
 *
 * const user = who.instance();
 * const adapter = new User(user, NoteSchema);
 *
 * // Save private note
 * const result = await adapter.put('notes/123', noteData);
 * ```
 */
export class User<T> implements Adapter<T> {
  constructor(
    private user: GunUser,
    private schema: z.ZodType<T>
  ) {
    if (!this.user || !this.user.is) {
      throw new Error('User must be authenticated for user-scoped operations');
    }
  }

  /**
   * Get a single item by path (from user's private graph)
   */
  async get(path: string): Promise<Result<T | null, AppError>> {
    return new Promise((resolve) => {
      this.user.get(path).once((data: any) => {
        if (!data) {
          resolve(ok(null));
          return;
        }

        const validated = this.check(data);
        resolve(validated);
      });
    });
  }

  /**
   * Save an item at path (to user's private graph)
   */
  async put(path: string, data: T): Promise<Result<T, AppError>> {
    // Validate before saving
    const validated = this.check(data);
    if (validated.isErr()) {
      return validated;
    }

    return new Promise((resolve) => {
      this.user.get(path).put(data as Partial<any>, (ack: any) => {
        if (ack.err) {
          resolve(err(Err.db(ack.err)));
        } else {
          resolve(ok(data));
        }
      });
    });
  }

  /**
   * Remove an item at path (from user's private graph)
   */
  async remove(path: string): Promise<Result<boolean, AppError>> {
    return new Promise((resolve) => {
      this.user.get(path).put(null, (ack: any) => {
        if (ack.err) {
          resolve(err(Err.db(ack.err)));
        } else {
          resolve(ok(true));
        }
      });
    });
  }

  /**
   * List all items at a path prefix (from user's private graph)
   */
  async list(path: string): Promise<Result<T[], AppError>> {
    return new Promise((resolve) => {
      const items: T[] = [];

      this.user
        .get(path)
        .map()
        .once((data: any) => {
          if (data) {
            const validated = this.check(data);
            validated.match(
              (item) => items.push(item),
              () => {} // Skip invalid items
            );
          }
        });

      // Gun doesn't have a "done" callback, so use timeout
      setTimeout(() => resolve(ok(items)), 300);
    });
  }

  /**
   * Subscribe to real-time updates at path (in user's private graph)
   */
  watch(path: string, callback: (data: T | null) => void): () => void {
    this.user.get(path).on((data: any) => {
      if (!data) {
        callback(null);
        return;
      }

      this.check(data).match(
        (validated) => callback(validated),
        () => callback(null) // Validation failed, send null
      );
    });

    // Return unsubscribe function
    return () => this.user.get(path).off();
  }

  /**
   * Validate data against schema
   * @private
   */
  private check(data: unknown): Result<T, AppError> {
    try {
      return ok(this.schema.parse(data));
    } catch (error) {
      return err(Err.fromZod(error));
    }
  }
}

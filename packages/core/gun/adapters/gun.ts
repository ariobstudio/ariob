import type { Result } from 'neverthrow';
import { ok, err } from 'neverthrow';
import type { z } from 'zod';
import type { GunInstance } from '../core/types';
import type { AppError } from '../schema/errors';
import * as Err from '../schema/errors';
import type { Adapter } from './adapter';

/**
 * Gun adapter for database operations
 * Wraps Gun API with Result types and validation
 * Following UNIX philosophy: one-word verbs for actions
 *
 * @template T - The type of data this adapter handles
 *
 * @example
 * ```typescript
 * import { gun } from '../core/gun';
 * import { TodoSchema } from '../schema/todo';
 *
 * const adapter = new Gun(gun, TodoSchema);
 *
 * // Get an item
 * const result = await adapter.get('todos/123');
 *
 * // Save an item
 * const saved = await adapter.put('todos/123', todoData);
 * ```
 */
export class Gun<T> implements Adapter<T> {
  constructor(
    private gun: GunInstance,
    private schema: z.ZodType<T>
  ) {}

  /**
   * Get a single item by path
   */
  async get(path: string): Promise<Result<T | null, AppError>> {
    return new Promise((resolve) => {
      this.gun.get(path).once((data: any) => {
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
   * Save an item at path
   */
  async put(path: string, data: T): Promise<Result<T, AppError>> {
    // Validate before saving
    const validated = this.check(data);
    if (validated.isErr()) {
      return validated;
    }

    return new Promise((resolve) => {
      this.gun.get(path).put(data as any, (ack: any) => {
        if (ack.err) {
          resolve(err(Err.db(ack.err)));
        } else {
          resolve(ok(data));
        }
      });
    });
  }

  /**
   * Remove an item at path
   */
  async remove(path: string): Promise<Result<boolean, AppError>> {
    return new Promise((resolve) => {
      this.gun.get(path).put(null, (ack: any) => {
        if (ack.err) {
          resolve(err(Err.db(ack.err)));
        } else {
          resolve(ok(true));
        }
      });
    });
  }

  /**
   * List all items at a path prefix
   * Uses Gun's .map() to iterate over all items
   */
  async list(path: string): Promise<Result<T[], AppError>> {
    return new Promise((resolve) => {
      const items: T[] = [];

      this.gun
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
      // This is a known limitation of Gun's API
      setTimeout(() => resolve(ok(items)), 300);
    });
  }

  /**
   * Subscribe to real-time updates at path
   */
  watch(path: string, callback: (data: T | null) => void): () => void {
    this.gun.get(path).on((data: any) => {
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
    return () => this.gun.get(path).off();
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

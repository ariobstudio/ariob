import type { Result } from 'neverthrow';
import { ok, err } from 'neverthrow';
import type { z } from 'zod';
import type { GunInstance, GunChain } from '../core/types';
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
  private chain(path: string): GunChain {
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) {
      return this.gun.get(path);
    }

    let node: GunChain = this.gun.get(segments[0]);

    for (let i = 1; i < segments.length; i += 1) {
      node = node.get(segments[i]);
    }

    return node;
  }

  async get(path: string): Promise<Result<T | null, AppError>> {
    return new Promise((resolve) => {
      this.chain(path).once((data: any) => {
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
      let settled = false;
      const finish = (result: Result<T, AppError>) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      const timeout = setTimeout(() => {
        finish(ok(data));
      }, 3000);

      this.chain(path).put(data as any, (ack: any) => {
        if (settled) return;
        clearTimeout(timeout);

        if (ack && ack.err) {
          finish(err(Err.db(ack.err)));
        } else {
          finish(ok(data));
        }
      });
    });
  }

  /**
   * Remove an item at path
   */
  async remove(path: string): Promise<Result<boolean, AppError>> {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (result: Result<boolean, AppError>) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      const timeout = setTimeout(() => {
        finish(ok(true));
      }, 3000);

      this.chain(path).put(null, (ack: any) => {
        if (settled) return;
        clearTimeout(timeout);

        if (ack && ack.err) {
          finish(err(Err.db(ack.err)));
        } else {
          finish(ok(true));
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

      this.chain(path)
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
    const node = this.chain(path);

    node.on((data: any) => {
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
    return () => node.off();
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

import type { Result } from 'neverthrow';
import { ok, err } from 'neverthrow';
import type { z } from 'zod';
import type { AppError } from '../schema/errors';
import * as Err from '../schema/errors';
import type { Adapter } from './adapter';

/**
 * In-memory adapter for testing
 * Stores data in a Map, provides same interface as Gun adapter
 * Perfect for unit tests without needing Gun instance
 * Following UNIX philosophy: one-word verbs for actions
 *
 * @template T - The type of data this adapter handles
 *
 * @example
 * ```typescript
 * import { Memory } from './memory';
 * import { TodoSchema } from '../schema/todo';
 *
 * const adapter = new Memory(TodoSchema);
 *
 * // Use exactly like Gun adapter
 * await adapter.put('todos/123', todoData);
 * const result = await adapter.get('todos/123');
 * ```
 */
export class Memory<T> implements Adapter<T> {
  private store = new Map<string, T>();
  private watchers = new Map<string, Set<(data: T | null) => void>>();

  constructor(private schema: z.ZodType<T>) {}

  /**
   * Get a single item by path
   */
  async get(path: string): Promise<Result<T | null, AppError>> {
    const data = this.store.get(path);
    if (!data) {
      return ok(null);
    }
    return this.check(data);
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

    this.store.set(path, data);

    // Notify watchers
    this.notify(path, data);

    return ok(data);
  }

  /**
   * Remove an item at path
   */
  async remove(path: string): Promise<Result<boolean, AppError>> {
    const existed = this.store.has(path);
    this.store.delete(path);

    // Notify watchers
    this.notify(path, null);

    return ok(existed);
  }

  /**
   * List all items at a path prefix
   * Filters all keys that start with the path prefix
   */
  async list(path: string): Promise<Result<T[], AppError>> {
    const items: T[] = [];

    for (const [key, value] of Array.from(this.store.entries())) {
      // Check if key starts with path prefix
      if (key.startsWith(path + '/') || key === path) {
        const validated = this.check(value);
        validated.match(
          (item) => items.push(item),
          () => {} // Skip invalid items
        );
      }
    }

    return ok(items);
  }

  /**
   * Subscribe to real-time updates at path
   * Simulates Gun's real-time behavior in memory
   */
  watch(path: string, callback: (data: T | null) => void): () => void {
    // Get or create watchers set for this path
    let callbacks = this.watchers.get(path);
    if (!callbacks) {
      callbacks = new Set();
      this.watchers.set(path, callbacks);
    }

    // Add callback
    callbacks.add(callback);

    // Immediately call with current value (like Gun does)
    const current = this.store.get(path);
    if (current) {
      this.check(current).match(
        (validated) => callback(validated),
        () => callback(null)
      );
    } else {
      callback(null);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.watchers.get(path);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.watchers.delete(path);
        }
      }
    };
  }

  /**
   * Notify all watchers of a path about data change
   * @private
   */
  private notify(path: string, data: T | null): void {
    const callbacks = this.watchers.get(path);
    if (!callbacks) return;

    if (data === null) {
      callbacks.forEach((cb) => cb(null));
    } else {
      this.check(data).match(
        (validated) => callbacks.forEach((cb) => cb(validated)),
        () => callbacks.forEach((cb) => cb(null))
      );
    }
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

  /**
   * Clear all data (useful for test cleanup)
   */
  clear(): void {
    this.store.clear();
    this.watchers.clear();
  }

  /**
   * Get number of stored items (useful for testing)
   */
  size(): number {
    return this.store.size;
  }
}

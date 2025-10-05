import type { Result } from 'neverthrow';
import type { AppError } from '../schema/errors';

/**
 * Adapter interface for database operations
 * Decouples services from specific database implementations (Gun, Memory, etc.)
 * Following UNIX philosophy: one-word verbs for actions
 *
 * @template T - The type of data this adapter handles
 */
export interface Adapter<T> {
  /**
   * Get a single item by path
   *
   * @example
   * ```typescript
   * const result = await adapter.get('todos/123');
   * result.match(
   *   (item) => console.log('Found:', item),
   *   (error) => console.error('Error:', error)
   * );
   * ```
   *
   * @param path - Gun path to the item
   * @returns Result with item or null if not found
   */
  get(path: string): Promise<Result<T | null, AppError>>;

  /**
   * Save an item at path
   *
   * @example
   * ```typescript
   * const result = await adapter.put('todos/123', todoData);
   * result.match(
   *   (saved) => console.log('Saved:', saved),
   *   (error) => console.error('Failed:', error)
   * );
   * ```
   *
   * @param path - Gun path where item should be saved
   * @param data - Item data to save
   * @returns Result with saved item
   */
  put(path: string, data: T): Promise<Result<T, AppError>>;

  /**
   * Remove an item at path
   *
   * @example
   * ```typescript
   * const result = await adapter.remove('todos/123');
   * result.match(
   *   (success) => console.log('Removed'),
   *   (error) => console.error('Failed:', error)
   * );
   * ```
   *
   * @param path - Gun path to remove
   * @returns Result with success boolean
   */
  remove(path: string): Promise<Result<boolean, AppError>>;

  /**
   * List all items at a path prefix
   *
   * @example
   * ```typescript
   * const result = await adapter.list('todos');
   * result.match(
   *   (items) => console.log('Found:', items.length),
   *   (error) => console.error('Failed:', error)
   * );
   * ```
   *
   * @param path - Gun path prefix to list from
   * @returns Result with array of items
   */
  list(path: string): Promise<Result<T[], AppError>>;

  /**
   * Subscribe to real-time updates at path
   *
   * @example
   * ```typescript
   * const unsubscribe = adapter.watch('todos/123', (item) => {
   *   console.log('Updated:', item);
   * });
   *
   * // Later: cleanup
   * unsubscribe();
   * ```
   *
   * @param path - Gun path to watch
   * @param callback - Function called with updates
   * @returns Unsubscribe function
   */
  watch(path: string, callback: (data: T | null) => void): () => void;
}

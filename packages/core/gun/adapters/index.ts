import type { z } from 'zod';
import type { GunInstance, GunUser } from '../core/types';
import type { Adapter } from './adapter';
import { Gun } from './gun';
import { User } from './user';
import { Memory } from './memory';

/**
 * Adapter factory options
 */
export interface AdapterOptions {
  /**
   * Whether to use user-scoped storage (private data)
   */
  scoped?: boolean;

  /**
   * Gun user instance (required if scoped is true)
   */
  user?: GunUser;
}

/**
 * Create an adapter for database operations
 * Factory function that returns appropriate adapter based on options
 * Following UNIX philosophy: one-word verb
 *
 * @example
 * ```typescript
 * // Public data
 * const adapter = adapt(gun, TodoSchema);
 *
 * // User-scoped private data
 * const privateAdapter = adapt(gun, NoteSchema, {
 *   scoped: true,
 *   user: who.instance()
 * });
 * ```
 *
 * @param gun - Gun instance
 * @param schema - Zod schema for validation
 * @param options - Adapter options
 * @returns Adapter instance
 */
export const adapt = <T>(
  gun: GunInstance,
  schema: z.ZodType<T>,
  options?: AdapterOptions
): Adapter<T> => {
  if (options?.scoped) {
    if (!options.user) {
      throw new Error('User instance required for scoped adapter');
    }
    return new User(options.user, schema);
  }

  return new Gun(gun, schema);
};

// Export all adapter types and classes
export type { Adapter } from './adapter';
export { Gun } from './gun';
export { User } from './user';
export { Memory } from './memory';

import type { Result } from 'neverthrow';
import { ok } from 'neverthrow';
import type { Thing } from '../../schema/thing.schema';
import type { AppError } from '../../schema/errors';
import type { Adapter } from '../../adapters/adapter';
import type { Validator, PrepareOptions } from './validator';
import type { Manager } from './manager';
import { soul, stamp } from '../../lib/utils';

/**
 * Thing service configuration
 */
export interface ServiceConfig<T extends Thing> {
  /**
   * Schema validator
   */
  validator: Validator<T>;

  /**
   * Database adapter
   */
  adapter: Adapter<T>;

  /**
   * Subscription manager
   */
  manager: Manager;

  /**
   * Path prefix for Gun paths
   */
  prefix: string;

  /**
   * Preparation options for new items
   */
  options: PrepareOptions;
}

/**
 * Thing service interface
 * Core CRUD operations for Things
 * Following UNIX philosophy: one-word verbs
 */
export interface ThingService<T extends Thing> {
  /**
   * Create a new thing
   * @param data - Thing data (without id, timestamps, etc.)
   * @returns Result with created thing
   */
  create(
    data: Omit<T, 'id' | 'createdAt' | 'soul' | 'schema' | 'createdBy'>
  ): Promise<Result<T, AppError>>;

  /**
   * Get a thing by ID
   * @param id - Thing ID
   * @returns Result with thing or null if not found
   */
  get(id: string): Promise<Result<T | null, AppError>>;

  /**
   * Update a thing
   * @param id - Thing ID
   * @param updates - Partial updates
   * @returns Result with updated thing or null if not found
   */
  update(
    id: string,
    updates: Partial<Omit<T, 'id' | 'createdAt' | 'soul' | 'schema'>>
  ): Promise<Result<T | null, AppError>>;

  /**
   * Remove a thing
   * @param id - Thing ID
   * @returns Result with success boolean
   */
  remove(id: string): Promise<Result<boolean, AppError>>;

  /**
   * List all things
   * @returns Result with array of things
   */
  list(): Promise<Result<T[], AppError>>;

  /**
   * Watch a thing for real-time updates
   * @param id - Thing ID
   * @param callback - Function called with updates
   * @returns Unsubscribe function
   */
  watch(id: string, callback: (result: Result<T | null, AppError>) => void): () => void;

  /**
   * Clean up all subscriptions
   */
  cleanup(): void;

  /**
   * Get Gun path for a thing
   * @param id - Thing ID
   * @returns Gun path string
   */
  soul(id: string): string;

  /**
   * Expose adapter for advanced use
   */
  adapter: Adapter<T>;

  /**
   * Expose validator for advanced use
   */
  validator: Validator<T>;
}

/**
 * Create a thing service
 * Composes validator, adapter, and manager into a service
 * Following UNIX philosophy: one-word verb
 *
 * @example
 * ```typescript
 * const config = {
 *   validator: validator(TodoSchema),
 *   adapter: adapt(gun, TodoSchema),
 *   manager: manager(),
 *   prefix: 'todos',
 *   options: { prefix: 'todos', type: 'todo' }
 * };
 *
 * const todos = service(config);
 *
 * // Use the service
 * const result = await todos.create({ title: 'Task' });
 * ```
 *
 * @param config - Service configuration
 * @returns Thing service
 */
export const service = <T extends Thing>(
  config: ServiceConfig<T>
): ThingService<T> => {
  return {
    // Create - compose prepare, check, and save
    create: async (input) => {
      const prepared = config.validator.prepare(input as Partial<T>, config.options);
      const validated = config.validator.check(prepared);

      if (validated.isErr()) return validated;

      const path = soul(config.prefix, prepared.id);
      return config.adapter.put(path, validated.value);
    },

    // Get - simple delegation to adapter
    get: async (id) => {
      const path = soul(config.prefix, id);
      return config.adapter.get(path);
    },

    // Update - get, merge, check, save
    update: async (id, updates) => {
      const path = soul(config.prefix, id);
      const existing = await config.adapter.get(path);

      if (existing.isErr()) return existing;
      if (!existing.value) return ok(null);

      const updated = {
        ...existing.value,
        ...updates,
        updatedAt: stamp(),
      };

      const validated = config.validator.check(updated);
      if (validated.isErr()) return validated;

      return config.adapter.put(path, validated.value);
    },

    // Remove - simple delegation
    remove: async (id) => {
      const path = soul(config.prefix, id);
      return config.adapter.remove(path);
    },

    // List - delegation to adapter
    list: async () => {
      return config.adapter.list(config.prefix);
    },

    // Watch - adapter + subscription management
    watch: (id, callback) => {
      const path = soul(config.prefix, id);

      const unsubscribe = config.adapter.watch(path, (data) => {
        if (data === null) {
          callback(ok(null));
          return;
        }
        callback(ok(data));
      });

      config.manager.add(path, unsubscribe);

      return () => config.manager.remove(path);
    },

    // Cleanup - delegate to subscription manager
    cleanup: () => config.manager.cleanup(),

    // Utility - create soul path
    soul: (id) => soul(config.prefix, id),

    // Expose internals for advanced use
    adapter: config.adapter,
    validator: config.validator,
  };
};

import type { z } from 'zod';
import type { Result } from 'neverthrow';
import { ok, err } from 'neverthrow';
import type { Thing } from '../../schema/thing.schema';
import type { AppError } from '../../schema/errors';
import * as Err from '../../schema/errors';
import { random, soul, stamp, extract } from '../../lib/utils';

/**
 * Options for preparing data
 */
export interface PrepareOptions {
  prefix: string;
  type: string;
  creator?: string;
}

/**
 * Validator interface
 * Handles validation and data preparation
 * Following UNIX philosophy: one-word verbs
 */
export interface Validator<T extends Thing> {
  /**
   * Validate data against schema
   * @param data - Data to validate
   * @returns Result with validated data or error
   */
  check(data: unknown): Result<T, AppError>;

  /**
   * Prepare new thing with defaults
   * @param input - Partial input data
   * @param options - Preparation options
   * @returns Fully prepared thing with id, timestamps, etc.
   */
  prepare(input: Partial<T>, options: PrepareOptions): T;
}

/**
 * Create a validator for a schema
 * Returns functions for checking and preparing data
 * Following UNIX philosophy: one-word verb
 *
 * @example
 * ```typescript
 * const validate = validator(TodoSchema);
 *
 * // Check data validity
 * const result = validate.check(data);
 *
 * // Prepare new item
 * const todo = validate.prepare({ title: 'Task' }, {
 *   prefix: 'todos',
 *   type: 'todo',
 *   creator: userPub
 * });
 * ```
 *
 * @param schema - Zod schema for validation
 * @returns Validator instance
 */
export const validator = <T extends Thing>(
  schema: z.ZodType<T>
): Validator<T> => {
  return {
    check: (data: unknown): Result<T, AppError> => {
      try {
        return ok(schema.parse(data));
      } catch (error) {
        return err(Err.fromZod(error));
      }
    },

    prepare: (input: Partial<T>, options: PrepareOptions): T => {
      const id = random();
      const now = stamp();

      return {
        id,
        soul: soul(options.prefix, id),
        schema: options.type,
        createdAt: now,
        updatedAt: now,
        public: true,
        ...(options.creator && { createdBy: options.creator }),
        ...input,
      } as T;
    },
  };
};

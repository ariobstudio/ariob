'background only';

import type { z } from 'zod';
import { gun } from '../../core/gun';
import type { Thing } from '../../schema/thing.schema';
import { extract } from '../../lib/utils';
import { adapt } from '../../adapters';
import { validator } from './validator';
import { manager } from './manager';
import { service, type ThingService } from './service';

/**
 * Service factory options
 */
export interface ServiceOptions {
  /**
   * Whether to scope data to authenticated user
   * If true, data is private to the user
   */
  scoped?: boolean;
}

/**
 * Create a thing service with Gun adapter
 * High-level convenience factory that handles all setup
 * Following UNIX philosophy: one-word verb
 *
 * @example
 * ```typescript
 * import { make, ThingSchema } from '@ariob/core';
 * import { z } from 'zod';
 *
 * // Define schema
 * const TodoSchema = ThingSchema.extend({
 *   title: z.string(),
 *   completed: z.boolean(),
 * });
 *
 * // Create service (one line!)
 * const todos = make(TodoSchema, 'todos');
 *
 * // Use it
 * const result = await todos.create({
 *   title: 'Build something amazing',
 *   completed: false
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Private user data
 * const notes = make(NoteSchema, 'notes', { scoped: true });
 * ```
 *
 * @param schema - Zod schema for validation
 * @param prefix - Gun path prefix
 * @param options - Service options
 * @returns Thing service
 */
export const make = <T extends Thing>(
  schema: z.ZodType<T>,
  prefix: string,
  options: ServiceOptions = {}
): ThingService<T> => {
  'background only';
  // Extract schema type from schema definition
  const schemaType = extract(schema) || prefix;

  // Get scoped option
  const isScoped = options.scoped || false;

  // Create adapter (will throw if scoped but no user)
  const adapter = adapt(gun, schema, {
    scoped: isScoped,
    ...(isScoped && {
      // Import who service dynamically to avoid circular dependency
      get user() {
        const { who } = require('../who.service');
        const userInstance = who.instance();
        if (!userInstance?.is) {
          throw new Error('Authentication required for user-scoped operations');
        }
        return userInstance;
      },
    }),
  });

  // Create validator
  const validate = validator(schema);

  // Create subscription manager
  const subscriptions = manager();

  // Get current user for creator field (if scoped)
  let creator: string | undefined;
  if (isScoped) {
    try {
      const { who } = require('../who.service');
      const current = who.current();
      creator = current?.pub;
    } catch {
      // who service not available yet, skip creator
    }
  }

  // Create service
  return service({
    validator: validate,
    adapter,
    manager: subscriptions,
    prefix,
    options: {
      prefix,
      type: schemaType,
      creator,
    },
  });
};

/**
 * Thing Service - Composable, testable, following UNIX philosophy
 *
 * This module provides a complete service layer for managing "Things"
 * (the base entity type in the system).
 *
 * @example Quick Start
 * ```typescript
 * import { make, ThingSchema } from '@ariob/core';
 * import { z } from 'zod';
 *
 * const TodoSchema = ThingSchema.extend({
 *   title: z.string(),
 *   completed: z.boolean(),
 * });
 *
 * const todos = make(TodoSchema, 'todos');
 * ```
 *
 * @example Advanced Usage
 * ```typescript
 * import { service, validator, manager } from '@ariob/core';
 * import { Memory } from '@ariob/core';
 *
 * // Use in-memory adapter for testing
 * const adapter = new Memory(TodoSchema);
 * const validate = validator(TodoSchema);
 * const subscriptions = manager();
 *
 * const todos = service({
 *   validator: validate,
 *   adapter,
 *   manager: subscriptions,
 *   prefix: 'todos',
 *   options: { prefix: 'todos', type: 'todo' }
 * });
 * ```
 */

// High-level factory (most common use case)
export { make, type ServiceOptions } from './factory';

// Low-level building blocks (for advanced use)
export { service, type ThingService, type ServiceConfig } from './service';
export { validator, type Validator, type PrepareOptions } from './validator';
export { manager, type Manager } from './manager';

// Re-export soul utility for convenience
export { soul } from '../../lib/utils';

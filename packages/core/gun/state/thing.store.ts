'background only';

/**
 * Thing Store - Zustand state management for Thing entities
 *
 * This module provides state management for Thing entities using Zustand.
 * It has been refactored to use the generic store factory following UNIX philosophy.
 *
 * @example
 * ```typescript
 * import { createThingStore, make } from '@ariob/core';
 * import { z } from 'zod';
 *
 * const TodoSchema = ThingSchema.extend({
 *   title: z.string(),
 *   completed: z.boolean(),
 * });
 *
 * const todos = make(TodoSchema, 'todos');
 * const useTodoStore = createThingStore(todos, 'TodoStore');
 *
 * // In a component
 * function TodoList() {
 *   const items = useTodoStore(state => state.items);
 *   const create = useTodoStore(state => state.create);
 *
 *   return <div>...</div>;
 * }
 * ```
 */

import type { Thing } from '../schema/thing.schema';
import type { ThingService } from '../services/thing/service';
import { store, type Store } from './factory';

/**
 * Thing store type (backward compatibility)
 * @deprecated Use Store<T> from factory instead
 */
export type ThingStore<T extends Thing> = Store<T>;

/**
 * Create a Thing store
 * Uses the generic store factory under the hood
 * Following UNIX philosophy: composed from smaller parts
 *
 * @param service - Thing service
 * @param name - Store name for devtools
 * @returns Zustand store hook
 */
export const createThingStore = <T extends Thing>(
  service: ThingService<T>,
  name: string
): (() => Store<T>) => {
  return store(service, { name, devtools: true });
};

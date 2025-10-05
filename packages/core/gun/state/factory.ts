import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Result } from 'neverthrow';
import type { Thing } from '../schema/thing.schema';
import type { ThingService } from '../services/thing/service';
import type { AppError } from '../schema/errors';

/**
 * Base state interface
 * Common state structure for all stores
 */
export interface BaseState<T> {
  items: T[];
  byId: Record<string, T>;
  isLoading: boolean;
  error: AppError | null;
}

/**
 * Base actions interface
 * Common actions for all stores
 */
export interface BaseActions<T> {
  create(data: any): Promise<Result<T, AppError>>;
  update(id: string, updates: any): Promise<Result<T | null, AppError>>;
  remove(id: string): Promise<Result<boolean, AppError>>;
  fetchAll(): Promise<Result<T[], AppError>>;
  fetchById(id: string): Promise<Result<T | null, AppError>>;
  watch(id: string): () => void;
  cleanup(): void;
}

/**
 * Combined store type
 */
export type Store<T> = BaseState<T> & BaseActions<T>;

/**
 * Store options
 */
export interface StoreOptions {
  /**
   * Store name for devtools
   */
  name?: string;

  /**
   * Enable devtools middleware
   * @default true
   */
  devtools?: boolean;
}

/**
 * Selector functions for accessing state
 * Pure functions that extract data from state
 * Following UNIX philosophy: one-word nouns
 */
export const selectors = <T extends Thing>() => ({
  /**
   * Get all items
   */
  all: (state: BaseState<T>) => state.items,

  /**
   * Get item by ID
   */
  byId: (id: string) => (state: BaseState<T>) => state.byId[id],

  /**
   * Get loading state
   */
  loading: (state: BaseState<T>) => state.isLoading,

  /**
   * Get error state
   */
  error: (state: BaseState<T>) => state.error,

  /**
   * Get item count
   */
  count: (state: BaseState<T>) => state.items.length,

  /**
   * Check if item exists
   */
  exists: (id: string) => (state: BaseState<T>) => !!state.byId[id],
});

/**
 * Action creators for state mutations
 * Pure functions that implement business logic
 * Following UNIX philosophy: one-word verbs
 */
export const actions = <T extends Thing>(service: ThingService<T>) => ({
  /**
   * Create action
   */
  create: async (
    data: any,
    set: (state: Partial<BaseState<T>>) => void,
    get: () => BaseState<T>
  ): Promise<Result<T, AppError>> => {
    set({ isLoading: true, error: null });
    const result = await service.create(data);

    result.match(
      (item) => {
        const { items, byId } = get();
        set({
          items: [...items, item],
          byId: { ...byId, [item.id]: item },
          isLoading: false,
        });
      },
      (error) => set({ error, isLoading: false })
    );

    return result;
  },

  /**
   * Update action
   */
  update: async (
    id: string,
    updates: any,
    set: (state: Partial<BaseState<T>>) => void,
    get: () => BaseState<T>
  ): Promise<Result<T | null, AppError>> => {
    set({ isLoading: true, error: null });
    const result = await service.update(id, updates);

    result.match(
      (item) => {
        if (item) {
          const { items, byId } = get();
          set({
            items: items.map((i) => (i.id === id ? item : i)),
            byId: { ...byId, [id]: item },
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
      },
      (error) => set({ error, isLoading: false })
    );

    return result;
  },

  /**
   * Remove action
   */
  remove: async (
    id: string,
    set: (state: Partial<BaseState<T>>) => void,
    get: () => BaseState<T>
  ): Promise<Result<boolean, AppError>> => {
    set({ isLoading: true, error: null });
    const result = await service.remove(id);

    result.match(
      () => {
        const { items, byId } = get();
        const newById = { ...byId };
        delete newById[id];
        set({
          items: items.filter((i) => i.id !== id),
          byId: newById,
          isLoading: false,
        });
      },
      (error) => set({ error, isLoading: false })
    );

    return result;
  },

  /**
   * Fetch all action
   */
  fetchAll: async (
    set: (state: Partial<BaseState<T>>) => void
  ): Promise<Result<T[], AppError>> => {
    set({ isLoading: true, error: null });
    const result = await service.list();

    result.match(
      (items) => {
        const byId = items.reduce(
          (acc, item) => ({ ...acc, [item.id]: item }),
          {}
        );
        set({ items, byId, isLoading: false });
      },
      (error) => set({ error, isLoading: false })
    );

    return result;
  },

  /**
   * Fetch by ID action
   */
  fetchById: async (
    id: string,
    set: (state: Partial<BaseState<T>>) => void,
    get: () => BaseState<T>
  ): Promise<Result<T | null, AppError>> => {
    const result = await service.get(id);

    result.match(
      (item) => {
        if (item) {
          const { items, byId } = get();
          if (!byId[id]) {
            set({
              items: [...items, item],
              byId: { ...byId, [id]: item },
            });
          } else {
            // Update existing item
            set({
              items: items.map((i) => (i.id === id ? item : i)),
              byId: { ...byId, [id]: item },
            });
          }
        }
      },
      (error) => set({ error })
    );

    return result;
  },

  /**
   * Watch action
   */
  watch: (
    id: string,
    set: (state: Partial<BaseState<T>>) => void,
    get: () => BaseState<T>,
    service: ThingService<T>
  ): (() => void) => {
    return service.watch(id, (result) => {
      result.match(
        (item) => {
          if (item) {
            const { items, byId } = get();
            const exists = byId[id];
            if (exists) {
              set({
                items: items.map((i) => (i.id === id ? item : i)),
                byId: { ...byId, [id]: item },
              });
            } else {
              set({
                items: [...items, item],
                byId: { ...byId, [id]: item },
              });
            }
          }
        },
        (error) => set({ error })
      );
    });
  },

  /**
   * Cleanup action
   */
  cleanup: (service: ThingService<T>): void => {
    service.cleanup();
  },
});

/**
 * Create a Zustand store for Thing entities
 * Generic factory that creates stores with common patterns
 * Following UNIX philosophy: one-word verb
 *
 * @example
 * ```typescript
 * import { store, make } from '@ariob/core';
 * import { z } from 'zod';
 *
 * const TodoSchema = ThingSchema.extend({
 *   title: z.string(),
 *   completed: z.boolean(),
 * });
 *
 * const todos = make(TodoSchema, 'todos');
 * const useTodoStore = store(todos, 'TodoStore');
 *
 * // In a component
 * function TodoList() {
 *   const items = useTodoStore(state => state.items);
 *   const create = useTodoStore(state => state.create);
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @param service - Thing service
 * @param options - Store options (name, devtools)
 * @returns Zustand store hook
 */
export const store = <T extends Thing>(
  service: ThingService<T>,
  options: StoreOptions = {}
): (() => Store<T>) => {
  const { name = 'ThingStore', devtools: enableDevtools = true } = options;

  const select = selectors<T>();
  const action = actions(service);

  const createStore = (set: any, get: any): Store<T> => ({
    // Initial state
    items: [],
    byId: {},
    isLoading: false,
    error: null,

    // Actions bound to set/get
    create: (data) => action.create(data, set, get),
    update: (id, updates) => action.update(id, updates, set, get),
    remove: (id) => action.remove(id, set, get),
    fetchAll: () => action.fetchAll(set),
    fetchById: (id) => action.fetchById(id, set, get),
    watch: (id) => action.watch(id, set, get, service),
    cleanup: () => action.cleanup(service),
  });

  if (enableDevtools) {
    return create<Store<T>>()(devtools(createStore, { name }));
  }

  return create<Store<T>>()(createStore);
};

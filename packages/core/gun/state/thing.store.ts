import * as Err from '../schema/errors';
import { Thing } from '../schema/thing.schema';
import { Result } from 'neverthrow';
import { create } from 'zustand';

// Thing store state interface
export interface ThingState<T extends Thing> {
  // State
  items: T[];
  byId: Record<string, T>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<T | null>;
  create: (data: any) => Promise<T>;
  update: (id: string, updates: any) => Promise<void>;
  remove: (id: string) => Promise<void>;
  watch: (id: string) => void;
  unwatch: (id: string) => void;
}

// Service interface for thing operations
export interface ThingService<T extends Thing> {
  get: (id: string) => Promise<Result<T | null, Err.AppError>>;
  list: () => Promise<Result<T[], Err.AppError>>;
  create: (data: any) => Promise<Result<T, Err.AppError>>;
  update: (id: string, data: any) => Promise<Result<T | null, Err.AppError>>;
  remove: (id: string) => Promise<Result<boolean, Err.AppError>>;
  watch: (id: string, callback: (result: Result<T | null, Err.AppError>) => void) => () => void;
}

// Factory to create thing stores
export const createThingStore = <T extends Thing>(
  service: ThingService<T>,
  storeName: string,
) => {
  // Create and return the store
  return create<ThingState<T>>()((set, get) => {
    // Store active subscriptions
    const subscriptions: Record<string, () => void> = {};

    return {
      // State
      items: [],
      byId: {},
      isLoading: false,
      error: null,

      // Actions
      fetchAll: async () => {
        set({ isLoading: true, error: null });

        const result = await service.list();
        
        result.match(
          (items) => {
            set({
              items,
              byId: items.reduce(
                (acc, item) => ({ ...acc, [item.id]: item }),
                {},
              ),
              isLoading: false,
            });
          },
          (error) => {
            set({
              error: error.message,
              isLoading: false,
            });
          }
        );
      },

      fetchById: async (id) => {
        set({ isLoading: true, error: null });

        const result = await service.get(id);
        
        return result.match(
          (item) => {
            if (item) {
              set((state) => ({
                byId: { ...state.byId, [id]: item },
                isLoading: false,
              }));
            } else {
              set({ isLoading: false });
            }
            return item;
          },
          (error) => {
            set({
              error: error.message,
              isLoading: false,
            });
            return null;
          }
        );
      },

      create: async (data) => {
        set({ isLoading: true, error: null });

        const result = await service.create(data);
        
        return result.match(
          (item) => {
            set((state) => ({
              items: [...state.items, item],
              byId: { ...state.byId, [item.id]: item },
              isLoading: false,
            }));
            return item;
          },
          (error) => {
            set({
              error: error.message,
              isLoading: false,
            });
            throw error;
          }
        );
      },

      update: async (id, updates) => {
        set({ isLoading: true, error: null });

        const result = await service.update(id, updates);
        
        return result.match(
          (updated) => {
            if (updated) {
              set((state) => ({
                items: state.items.map((item) =>
                  item.id === id ? updated : item,
                ),
                byId: { ...state.byId, [id]: updated },
                isLoading: false,
              }));
            } else {
              throw new Error(`Item ${id} not found`);
            }
          },
          (error) => {
            set({
              error: error.message,
              isLoading: false,
            });
            throw error;
          }
        );
      },

      remove: async (id) => {
        set({ isLoading: true, error: null });

        const result = await service.remove(id);
        
        return result.match(
          (success) => {
            if (success) {
              set((state) => ({
                items: state.items.filter((item) => item.id !== id),
                byId: Object.keys(state.byId).reduce(
                  (acc, key) => {
                    if (key !== id) {
                      acc[key] = state.byId[key];
                    }
                    return acc;
                  },
                  {} as Record<string, T>,
                ),
                isLoading: false,
              }));
            } else {
              throw new Error(`Failed to delete item ${id}`);
            }
          },
          (error) => {
            set({
              error: error.message,
              isLoading: false,
            });
            throw error;
          }
        );
      },

      watch: (id) => {
        // If already subscribed, do nothing
        if (subscriptions[id]) return;

        // Create new subscription
        subscriptions[id] = service.watch(id, (result) => {
          result.match(
            (data) => {
              if (data) {
                set((state) => ({
                  byId: { ...state.byId, [id]: data },
                  items: state.items.some((item) => item.id === id)
                    ? state.items.map((item) => (item.id === id ? data : item))
                    : [...state.items, data],
                }));
              } else {
                // Item was deleted
                set((state) => ({
                  items: state.items.filter((item) => item.id !== id),
                  byId: Object.keys(state.byId).reduce(
                    (acc, key) => {
                      if (key !== id) {
                        acc[key] = state.byId[key];
                      }
                      return acc;
                    },
                    {} as Record<string, T>,
                  ),
                }));
              }
            },
            (error) => {
              console.error(`Error watching item ${id}:`, error);
            }
          );
        });
      },

      unwatch: (id) => {
        if (subscriptions[id]) {
          subscriptions[id]();
          delete subscriptions[id];
        }
      },
    };
  });
};

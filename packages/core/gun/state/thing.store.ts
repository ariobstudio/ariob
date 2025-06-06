import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Thing } from '../schema/thing.schema';
import { ThingService } from '../services/thing.service';
import { AppError } from '../schema/errors';
import { Result } from 'neverthrow';

interface ThingState<T extends Thing> {
  items: T[];
  byId: Record<string, T>;
  isLoading: boolean;
  error: AppError | null;
}

interface ThingActions<T extends Thing> {
  create: (data: any) => Promise<Result<T, AppError>>;
  update: (id: string, updates: any) => Promise<Result<T | null, AppError>>;
  remove: (id: string) => Promise<Result<boolean, AppError>>;
  fetchAll: () => Promise<Result<T[], AppError>>;
  fetchById: (id: string) => Promise<Result<T | null, AppError>>;
  watch: (id: string) => () => void;
  cleanup: () => void;
}

export type ThingStore<T extends Thing> = ThingState<T> & ThingActions<T>;

export const createThingStore = <T extends Thing>(
  service: ThingService<T>,
  name: string
) => {
  return create<ThingStore<T>>()(
    (set, get) => ({
      items: [],
      byId: {},
      isLoading: false,
      error: null,

      create: async (data) => {
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

      update: async (id, updates) => {
        set({ isLoading: true, error: null });
        const result = await service.update(id, updates);
        
        result.match(
          (item) => {
            if (item) {
              const { items, byId } = get();
              set({
                items: items.map(i => i.id === id ? item : i),
                byId: { ...byId, [id]: item },
                isLoading: false,
              });
            }
          },
          (error) => set({ error, isLoading: false })
        );
        
        return result;
      },

      remove: async (id) => {
        set({ isLoading: true, error: null });
        const result = await service.remove(id);
        
        result.match(
          () => {
            const { items, byId } = get();
            const newById = { ...byId };
            delete newById[id];
            set({
              items: items.filter(i => i.id !== id),
              byId: newById,
              isLoading: false,
            });
          },
          (error) => set({ error, isLoading: false })
        );
        
        return result;
      },

      fetchAll: async () => {
        set({ isLoading: true, error: null });
        const result = await service.list();
        
        result.match(
          (items) => {
            const byId = items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});
            set({ items, byId, isLoading: false });
          },
          (error) => set({ error, isLoading: false })
        );
        
        return result;
      },

      fetchById: async (id) => {
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
              }
            }
          },
          (error) => set({ error })
        );
        
        return result;
      },

      watch: (id) => {
        return service.watch(id, (result) => {
          result.match(
            (item) => {
              if (item) {
                const { items, byId } = get();
                const exists = byId[id];
                if (exists) {
                  set({
                    items: items.map(i => i.id === id ? item : i),
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

      cleanup: () => {
        service.cleanup();
      },
    })
  );
};

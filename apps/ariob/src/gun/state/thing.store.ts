import { create } from 'zustand';
import { Thing } from '@/gun/schema/thing.schema';

// Factory to create thing stores
export const createThingStore = <T extends Thing>(
  service: {
    get: (id: string) => Promise<T | null>;
    list: () => Promise<T[]>;
    create: (data: any) => Promise<T>;
    update: (id: string, data: any) => Promise<T | null>;
    remove: (id: string) => Promise<boolean>;
    subscribe: (id: string, callback: (data: T | null) => void) => () => void;
  },
  storeName: string
) => {
  interface ThingState {
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
    subscribe: (id: string) => void;
    unsubscribe: (id: string) => void;
  }

  // Create and return the store
  return create<ThingState>()((set, get) => {
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
        
        try {
          const items = await service.list();
          set({ 
            items, 
            byId: items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch items', 
            isLoading: false 
          });
        }
      },
      
      fetchById: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const item = await service.get(id);
          
          if (item) {
            set((state) => ({
              byId: { ...state.byId, [id]: item },
              isLoading: false,
            }));
          } else {
            set({ isLoading: false });
          }
          
          return item;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : `Failed to fetch item ${id}`, 
            isLoading: false 
          });
          return null;
        }
      },
      
      create: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const item = await service.create(data);
          
          set((state) => ({
            items: [...state.items, item],
            byId: { ...state.byId, [item.id]: item },
            isLoading: false,
          }));
          
          return item;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create item', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      update: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const updated = await service.update(id, updates);
          
          if (updated) {
            set((state) => ({
              items: state.items.map(item => item.id === id ? updated : item),
              byId: { ...state.byId, [id]: updated },
              isLoading: false,
            }));
          } else {
            throw new Error(`Item ${id} not found`);
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : `Failed to update item ${id}`, 
            isLoading: false 
          });
          throw error;
        }
      },
      
      remove: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const success = await service.remove(id);
          
          if (success) {
            set((state) => ({
              items: state.items.filter(item => item.id !== id),
              byId: Object.keys(state.byId).reduce((acc, key) => {
                if (key !== id) {
                  acc[key] = state.byId[key];
                }
                return acc;
              }, {} as Record<string, T>),
              isLoading: false,
            }));
          } else {
            throw new Error(`Failed to delete item ${id}`);
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : `Failed to delete item ${id}`, 
            isLoading: false 
          });
          throw error;
        }
      },
      
      subscribe: (id) => {
        // If already subscribed, do nothing
        if (subscriptions[id]) return;
        
        // Create new subscription
        subscriptions[id] = service.subscribe(id, (data) => {
          if (data) {
            set((state) => ({
              byId: { ...state.byId, [id]: data },
              items: state.items.some(item => item.id === id)
                ? state.items.map(item => item.id === id ? data : item)
                : [...state.items, data]
            }));
          } else {
            // Item was deleted
            set((state) => ({
              items: state.items.filter(item => item.id !== id),
              byId: Object.keys(state.byId).reduce((acc, key) => {
                if (key !== id) {
                  acc[key] = state.byId[key];
                }
                return acc;
              }, {} as Record<string, T>),
            }));
          }
        });
      },
      
      unsubscribe: (id) => {
        if (subscriptions[id]) {
          subscriptions[id]();
          delete subscriptions[id];
        }
      }
    };
  });
};

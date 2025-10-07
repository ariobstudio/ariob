import { useEffect, useCallback } from 'react';
import type { Thing } from '../schema/thing.schema';
import type { ThingStore } from '../state/thing.store';

/**
 * useThing Hook
 * 
 * A React hook for managing a single Thing entity with real-time updates.
 * Automatically subscribes to changes and cleans up on unmount.
 * 
 * @param store - The thing store created with createThingStore
 * @param id - The ID of the thing to watch
 * 
 * @example
 * ```tsx
 * // Create your store
 * const useNotesStore = createThingStore(notesService, 'Notes');
 * 
 * // In your component
 * function NoteDetail({ noteId }: { noteId: string }) {
 *   const { item: note, isLoading, error, update } = useThing(useNotesStore, noteId);
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!note) return <div>Note not found</div>;
 *   
 *   return (
 *     <div>
 *       <h1>{note.title}</h1>
 *       <p>{note.content}</p>
 *       <button onClick={() => update({ title: 'Updated!' })}>
 *         Update Title
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useThing = <T extends Thing>(
  useStore: () => ThingStore<T>,
  id: string | null
) => {
  console.log('----[useThing.ts][Hook called][useThing initializing][for thing management]');
  console.log('----[useThing.ts][ID parameter][Thing ID to watch][for]', id);

  console.log('----[useThing.ts][Calling useStore][Getting store instance][for state access]');
  const store = useStore();
  console.log('----[useThing.ts][Store obtained][Store from hook][for]', {
    hasStore: !!store,
    byIdKeys: store?.byId ? Object.keys(store.byId) : [],
    isLoading: store?.isLoading,
    error: store?.error
  });

  const item = id ? store.byId[id] || null : null;
  console.log('----[useThing.ts][Item from store][Current item value][for]', { id, hasItem: !!item, item });

  useEffect(() => {
    console.log('----[useThing.ts][useEffect triggered][Effect running for ID][for]', id);
    let unsubscribe: (() => void) | undefined;

    if (id) {
      console.log('----[useThing.ts][ID exists][Checking if item cached][for]', id);
      if (!store.byId[id]) {
        console.log('----[useThing.ts][Item not cached][Fetching from service][for]', id);
        store.fetchById(id);
      } else {
        console.log('----[useThing.ts][Item cached][Using cached item][for]', id);
      }
      console.log('----[useThing.ts][Starting watch][Subscribing to updates][for]', id);
      unsubscribe = store.watch(id);
      console.log('----[useThing.ts][Watch started][Subscription active][for]', id);
    } else {
      console.log('----[useThing.ts][No ID][Skipping fetch and watch][for null ID]');
    }

    return unsubscribe;
  }, [id, store]);

  const update = useCallback(
    (updates: any) => {
      console.log('----[useThing.ts][update called][Updating thing][for]', { id, updates });
      return id ? store.update(id, updates) : Promise.resolve();
    },
    [id, store]
  );

  const remove = useCallback(
    () => {
      console.log('----[useThing.ts][remove called][Removing thing][for]', id);
      return id ? store.remove(id) : Promise.resolve();
    },
    [id, store]
  );

  const result = {
    item,
    isLoading: store.isLoading,
    error: store.error,
    update,
    remove,
  };
  console.log('----[useThing.ts][Returning result][Hook return value][for]', result);

  return result;
};

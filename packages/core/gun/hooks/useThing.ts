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
  const store = useStore();
  const item = id ? store.byId[id] || null : null;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (id) {
      if (!store.byId[id]) {
        store.fetchById(id);
      }
      unsubscribe = store.watch(id);
    }
    
    return unsubscribe;
  }, [id, store]);

  const update = useCallback(
    (updates: any) => id ? store.update(id, updates) : Promise.resolve(),
    [id, store]
  );

  const remove = useCallback(
    () => id ? store.remove(id) : Promise.resolve(),
    [id, store]
  );

  return {
    item,
    isLoading: store.isLoading,
    error: store.error,
    update,
    remove,
  };
};

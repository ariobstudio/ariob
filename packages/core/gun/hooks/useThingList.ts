// src/gun/hooks/useThingList.ts (continued)
import { useEffect } from 'react';
import type { Store } from '../state/factory';
import type { Thing } from '../schema/thing.schema';

/**
 * useThingList Hook
 * 
 * A React hook for managing a list of Thing entities.
 * Automatically fetches all items on mount and provides CRUD operations.
 * 
 * @param store - The thing store created with createThingStore
 * 
 * @example
 * ```tsx
 * // Create your store
 * const useNotesStore = createThingStore(notesService, 'Notes');
 * 
 * // In your component
 * function NotesList() {
 *   const { items, isLoading, error, create } = useThingList(useNotesStore);
 *   
 *   const handleCreate = async () => {
 *     await create({
 *       title: 'New Note',
 *       content: 'This is a new note'
 *     });
 *   };
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return (
 *     <div>
 *       <button onClick={handleCreate}>Create Note</button>
 *       <ul>
 *         {items.map(note => (
 *           <li key={note.id}>{note.title}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export const useThingList = <T extends Thing>(
  store: () => Store<T>
) => {
  const { items, fetchAll, create } = store();

  useEffect(() => {
    // Fetch all items on mount
    fetchAll();
  }, [fetchAll]);

  return {
    items,
    isLoading: store().isLoading,
    error: store().error,
    create,
    refresh: fetchAll,
  };
};

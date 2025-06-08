import { createThingStore, make } from '@ariob/core';
import { NoteSchema } from '../schema/note.schema';

/**
 * Note Service
 *
 * Service for managing notes with Gun.js
 */
export const noteService = make(NoteSchema, 'notes');

/**
 * Private Note Service
 *
 * User-scoped notes that are only accessible by the authenticated user
 */
export const privateNoteService = make(NoteSchema, 'private-notes', {
  userScoped: true,
});

/**
 * Note Store Hook
 *
 * Zustand store for managing notes state
 */
export const useNotesStore = createThingStore(noteService, 'NotesStore');

/**
 * Private Note Store Hook
 *
 * Zustand store for managing private notes state
 */
export const usePrivateNotesStore = createThingStore(
  privateNoteService,
  'PrivateNotesStore',
);

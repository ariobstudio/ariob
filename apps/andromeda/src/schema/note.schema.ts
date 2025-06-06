import { z } from 'zod';
import { ContentThingSchema } from '@ariob/core';

/**
 * Note Schema
 * 
 * Example of extending the base ContentThingSchema for a note-taking app
 */
export const NoteSchema = ContentThingSchema.extend({
  // Note-specific fields
  pinned: z.boolean().default(false),
  color: z.string().optional(),
  attachments: z.array(z.string()).default([]),
});

export type Note = z.infer<typeof NoteSchema>; 
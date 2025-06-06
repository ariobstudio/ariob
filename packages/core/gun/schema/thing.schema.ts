import { z } from 'zod';

/**
 * Thing Schema - Base for all entities
 * Things are the base unit of data in the system.
 */
export const ThingSchema = z.object({
  // Identity
  id: z.string().min(1),
  soul: z.string().min(1),        // Gun path: "prefix/id"
  schema: z.string().min(1),      // Type discriminator
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  
  // Ownership
  public: z.boolean().default(true),
  createdBy: z.string().optional(), // Creator's public key
});

export type Thing = z.infer<typeof ThingSchema>;

/**
 * Content Thing Schema
 * 
 * Common extensions.
 */
export const ContentThingSchema = ThingSchema.extend({
  title: z.string().optional(),
  body: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type ContentThing = z.infer<typeof ContentThingSchema>;

/**
 * Relational Thing Schema
 * 
 * For things that have hierarchical relationships.
 */
export const RelationalThingSchema = ThingSchema.extend({
  parentId: z.string().optional(),
  rootId: z.string().optional(),
});

export type RelationalThing = z.infer<typeof RelationalThingSchema>;

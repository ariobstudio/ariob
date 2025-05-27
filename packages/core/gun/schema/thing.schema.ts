import { z } from 'zod';

/**
 * Thing Schema
 * 
 * A minimal, secure schema for decentralized entities stored in Gun.
 * Things are the base unit of data in the system.
 */
export const ThingSchema = z.object({
  // Core identity
  id: z.string().min(1),
  soul: z.string().min(1), // Gun soul path
  schema: z.string().min(1), // Schema type identifier
  
  // Timestamps
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  
  // Ownership
  createdBy: z.string().optional(), // Public key of creator
  
  // Access control
  public: z.boolean().default(true),
  version: z.number().default(1),
});

export type Thing = z.infer<typeof ThingSchema>;

/**
 * Content Thing Schema
 * 
 * For things that contain user-generated content.
 */
export const ContentThingSchema = ThingSchema.extend({
  title: z.string().min(1).max(100).optional(),
  body: z.string().max(50000).optional(),
  tags: z.array(z.string()).optional(),
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
  order: z.number().optional(),
});

export type RelationalThing = z.infer<typeof RelationalThingSchema>;

import { z } from 'zod';

/**
 * Thing Schema
 *
 * This is the schema for a thing.
 *
 * A thing is a collection of data that is stored in the database.
 *
 * id: The unique identifier of the thing.
 * createdAt: The date and time the thing was created.
 * updatedAt: The date and time the thing was last updated.
 * createdBy: The alias of the user who created the thing.
 *
 * Metadata
 * soul: The soul path of the thing.
 * schema: The schema identifier of the thing.
 *
 * Version control
 * version: The version of the thing.
 *
 * Access control
 * public: Whether the thing is public or not.
 * acl: The access control list of the thing.
 */
export const ThingSchema = z.object({
  id: z.string().min(1),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  createdBy: z.string().optional(), // Who.pub

  // Metadata
  soul: z.string().min(1), // Gun soul path
  schema: z.string().min(1), // Schema identifier

  // Version control
  version: z.number().default(1),

  // Access control
  public: z.boolean().default(true),
  acl: z
    .record(
      z.string(),
      z.union([z.literal('read'), z.literal('write'), z.literal('admin')]),
    )
    .optional(),
});

export type Thing = z.infer<typeof ThingSchema>;

/**
 * Content Thing Schema
 *
 * This is the schema for a content thing.
 *
 * A content thing is a thing that has a title, body, and tags.
 */
export const ContentThingSchema = ThingSchema.extend({
  title: z.string().min(1).max(100).optional(),
  body: z.string().max(50000).optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
});

export type ContentThing = z.infer<typeof ContentThingSchema>;

/**
 * Relational Thing Schema
 *
 * This is the schema for a relational thing.
 *
 * A relational thing is a thing that has a parent and child relationship.
 */
export const RelationalThingSchema = ThingSchema.extend({
  parentId: z.string().optional(),
  rootId: z.string().optional(),
  order: z.number().optional(),
});

export type RelationalThing = z.infer<typeof RelationalThingSchema>;

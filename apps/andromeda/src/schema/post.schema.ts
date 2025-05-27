import { ContentThingSchema, Thing } from '@ariob/core';
import { z } from 'zod';

/**
 * Post Schema
 *
 * Extends ContentThingSchema to represent a post
 */
export const PostSchema = ContentThingSchema.extend({
  schema: z.literal('post'),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
  likes: z.number().default(0),
  tags: z.array(z.string()).default([]),
});

/**
 * Post type
 */
export type Post = z.infer<typeof PostSchema>;

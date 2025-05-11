// src/gun/schema/examples/post.schema.ts
import { z } from 'zod';
import { ContentThingSchema } from '@/gun/schema/thing.schema';

export const PostSchema = ContentThingSchema.extend({
  schema: z.literal('post'),
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(50000),
  topic: z.string().min(1).max(100),
  url: z.string().url().optional(),
  domain: z.string().optional(),
  isNSFW: z.boolean().default(false),
  isLocked: z.boolean().default(false),
  
  // Post stats
  commentCount: z.number().default(0),
  upvotes: z.number().default(0),
  downvotes: z.number().default(0),
});

export type Post = z.infer<typeof PostSchema>;

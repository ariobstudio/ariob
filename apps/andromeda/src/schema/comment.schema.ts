import {
  ContentThingSchema,
  RelationalThingSchema,
} from '@/gun/schema/thing.schema';
// src/gun/schema/examples/comment.schema.ts
import { z } from 'zod';

export const CommentSchema = ContentThingSchema.merge(
  RelationalThingSchema,
).extend({
  schema: z.literal('comment'),
  body: z.string().min(1).max(10000),
  postId: z.string().min(1),
  isDeleted: z.boolean().default(false),

  // Comment stats
  upvotes: z.number().default(0),
  downvotes: z.number().default(0),
});

export type Comment = z.infer<typeof CommentSchema>;

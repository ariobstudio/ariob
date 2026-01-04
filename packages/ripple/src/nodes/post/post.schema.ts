/**
 * Post Node Schema
 *
 * Blog-style posts with content, author metadata, and visibility scope.
 */

import { Thing, z } from '@ariob/core';
import { DegreeEnum, defaults } from '../_shared';

/**
 * Default actions for Post nodes
 *
 * - reply
 * - save
 * - share
 * - delete (owner only)
 */
export const POST_ACTIONS = ['reply', 'save', 'share', 'delete'] as const;

/**
 * PostSchema
 *
 * Text posts with content, author metadata, and visibility scope.
 */
export const PostSchema = Thing.extend({
  type: z.literal('post'),
  content: z.string().min(1, 'Content cannot be empty').max(10000, 'Content too long'),
  author: z.string(), // Public key of author
  authorAlias: z.string().optional(),
  created: z.number(),
  degree: DegreeEnum, // Visibility scope
  tags: z.array(z.string()).optional(),
  editedAt: z.number().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  actions: defaults([...POST_ACTIONS]),
});

export type Post = z.infer<typeof PostSchema>;

/**
 * Type guard for Post
 */
export function isPost(item: unknown): item is Post {
  return PostSchema.safeParse(item).success;
}

/**
 * Create a new post
 */
export function createPost(params: Omit<Post, 'type' | 'created' | '#' | 'actions'>): Post {
  return {
    type: 'post',
    created: Date.now(),
    actions: [...POST_ACTIONS],
    ...params,
  } as Post;
}

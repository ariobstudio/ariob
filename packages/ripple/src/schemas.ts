/**
 * Content Schemas
 *
 * Zod schemas for Ripple content types: Posts, Messages, and unified FeedItems.
 * All content extends the Thing schema with unique type discriminators.
 */

import { Thing, z } from '@ariob/core';

/**
 * Degree type - visibility scope for content
 * - 0: Personal (only me)
 * - 1: Friends (direct connections)
 * - 2: Extended network (friends-of-friends)
 */
export const DegreeEnum = z.enum(['0', '1', '2']);
export type Degree = z.infer<typeof DegreeEnum>;

/**
 * Text Post Schema
 *
 * Blog-style posts with content, author metadata, and visibility scope.
 * Posts are public within their degree scope and support future features
 * like tagging and editing.
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
});

export type Post = z.infer<typeof PostSchema>;

/**
 * Direct Message Schema
 *
 * Private messages between two users, encrypted by default.
 * Messages are organized into threads and support read receipts.
 */
export const MessageSchema = Thing.extend({
  type: z.literal('message'),
  text: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  from: z.string(), // Sender public key
  to: z.string(), // Recipient public key
  threadId: z.string(), // Thread identifier
  created: z.number(),
  encrypted: z.boolean().default(true),
  read: z.boolean().default(false),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * DM Thread Metadata Schema
 *
 * Metadata for a DM conversation, including participants and last message info.
 * Used for displaying thread previews in the unified feed.
 */
export const ThreadMetadataSchema = Thing.extend({
  type: z.literal('thread'),
  threadId: z.string(), // Unique thread identifier
  participants: z.array(z.string()).length(2), // [pubKeyA, pubKeyB]
  lastMessage: z.string().optional(),
  lastMessageAt: z.number().optional(),
  unreadCount: z.number().default(0),
  created: z.number(),
});

export type ThreadMetadata = z.infer<typeof ThreadMetadataSchema>;

/**
 * Unified Feed Item Schema
 *
 * Discriminated union of all content types that can appear in the feed.
 * The 'type' field enables type-safe narrowing in components.
 */
export const FeedItemSchema = z.discriminatedUnion('type', [
  PostSchema,
  ThreadMetadataSchema,
]);

export type FeedItem = z.infer<typeof FeedItemSchema>;

/**
 * Helper type guards
 */
export function isPost(item: FeedItem): item is Post {
  return item.type === 'post';
}

export function isThread(item: FeedItem): item is ThreadMetadata {
  return item.type === 'thread';
}

/**
 * Content creation helpers
 */
export function createPost(params: Omit<Post, 'type' | 'created' | '#'>): Post {
  return {
    type: 'post',
    created: Date.now(),
    ...params,
  };
}

export function createMessage(params: Omit<Message, 'type' | 'created' | 'encrypted' | 'read' | '#'>): Message {
  return {
    type: 'message',
    created: Date.now(),
    encrypted: true,
    read: false,
    ...params,
  };
}

export function createThreadId(pubKeyA: string, pubKeyB: string): string {
  // Sort keys alphabetically to ensure consistent thread IDs
  const sorted = [pubKeyA, pubKeyB].sort();
  return `thread-${sorted[0].substring(0, 8)}-${sorted[1].substring(0, 8)}`;
}

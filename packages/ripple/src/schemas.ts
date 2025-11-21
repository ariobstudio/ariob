/**
 * Content Schemas
 *
 * Zod schemas for Ripple content types: Posts, Media, Messages, and unified FeedItems.
 * All content extends the Thing schema with unique type discriminators.
 */

import { Thing, z } from '@ariob/core';

/**
 * Degree type - visibility scope for content
 * - 0: Personal (only me)
 * - 1: Friends (direct connections)
 * - 2: Extended network (friends-of-friends)
 * - 3: Public (everyone)
 * - 4: Spam/bot filter
 */
export const DegreeEnum = z.enum(['0', '1', '2', '3', '4']);
export type Degree = z.infer<typeof DegreeEnum>;

/**
 * Media attachment schema
 */
export const MediaAttachmentSchema = z.object({
  url: z.string().url(),
  type: z.enum(['image', 'video', 'audio']),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(), // For videos/audio
  thumbnail: z.string().url().optional(),
  altText: z.string().optional(),
});

export type MediaAttachment = z.infer<typeof MediaAttachmentSchema>;

/**
 * Text Post Schema
 *
 * Standard text posts with optional media attachments.
 */
export const PostSchema = Thing.extend({
  type: z.literal('post'),
  content: z.string().min(1, 'Content cannot be empty').max(10000, 'Content too long'),
  author: z.string(), // Public key of author
  authorAlias: z.string().optional(),
  created: z.number(),
  degree: DegreeEnum,
  tags: z.array(z.string()).optional(),
  editedAt: z.number().optional(),
  media: z.array(MediaAttachmentSchema).optional(), // Optional media
});

export type Post = z.infer<typeof PostSchema>;

/**
 * Image Post Schema
 *
 * Posts with images as primary content.
 */
export const ImagePostSchema = Thing.extend({
  type: z.literal('image-post'),
  caption: z.string().max(2000).optional(),
  images: z.array(MediaAttachmentSchema).min(1, 'At least one image required'),
  author: z.string(),
  authorAlias: z.string().optional(),
  created: z.number(),
  degree: DegreeEnum,
  tags: z.array(z.string()).optional(),
});

export type ImagePost = z.infer<typeof ImagePostSchema>;

/**
 * Video Post Schema
 *
 * TikTok-style vertical video posts.
 */
export const VideoPostSchema = Thing.extend({
  type: z.literal('video-post'),
  video: MediaAttachmentSchema,
  caption: z.string().max(2000).optional(),
  author: z.string(),
  authorAlias: z.string().optional(),
  created: z.number(),
  degree: DegreeEnum,
  tags: z.array(z.string()).optional(),
  soundtrack: z.string().optional(), // Optional audio track
});

export type VideoPost = z.infer<typeof VideoPostSchema>;

/**
 * Poll Option Schema
 */
export const PollOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1).max(200),
  votes: z.number().default(0),
  voters: z.array(z.string()).default([]), // Public keys of voters
});

export type PollOption = z.infer<typeof PollOptionSchema>;

/**
 * Poll Post Schema
 *
 * Interactive polls that friends can vote on.
 */
export const PollSchema = Thing.extend({
  type: z.literal('poll'),
  question: z.string().min(1, 'Question required').max(500),
  options: z.array(PollOptionSchema).min(2, 'At least 2 options').max(10, 'Max 10 options'),
  author: z.string(),
  authorAlias: z.string().optional(),
  created: z.number(),
  degree: DegreeEnum,
  expiresAt: z.number().optional(), // Optional poll deadline
  multipleChoice: z.boolean().default(false), // Allow multiple selections
  totalVotes: z.number().default(0),
});

export type Poll = z.infer<typeof PollSchema>;

/**
 * Share/Repost Schema
 *
 * Shares or reposts another user's content.
 */
export const ShareSchema = Thing.extend({
  type: z.literal('share'),
  originalPostRef: z.string(), // Gun reference to original post
  originalAuthor: z.string(), // Public key
  originalAuthorAlias: z.string().optional(),
  comment: z.string().max(1000).optional(), // Optional comment on share
  author: z.string(), // Person sharing
  authorAlias: z.string().optional(),
  created: z.number(),
  degree: DegreeEnum,
});

export type Share = z.infer<typeof ShareSchema>;

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
 * Comment Schema
 *
 * Comments on posts, creating threaded discussions.
 */
export const CommentSchema = Thing.extend({
  type: z.literal('comment'),
  content: z.string().min(1).max(5000),
  author: z.string(),
  authorAlias: z.string().optional(),
  created: z.number(),
  parentPostRef: z.string(), // Gun reference to parent post
  parentCommentRef: z.string().optional(), // For nested comments
  editedAt: z.number().optional(),
});

export type Comment = z.infer<typeof CommentSchema>;

/**
 * Unified Feed Item Schema
 *
 * Discriminated union of all content types that can appear in the feed.
 * The 'type' field enables type-safe narrowing in components.
 */
export const FeedItemSchema = z.discriminatedUnion('type', [
  PostSchema,
  ImagePostSchema,
  VideoPostSchema,
  PollSchema,
  ShareSchema,
  ThreadMetadataSchema,
]);

export type FeedItem = z.infer<typeof FeedItemSchema>;

/**
 * Helper type guards
 */
export function isPost(item: FeedItem): item is Post {
  return item.type === 'post';
}

export function isImagePost(item: FeedItem): item is ImagePost {
  return item.type === 'image-post';
}

export function isVideoPost(item: FeedItem): item is VideoPost {
  return item.type === 'video-post';
}

export function isPoll(item: FeedItem): item is Poll {
  return item.type === 'poll';
}

export function isShare(item: FeedItem): item is Share {
  return item.type === 'share';
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

export function createImagePost(params: Omit<ImagePost, 'type' | 'created' | '#'>): ImagePost {
  return {
    type: 'image-post',
    created: Date.now(),
    ...params,
  };
}

export function createVideoPost(params: Omit<VideoPost, 'type' | 'created' | '#'>): VideoPost {
  return {
    type: 'video-post',
    created: Date.now(),
    ...params,
  };
}

export function createPoll(params: Omit<Poll, 'type' | 'created' | 'totalVotes' | '#'>): Poll {
  return {
    type: 'poll',
    created: Date.now(),
    totalVotes: 0,
    ...params,
  };
}

export function createShare(params: Omit<Share, 'type' | 'created' | '#'>): Share {
  return {
    type: 'share',
    created: Date.now(),
    ...params,
  };
}

export function createComment(params: Omit<Comment, 'type' | 'created' | '#'>): Comment {
  return {
    type: 'comment',
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

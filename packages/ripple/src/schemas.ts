/**
 * Content Schemas
 *
 * Zod schemas for Ripple content types: Posts, Messages, Profiles, AI, and unified FeedItems.
 * All content extends the Thing schema with unique type discriminators.
 *
 * Following the Node architecture:
 * - Node = Schema + Renderer + Actions
 * - Each node type defines default actions driven by schema
 */

import { Thing, Who, z } from '@ariob/core';
import { NodeMeta, DegreeEnum, VariantEnum, defaults } from './nodes/_shared';

// Re-export for consumers
export { VariantEnum, NodeMeta, defaults, DegreeEnum } from './nodes/_shared';

/** Variant type - render mode for nodes */
export type Variant = z.infer<typeof VariantEnum>;

/** Degree type - visibility scope for content */
export type Degree = z.infer<typeof DegreeEnum>;

/** Degree labels */
export const DEGREES = [
  { id: 0, name: 'Me' },
  { id: 1, name: 'Friends' },
  { id: 2, name: 'World' },
  { id: 3, name: 'Discover' },
  { id: 4, name: 'Noise' },
] as const;

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
  unreadCount: z.number().optional(), // Defaults to 0 in UI layer
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

// ─────────────────────────────────────────────────────────────────────────────
// Search Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * User Search Result Schema
 *
 * Result item from searching the public profile index.
 * Contains minimal info for display in search results.
 */
export const UserSearchResultSchema = z.object({
  pub: z.string(),
  alias: z.string(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
});

export type UserSearchResult = z.infer<typeof UserSearchResultSchema>;

/**
 * Hashtag Reference Schema
 *
 * Reference stored in the hashtag index pointing to a post.
 */
export const HashtagRefSchema = z.object({
  postId: z.string(),
  postAuthor: z.string(),
  created: z.number(),
});

export type HashtagRef = z.infer<typeof HashtagRefSchema>;

/**
 * Public Profile Index Schema
 *
 * Profile data stored in `public/profiles/{pubKey}` for discoverability.
 */
export const PublicProfileSchema = z.object({
  pub: z.string(),
  alias: z.string(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  indexed: z.number(),
});

export type PublicProfile = z.infer<typeof PublicProfileSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Node Schemas (Schema-Driven Architecture)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ProfileNode Schema
 *
 * Represents a user identity in the social graph.
 * Extends Who (cryptographic identity) with social metadata.
 *
 * Default actions driven by ownership and context:
 * - edit (owner only)
 * - connect (non-owner)
 * - message
 * - share
 * - block
 */
export const ProfileNodeSchema = Who.merge(NodeMeta).extend({
  type: z.literal('profile'),

  // Display info
  displayName: z.string().min(1).max(50),
  handle: z.string().regex(/^[a-z0-9_]{2,20}$/).optional(),
  bio: z.string().max(160).optional(),
  avatar: z.string().url().optional(),
  cover: z.string().url().optional(),

  // Social proof
  pronouns: z.string().max(20).optional(),
  location: z.string().max(50).optional(),
  website: z.string().url().optional(),
  verified: z.boolean().default(false),

  // Stats (computed)
  stats: z.object({
    posts: z.number().default(0),
    connections: z.number().default(0),
    degree1: z.number().default(0), // Direct friends
    degree2: z.number().default(0), // Friends of friends
  }).default({}),

  // Settings
  discoverability: z.enum(['open', 'connections', 'private']).default('open'),
  dmSettings: z.enum(['anyone', 'connections', 'none']).default('connections'),

  // Default actions for profile nodes
  actions: defaults(['edit', 'connect', 'message', 'share', 'block']),
});

export type ProfileNode = z.infer<typeof ProfileNodeSchema>;

/**
 * Type guard for ProfileNode
 */
export function isProfileNode(node: unknown): node is ProfileNode {
  return ProfileNodeSchema.safeParse(node).success;
}

/**
 * Topic Schema
 *
 * A topic category for AI conversations.
 * Topics group related threads together.
 */
export const TopicSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  icon: z.string().optional(), // Emoji or icon name
  lastActive: z.number(),
  threadCount: z.number().default(0),
  summary: z.string().max(200).optional(),
});

export type Topic = z.infer<typeof TopicSchema>;

/**
 * AIThread Schema
 *
 * A conversation thread within a topic.
 */
export const AIThreadSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  title: z.string().max(100).optional(), // AI-generated title
  preview: z.string().max(200), // Last message preview
  createdAt: z.number(),
  updatedAt: z.number(),
  messageCount: z.number().default(0),
});

export type AIThread = z.infer<typeof AIThreadSchema>;

/**
 * AINode Schema
 *
 * Personal AI assistant node.
 * Organizes conversations into topics and threads.
 *
 * Default actions:
 * - expand (navigate to full chat)
 * - chat (continue current thread)
 * - new-topic (start new topic)
 * - topics (view all topics)
 */
export const AINodeSchema = Thing.merge(NodeMeta).extend({
  type: z.literal('ai'),

  // AI identity
  name: z.string().default('Claude'),
  subtitle: z.string().default('Personal Assistant'),
  avatar: z.string().optional(),
  model: z.string().default('claude-sonnet'),

  // Topic-based organization
  topics: z.array(TopicSchema).default([]),
  activeTopicId: z.string().optional(),

  // Current session
  currentThread: AIThreadSchema.optional(),

  // Stats
  stats: z.object({
    totalThreads: z.number().default(0),
    totalMessages: z.number().default(0),
    topicsCount: z.number().default(0),
    lastActive: z.number().optional(),
  }).default({}),

  // Default actions for AI node
  actions: defaults(['expand', 'chat', 'new-topic', 'topics']),
});

export type AINode = z.infer<typeof AINodeSchema>;

/**
 * Type guard for AINode
 */
export function isAINode(node: unknown): node is AINode {
  return AINodeSchema.safeParse(node).success;
}

// ─────────────────────────────────────────────────────────────────────────────
// Node Union Type
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All node types as discriminated union
 */
export const NodeSchema = z.discriminatedUnion('type', [
  PostSchema,
  ThreadMetadataSchema,
  ProfileNodeSchema,
  AINodeSchema,
]);

export type Node = z.infer<typeof NodeSchema>;

/**
 * Node type literal union
 */
export type NodeType = Node['type'];

/**
 * Extract node type from discriminated union
 */
export type NodeOfType<T extends NodeType> = Extract<Node, { type: T }>;

/**
 * Type guard map for all node types
 */
export const nodeGuards = {
  post: isPost,
  thread: isThread,
  profile: isProfileNode,
  ai: isAINode,
} as const;

/**
 * AI Node Schema
 *
 * Personal AI assistant node.
 * Organizes conversations into topics and threads.
 */

import { Thing, z } from '@ariob/core';
import { NodeMeta, defaults } from '../_shared';

/**
 * Default actions for AI nodes
 *
 * - expand (navigate to full chat)
 * - chat (continue current thread)
 * - new-topic (start new topic)
 * - topics (view all topics)
 */
export const AI_ACTIONS = ['expand', 'chat', 'new-topic', 'topics'] as const;

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
  actions: defaults([...AI_ACTIONS]),
});

export type AINode = z.infer<typeof AINodeSchema>;

/**
 * Type guard for AINode
 */
export function isAINode(node: unknown): node is AINode {
  return AINodeSchema.safeParse(node).success;
}

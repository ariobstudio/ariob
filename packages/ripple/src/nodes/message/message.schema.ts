/**
 * Message Node Schema
 *
 * Private messages between two users.
 */

import { Thing, z } from '@ariob/core';
import { defaults } from '../_shared';

/**
 * Default actions for Message nodes
 */
export const MESSAGE_ACTIONS = ['reply', 'forward', 'delete'] as const;

/**
 * MessageSchema
 *
 * Direct messages, encrypted by default.
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
  actions: defaults([...MESSAGE_ACTIONS]),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * ThreadMetadata Schema
 *
 * Metadata for a DM conversation.
 */
export const ThreadMetadataSchema = Thing.extend({
  type: z.literal('thread'),
  threadId: z.string(),
  participants: z.array(z.string()).length(2),
  lastMessage: z.string().optional(),
  lastMessageAt: z.number().optional(),
  unreadCount: z.number().optional(),
  created: z.number(),
});

export type ThreadMetadata = z.infer<typeof ThreadMetadataSchema>;

/**
 * Type guards
 */
export function isMessage(item: unknown): item is Message {
  return MessageSchema.safeParse(item).success;
}

export function isThread(item: unknown): item is ThreadMetadata {
  return ThreadMetadataSchema.safeParse(item).success;
}

/**
 * Create a new message
 */
export function createMessage(
  params: Omit<Message, 'type' | 'created' | 'encrypted' | 'read' | '#' | 'actions'>
): Message {
  return {
    type: 'message',
    created: Date.now(),
    encrypted: true,
    read: false,
    actions: [...MESSAGE_ACTIONS],
    ...params,
  } as Message;
}

/**
 * Create thread ID from two public keys
 */
export function createThreadId(pubKeyA: string, pubKeyB: string): string {
  const sorted = [pubKeyA, pubKeyB].sort();
  return `thread-${sorted[0].substring(0, 8)}-${sorted[1].substring(0, 8)}`;
}

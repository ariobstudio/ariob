/**
 * Profile Node Schema
 *
 * Represents a user identity in the social graph.
 * Extends Who (cryptographic identity) with social metadata.
 */

import { Who, z } from '@ariob/core';
import { NodeMeta, defaults } from '../_shared';

/**
 * Default actions for Profile nodes
 *
 * - edit (owner only)
 * - connect (non-owner)
 * - message
 * - share
 * - block
 */
export const PROFILE_ACTIONS = ['edit', 'connect', 'message', 'share', 'block'] as const;

/**
 * ProfileNode Schema
 *
 * Represents a user identity in the social graph.
 * Extends Who (cryptographic identity) with social metadata.
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
  actions: defaults([...PROFILE_ACTIONS]),
});

export type ProfileNode = z.infer<typeof ProfileNodeSchema>;

/**
 * Type guard for ProfileNode
 */
export function isProfileNode(node: unknown): node is ProfileNode {
  return ProfileNodeSchema.safeParse(node).success;
}

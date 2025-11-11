/**
 * @ariob/ripple
 *
 * Ripple social network primitives for decentralized feed and relationships.
 * Built on @ariob/core Gun.js primitives.
 */

// ============================================================================
// Core Primitives
// ============================================================================

// Schemas - Content types (Post, Message, FeedItem)
export {
  PostSchema,
  MessageSchema,
  ThreadMetadataSchema,
  FeedItemSchema,
  DegreeEnum,
  isPost,
  isThread,
  createPost,
  createMessage,
  createThreadId,
} from './schemas';
export type { Post, Message, ThreadMetadata, FeedItem, Degree } from './schemas';

// Feed - Unified feed with degree filtering
export { feed, useFeed, DEGREE_NAMES } from './feed';
export type { FeedConfig } from './feed';

// Relationships - Friend graph management
export { relationships, useRelationships } from './relationships';
export type { Friend, RelationshipsStore } from './relationships';

// Profile - User profile management
export {
  profile,
  saveProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  useProfile,
  ProfileSchema,
} from './profile';
export type { UserProfile } from './profile';

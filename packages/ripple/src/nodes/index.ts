/**
 * Nodes
 *
 * Co-located node modules following the feature-folder pattern.
 * Each node type is self-contained with schema, component, actions, and styles.
 *
 * Importing this module auto-registers all node actions with the registry.
 *
 * @example
 * ```ts
 * // Import all nodes (auto-registers all actions)
 * import '@ariob/ripple/nodes';
 *
 * // Or import specific nodes
 * import { Profile, Post, Message } from '@ariob/ripple/nodes';
 * ```
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared Infrastructure
// ─────────────────────────────────────────────────────────────────────────────

export * from './_shared';

// ─────────────────────────────────────────────────────────────────────────────
// Profile Node
// ─────────────────────────────────────────────────────────────────────────────

export {
  Profile,
  type ProfileData,
  ProfileNodeSchema,
  type ProfileNode,
  isProfileNode,
  PROFILE_ACTIONS,
  profileActions,
  profileStyles,
} from './profile';

// ─────────────────────────────────────────────────────────────────────────────
// AI Node
// ─────────────────────────────────────────────────────────────────────────────

export {
  AI,
  AIModel,
  type AIModelData,
  type ModelOption,
  AINodeSchema,
  type AINode,
  isAINode,
  AI_ACTIONS,
  TopicSchema,
  type Topic,
  AIThreadSchema,
  type AIThread,
  aiActions,
  aiStyles,
} from './ai';

// ─────────────────────────────────────────────────────────────────────────────
// Post Node
// ─────────────────────────────────────────────────────────────────────────────

export {
  Post,
  type PostData,
  PostSchema,
  type Post as PostNode,
  isPost,
  createPost,
  POST_ACTIONS,
  postActions,
  postStyles,
} from './post';

// ─────────────────────────────────────────────────────────────────────────────
// Message Node
// ─────────────────────────────────────────────────────────────────────────────

export {
  Message,
  type MessageData,
  MessageSchema,
  type Message as MessageNode,
  isMessage,
  createMessage,
  MESSAGE_ACTIONS,
  ThreadMetadataSchema,
  type ThreadMetadata,
  isThread,
  createThreadId,
  messageActions,
  messageStyles,
} from './message';

// ─────────────────────────────────────────────────────────────────────────────
// Simple Nodes (no actions)
// ─────────────────────────────────────────────────────────────────────────────

export { Ghost, type GhostData, GHOST_ACTIONS } from './ghost';
export { Sync, type SyncData, SYNC_ACTIONS } from './sync';
export { Suggestion, type SuggestionData, SUGGESTION_ACTIONS } from './suggestion';
export { Auth, type AuthData, AUTH_ACTIONS } from './auth';

// ─────────────────────────────────────────────────────────────────────────────
// Consolidated Styles (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export { profileStyles as styles } from './profile';

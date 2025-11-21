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
  ImagePostSchema,
  VideoPostSchema,
  PollSchema,
  ShareSchema,
  CommentSchema,
  isImagePost,
  isVideoPost,
  isPoll,
  isShare,
  createImagePost,
  createVideoPost,
  createPoll,
  createShare,
  createComment,
} from './schemas';
export type {
  Post,
  Message,
  ThreadMetadata,
  FeedItem,
  Degree,
  ImagePost,
  VideoPost,
  Poll,
  Share,
  Comment,
  MediaAttachment,
  PollOption,
} from './schemas';

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

// ============================================================================
// Node System
// ============================================================================

// Node System - Modular content rendering
export {
  // Types
  type ViewMode,
  type NodeType,
  type NodeRendererType,
  type NodeRenderProps,
  type NodeMetadata,
  type NodeRegistryEntry,
  type NodeNavigationContext,
  type UseNodeRendererResult,

  // Registry
  registerNode,
  registerNodes,
  getNodeRenderer,
  getNodeMetadata,
  isNodeRegistered,
  supportsImmersiveView,
  renderNode,
  getAllNodeTypes,
  getAllNodes,
  clearRegistry,
  getRegistrySize,

  // Context & Navigation
  NodeProvider,
  useNodeNavigation,
  useViewMode,
  useCurrentNodeId,

  // Hooks
  useNodeRenderer,
  useNodeRendererForType,
  useNodeMetadata,
  useShouldOpenImmersive,
} from './nodes';

// Node Renderers
export {
  initializeNodeRenderers,
  TextPostNodeRenderer,
  ImagePostNodeRenderer,
  VideoPostNodeRenderer,
  PollNodeRenderer,
  ShareNodeRenderer,
  MessageThreadNodeRenderer,
} from './nodes/renderers';

// ============================================================================
// Components
// ============================================================================

// NodeRenderer - Universal content renderer
export { NodeRenderer } from './components/NodeRenderer';
export type { NodeRendererProps } from './components/NodeRenderer';

// FeedItem - Unified feed item component with visual differentiation
export { FeedItemComponent } from './components/FeedItem';

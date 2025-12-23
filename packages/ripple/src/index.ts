/**
 * @ariob/ripple - Graph-Native Social Feed System
 *
 * Small, composable, single-purpose modules following UNIX philosophy.
 *
 * ## Structure
 * - **Nodes** - Co-located content modules (Profile, AI, Post, Message, etc.)
 * - **Menu** - Bar and Context menu components
 * - **Components** - Shared components (Node renderer, Header, Footer)
 * - **Primitives** - Base primitives (Shell)
 * - **Gestures** - Gesture handlers (hold, tap, swipe)
 * - **Hooks** - React hooks (useFeed, useNav)
 * - **Config** - Configuration (degrees, paths)
 * - **Styles** - Theme tokens and effects
 *
 * ## Usage
 * ```tsx
 * // Import nodes (auto-registers their actions)
 * import { Profile, Post, Message, registry } from '@ariob/ripple';
 *
 * // Execute an action
 * const result = await registry.execute('edit', context);
 * ```
 */

// ─────────────────────────────────────────────────────────────────────────────
// Nodes (Co-located Content Modules)
// Auto-registers actions on import
// ─────────────────────────────────────────────────────────────────────────────

export {
  // Profile
  Profile,
  type ProfileData,
  ProfileNodeSchema,
  type ProfileNode,
  isProfileNode,
  PROFILE_ACTIONS,
  profileActions,
  profileStyles,
  // AI
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
  // Post
  Post,
  type PostData,
  PostSchema,
  type Post as PostNode,
  isPost,
  createPost,
  POST_ACTIONS,
  postActions,
  postStyles,
  // Message
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
  // Simple nodes
  Ghost,
  type GhostData,
  Sync,
  type SyncData,
  Suggestion,
  type SuggestionData,
  Auth,
  type AuthData,
  // Shared infrastructure
  DegreeEnum,
  VariantEnum,
  NodeMeta,
  BaseNode,
  defaults,
  type Degree,
  type Variant,
  // Action system
  CategoryEnum,
  ActionVariantEnum,
  ActionMeta,
  RegistryContext,
  ActionResult,
  success,
  error,
  pending,
  type Category,
  type ActionVariant,
  // Registry
  registry,
  action,
  define,
  type ActionHandler,
  type RegisteredAction,
  // Styles
  styles as nodeStyles,
} from './nodes';

// ─────────────────────────────────────────────────────────────────────────────
// Protocols (Extensibility Interfaces)
// ─────────────────────────────────────────────────────────────────────────────

export * from './protocols';

// ─────────────────────────────────────────────────────────────────────────────
// Menu System (Bar, Context)
// ─────────────────────────────────────────────────────────────────────────────

export * from './menu';

// Legacy make helper (for backward compatibility)
export { make, type Def } from './menu/make';

// ─────────────────────────────────────────────────────────────────────────────
// Components (Shared)
// ─────────────────────────────────────────────────────────────────────────────

export { NodeView, NodeView as Node, type NodeData, type NodeType as ComponentNodeType } from './components/node';
export { Header } from './components/header';
export { Footer } from './components/footer';

// ─────────────────────────────────────────────────────────────────────────────
// Primitives (Base)
// ─────────────────────────────────────────────────────────────────────────────

export * from './primitives';

// ─────────────────────────────────────────────────────────────────────────────
// Gestures (Handlers) - DISABLED: GestureDetector causes "property is not writable"
// errors with RN 0.81+. Using native onLongPress in Shell instead.
// ─────────────────────────────────────────────────────────────────────────────
// export * from './gesture';

// ─────────────────────────────────────────────────────────────────────────────
// Hooks (React)
// ─────────────────────────────────────────────────────────────────────────────

export { useFeed, type FeedConfig, type Feed } from './hooks/feed';
export { useNodeNavigation, getTransitionTag, type NavigateOptions } from './hooks/navigation';
export {
  useSearch,
  useUserSearch,
  useHashtagSearch,
  type SearchConfig,
  type SearchResults,
  type Search,
  type SearchType,
  type UserSearch,
  type HashtagSearch,
} from './hooks/search';

// ─────────────────────────────────────────────────────────────────────────────
// Config (Settings)
// ─────────────────────────────────────────────────────────────────────────────

export * from './config';

// ─────────────────────────────────────────────────────────────────────────────
// Styles (Tokens, Themes)
// ─────────────────────────────────────────────────────────────────────────────

export * from './styles';

// ─────────────────────────────────────────────────────────────────────────────
// Schemas (Legacy exports for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export {
  DEGREES,
  FeedItemSchema,
  type FeedItem as FeedItemSchema_FeedItem,
  UserSearchResultSchema,
  type UserSearchResult,
  HashtagRefSchema,
  type HashtagRef,
  PublicProfileSchema,
  type PublicProfile,
  NodeSchema,
  type Node as SchemaNode, // Renamed to avoid conflict with component
  type NodeType,
  type NodeOfType,
  nodeGuards,
} from './schemas';

// ─────────────────────────────────────────────────────────────────────────────
// Search (Decentralized Discovery)
// ─────────────────────────────────────────────────────────────────────────────

export {
  searchUsers,
  searchByHashtag,
  fetchPostsFromRefs,
  extractHashtags,
  extractMentions,
  indexMyProfile,
  indexPostHashtags,
} from './search';

// ─────────────────────────────────────────────────────────────────────────────
// Transitions (Animations)
// ─────────────────────────────────────────────────────────────────────────────

export * from './transitions';

// ─────────────────────────────────────────────────────────────────────────────
// Node Bar Hook (Schema-Driven Actions for Nodes)
// ─────────────────────────────────────────────────────────────────────────────

export {
  useNodeBar,
  NodeBarProvider,
  NodeBarContext,
  useNodeBarContext,
  useNodeBarContextSafe,
  type NodeBarConfig,
  type NodeBarState,
  type NodeBarProviderProps,
} from './menu/bar';

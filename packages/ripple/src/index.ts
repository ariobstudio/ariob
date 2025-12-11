/**
 * @ariob/ripple - Graph-Native Social Feed System
 *
 * Small, composable, single-purpose modules following UNIX philosophy.
 *
 * ## Structure
 * - **Nodes** - Content type components (Post, Message, Profile, Auth, etc.)
 * - **Menu** - Action system with make helper, Bar, Context menu
 * - **Components** - Shared components (Node renderer, Header, Footer)
 * - **Primitives** - Base primitives (Shell)
 * - **Gestures** - Gesture handlers (hold, tap, swipe)
 * - **Hooks** - React hooks (useFeed, useNav)
 * - **Config** - Configuration (degrees, paths)
 * - **Styles** - Theme tokens and effects
 *
 * ## Usage
 * ```tsx
 * import { make, Bar, Context, Post, Shell } from '@ariob/ripple';
 *
 * // Create actions using make helper
 * const actions = {
 *   post: make('post', { icon: 'add', label: 'Post' }),
 *   reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
 * };
 * ```
 */

// ─────────────────────────────────────────────────────────────────────────────
// Menu System (Actions, Bar, Context)
// ─────────────────────────────────────────────────────────────────────────────

export * from './menu';

// Re-export make helper at top level for convenience
export { make, type Def } from './menu/make';

// ─────────────────────────────────────────────────────────────────────────────
// Nodes (Content Types)
// ─────────────────────────────────────────────────────────────────────────────

// Export nodes explicitly to avoid naming conflicts with schemas
export { Post, type PostData } from './nodes/post';
export { Message, type MessageData } from './nodes/message';
export { Profile, type ProfileData } from './nodes/profile';
export { Auth, type AuthData } from './nodes/auth';
export { Sync, type SyncData } from './nodes/sync';
export { Ghost, type GhostData } from './nodes/ghost';
export { Suggestion, type SuggestionData } from './nodes/suggestion';
export { AIModel, type AIModelData } from './nodes/ai-model';
export { styles as nodeStyles } from './nodes';

// ─────────────────────────────────────────────────────────────────────────────
// Components (Shared)
// ─────────────────────────────────────────────────────────────────────────────

// Export components explicitly to avoid naming conflicts
export { Node, type NodeData, type NodeType } from './components/node';
export { Header } from './components/header';
export { Footer } from './components/footer';
// Note: Renderer component moved to apps/ripple/components/Renderer.tsx
// as it contains app-specific business logic (type mapping, data transformation)

// ─────────────────────────────────────────────────────────────────────────────
// Primitives (Base)
// ─────────────────────────────────────────────────────────────────────────────

export * from './primitives';

// ─────────────────────────────────────────────────────────────────────────────
// Gestures (Handlers)
// ─────────────────────────────────────────────────────────────────────────────

export * from './gesture';

// ─────────────────────────────────────────────────────────────────────────────
// Hooks (React)
// ─────────────────────────────────────────────────────────────────────────────

// Export hooks explicitly (ViewMode already exported from components)
export { useFeed, type FeedConfig, type Feed } from './hooks/feed';
export { useNodeNavigation, getTransitionTag, type NavigateOptions } from './hooks/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// Config (Settings)
// ─────────────────────────────────────────────────────────────────────────────

export * from './config';

// ─────────────────────────────────────────────────────────────────────────────
// Styles (Tokens, Themes)
// ─────────────────────────────────────────────────────────────────────────────

export * from './styles';

// ─────────────────────────────────────────────────────────────────────────────
// Schemas (Data Types)
// ─────────────────────────────────────────────────────────────────────────────

// Export schemas with explicit naming to avoid conflicts with component exports
export {
  DegreeEnum,
  type Degree,
  DEGREES,
  PostSchema,
  type Post as PostSchema_Post,  // Renamed to avoid conflict with Post component
  MessageSchema,
  type Message as MessageSchema_Message, // Renamed to avoid conflict with Message component
  FeedItemSchema,
  type FeedItem as FeedItemSchema_FeedItem, // Renamed to avoid conflict with FeedItem interface
} from './schemas';

// ─────────────────────────────────────────────────────────────────────────────
// Transitions (Animations)
// ─────────────────────────────────────────────────────────────────────────────

export * from './transitions';

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

export * from './nodes';

// ─────────────────────────────────────────────────────────────────────────────
// Components (Shared)
// ─────────────────────────────────────────────────────────────────────────────

export * from './components';

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

export * from './hooks';

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

export * from './schemas';

// ─────────────────────────────────────────────────────────────────────────────
// Transitions (Animations)
// ─────────────────────────────────────────────────────────────────────────────

export * from './transitions';

# API Reference

Complete reference for all exports from `@ariob/ripple`.

---

## Table of Contents

- [Nodes](#nodes)
- [Menu System](#menu-system)
- [Components](#components)
- [Primitives](#primitives)
- [Hooks](#hooks)
- [Search](#search)
- [Config](#config)
- [Styles](#styles)
- [Schemas](#schemas)
- [Transitions](#transitions)

---

## Nodes

Co-located content modules that auto-register actions on import.

### Profile

```typescript
import {
  Profile,
  type ProfileData,
  ProfileNodeSchema,
  type ProfileNode,
  isProfileNode,
  PROFILE_ACTIONS,
  profileActions,
  profileStyles,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `Profile` | Component | Profile card component |
| `ProfileData` | Type | Props for Profile component |
| `ProfileNodeSchema` | Zod Schema | Validation schema |
| `ProfileNode` | Type | Inferred type from schema |
| `isProfileNode` | Function | Type guard |
| `PROFILE_ACTIONS` | Constant | `['edit', 'connect', 'message', 'share', 'block']` |
| `profileActions` | Object | Registered action handlers |
| `profileStyles` | Stylesheet | Theme-aware styles |

### Post

```typescript
import {
  Post,
  type PostData,
  PostSchema,
  type PostNode,
  isPost,
  createPost,
  POST_ACTIONS,
  postActions,
  postStyles,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `Post` | Component | Social post component |
| `PostData` | Type | Props for Post component |
| `PostSchema` | Zod Schema | Validation schema |
| `PostNode` | Type | Inferred type from schema |
| `isPost` | Function | Type guard |
| `createPost` | Function | Factory for creating posts |
| `POST_ACTIONS` | Constant | `['reply', 'save', 'share', 'delete']` |
| `postActions` | Object | Registered action handlers |
| `postStyles` | Stylesheet | Theme-aware styles |

### Message

```typescript
import {
  Message,
  type MessageData,
  MessageSchema,
  type MessageNode,
  isMessage,
  createMessage,
  MESSAGE_ACTIONS,
  ThreadMetadataSchema,
  type ThreadMetadata,
  isThread,
  createThreadId,
  messageActions,
  messageStyles,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `Message` | Component | Chat bubble component |
| `MessageData` | Type | Props for Message component |
| `MessageSchema` | Zod Schema | Validation schema |
| `MessageNode` | Type | Inferred type from schema |
| `isMessage` | Function | Type guard |
| `createMessage` | Function | Factory for creating messages |
| `MESSAGE_ACTIONS` | Constant | `['reply', 'forward', 'delete']` |
| `ThreadMetadataSchema` | Zod Schema | Thread metadata validation |
| `ThreadMetadata` | Type | Thread metadata type |
| `isThread` | Function | Thread type guard |
| `createThreadId` | Function | Generate thread ID from participants |
| `messageActions` | Object | Registered action handlers |
| `messageStyles` | Stylesheet | Theme-aware styles |

### AI

```typescript
import {
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
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `AI` | Component | AI conversation component |
| `AIModel` | Component | Model selection card |
| `AIModelData` | Type | Props for AIModel component |
| `ModelOption` | Type | Model option definition |
| `AINodeSchema` | Zod Schema | Validation schema |
| `AINode` | Type | Inferred type from schema |
| `isAINode` | Function | Type guard |
| `AI_ACTIONS` | Constant | AI action names |
| `TopicSchema` | Zod Schema | Topic validation |
| `Topic` | Type | Topic type |
| `AIThreadSchema` | Zod Schema | AI thread validation |
| `AIThread` | Type | AI thread type |
| `aiActions` | Object | Registered action handlers |
| `aiStyles` | Stylesheet | Theme-aware styles |

### Simple Nodes

```typescript
import {
  Ghost,
  type GhostData,
  Sync,
  type SyncData,
  Suggestion,
  type SuggestionData,
  Auth,
  type AuthData,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `Ghost` | Component | Placeholder/loading state |
| `GhostData` | Type | `{ message: string }` |
| `Sync` | Component | Sync status indicator |
| `SyncData` | Type | Peer list and sync status |
| `Suggestion` | Component | Recommendation card |
| `SuggestionData` | Type | Suggestion content |
| `Auth` | Component | Authentication UI |
| `AuthData` | Type | Auth mode and callbacks |

### Shared Infrastructure

```typescript
import {
  DegreeEnum,
  VariantEnum,
  NodeMeta,
  BaseNode,
  defaults,
  type Degree,
  type Variant,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `DegreeEnum` | Zod Enum | `z.enum(['0', '1', '2', '3', '4'])` |
| `VariantEnum` | Zod Enum | `z.enum(['feed', 'detail', 'full'])` |
| `NodeMeta` | Zod Schema | Common node metadata |
| `BaseNode` | Zod Schema | Base schema for all nodes |
| `defaults` | Function | Create default array with fallback |
| `Degree` | Type | `'0' | '1' | '2' | '3' | '4'` |
| `Variant` | Type | `'feed' | 'detail' | 'full'` |

### Action System

```typescript
import {
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
  registry,
  action,
  define,
  type ActionHandler,
  type RegisteredAction,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `CategoryEnum` | Zod Enum | `z.enum(['primary', 'secondary', 'danger'])` |
| `ActionVariantEnum` | Zod Enum | `z.enum(['feed', 'detail', 'full', 'quick'])` |
| `ActionMeta` | Zod Schema | Action metadata schema |
| `RegistryContext` | Zod Schema | Execution context schema |
| `ActionResult` | Zod Schema | Action result schema |
| `success` | Function | Create success result |
| `error` | Function | Create error result |
| `pending` | Function | Create pending result |
| `Category` | Type | `'primary' | 'secondary' | 'danger'` |
| `ActionVariant` | Type | `'feed' | 'detail' | 'full' | 'quick'` |
| `registry` | Object | ActionRegistry singleton |
| `action` | Function | Register action with metadata |
| `define` | Function | Define action without registration |
| `ActionHandler` | Type | Handler function type |
| `RegisteredAction` | Type | Registered action with metadata |

---

## Menu System

Action bar and context menu components.

### Core Components

```typescript
import {
  Bar,
  Context,
  ActionsProvider,
  SheetRegistryProvider,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `Bar` | Component | Floating action bar |
| `Context` | Component | Long-press context menu |
| `ActionsProvider` | Provider | Actions context provider |
| `SheetRegistryProvider` | Provider | Bottom sheet registry |

### Hooks

```typescript
import {
  useBar,
  useAction,
  useFeedConfig,
  useNodeMenu,
  useNodeBar,
  NodeBarProvider,
  NodeBarContext,
  useNodeBarContext,
  useNodeBarContextSafe,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `useBar` | Hook | Control bar programmatically |
| `useAction` | Hook | Get single action definition |
| `useFeedConfig` | Hook | Get feed config for degree |
| `useNodeMenu` | Hook | Get menu config for node type |
| `useNodeBar` | Hook | Schema-driven action bar (advanced) |
| `NodeBarProvider` | Provider | NodeBar context provider |
| `NodeBarContext` | Context | React context for NodeBar |
| `useNodeBarContext` | Hook | Access NodeBar context |
| `useNodeBarContextSafe` | Hook | Safe access (returns null) |

### Helpers

```typescript
import {
  make,
  type Def,
  createFeedConfigs,
  createNodeMenus,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `make` | Function | Create action definition |
| `Def` | Type | Action definition options |
| `createFeedConfigs` | Function | Create degree feed configs |
| `createNodeMenus` | Function | Create node menu configs |

### Types

```typescript
import type {
  Act,
  SubAction,
  ActionsConfig,
  ActionContext,
  FeedConfig,
  NodeMenuConfig,
  BarConfig,
  BarMode,
  BarCallbacks,
  SheetRegistry,
  NodeBarConfig,
  NodeBarState,
  NodeBarProviderProps,
} from '@ariob/ripple';
```

---

## Components

Shared UI components.

```typescript
import {
  NodeView,
  Node,  // Alias for NodeView
  Header,
  Footer,
  type NodeData,
  type ComponentNodeType,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `NodeView` | Component | Universal node renderer |
| `Node` | Component | Alias for NodeView |
| `Header` | Component | Screen header |
| `Footer` | Component | Screen footer |
| `NodeData` | Type | Union of all node data types |
| `ComponentNodeType` | Type | Node type string literal |

### NodeView Usage

```typescript
<NodeView type="post" data={postData} />
<NodeView type="message" data={messageData} />
<NodeView type="profile" data={profileData} />
```

---

## Primitives

Base UI primitives.

```typescript
import {
  Shell,
  Avatar,
  Badge,
  Dot,
  Line,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `Shell` | Component | Long-press context wrapper |
| `Avatar` | Component | Re-exported from andromeda |
| `Badge` | Component | Re-exported from andromeda |
| `Dot` | Component | Re-exported from andromeda |
| `Line` | Component | Re-exported from andromeda |

### Shell Props

```typescript
interface ShellProps {
  children: ReactNode;
  nodeRef: { id: string; type: string };
  disabled?: boolean;
  style?: ViewStyle;
}
```

---

## Hooks

React hooks for data and navigation.

### useFeed

```typescript
import { useFeed, type FeedConfig, type Feed } from '@ariob/ripple';

const feed = useFeed({ degree: 1, limit: 30 });
```

| Property | Type | Description |
|----------|------|-------------|
| `items` | `FeedItem[]` | Feed items |
| `loading` | `boolean` | Initial load state |
| `refreshing` | `boolean` | Pull-to-refresh state |
| `error` | `Error | null` | Error state |
| `hasMore` | `boolean` | More items available |
| `refresh` | `() => void` | Trigger refresh |
| `loadMore` | `() => void` | Load more items |
| `post` | `(content: string) => Promise<void>` | Post new content |

### useNodeNavigation

```typescript
import { useNodeNavigation, getTransitionTag, type NavigateOptions } from '@ariob/ripple';

const { navigate, back, toProfile, toThread, toMessage } = useNodeNavigation();
```

| Method | Type | Description |
|--------|------|-------------|
| `navigate` | `(id: string, mode: ViewMode) => void` | Navigate to node |
| `back` | `() => void` | Go back |
| `toProfile` | `(userId: string) => void` | Navigate to profile |
| `toThread` | `(postId: string) => void` | Navigate to thread |
| `toMessage` | `(userId: string) => void` | Navigate to message |

### Search Hooks

```typescript
import {
  useSearch,
  useUserSearch,
  useHashtagSearch,
  type SearchConfig,
  type SearchResults,
  type Search,
  type SearchType,
  type UserSearch,
  type HashtagSearch,
} from '@ariob/ripple';

// Unified search
const search = useSearch({ type: 'users', debounce: 300 });

// User search
const { results, isLoading, error, refetch } = useUserSearch(query);

// Hashtag search
const { refs, posts, isLoading, error, refetch } = useHashtagSearch(tag);
```

---

## Search

Decentralized search functions.

```typescript
import {
  searchUsers,
  searchByHashtag,
  fetchPostsFromRefs,
  extractHashtags,
  extractMentions,
  indexMyProfile,
  indexPostHashtags,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `searchUsers` | `(query: string) => Promise<UserSearchResult[]>` | Search user index |
| `searchByHashtag` | `(tag: string) => Promise<HashtagRef[]>` | Search hashtag index |
| `fetchPostsFromRefs` | `(refs: HashtagRef[]) => Promise<Post[]>` | Fetch posts from refs |
| `extractHashtags` | `(text: string) => string[]` | Extract hashtags from text |
| `extractMentions` | `(text: string) => string[]` | Extract mentions from text |
| `indexMyProfile` | `(profile: PublicProfile) => Promise<void>` | Index profile for search |
| `indexPostHashtags` | `(post: Post) => Promise<void>` | Index post hashtags |

---

## Config

Configuration constants.

```typescript
import { degrees, paths } from '@ariob/ripple';
```

### degrees

```typescript
const degrees = {
  0: { name: 'Me', color: '#FF375F' },
  1: { name: 'Friends', color: '#64D2FF' },
  2: { name: 'World', color: '#BF5AF2' },
  3: { name: 'Discover', color: '#FFD60A' },
  4: { name: 'Noise', color: '#8E8E93' },
};
```

### paths

```typescript
const paths = {
  profile: (id: string) => `/user/${id}`,
  thread: (id: string) => `/thread/${id}`,
  message: (id: string) => `/message/${id}`,
  settings: '/settings',
};
```

---

## Styles

Theme tokens and effects.

```typescript
import {
  rippleThemes,
  ripplePalettes,
  rippleSpacing,
  rippleRadii,
  rippleTypography,
  rippleEffects,
  rippleSprings,
  rippleBreakpoints,
  createRippleTheme,
  type RippleTheme,
  type RippleThemeMode,
  type RipplePalette,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `rippleThemes` | Object | `{ dark: RippleTheme, light: RippleTheme }` |
| `ripplePalettes` | Object | Color palettes per mode |
| `rippleSpacing` | Object | Spacing scale (xxs to xxxl) |
| `rippleRadii` | Object | Border radii (sm to pill) |
| `rippleTypography` | Object | Typography scale |
| `rippleEffects` | Object | Dividers, outlines, glows, shadows |
| `rippleSprings` | Object | Animation spring presets |
| `rippleBreakpoints` | Object | Responsive breakpoints |
| `createRippleTheme` | Function | Create theme from palette |
| `RippleTheme` | Type | Complete theme type |
| `RippleThemeMode` | Type | `'dark' | 'light'` |
| `RipplePalette` | Type | Color palette type |

### Node Styles

```typescript
import { nodeStyles } from '@ariob/ripple';

const { post, message, profile, ai } = nodeStyles;
```

---

## Schemas

Zod schemas for data validation.

```typescript
import {
  DEGREES,
  FeedItemSchema,
  type FeedItem,
  UserSearchResultSchema,
  type UserSearchResult,
  HashtagRefSchema,
  type HashtagRef,
  PublicProfileSchema,
  type PublicProfile,
  NodeSchema,
  type SchemaNode,
  type NodeType,
  type NodeOfType,
  nodeGuards,
} from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `DEGREES` | Constant | `[0, 1, 2, 3, 4]` |
| `FeedItemSchema` | Zod Schema | Feed item validation |
| `FeedItem` | Type | Feed item type |
| `UserSearchResultSchema` | Zod Schema | User search result |
| `UserSearchResult` | Type | `{ pub, alias, avatar?, name? }` |
| `HashtagRefSchema` | Zod Schema | Hashtag reference |
| `HashtagRef` | Type | `{ author, id }` |
| `PublicProfileSchema` | Zod Schema | Public profile for indexing |
| `PublicProfile` | Type | Public profile type |
| `NodeSchema` | Zod Schema | Union of all node schemas |
| `SchemaNode` | Type | Union of all node types |
| `NodeType` | Type | Node type string literal |
| `NodeOfType` | Type | Get node type by discriminator |
| `nodeGuards` | Object | Type guard functions |

---

## Transitions

Animation configuration for navigation.

```typescript
import { sharedTransition, cardTransition } from '@ariob/ripple';
```

| Export | Type | Description |
|--------|------|-------------|
| `sharedTransition` | Object | Shared element transition config |
| `cardTransition` | Object | Card-style transition config |

---

## Full Import Example

```typescript
// Nodes
import {
  Profile, Post, Message, AI, Ghost, Sync, Auth, Suggestion,
  registry, action,
} from '@ariob/ripple';

// Menu
import {
  Bar, Context, ActionsProvider,
  make, createFeedConfigs, createNodeMenus,
  useBar, useAction, useFeedConfig, useNodeMenu,
} from '@ariob/ripple';

// Components & Primitives
import { NodeView, Header, Footer, Shell } from '@ariob/ripple';

// Hooks
import { useFeed, useNodeNavigation, useSearch } from '@ariob/ripple';

// Search
import { searchUsers, searchByHashtag, indexMyProfile } from '@ariob/ripple';

// Config & Styles
import { degrees, paths } from '@ariob/ripple';
import { rippleThemes, rippleSpacing } from '@ariob/ripple';

// Types
import type {
  ProfileData, PostData, MessageData,
  FeedConfig, ActionsConfig,
  RippleTheme, RipplePalette,
} from '@ariob/ripple';
```

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - Design patterns
- [Menu System](./MENU.md) - Action bar and context menu
- [Registry](./REGISTRY.md) - Schema-driven actions
- [Nodes](./NODES.md) - Content type components
- [Hooks](./HOOKS.md) - React hooks
- [Search](./SEARCH.md) - Decentralized search
- [Styles](./STYLES.md) - Theme tokens

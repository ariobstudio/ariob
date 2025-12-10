# @ariob/ripple

> Graph-native social primitives following UNIX philosophy

Small, composable modules for building decentralized social experiences.

---

## Overview

**@ariob/ripple** provides:

- **Menu** — Action system with `make` helper, Bar, Context menu
- **Nodes** — Content types (Post, Message, Profile, Auth, etc.)
- **Components** — Shared components (Node renderer, Header, Footer)
- **Gestures** — Touch-first interactions (hold, tap, swipe)
- **Hooks** — React hooks (useFeed, useNav)
- **Config** — Degree and path definitions
- **Styles** — Theme tokens and effects

---

## Quick Start

```typescript
import { make, Bar, Context, ActionsProvider } from '@ariob/ripple';

// Create actions using the make helper
const actions = {
  post: make('post', { icon: 'add', label: 'Post' }),
  reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
  config: make('config', {
    icon: 'settings',
    label: 'Settings',
    sub: [
      { name: 'profile', icon: 'person', label: 'Profile' },
      { name: 'theme', icon: 'color-palette', label: 'Theme' },
    ],
  }),
};

// Provide to app
function App() {
  return (
    <ActionsProvider config={{ actions, feedConfig, nodeMenus, onAction: handleAction }}>
      <Feed />
      <Bar />
      <Context />
    </ActionsProvider>
  );
}
```

---

## Architecture

Following UNIX philosophy with protocol-first design:

```
@ariob/ripple
├── menu/                 # Action system
│   ├── make.ts           # UNIX-style action factory
│   ├── types.ts          # Protocol definitions
│   ├── Provider.tsx      # Context provider
│   ├── bar/              # Floating action bar
│   ├── context.tsx       # Long-press menu
│   └── __tests__/        # Jest tests
├── nodes/                # Content types
│   ├── styles.ts         # Consolidated styles
│   ├── post.tsx
│   ├── message.tsx
│   └── ...
├── components/           # Shared components
├── primitives/           # Base primitives
├── gesture/              # Gesture handlers
├── hooks/                # React hooks
├── config/               # Configuration
└── styles/               # Theme tokens
```

---

## Make Helper

UNIX-style factory for creating actions:

```typescript
import { make } from '@ariob/ripple';

// Simple action
const post = make('post', { icon: 'add', label: 'Post' });
// { name: 'post', icon: 'add', label: 'Post' }

// Action with submenu
const config = make('config', {
  icon: 'settings',
  label: 'Settings',
  sub: [
    { name: 'profile', icon: 'person', label: 'Profile' },
    { name: 'theme', icon: 'color-palette', label: 'Theme' },
  ],
});

// Build action records
const actions = {
  post: make('post', { icon: 'add', label: 'Post' }),
  reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
  save: make('save', { icon: 'bookmark-outline', label: 'Save' }),
};
```

---

## Actions Provider

Configure actions for your app:

```typescript
import { ActionsProvider, make, createFeedConfigs, createNodeMenus } from '@ariob/ripple';

const config = {
  // Actions created with make helper
  actions: {
    post: make('post', { icon: 'add', label: 'Post' }),
    reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
    // ...
  },

  // Feed config per degree
  feedConfig: createFeedConfigs({
    0: { main: 'post', mainUnauthenticated: 'create', left: 'config', right: 'more' },
    1: { main: 'post', right: 'find' },
    2: { main: 'post', left: 'trend', right: 'search' },
  }),

  // Node menus per type
  nodeMenus: createNodeMenus({
    post: { quick: ['reply', 'save', 'share'], detail: ['reply'], opts: ['report'] },
    message: { quick: ['reply', 'forward'], detail: ['reply'], opts: ['delete'] },
  }),

  // Action handler
  onAction: (action, context) => {
    switch (action) {
      case 'post': router.push('/compose'); break;
      case 'reply': router.push('/thread/' + context.node?.id); break;
    }
  },
};

<ActionsProvider config={config}>
  <App />
</ActionsProvider>
```

---

## Menu System

### Action Bar

Floating action bar with contextual actions:

```typescript
import { Bar, useBar } from '@ariob/ripple';

// Add to layout
<Bar />

// Control programmatically
const { setMode, setActions, setValue } = useBar();

// Switch to input mode
setMode('input');

// Update actions
setActions({
  left: make('back', { icon: 'arrow-back', label: 'Back' }),
  center: make('send', { icon: 'send', label: 'Send' }),
});
```

### Context Menu

Long-press floating menu:

```typescript
import { Context } from '@ariob/ripple';

// Add to layout
<Context />
```

### Hooks

```typescript
import { useFeedConfig, useNodeMenu, useAction } from '@ariob/ripple';

// Get feed config for current degree
const config = useFeedConfig(degree);
// { main: 'post', left: 'config', right: 'more' }

// Get menu for node type
const menu = useNodeMenu('post');
// { quick: ['reply', 'save'], detail: ['reply'], opts: ['report'] }

// Get single action
const action = useAction('post');
// { name: 'post', icon: 'add', label: 'Post' }
```

---

## Five Degrees of Visibility

| Degree | Name | Description |
|--------|------|-------------|
| 0 | Me | Personal posts, drafts, private notes |
| 1 | Friends | Direct connections, DMs |
| 2 | World | Friends-of-friends, public content |
| 3 | Discover | Algorithmic recommendations |
| 4 | Noise | Unfiltered, unverified content |

---

## Nodes

Content type components with theme-aware styles:

```typescript
import { Post, Message, Profile, Auth, Sync, Ghost } from '@ariob/ripple';
import { styles } from '@ariob/ripple/nodes';

// Use consolidated styles
const { post, message, auth, sync, ghost, profile, aiModel } = styles;
```

---

## Gestures

### Hold (Long-press)

Opens context menu:

```typescript
import { Shell } from '@ariob/ripple';

<Shell nodeRef={{ id: post.id, type: 'post' }}>
  <PostContent />
</Shell>
```

### Swipe

Trigger actions with swipes:

```typescript
import { useSwipe } from '@ariob/ripple';

const gesture = useSwipe(message, {
  left: () => deleteMessage(message),
  right: () => replyTo(message),
});
```

---

## Hooks

### useFeed

```typescript
import { useFeed } from '@ariob/ripple';

const { items, loading, error, post } = useFeed({
  degree: '1',
  enabled: true,
});
```

### useNodeNavigation

```typescript
import { useNodeNavigation } from '@ariob/ripple';

const { navigate, back, toProfile } = useNodeNavigation();

navigate(nodeId, 'full');    // Thread detail
toProfile(userId);           // User profile
```

---

## Styles

Theme-aware styles using Unistyles:

```typescript
import { rippleThemes, rippleSpacing, rippleRadii } from '@ariob/ripple/styles';

// Themes
rippleThemes.dark   // Dark theme
rippleThemes.light  // Light theme

// Spacing
rippleSpacing.sm  // 8
rippleSpacing.md  // 12

// Colors
rippleThemes.dark.colors.accent     // '#1D9BF0'
rippleThemes.dark.colors.degree[1]  // '#00E5FF' (Friends)
```

---

## Integration

### With @ariob/andromeda

```typescript
import { toast } from '@ariob/andromeda';
import { make, ActionsProvider } from '@ariob/ripple';

const config = {
  actions: { /* ... */ },
  onAction: (action) => {
    if (action === 'save') toast.success('Saved!');
  },
};
```

### With Expo Router

```typescript
// app/_layout.tsx
import { Context as MenuContext, Bar, ActionsProvider } from '@ariob/ripple';
import { actions, feedConfig, nodeMenus, handleAction } from '../config';

export default function Layout() {
  return (
    <ActionsProvider config={{ actions, feedConfig, nodeMenus, onAction: handleAction }}>
      <Stack />
      <Bar />
      <MenuContext />
    </ActionsProvider>
  );
}
```

---

## Documentation

For comprehensive documentation with full API references, prop tables, and detailed examples:

| Document | Description |
|----------|-------------|
| [README](../../docs/ripple/README.md) | Overview and quick start |
| [SETUP](../../docs/ripple/SETUP.md) | Installation and configuration |
| [MENU](../../docs/ripple/MENU.md) | Action system, Bar, Context, hooks |
| [NODES](../../docs/ripple/NODES.md) | Content type components |
| [GESTURES](../../docs/ripple/GESTURES.md) | Touch interaction handlers |
| [HOOKS](../../docs/ripple/HOOKS.md) | React hooks reference |
| [STYLES](../../docs/ripple/STYLES.md) | Theme tokens and effects |
| [DEGREES](../../docs/ripple/DEGREES.md) | Five Degrees of Visibility |
| [TROUBLESHOOTING](../../docs/ripple/TROUBLESHOOTING.md) | Common issues and solutions |

---

## License

Private package - Ariob monorepo

# @ariob/ripple

> Graph-native social primitives following UNIX philosophy

Small, composable modules for building decentralized social experiences.

---

## Philosophy

**@ariob/ripple** builds on the decentralized graph of @ariob/core to provide:

1. **Protocol-first design** - Data structures before UI
2. **UNIX philosophy** - Small modules that do one thing well
3. **Graph-native** - Built for real-time, peer-to-peer data

The result is a social toolkit where every component:
- **Follows the data** - UI reflects graph state
- **Is context-aware** - Adapts to degree, view mode, auth state
- **Supports offline** - Works without network connectivity
- **Is composable** - Mix and match for your use case

---

## Quick Start

```typescript
import { make, Bar, Context, ActionsProvider, Shell, Post } from '@ariob/ripple';

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

```
@ariob/ripple
├── menu/           # Action system (make, Bar, Context)
├── nodes/          # Content types (Post, Message, Profile, etc.)
├── components/     # Shared components (Node, Header, Footer)
├── primitives/     # Base primitives (Shell, Avatar, Badge)
├── gesture/        # Touch handlers (hold, swipe, tap)
├── hooks/          # React hooks (useFeed, useNav)
├── config/         # Configuration (degrees, paths)
├── styles/         # Theme tokens
├── schemas/        # Data type definitions
└── transitions/    # Animation config
```

---

## Documentation

| Section | Description |
|---------|-------------|
| [Setup](./SETUP.md) | Installation & Unistyles configuration |
| [Menu](./MENU.md) | Action system (make, Bar, Context) |
| [Nodes](./NODES.md) | Content type components |
| [Gestures](./GESTURES.md) | Touch interaction handlers |
| [Hooks](./HOOKS.md) | React hooks |
| [Styles](./STYLES.md) | Theme tokens & effects |
| [Degrees](./DEGREES.md) | Five Degrees of Visibility |
| [Troubleshooting](./TROUBLESHOOTING.md) | Common issues |

---

## Key Features

### Action System

The `make` helper creates consistent action definitions:

```typescript
const post = make('post', { icon: 'add', label: 'Post' });
// { name: 'post', icon: 'add', label: 'Post' }

const config = make('config', {
  icon: 'settings',
  label: 'Settings',
  sub: [{ name: 'profile', icon: 'person', label: 'Profile' }],
});
```

### Five Degrees of Visibility

Content organized by social proximity:

| Degree | Name | Description |
|--------|------|-------------|
| 0 | Me | Personal, private content |
| 1 | Friends | Direct connections |
| 2 | World | Friends-of-friends |
| 3 | Discover | Algorithmic recommendations |
| 4 | Noise | Unfiltered content |

### Context-Aware UI

Components adapt based on:
- Current degree filter
- Authentication state
- View mode (feed, detail, full)
- Node type

### Gesture Shell

Long-press any content for contextual actions:

```typescript
<Shell nodeRef={{ id: post.id, type: 'post' }}>
  <PostContent />
</Shell>
```

---

## Exports

```typescript
// Menu System
export { make, ActionsProvider, Bar, Context, useBar } from '@ariob/ripple';
export { createFeedConfigs, createNodeMenus } from '@ariob/ripple';

// Nodes
export { Post, Message, Profile, Auth, Sync, Ghost, Suggestion, AIModel } from '@ariob/ripple';

// Components
export { Node, Header, Footer } from '@ariob/ripple';

// Primitives
export { Shell, Avatar, Badge, Dot, Line } from '@ariob/ripple';

// Gestures
export { useHold, useSwipe, useDoubleTap } from '@ariob/ripple';

// Hooks
export { useFeed, useNodeNavigation } from '@ariob/ripple';

// Styles
export { rippleThemes, rippleSpacing, rippleRadii, rippleTypography } from '@ariob/ripple/styles';

// Config
export { degrees, paths } from '@ariob/ripple';
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

## License

Private package - Ariob monorepo

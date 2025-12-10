# Menu System

Action system with `make` helper, Bar, and Context menu.

---

## Overview

The menu system provides:
- **`make` helper** - UNIX-style factory for creating actions
- **ActionsProvider** - Context for actions configuration
- **Bar** - Floating action bar with contextual actions
- **Context** - Long-press context menu

---

## make Helper

Factory function for creating consistent action definitions.

### Import

```typescript
import { make, type Def } from '@ariob/ripple';
```

### API

```typescript
make(name: string, options: Def): Action

interface Def {
  icon: string;       // Ionicons name
  label: string;      // Display label
  sub?: SubAction[];  // Optional submenu
}

interface SubAction {
  name: string;
  icon: string;
  label: string;
}
```

### Examples

```typescript
// Simple action
const post = make('post', { icon: 'add', label: 'Post' });
// Result: { name: 'post', icon: 'add', label: 'Post' }

// Action with submenu
const config = make('config', {
  icon: 'settings',
  label: 'Settings',
  sub: [
    { name: 'profile', icon: 'person', label: 'Profile' },
    { name: 'theme', icon: 'color-palette', label: 'Theme' },
    { name: 'keys', icon: 'key', label: 'Keys' },
  ],
});

// Build action records
const actions = {
  post: make('post', { icon: 'add', label: 'Post' }),
  reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
  save: make('save', { icon: 'bookmark-outline', label: 'Save' }),
  share: make('share', { icon: 'share-outline', label: 'Share' }),
  report: make('report', { icon: 'flag-outline', label: 'Report' }),
  block: make('block', { icon: 'ban', label: 'Block' }),
};
```

---

## ActionsProvider

Context provider for the action system.

### Import

```typescript
import { ActionsProvider, type ActionsConfig } from '@ariob/ripple';
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `ActionsConfig` | Full actions configuration |
| `children` | `ReactNode` | App content |

### ActionsConfig Type

```typescript
interface ActionsConfig {
  actions: Record<string, Action>;
  feedConfig: FeedConfigs;
  nodeMenus: NodeMenus;
  onAction: (action: string, context: ActionContext) => void;
}

interface ActionContext {
  node?: { id: string; type: string };
  degree?: number;
  mode?: 'feed' | 'detail' | 'full';
}
```

### Example

```typescript
import { ActionsProvider, make, createFeedConfigs, createNodeMenus } from '@ariob/ripple';

const config: ActionsConfig = {
  actions: {
    post: make('post', { icon: 'add', label: 'Post' }),
    reply: make('reply', { icon: 'arrow-undo', label: 'Reply' }),
    // ...
  },

  feedConfig: createFeedConfigs({
    0: { main: 'post', left: 'config', right: 'more' },
    1: { main: 'post', right: 'find' },
    2: { main: 'post', left: 'trend' },
  }),

  nodeMenus: createNodeMenus({
    post: { quick: ['reply', 'save'], detail: ['reply'], opts: ['report'] },
    message: { quick: ['reply'], detail: ['reply'], opts: ['delete'] },
  }),

  onAction: (action, context) => {
    console.log('Action:', action, 'Context:', context);
    // Handle the action
  },
};

function App() {
  return (
    <ActionsProvider config={config}>
      <YourApp />
    </ActionsProvider>
  );
}
```

---

## createFeedConfigs

Helper for creating degree-specific feed configurations.

### Import

```typescript
import { createFeedConfigs } from '@ariob/ripple';
```

### API

```typescript
createFeedConfigs(configs: Record<number, FeedConfig>): FeedConfigs

interface FeedConfig {
  main?: string;                // Primary action (center)
  mainUnauthenticated?: string; // When not logged in
  left?: string;                // Left action
  right?: string;               // Right action
}
```

### Example

```typescript
const feedConfig = createFeedConfigs({
  0: {
    main: 'post',
    mainUnauthenticated: 'create-account',
    left: 'config',
    right: 'more',
  },
  1: {
    main: 'post',
    left: 'dm',
    right: 'find',
  },
  2: {
    main: 'post',
    left: 'trend',
    right: 'search',
  },
  3: {
    main: 'discover',
    right: 'filter',
  },
  4: {
    main: 'post',
  },
});
```

---

## createNodeMenus

Helper for creating node type-specific menus.

### Import

```typescript
import { createNodeMenus } from '@ariob/ripple';
```

### API

```typescript
createNodeMenus(configs: Record<string, NodeMenuConfig>): NodeMenus

interface NodeMenuConfig {
  quick?: string[];   // Quick action icons (swipe)
  detail?: string[];  // Detail view actions
  opts?: string[];    // Options menu actions
}
```

### Example

```typescript
const nodeMenus = createNodeMenus({
  post: {
    quick: ['reply', 'save', 'share'],
    detail: ['reply', 'quote'],
    opts: ['report', 'block', 'mute'],
  },
  message: {
    quick: ['reply', 'forward'],
    detail: ['reply'],
    opts: ['delete', 'archive'],
  },
  profile: {
    quick: ['message', 'follow'],
    detail: ['message'],
    opts: ['block', 'report'],
  },
});
```

---

## Bar

Floating action bar component.

### Import

```typescript
import { Bar, useBar } from '@ariob/ripple';
```

### Rendering

```typescript
// Add to your layout (usually root)
<ActionsProvider config={config}>
  <Stack />
  <Bar />
</ActionsProvider>
```

### useBar Hook

Control the bar programmatically:

```typescript
const bar = useBar();

// Switch modes
bar.setMode('actions');  // Default action buttons
bar.setMode('input');    // Text input mode
bar.setMode('hidden');   // Hide the bar

// Configure bar
bar.configure({
  mode: 'input',
  persistInputMode: true,
  placeholder: 'Type a message...',
  inputLeft: { name: 'attach', icon: 'attach', label: 'Attach' },
  center: null,
  left: null,
  right: null,
});

// Set callbacks
bar.setCallbacks({
  onSubmit: (text) => sendMessage(text),
  onCancel: () => bar.setMode('actions'),
});

// Get current value (input mode)
const inputValue = bar.getValue();

// Reset to feed config
bar.resetToFeed(currentDegree);
```

### Bar Modes

| Mode | Description |
|------|-------------|
| `actions` | Shows action buttons (main, left, right) |
| `input` | Shows text input with submit |
| `hidden` | Hides the bar |

### Example: Chat Input

```typescript
function ChatScreen() {
  const bar = useBar();

  useFocusEffect(
    useCallback(() => {
      bar.configure({
        mode: 'input',
        persistInputMode: true,
        placeholder: 'Type a message...',
        inputLeft: { name: 'attach', icon: 'attach', label: 'Attach' },
      });

      bar.setCallbacks({
        onSubmit: handleSend,
        onCancel: () => {},
      });

      return () => {
        bar.configure({ persistInputMode: false });
        bar.setMode('actions');
      };
    }, [])
  );

  // ...
}
```

---

## Context

Long-press context menu.

### Import

```typescript
import { Context } from '@ariob/ripple';
```

### Rendering

```typescript
// Add to your layout
<ActionsProvider config={config}>
  <Stack />
  <Bar />
  <Context />
</ActionsProvider>
```

The Context menu appears automatically when users long-press on content wrapped in a `Shell` component.

---

## Action Hooks

### useAction

Get a single action definition:

```typescript
import { useAction } from '@ariob/ripple';

const postAction = useAction('post');
// { name: 'post', icon: 'add', label: 'Post' }
```

### useFeedConfig

Get feed config for a degree:

```typescript
import { useFeedConfig } from '@ariob/ripple';

const config = useFeedConfig(1); // Degree 1 (Friends)
// { main: 'post', left: 'dm', right: 'find' }
```

### useNodeMenu

Get menu for a node type:

```typescript
import { useNodeMenu } from '@ariob/ripple';

const menu = useNodeMenu('post');
// { quick: ['reply', 'save'], detail: ['reply'], opts: ['report'] }
```

---

## Action Flow

1. **User triggers action** (tap button, swipe, long-press)
2. **Action name resolved** from config
3. **`onAction` callback** called with action name and context
4. **Your handler** performs the actual operation

```typescript
const onAction = (action: string, context: ActionContext) => {
  switch (action) {
    case 'post':
      router.push('/compose');
      break;

    case 'reply':
      if (context.node) {
        router.push(`/thread/${context.node.id}`);
      }
      break;

    case 'save':
      if (context.node) {
        saveNode(context.node.id);
        toast.success('Saved!');
      }
      break;

    case 'profile':
      router.push('/profile');
      break;

    case 'report':
      if (context.node) {
        openReportSheet(context.node);
      }
      break;

    default:
      console.log('Unhandled action:', action);
  }
};
```

---

## Best Practices

### Action Naming

Use consistent, descriptive names:

```typescript
// ✅ Good names
make('post', ...)
make('reply', ...)
make('save', ...)
make('share', ...)

// ❌ Avoid abbreviations
make('pst', ...)
make('rply', ...)
```

### Memoize Config

Memoize the config to prevent unnecessary re-renders:

```typescript
const actionsConfig = useMemo<ActionsConfig>(() => ({
  actions,
  feedConfig,
  nodeMenus,
  onAction: handleAction,
}), []);
```

### Handle All Actions

Ensure your handler covers all defined actions:

```typescript
const onAction = (action, context) => {
  const handlers: Record<string, () => void> = {
    post: () => router.push('/compose'),
    reply: () => context.node && router.push(`/thread/${context.node.id}`),
    // ... all actions
  };

  const handler = handlers[action];
  if (handler) {
    handler();
  } else {
    console.warn('Unhandled action:', action);
  }
};
```

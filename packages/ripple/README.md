# @ariob/ripple

> Graph-native social primitives following UNIX philosophy

Small, composable modules for building decentralized social experiences with React Native.

---

## Overview

**@ariob/ripple** provides primitives for building social feeds:

| Module | Description |
|--------|-------------|
| **Bar** | Morphing action bar (slot-based) |
| **Primitives** | Base building blocks (Shell, Avatar, Badge, Dot, Line) |
| **Node Infrastructure** | BaseNode schema, registry, useNodeBar |
| **Hooks** | React hooks (useSearch, useUserSearch, useHashtagSearch) |
| **Search** | Decentralized search (users, hashtags, indexing) |
| **Config** | Degree and path definitions |
| **Styles** | Theme tokens, palettes, and effects |

**Nodes (Profile, Post, Message, etc.) live in your app, not the framework.**

---

## Quick Start

### Basic Setup

```typescript
import { Bar, useBar, Shell, Avatar } from '@ariob/ripple';

function App() {
  const { mode, openSheet, closeSheet, openInput, closeInput } = useBar();
  const [sheet, setSheet] = useState(null);

  return (
    <>
      <Feed />

      <Bar mode={mode}>
        <Bar.Actions>
          <Bar.Button icon="add" onPress={() => {
            setSheet(<ComposeSheet onClose={closeSheet} />);
            openSheet();
          }} />
          <Bar.Button icon="search" onPress={openInput} />
        </Bar.Actions>

        <Bar.Input
          placeholder="Search..."
          onSubmit={(text) => { search(text); closeInput(); }}
          onCancel={closeInput}
        />

        <Bar.Sheet>
          {sheet}
        </Bar.Sheet>
      </Bar>
    </>
  );
}
```

### Creating App Nodes

```typescript
// your-app/nodes/post/post.schema.ts
import { z } from 'zod';
import { BaseNode, DegreeEnum } from '@ariob/ripple';

export const PostSchema = BaseNode.extend({
  type: z.literal('post'),
  content: z.string(),
  author: z.string(),
  degree: DegreeEnum,
});
```

```typescript
// your-app/nodes/post/Post.tsx
import { Shell, Avatar } from '@ariob/ripple';

export function Post({ data }) {
  return (
    <Shell>
      <Avatar char={data.author[0]} />
      <Text>{data.content}</Text>
    </Shell>
  );
}
```

---

## Architecture

```
@ariob/ripple/src/
├── menu/bar/                 # Morphing action bar
│   ├── Bar.tsx               # Main component with slots
│   ├── Bar.Actions.tsx       # Action mode slot
│   ├── Bar.Input.tsx         # Input mode slot
│   ├── Bar.Sheet.tsx         # Sheet mode slot
│   ├── Bar.Button.tsx        # Button primitive
│   └── store.ts              # Minimal useBar store
├── primitives/               # Visual building blocks
│   ├── shell.tsx             # Container with long-press
│   ├── avatar.tsx            # User avatar
│   ├── badge.tsx             # Status badge
│   ├── dot.tsx               # Timeline dot
│   └── line.tsx              # Timeline connector
├── nodes/_shared/            # Node infrastructure
│   ├── base.ts               # BaseNode, DegreeEnum, VariantEnum
│   ├── types.ts              # ActionMeta, RegistryContext
│   └── registry.ts           # ActionRegistry singleton
├── hooks/                    # React hooks
│   └── search.ts             # useSearch, useUserSearch
├── search/                   # Decentralized search
├── config/                   # Configuration
│   └── degrees.ts            # Five degrees of visibility
└── styles/                   # Theme tokens
```

---

## Exports

### Bar (Slot-Based)

```typescript
import { Bar, useBar } from '@ariob/ripple';

// Bar sub-components
<Bar mode={mode}>
  <Bar.Actions>
    <Bar.Button icon="add" onPress={handleAdd} />
  </Bar.Actions>
  <Bar.Input placeholder="..." onSubmit={handleSubmit} />
  <Bar.Sheet>{sheetContent}</Bar.Sheet>
</Bar>

// useBar hook
const { mode, openSheet, closeSheet, openInput, closeInput } = useBar();
```

### Primitives

```typescript
import { Shell, Avatar, Badge, Dot, Line } from '@ariob/ripple';
```

### Node Infrastructure

```typescript
import {
  // Schemas
  BaseNode,
  DegreeEnum,
  VariantEnum,
  defaults,

  // Registry
  registry,
  action,
  success,
  failure,

  // Hook
  useNodeBar,
} from '@ariob/ripple';

export type { BaseNode, NodeMeta, ActionMeta, RegistryContext } from '@ariob/ripple';
```

### Hooks

```typescript
import {
  useSearch,
  useUserSearch,
  useHashtagSearch,
} from '@ariob/ripple';
```

### Search

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

### Config & Styles

```typescript
import { getDegree, getPath, degrees } from '@ariob/ripple';
import { rippleThemes, ripplePalettes, rippleSpacing } from '@ariob/ripple/styles';
```

---

## Bar System

The Bar morphs between three modes:

### Action Mode (Default)
```typescript
<Bar mode="action">
  <Bar.Actions>
    <Bar.Button icon="settings" position="left" onPress={openSettings} />
    <Bar.Button icon="add" position="center" onPress={openCompose} />
    <Bar.Button icon="search" position="right" onPress={openSearch} />
  </Bar.Actions>
</Bar>
```

### Input Mode
```typescript
<Bar mode="input">
  <Bar.Input
    value={text}
    onChangeText={setText}
    placeholder="Message..."
    onSubmit={handleSend}
    onCancel={closeInput}
  />
</Bar>
```

### Sheet Mode
```typescript
<Bar mode="sheet">
  <Bar.Sheet>
    <AccountSheet onClose={closeSheet} />
  </Bar.Sheet>
</Bar>
```

---

## Node-Specific Bars

Nodes can declare their preferred bar configuration:

```typescript
// In your node schema
export const MessageSchema = BaseNode.extend({
  type: z.literal('message'),
  content: z.string(),

  bar: z.object({
    mode: z.literal('input'),
    actions: z.array(z.string()).default(['attach', 'emoji']),
    input: z.object({
      placeholder: z.string().default('Reply...'),
      submitAction: z.literal('reply'),
    }),
  }).default({
    mode: 'input',
    actions: ['attach', 'emoji'],
    input: { placeholder: 'Reply...', submitAction: 'reply' },
  }),
});
```

Use with `useNodeBar`:

```typescript
function MessageDetail({ node }) {
  const { mode, actions, inputConfig } = useNodeBar({ node, onAction: handleAction });

  return (
    <Bar mode={mode}>
      <Bar.Actions>
        {actions.map(action => (
          <Bar.Button key={action} icon={getIcon(action)} onPress={() => handleAction(action)} />
        ))}
      </Bar.Actions>
      {inputConfig && (
        <Bar.Input
          placeholder={inputConfig.placeholder}
          onSubmit={(text) => handleAction(inputConfig.submitAction, { text })}
        />
      )}
    </Bar>
  );
}
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

```typescript
import { getDegree, getPath } from '@ariob/ripple';

const degree = getDegree('1');
// { name: 'Friends', path: 'feeds/friends', icon: 'people', ... }
```

---

## Peer Dependencies

```json
{
  "react": "^18.0.0 || ^19.0.0",
  "react-native": ">=0.71.0",
  "react-native-unistyles": "^2.0.0",
  "zod": "^3.23.0"
}
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Overview](../../docs/ripple/README.md) | Quick start and overview |
| [Architecture](../../docs/ripple/ARCHITECTURE.md) | Design patterns and decisions |
| [Bar](../../docs/ripple/MENU.md) | Slot-based bar system |
| [Nodes](../../docs/ripple/NODES.md) | Creating app-specific nodes |
| [Registry](../../docs/ripple/REGISTRY.md) | Schema-driven action system |
| [Search](../../docs/ripple/SEARCH.md) | Decentralized search |
| [Primitives](../../docs/ripple/PRIMITIVES.md) | Base components |
| [Hooks](../../docs/ripple/HOOKS.md) | React hooks reference |
| [Styles](../../docs/ripple/STYLES.md) | Theme tokens |
| [Degrees](../../docs/ripple/DEGREES.md) | Five Degrees of Visibility |
| [Integration](../../docs/ripple/INTEGRATION.md) | App integration guide |
| [API Reference](../../docs/ripple/API.md) | Complete API |

---

## License

Private package - Ariob monorepo

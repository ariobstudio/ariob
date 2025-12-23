# @ariob/ripple

> Graph-native social primitives following UNIX philosophy

Small, composable modules for building decentralized social experiences.

---

## Philosophy

**@ariob/ripple** is a design system that provides **primitives**, not **configuration**. Apps compose primitives to build experiences. The framework knows nothing about specific sheets, actions, or business logic.

1. **Composition over configuration** - Build UIs by composing primitives
2. **UNIX philosophy** - Small modules that do one thing well
3. **Inversion of control** - Apps own logic, framework provides structure
4. **Graph-native** - Built for real-time, peer-to-peer data

---

## Quick Start

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

---

## Architecture

```
@ariob/ripple (Design System)
├── primitives/           # Visual building blocks
│   ├── Shell             # Pressable container with long-press
│   ├── Avatar            # User avatar
│   ├── Badge             # Status indicator
│   ├── Dot               # Timeline dot
│   └── Line              # Timeline connector
├── bar/                  # Morphing action bar
│   ├── Bar               # Container with animation
│   ├── Bar.Actions       # Action mode slot
│   ├── Bar.Input         # Input mode slot
│   ├── Bar.Sheet         # Sheet mode slot
│   └── Bar.Button        # Action button
├── node/                 # Node infrastructure
│   ├── registry          # Action discovery
│   ├── types             # BaseNode, ActionMeta
│   └── useNodeBar        # Node-aware bar hook
├── hooks/                # React hooks
│   └── useSearch         # Decentralized search
├── config/               # Configuration
│   └── degrees           # Five degrees of visibility
└── styles/               # Theme tokens
```

### App-Specific Nodes

Nodes (Profile, Post, Message, etc.) live in your app, not the framework:

```
apps/your-app/
├── nodes/
│   ├── profile/          # Your profile implementation
│   ├── post/             # Your post implementation
│   └── message/          # Your message implementation
└── components/
    └── NodeView.tsx      # Your node renderer
```

---

## Documentation

### Getting Started

| Section | Description |
|---------|-------------|
| [Integration](./INTEGRATION.md) | App integration guide |
| [Troubleshooting](./TROUBLESHOOTING.md) | Common issues |

### Core Concepts

| Section | Description |
|---------|-------------|
| [Architecture](./ARCHITECTURE.md) | Design patterns & module structure |
| [Degrees](./DEGREES.md) | Five Degrees of Visibility |
| [Nodes](./NODES.md) | Creating app-specific nodes |
| [Primitives](./PRIMITIVES.md) | Base components (Shell, Avatar, etc.) |

### Components

| Section | Description |
|---------|-------------|
| [Bar](./MENU.md) | Morphing action bar (slot-based API) |
| [Registry](./REGISTRY.md) | Schema-driven actions |

### Features

| Section | Description |
|---------|-------------|
| [Hooks](./HOOKS.md) | React hooks (feed, navigation, search) |
| [Search](./SEARCH.md) | Decentralized search module |
| [Styles](./STYLES.md) | Theme tokens & effects |

### Reference

| Section | Description |
|---------|-------------|
| [API](./API.md) | Complete API reference |

---

## Key Concepts

### Slot-Based Bar

The Bar morphs between three visual states. Apps control what goes inside:

```typescript
<Bar mode={mode}>
  <Bar.Actions>
    {/* Renders in action mode */}
    <Bar.Button icon="add" onPress={handleAdd} />
  </Bar.Actions>

  <Bar.Input
    {/* Renders in input mode */}
    placeholder="Type..."
    onSubmit={handleSubmit}
  />

  <Bar.Sheet>
    {/* Renders in sheet mode */}
    <YourSheetComponent />
  </Bar.Sheet>
</Bar>
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

### Node-Specific Bars

Nodes declare their preferred bar configuration:

```typescript
// In your app's post.schema.ts
export const PostSchema = BaseNode.extend({
  type: z.literal('post'),
  content: z.string(),

  bar: z.object({
    mode: z.literal('action'),
    actions: z.array(z.string()).default(['reply', 'save', 'share']),
  }).optional(),
});
```

Apps use `useNodeBar` to render node-appropriate bars:

```typescript
function PostDetail({ node }) {
  const { mode, actions } = useNodeBar({ node, onAction: handleAction });

  return (
    <>
      <PostContent data={node} />
      <Bar mode={mode}>
        <Bar.Actions>
          {actions.map(action => (
            <Bar.Button key={action} icon={getIcon(action)} onPress={() => handleAction(action)} />
          ))}
        </Bar.Actions>
      </Bar>
    </>
  );
}
```

---

## Exports

```typescript
// Primitives
export { Shell, Avatar, Badge, Dot, Line } from '@ariob/ripple';

// Bar (slot-based)
export { Bar, useBar } from '@ariob/ripple';
export type { BarProps, BarButtonProps, BarInputProps, BarSheetProps } from '@ariob/ripple';

// Node Infrastructure
export { registry, action, success, failure } from '@ariob/ripple';
export { useNodeBar } from '@ariob/ripple';
export type { BaseNode, NodeMeta, ActionMeta, RegistryContext } from '@ariob/ripple';
export { DegreeEnum, VariantEnum } from '@ariob/ripple';

// Hooks
export { useSearch, useUserSearch, useHashtagSearch } from '@ariob/ripple';

// Config
export { getDegree, getPath, degrees } from '@ariob/ripple';

// Styles
export { rippleThemes, rippleSpacing, rippleRadii } from '@ariob/ripple/styles';
```

---

## Integration with Your App

### Creating Nodes

Apps define their own node types:

```typescript
// your-app/nodes/post/post.schema.ts
import { z } from 'zod';
import { BaseNode, DegreeEnum } from '@ariob/ripple';

export const PostSchema = BaseNode.extend({
  type: z.literal('post'),
  content: z.string(),
  author: z.string(),
  degree: DegreeEnum,
  actions: z.array(z.string()).default(['reply', 'save', 'share']),
});

export type PostData = z.infer<typeof PostSchema>;
```

```typescript
// your-app/nodes/post/Post.tsx
import { Shell, Avatar } from '@ariob/ripple';
import type { PostData } from './post.schema';

export function Post({ data }: { data: PostData }) {
  return (
    <Shell>
      <Avatar char={data.author[0]} />
      <Text>{data.content}</Text>
    </Shell>
  );
}
```

### Rendering Nodes

```typescript
// your-app/components/NodeView.tsx
import { Post } from '../nodes/post';
import { Message } from '../nodes/message';

export function NodeView({ data }) {
  switch (data.type) {
    case 'post': return <Post data={data} />;
    case 'message': return <Message data={data} />;
    default: return <Ghost message={`Unknown: ${data.type}`} />;
  }
}
```

---

## License

Private package - Ariob monorepo

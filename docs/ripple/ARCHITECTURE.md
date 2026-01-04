# Architecture Guide

> Design patterns, decisions, and module relationships in @ariob/ripple

---

## Design Principles

### 1. Primitives, Not Configuration

The framework provides **building blocks**, not **configuration APIs**. Apps compose primitives to create experiences.

```typescript
// Framework provides the primitive
<Bar mode={mode}>
  <Bar.Sheet>{children}</Bar.Sheet>
</Bar>

// App decides what goes inside
<Bar.Sheet>
  <AccountSheet onClose={closeSheet} />
</Bar.Sheet>
```

**Why:** No hardcoded types. No framework changes to add features.

### 2. Inversion of Control

The framework knows nothing about:
- Sheet types (account, compose, settings)
- Action names (post, reply, save)
- Node types (profile, post, message)

Apps define all of these.

```typescript
// OLD: Framework defines types
type SheetType = 'compose' | 'account' | 'settings';  // In framework

// NEW: Apps define their own
type MySheetType = 'mySheet' | 'anotherSheet';  // In your app
```

**Why:** Framework works for any app, not just ariob.

### 3. Composition Over Configuration

Build UIs by nesting components, not by passing config objects.

```typescript
// OLD: Configuration object
<ActionsProvider config={{
  actions: { post: {...}, reply: {...} },
  feedConfig: { 0: {...}, 1: {...} },
  nodeMenus: { post: {...} },
  onAction: handleAction,
}}>

// NEW: Composition
<Bar mode={mode}>
  <Bar.Actions>
    <Bar.Button icon="add" onPress={handlePost} />
    <Bar.Button icon="reply" onPress={handleReply} />
  </Bar.Actions>
</Bar>
```

**Why:** Simpler API. Type-safe. No learning curve for config schemas.

### 4. Schema-Driven Nodes

Nodes declare their capabilities in Zod schemas:

```typescript
export const PostSchema = BaseNode.extend({
  type: z.literal('post'),
  content: z.string(),
  actions: z.array(z.string()).default(['reply', 'save', 'share']),
  bar: z.object({
    mode: z.literal('action'),
    actions: z.array(z.string()),
  }).optional(),
});
```

**Why:** Single source of truth for validation, types, and UI generation.

---

## Module Structure

### Framework (What @ariob/ripple provides)

```
packages/ripple/src/
├── primitives/               # Visual building blocks
│   ├── shell.tsx             # Pressable container with long-press
│   ├── avatar.tsx            # User avatar
│   ├── badge.tsx             # Status indicator
│   ├── dot.tsx               # Timeline dot
│   ├── line.tsx              # Timeline connector
│   └── index.ts
├── menu/                     # Bar system
│   └── bar/
│       ├── Bar.tsx           # Main container
│       ├── Bar.Actions.tsx   # Actions slot
│       ├── Bar.Input.tsx     # Input slot
│       ├── Bar.Sheet.tsx     # Sheet slot
│       ├── Bar.Button.tsx    # Button primitive
│       ├── store.ts          # Minimal useBar store
│       ├── types.ts          # BarProps, BarButtonProps, etc.
│       └── index.ts
├── nodes/                    # Node infrastructure only
│   └── _shared/
│       ├── base.ts           # BaseNode, DegreeEnum, VariantEnum
│       ├── types.ts          # ActionMeta, RegistryContext
│       ├── registry.ts       # ActionRegistry singleton
│       └── index.ts
├── hooks/
│   ├── search.ts             # useSearch, useUserSearch
│   └── index.ts
├── config/
│   ├── degrees.ts            # Five degrees configuration
│   └── paths.ts              # Navigation paths
├── styles/
│   └── tokens.ts             # Theme tokens
└── index.ts                  # Public exports
```

### Application (What your app provides)

```
apps/your-app/
├── nodes/                    # App-specific node types
│   ├── profile/
│   │   ├── Profile.tsx       # Component
│   │   ├── profile.schema.ts # Zod schema
│   │   ├── profile.actions.ts# Action handlers
│   │   ├── profile.styles.ts # Styles
│   │   └── index.ts
│   ├── post/
│   ├── message/
│   └── index.ts              # Register all nodes
├── components/
│   ├── AppBar.tsx            # Your bar composition
│   ├── NodeView.tsx          # Your node renderer
│   └── sheets/               # Your sheet components
│       ├── AccountSheet.tsx
│       ├── ComposeSheet.tsx
│       └── index.ts
├── hooks/
│   └── useBarState.ts        # Your bar state logic
└── actions/
    └── actionHandler.ts      # Your action handlers
```

---

## Separation of Concerns

### Framework Provides

| Module | Purpose |
|--------|---------|
| `primitives/*` | Visual building blocks |
| `bar/*` | Morphing action bar (slots) |
| `node/_shared` | Base schemas, registry |
| `styles/tokens` | Theme tokens |
| `config/degrees` | Degree definitions |

### App Provides

| Module | Purpose |
|--------|---------|
| `nodes/*` | Profile, Post, Message, etc. |
| `components/sheets/*` | AccountSheet, ComposeSheet, etc. |
| `components/AppBar.tsx` | Bar wired to app state |
| `actions/*` | Action handlers |

---

## Data Flow

### Bar State Flow

```
User Interaction
    │
    ▼
useBar() store
    │
    ├── setMode('sheet') ─────► Bar renders <Bar.Sheet>
    ├── setMode('input') ─────► Bar renders <Bar.Input>
    └── setMode('action') ────► Bar renders <Bar.Actions>
    │
    ▼
App renders content in slots
```

### Node Action Flow

```
Node Schema
    │
    ├── actions: ['reply', 'save', 'share']
    │
    ▼
useNodeBar({ node })
    │
    ├── mode: 'action'
    ├── actions: ['reply', 'save', 'share']
    │
    ▼
App renders Bar with node's actions
    │
    ▼
User taps action → App's handleAction()
```

---

## Bar Architecture

### Three Modes

```
┌─────────────────────────────────────────────────────┐
│  Mode: 'action' (default)                           │
│  ┌────────┐ ┌────────────┐ ┌────────┐              │
│  │  Left  │ │   Center   │ │ Right  │              │
│  └────────┘ └────────────┘ └────────┘              │
├─────────────────────────────────────────────────────┤
│  Mode: 'input' (composing)                          │
│  ┌────────┐ ┌──────────────────────┐ ┌────────┐    │
│  │ attach │ │   [Text Input...]    │ │  send  │    │
│  └────────┘ └──────────────────────┘ └────────┘    │
├─────────────────────────────────────────────────────┤
│  Mode: 'sheet' (expanded)                           │
│  ┌─────────────────────────────────────────────┐   │
│  │  Any Component (AccountSheet, etc.)         │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Slot-Based Rendering

```typescript
function Bar({ mode, children }) {
  return (
    <AnimatedContainer mode={mode}>
      {React.Children.map(children, child => {
        if (child.type === Bar.Actions && mode === 'action') return child;
        if (child.type === Bar.Input && mode === 'input') return child;
        if (child.type === Bar.Sheet && mode === 'sheet') return child;
        return null;
      })}
    </AnimatedContainer>
  );
}
```

### Minimal Store

```typescript
interface BarStore {
  mode: 'action' | 'input' | 'sheet';
  inputValue: string;

  setMode: (mode: BarStore['mode']) => void;
  setInputValue: (value: string) => void;
  openSheet: () => void;
  closeSheet: () => void;
  openInput: () => void;
  closeInput: () => void;
}

// 2 state properties, 6 actions
// (Previously: 19 properties, 13 actions)
```

---

## Node Architecture

### Creating App Nodes

Each node follows the same pattern:

```
nodes/post/
├── Post.tsx           # Component
├── post.schema.ts     # Zod schema + types
├── post.actions.ts    # Action handlers (optional)
├── post.styles.ts     # Themed styles
└── index.ts           # Exports + side-effect imports
```

### Node Schema with Bar Config

```typescript
// post.schema.ts
import { z } from 'zod';
import { BaseNode, DegreeEnum, defaults } from '@ariob/ripple';

export const PostSchema = BaseNode.extend({
  type: z.literal('post'),
  content: z.string().min(1).max(10000),
  author: z.string(),
  degree: DegreeEnum,

  // Actions available for this node
  actions: defaults(['reply', 'save', 'share', 'delete']),

  // Bar configuration when viewing this node
  bar: z.object({
    mode: z.enum(['action', 'input', 'sheet']).default('action'),
    actions: z.array(z.string()).default(['reply', 'save', 'share']),
    input: z.object({
      placeholder: z.string(),
      submitAction: z.string(),
    }).optional(),
  }).optional(),
});

export type Post = z.infer<typeof PostSchema>;
```

### Using useNodeBar

```typescript
function PostDetail({ node }) {
  const { mode, actions, inputConfig } = useNodeBar({
    node,
    onAction: handleAction,
  });

  return (
    <>
      <PostContent data={node} />

      <Bar mode={mode}>
        <Bar.Actions>
          {actions.map(action => (
            <Bar.Button
              key={action}
              icon={getIcon(action)}
              onPress={() => handleAction(action, node)}
            />
          ))}
        </Bar.Actions>

        {inputConfig && (
          <Bar.Input
            placeholder={inputConfig.placeholder}
            onSubmit={(text) => handleAction(inputConfig.submitAction, node, { text })}
          />
        )}
      </Bar>
    </>
  );
}
```

---

## Action Registry

### Schema-Driven Actions

Actions auto-register when node modules are imported:

```typescript
// post.actions.ts
import { action, success } from '@ariob/ripple';

export const reply = action(
  {
    verb: 'reply',
    label: 'Reply',
    icon: 'arrow-undo',
    ownerOnly: false,
  },
  async (ctx) => success(null, `/thread/${ctx.nodeId}`)
);

export const save = action(
  {
    verb: 'save',
    label: 'Save',
    icon: 'bookmark-outline',
  },
  async (ctx) => success({ saved: true })
);
```

### Registry Usage

```typescript
import { registry } from '@ariob/ripple';
import './nodes'; // Import triggers registration

// Get available actions for context
const actions = registry.forNode(['reply', 'save', 'share'], {
  nodeId: 'post-123',
  isOwner: false,
  degree: '1',
});

// Execute action
const result = await registry.execute('reply', context);
if (result.isOk() && result.value.navigate) {
  router.push(result.value.navigate);
}
```

---

## Performance Considerations

### Lazy Loading

For large apps, lazy load node modules:

```typescript
const AI = lazy(() => import('./nodes/ai').then(m => ({ default: m.AI })));
```

### Memoization

Memoize node components:

```typescript
export const Post = memo(({ data }) => {
  // ...
}, (prev, next) => prev.data.id === next.data.id);
```

---

## Related Documentation

- [Bar System](./MENU.md) - Slot-based bar API
- [Nodes Reference](./NODES.md) - Creating app nodes
- [Registry](./REGISTRY.md) - Action system
- [Integration](./INTEGRATION.md) - App integration guide

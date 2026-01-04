# Nodes

Creating app-specific content type components.

---

## Quick Reference

```
nodes/[type]/
├── [Type].tsx           # React component
├── [type].schema.ts     # Zod schema + types
├── [type].actions.ts    # Action handlers (auto-register on import)
├── [type].styles.ts     # Themed styles
└── index.ts             # Exports + side-effect imports
```

**Key pattern**: Actions auto-register when imported. Add `import './[type].actions'` in your index.ts.

---

## Overview

Nodes are content type components that render graph data. **Nodes live in your app, not the framework.**

The framework provides:
- `BaseNode` schema for common fields
- `DegreeEnum`, `VariantEnum` for type safety
- `registry` for action discovery
- `useNodeBar` for node-specific bars

Your app provides:
- Node components (Post, Message, Profile, etc.)
- Node schemas with validation
- Node actions with handlers
- Node styles

---

## Architecture

### Framework Provides (Node Infrastructure)

```
packages/ripple/src/nodes/_shared/
├── base.ts       # BaseNode, DegreeEnum, VariantEnum
├── types.ts      # ActionMeta, RegistryContext
├── registry.ts   # ActionRegistry singleton
└── index.ts
```

### App Provides (Actual Nodes)

```
apps/your-app/nodes/
├── profile/
│   ├── Profile.tsx
│   ├── profile.schema.ts
│   ├── profile.actions.ts
│   ├── profile.styles.ts
│   └── index.ts
├── post/
├── message/
├── ai/
└── index.ts      # Register all nodes
```

---

## Creating a Node

### Step 1: Create Folder Structure

```
nodes/post/
├── Post.tsx           # Component
├── post.schema.ts     # Zod schema + types
├── post.actions.ts    # Action handlers (optional)
├── post.styles.ts     # Themed styles
└── index.ts           # Exports
```

### Step 2: Define Schema

```typescript
// nodes/post/post.schema.ts
import { z } from 'zod';
import { BaseNode, DegreeEnum, defaults } from '@ariob/ripple';

export const PostSchema = BaseNode.extend({
  type: z.literal('post'),
  content: z.string().min(1).max(10000),
  author: z.string(),
  degree: DegreeEnum,
  images: z.array(z.string()).optional(),

  // Available actions for this node
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
export type PostData = Post;

export const POST_ACTIONS = ['reply', 'save', 'share', 'delete'] as const;

export function isPost(item: unknown): item is Post {
  return PostSchema.safeParse(item).success;
}

export function createPost(data: Omit<Post, 'type'>): Post {
  return { ...data, type: 'post' };
}
```

### Step 3: Create Component

```typescript
// nodes/post/Post.tsx
import { View } from 'react-native';
import { Text } from '@ariob/andromeda';
import { Shell, Avatar } from '@ariob/ripple';
import { useStyles } from 'react-native-unistyles';
import { postStyles } from './post.styles';
import type { PostData } from './post.schema';

export interface PostProps {
  data: PostData;
  onPress?: () => void;
  onAvatarPress?: () => void;
}

export function Post({ data, onPress, onAvatarPress }: PostProps) {
  const { styles } = useStyles(postStyles);

  return (
    <Shell onPress={onPress}>
      <View style={styles.container}>
        <Avatar
          char={data.author[0]}
          onPress={onAvatarPress}
        />
        <View style={styles.content}>
          <Text style={styles.author}>{data.author}</Text>
          <Text style={styles.body}>{data.content}</Text>
          {data.images?.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.image} />
          ))}
        </View>
      </View>
    </Shell>
  );
}
```

### Step 4: Define Actions (Optional)

```typescript
// nodes/post/post.actions.ts
import { action, success, failure } from '@ariob/ripple';

export const reply = action(
  {
    verb: 'reply',
    label: 'Reply',
    icon: 'arrow-undo',
    category: 'primary',
    ownerOnly: false,
  },
  async (ctx) => {
    return success(null, `/thread/${ctx.nodeId}`);
  }
);

export const save = action(
  {
    verb: 'save',
    label: 'Save',
    icon: 'bookmark-outline',
    category: 'secondary',
  },
  async (ctx) => {
    // TODO: Implement save logic
    return success({ saved: true });
  }
);

export const share = action(
  {
    verb: 'share',
    label: 'Share',
    icon: 'share-outline',
    category: 'secondary',
  },
  async (ctx) => {
    return success(null, `/share/${ctx.nodeId}`);
  }
);

export const remove = action(
  {
    verb: 'delete',
    label: 'Delete',
    icon: 'trash-outline',
    category: 'danger',
    ownerOnly: true,
  },
  async (ctx) => {
    // TODO: Implement delete logic
    return success({ deleted: true });
  }
);

export const postActions = { reply, save, share, remove };
```

### Step 5: Create Styles

```typescript
// nodes/post/post.styles.ts
import { createStyleSheet } from 'react-native-unistyles';

export const postStyles = createStyleSheet((theme) => ({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  author: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  body: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xs,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.sm,
  },
}));
```

### Step 6: Create Index

```typescript
// nodes/post/index.ts
export { Post, type PostProps } from './Post';
export {
  PostSchema,
  type Post as PostNode,
  type PostData,
  isPost,
  createPost,
  POST_ACTIONS,
} from './post.schema';
export { postActions } from './post.actions';
export { postStyles } from './post.styles';

// Side effect: register actions
import './post.actions';
```

### Step 7: Register Node

```typescript
// nodes/index.ts
export * from './post';
export * from './message';
export * from './profile';
// ... other nodes
```

---

## Node Schema with Bar Config

Nodes can declare their preferred bar configuration:

```typescript
export const MessageSchema = BaseNode.extend({
  type: z.literal('message'),
  content: z.string(),
  author: z.string(),

  // Messages default to input mode for replies
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
  const { mode, actions, inputConfig } = useNodeBar({
    node,
    onAction: handleAction,
  });

  return (
    <>
      <MessageContent data={node} />

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
    </>
  );
}
```

---

## Node Renderer

Create a component to render nodes by type:

```typescript
// components/NodeView.tsx
import { Post } from '../nodes/post';
import { Message } from '../nodes/message';
import { Profile } from '../nodes/profile';
import { Ghost } from '../nodes/ghost';

interface NodeViewProps {
  data: { type: string; [key: string]: any };
  onPress?: () => void;
  onAvatarPress?: () => void;
}

export function NodeView({ data, onPress, onAvatarPress }: NodeViewProps) {
  switch (data.type) {
    case 'post':
      return <Post data={data} onPress={onPress} onAvatarPress={onAvatarPress} />;
    case 'message':
      return <Message data={data} onPress={onPress} />;
    case 'profile':
      return <Profile data={data} onPress={onPress} />;
    default:
      return <Ghost message={`Unknown node type: ${data.type}`} />;
  }
}
```

---

## Common Node Types

### Post

Social post with text and optional media.

```typescript
interface PostData {
  id: string;
  type: 'post';
  content: string;
  author: string;
  degree: Degree;
  images?: string[];
  timestamp?: string;
  stats?: { replies: number; reposts: number; likes: number };
}
```

### Message

Chat message bubble.

```typescript
interface MessageData {
  id: string;
  type: 'message';
  content: string;
  from: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}
```

### Profile

User profile card.

```typescript
interface ProfileData {
  id: string;
  type: 'profile';
  pub: string;
  alias?: string;
  bio?: string;
  stats?: { posts: number; followers: number; following: number };
}
```

### Ghost

Placeholder/loading state.

```typescript
interface GhostData {
  id: string;
  type: 'ghost';
  message?: string;
}
```

---

## Action Definitions

### ActionMeta Interface

```typescript
interface ActionMeta {
  verb: string;           // Action identifier
  label: string;          // Display label
  icon: string;           // Ionicons name
  category?: 'primary' | 'secondary' | 'danger';
  ownerOnly?: boolean;    // Only show to content owner
  degrees?: Degree[];     // Limit to specific degrees
  variants?: Variant[];   // Limit to specific variants
}
```

### action() Helper

```typescript
import { action, success, failure } from '@ariob/ripple';

export const myAction = action(
  {
    verb: 'my-action',
    label: 'My Action',
    icon: 'star',
    ownerOnly: false,
  },
  async (ctx) => {
    // ctx contains: nodeId, nodeType, userId, isOwner, degree, variant
    try {
      const result = await doSomething(ctx.nodeId);
      return success(result, '/optional/navigate/path');
    } catch (error) {
      return failure(error.message);
    }
  }
);
```

### Registry Usage

```typescript
import { registry } from '@ariob/ripple';

// Get available actions for a context
const actions = registry.forNode(['reply', 'save', 'share'], {
  nodeId: 'post-123',
  nodeType: 'post',
  userId: 'user-456',
  isOwner: false,
  degree: '1',
  variant: 'card',
});

// Execute an action
const result = await registry.execute('reply', context);
if (result.isOk()) {
  const { data, navigate } = result.value;
  if (navigate) router.push(navigate);
}
```

---

## Testing Nodes

### Schema Tests

```typescript
import { describe, it, expect } from 'vitest';
import { PostSchema, isPost } from './post.schema';

describe('PostSchema', () => {
  it('validates correct data', () => {
    const result = PostSchema.safeParse({
      id: '123',
      type: 'post',
      content: 'Hello world',
      author: 'alice',
      degree: '1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing content', () => {
    const result = PostSchema.safeParse({
      id: '123',
      type: 'post',
      author: 'alice',
    });
    expect(result.success).toBe(false);
  });

  it('isPost type guard works', () => {
    expect(isPost({ id: '1', type: 'post', content: 'Hi', author: 'bob' })).toBe(true);
    expect(isPost({ id: '1', type: 'message' })).toBe(false);
  });
});
```

### Action Tests

```typescript
import { describe, it, expect } from 'vitest';
import { registry } from '@ariob/ripple';
import './post.actions'; // Register actions

describe('Post Actions', () => {
  it('reply returns navigation path', async () => {
    const result = await registry.execute('reply', {
      nodeId: 'post-123',
      nodeType: 'post',
      isOwner: false,
      degree: '1',
      variant: 'card',
    });

    expect(result.isOk()).toBe(true);
    expect(result.value.navigate).toBe('/thread/post-123');
  });

  it('delete requires ownership', async () => {
    const action = registry.get('delete');
    expect(action?.meta.ownerOnly).toBe(true);
  });
});
```

---

## BaseNode Schema

Framework provides base fields all nodes extend:

```typescript
// From @ariob/ripple
export const BaseNode = z.object({
  id: z.string(),
  type: z.string(),
  author: z.string().optional(),
  timestamp: z.string().optional(),
  degree: DegreeEnum.default('1'),
});

export const DegreeEnum = z.enum(['0', '1', '2', '3', '4']);
export type Degree = z.infer<typeof DegreeEnum>;

export const VariantEnum = z.enum(['preview', 'card', 'full', 'compact', 'inline']);
export type Variant = z.infer<typeof VariantEnum>;

export const defaults = <T extends string[]>(actions: T) =>
  z.array(z.string()).default([...actions]);
```

---

## Best Practices

### 1. Co-locate Everything

Keep component, schema, actions, and styles together:

```
nodes/post/
├── Post.tsx
├── post.schema.ts
├── post.actions.ts
├── post.styles.ts
└── index.ts
```

### 2. Use Schema Defaults

Define sensible defaults in schemas:

```typescript
export const PostSchema = BaseNode.extend({
  type: z.literal('post'),
  content: z.string(),
  degree: DegreeEnum.default('1'),
  actions: defaults(['reply', 'save', 'share']),
});
```

### 3. Type-Safe Actions

Use the registry for action discovery:

```typescript
const actions = registry.forNode(node.actions ?? [], context);
// Only returns actions available for this context
```

### 4. Memoize Components

```typescript
export const Post = memo(({ data, onPress }) => {
  // ...
}, (prev, next) => prev.data.id === next.data.id);
```

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - Design patterns
- [Bar System](./MENU.md) - Node-specific bars
- [Registry](./REGISTRY.md) - Action system
- [Primitives](./PRIMITIVES.md) - Shell, Avatar, etc.

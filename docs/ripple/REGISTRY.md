# Registry System

> Schema-driven action system for advanced use cases

---

## Action Flow

```
1. Node schema declares actions → actions: defaults(['reply', 'save', 'share'])
2. action() helper registers to singleton → import './post.actions' in index.ts
3. App calls registry.forNode(actions, context) → filters by owner/degree/variant
4. User triggers action → registry.execute(verb, context)
5. Handler returns ActionResult → success(), error(), pending()
6. App handles navigate/data from result
```

---

## Overview

The Registry is an advanced action system that provides:

- **Auto-registration**: Actions register when their module is imported
- **Context-aware filtering**: Actions appear based on ownership, degree, variant
- **Type-safe execution**: Full TypeScript support with result types
- **Decoupled discovery**: Find available actions without hardcoding

> **Note**: For most applications, the [Legacy System](./MENU.md) (`make()` + `ActionsProvider`) is recommended. The Registry is for advanced schema-driven scenarios.

---

## Quick Start

```typescript
import { registry, Post } from '@ariob/ripple';

// Importing Post auto-registers its actions (reply, save, share, delete)

// Execute an action
const result = await registry.execute('reply', {
  nodeId: 'post-123',
  nodeType: 'post',
  userId: 'user-456',
  isOwner: false,
  degree: '1',
  variant: 'card',
});

if (result.isOk()) {
  const { navigate, data } = result.value;
  if (navigate) router.push(navigate);
}
```

---

## Core Concepts

### ActionRegistry

Singleton that manages all registered actions.

```typescript
import { registry } from '@ariob/ripple';

// Get a registered action
const action = registry.get('reply');

// Check if action exists
const exists = registry.has('reply');

// Get all available actions for a node
const actions = registry.forNode(['reply', 'save', 'share'], context);

// Execute an action
const result = await registry.execute('reply', context);
```

### Registering Actions

Actions register via the `action()` helper:

```typescript
import { action, success, error } from '@ariob/ripple';

const reply = action(
  {
    verb: 'reply',
    label: 'Reply',
    icon: 'arrow-undo',
    category: 'primary',
    ownerOnly: false,
    degrees: ['0', '1', '2'],
    variants: ['card', 'full'],
  },
  async (ctx) => {
    // Action logic here
    return success(null, `/thread/${ctx.nodeId}`);
  }
);
```

### RegistryContext

Context passed to action handlers and availability checks:

```typescript
interface RegistryContext {
  nodeId: string;
  nodeType: string;
  userId?: string;
  isOwner: boolean;
  degree: Degree;        // '0' | '1' | '2' | '3' | '4'
  variant: Variant;      // 'preview' | 'card' | 'full' | 'compact' | 'inline'
  data?: Record<string, unknown>;
}
```

### ActionResult

Result returned from action execution:

```typescript
interface ActionResult {
  data?: unknown;        // Arbitrary result data
  navigate?: string;     // Path to navigate to
  message?: string;      // User-facing message
}

// Success result
success(data, navigate?, message?)

// Error result
error(message, code?)

// Pending result (for async operations)
pending(taskId)
```

---

## API Reference

### registry.register

Register an action with metadata and handler.

```typescript
registry.register(meta: ActionMeta, handler: ActionHandler): void
```

Usually called via the `action()` helper instead.

### registry.get

Get a registered action by verb.

```typescript
const action = registry.get('reply');
// { meta: ActionMeta, handler: ActionHandler } | undefined
```

### registry.has

Check if an action is registered.

```typescript
const exists = registry.has('reply'); // boolean
```

### registry.available

Check if an action is available in a context.

```typescript
const isAvailable = registry.available('edit', {
  nodeId: 'post-123',
  nodeType: 'post',
  isOwner: true,
  degree: '0',
  variant: 'full',
});
// true (because user owns the post)
```

### registry.forNode

Get all available actions for a node in context.

```typescript
const actions = registry.forNode(
  ['reply', 'save', 'share', 'edit', 'delete'],
  context
);
// Returns only actions available to this user in this context
```

### registry.execute

Execute an action with context.

```typescript
const result = await registry.execute('reply', context);

if (result.isOk()) {
  const { navigate, data, message } = result.value;
  if (navigate) router.push(navigate);
  if (message) toast.show(message);
}

if (result.isErr()) {
  toast.error(result.error.message);
}
```

---

## ActionMeta

Metadata that defines an action's behavior and availability.

```typescript
interface ActionMeta {
  verb: string;              // Unique identifier
  label: string;             // Display label
  icon: string;              // Ionicons icon name

  // Categorization
  category?: Category;       // 'primary' | 'secondary' | 'destructive'
  variant?: ActionVariant;   // 'default' | 'outline' | 'ghost'

  // Availability rules
  ownerOnly?: boolean;       // Only show to content owner
  degrees?: Degree[];        // Show only at these degrees
  variants?: Variant[];      // Show only in these UI variants

  // Confirmation
  confirm?: boolean;         // Require confirmation
  confirmMessage?: string;   // Custom confirmation message
}
```

### Availability Rules

Actions automatically filter based on:

```typescript
// Owner-only action (like edit or delete)
action({
  verb: 'edit',
  label: 'Edit',
  icon: 'pencil',
  ownerOnly: true,  // Only shows when isOwner === true
}, handler);

// Degree-restricted action
action({
  verb: 'connect',
  label: 'Connect',
  icon: 'person-add',
  degrees: ['1', '2'],  // Only at Friends or World degree
}, handler);

// Variant-restricted action
action({
  verb: 'expand',
  label: 'Expand',
  icon: 'expand',
  variants: ['card', 'compact'],  // Not in full view
}, handler);
```

---

## Defining Actions

### Basic Action

```typescript
import { action, success } from '@ariob/ripple';

export const reply = action(
  {
    verb: 'reply',
    label: 'Reply',
    icon: 'arrow-undo',
    category: 'primary',
  },
  async (ctx) => {
    return success(null, `/thread/${ctx.nodeId}`);
  }
);
```

### Owner-Only Action

```typescript
export const edit = action(
  {
    verb: 'edit',
    label: 'Edit',
    icon: 'pencil',
    category: 'primary',
    ownerOnly: true,
    variants: ['full'],  // Only in full view
  },
  async (ctx) => {
    return success(null, `/edit/${ctx.nodeId}`);
  }
);
```

### Destructive Action with Confirmation

```typescript
export const remove = action(
  {
    verb: 'delete',
    label: 'Delete',
    icon: 'trash',
    category: 'destructive',
    ownerOnly: true,
    confirm: true,
    confirmMessage: 'Are you sure you want to delete this post?',
  },
  async (ctx) => {
    await deletePost(ctx.nodeId);
    return success({ deleted: true }, null, 'Post deleted');
  }
);
```

### Action with Side Effects

```typescript
export const save = action(
  {
    verb: 'save',
    label: 'Save',
    icon: 'bookmark',
    category: 'secondary',
  },
  async (ctx) => {
    const isSaved = await toggleSave(ctx.nodeId, ctx.userId);

    return success(
      { saved: isSaved },
      null,
      isSaved ? 'Saved!' : 'Removed from saved'
    );
  }
);
```

---

## Node Integration

### Schema Actions

Nodes declare available actions in their schema:

```typescript
// nodes/post/post.schema.ts
export const PostSchema = BaseNode.extend({
  type: z.literal('post'),
  content: z.string(),
  actions: defaults(['reply', 'save', 'share', 'delete']),
});

export const POST_ACTIONS = ['reply', 'save', 'share', 'delete'] as const;
```

### Action Registration

Actions auto-register on import:

```typescript
// nodes/post/post.actions.ts
import { action, success } from '../_shared';

export const reply = action({ verb: 'reply', ... }, async (ctx) => { ... });
export const save = action({ verb: 'save', ... }, async (ctx) => { ... });
export const share = action({ verb: 'share', ... }, async (ctx) => { ... });
export const remove = action({ verb: 'delete', ... }, async (ctx) => { ... });

export const postActions = { reply, save, share, remove };
```

### Module Entry Point

```typescript
// nodes/post/index.ts
export { Post } from './Post';
export { PostSchema, POST_ACTIONS } from './post.schema';
export { postActions } from './post.actions';
export { postStyles } from './post.styles';

// Side effect: register actions
import './post.actions';
```

---

## Using with useNodeBar

The `useNodeBar` hook uses the registry for schema-driven action bars:

```typescript
import { useNodeBar, NodeBarProvider } from '@ariob/ripple';

function NodeDetail({ node }) {
  const bar = useNodeBar({
    node,
    userId: currentUser.id,
    degree: '1',
    variant: 'full',
    onNavigate: (path) => router.push(path),
  });

  return (
    <View>
      <NodeContent data={node} />

      <ActionBar>
        {bar.primary.map((action) => (
          <ActionButton
            key={action.verb}
            action={action}
            onPress={() => bar.execute(action.verb)}
            loading={bar.loading === action.verb}
          />
        ))}
      </ActionBar>
    </View>
  );
}

// Wrap app with provider
<NodeBarProvider>
  <App />
</NodeBarProvider>
```

---

## Result Types

### Success

```typescript
import { success } from '@ariob/ripple';

// Simple success
return success(null);

// With data
return success({ liked: true, count: 42 });

// With navigation
return success(null, '/thread/123');

// With message
return success({ saved: true }, null, 'Post saved!');

// All three
return success(
  { id: 'new-post' },
  '/post/new-post',
  'Post created!'
);
```

### Error

```typescript
import { error } from '@ariob/ripple';

// Simple error
return error('Something went wrong');

// With error code
return error('Not authorized', 'UNAUTHORIZED');

// From caught exception
try {
  await doSomething();
} catch (e) {
  return error(e.message, 'NETWORK_ERROR');
}
```

### Pending

For long-running operations:

```typescript
import { pending } from '@ariob/ripple';

// Return pending with task ID for tracking
return pending('upload-task-123');

// Caller can poll for completion
```

---

## Advanced Patterns

### Custom Availability Logic

Override availability with a custom check:

```typescript
export const moderate = action(
  {
    verb: 'moderate',
    label: 'Moderate',
    icon: 'shield',
    // Custom availability function
    available: (ctx) => {
      // Only available to moderators
      return isModerator(ctx.userId);
    },
  },
  async (ctx) => { ... }
);
```

### Composite Actions

Actions that trigger other actions:

```typescript
export const repost = action(
  {
    verb: 'repost',
    label: 'Repost',
    icon: 'repeat',
  },
  async (ctx) => {
    // Create new post referencing original
    const newPost = await createPost({
      content: `Reposted from @${ctx.data?.author}`,
      repostOf: ctx.nodeId,
    });

    // Execute share action
    await registry.execute('share', {
      ...ctx,
      nodeId: newPost.id,
    });

    return success({ reposted: true }, `/post/${newPost.id}`);
  }
);
```

### Action Groups

Organize related actions:

```typescript
// actions/content.ts
export const contentActions = {
  reply: action({ ... }),
  save: action({ ... }),
  share: action({ ... }),
};

// actions/moderation.ts
export const moderationActions = {
  report: action({ ... }),
  block: action({ ... }),
  mute: action({ ... }),
};

// All register on import
```

---

## Comparison with Legacy System

| Feature | Legacy (`make()`) | Registry (`action()`) |
|---------|-------------------|----------------------|
| Setup complexity | Simple | More involved |
| Type safety | Manual | Full inference |
| Availability filtering | Manual in handler | Automatic via metadata |
| Action discovery | Fixed config | Dynamic registry |
| Best for | App-level config | Node-level actions |

### When to Use Registry

- Building reusable node libraries
- Complex availability rules
- Schema-driven UI generation
- Actions that need to be discovered dynamically

### When to Use Legacy

- Application-level action configuration
- Simple action routing
- Quick prototyping
- When actions don't vary by context

---

## Related Documentation

- [Menu System](./MENU.md) - Legacy action system
- [Architecture](./ARCHITECTURE.md) - Design patterns
- [Nodes](./NODES.md) - Content type modules

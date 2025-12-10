# Nodes

Content type components for rendering graph data.

---

## Overview

Nodes are the visual representation of data in the social graph. Each node type has:
- A component for rendering
- Consolidated theme-aware styles
- Context menu integration via Shell

| Node | Purpose |
|------|---------|
| [Post](#post) | Social posts with text/media |
| [Message](#message) | Chat messages |
| [Profile](#profile) | User profiles |
| [Auth](#auth) | Authentication UI |
| [Sync](#sync) | Sync status indicator |
| [Ghost](#ghost) | Placeholder/loading |
| [Suggestion](#suggestion) | Recommendations |
| [AIModel](#aimodel) | AI model selection |

---

## Using Node Styles

All node styles are consolidated in a single file for consistency:

```typescript
import { styles } from '@ariob/ripple/nodes';

// Access individual style sets
const { post, message, auth, sync, ghost, profile, aiModel, suggestion } = styles;

// Use in components
<View style={post.container}>
  <Text style={post.body}>{content}</Text>
</View>
```

---

## Post

Social post with text and optional media.

### Import

```typescript
import { Post, styles } from '@ariob/ripple';
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `PostData` | Post content and metadata |
| `mode` | `ViewMode` | Display mode |
| `onPress` | `() => void` | Tap handler |

### PostData Type

```typescript
interface PostData {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar?: string;
  };
  content: string;
  media?: MediaItem[];
  timestamp: string;
  stats?: {
    replies: number;
    reposts: number;
    likes: number;
  };
  degree?: number;
}
```

### Example

```typescript
<Shell nodeRef={{ id: post.id, type: 'post' }}>
  <Post
    data={post}
    mode="feed"
    onPress={() => router.push(`/thread/${post.id}`)}
  />
</Shell>
```

### Styles

```typescript
styles.post = {
  container: { /* ... */ },
  body: { /* ... */ },
  image: { /* ... */ },
  placeholder: { /* ... */ },
}
```

---

## Message

Chat message bubble.

### Import

```typescript
import { Message, styles } from '@ariob/ripple';
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `MessageData` | Message content |
| `isMe` | `boolean` | From current user |
| `showAvatar` | `boolean` | Show sender avatar |

### MessageData Type

```typescript
interface MessageData {
  id: string;
  from: string;
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}
```

### Example

```typescript
<Message
  data={message}
  isMe={message.from === currentUser.id}
  showAvatar={!isMe}
/>
```

### Styles

```typescript
styles.message = {
  container: { /* ... */ },
  row: { /* ... */ },
  bubble: { /* ... */ },
  bubbleMe: { /* ... */ },
  bubbleThem: { /* ... */ },
  text: { /* ... */ },
  textMe: { /* ... */ },
  textThem: { /* ... */ },
  thinking: { /* ... */ },
  replySection: { /* ... */ },
}
```

---

## Profile

User profile card.

### Import

```typescript
import { Profile, styles } from '@ariob/ripple';
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `ProfileData` | User data |
| `mode` | `'view' \| 'edit'` | Display mode |
| `onAction` | `(action: string) => void` | Action handler |

### ProfileData Type

```typescript
interface ProfileData {
  avatar: string;
  handle: string;
  pubkey?: string;
  bio?: string;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
}
```

### Example

```typescript
<Profile
  data={{
    avatar: user.name[0],
    handle: `@${user.alias}`,
    pubkey: user.pub,
    bio: user.bio,
  }}
  mode="view"
  onAction={(action) => {
    if (action === 'message') router.push(`/message/${user.id}`);
    if (action === 'follow') followUser(user.id);
  }}
/>
```

### Styles

```typescript
styles.profile = {
  container: { /* ... */ },
  header: { /* ... */ },
  avatar: { /* ... */ },
  info: { /* ... */ },
  name: { /* ... */ },
  handle: { /* ... */ },
  bio: { /* ... */ },
  stats: { /* ... */ },
}
```

---

## Auth

Authentication options UI.

### Import

```typescript
import { Auth, styles } from '@ariob/ripple';
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `mode` | `'login' \| 'create'` | Auth flow |
| `onAction` | `(action: string, data?: any) => void` | Handler |

### Example

```typescript
<Auth
  mode="create"
  onAction={(action, data) => {
    if (action === 'create') createAccount(data);
    if (action === 'login') loginWithKeys(data);
    if (action === 'import') importKeys();
  }}
/>
```

### Styles

```typescript
styles.auth = {
  container: { /* ... */ },
  option: { /* ... */ },
  icon: { /* ... */ },
  info: { /* ... */ },
  title: { /* ... */ },
  subtitle: { /* ... */ },
}
```

---

## Sync

Synchronization status indicator.

### Import

```typescript
import { Sync, styles } from '@ariob/ripple';
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `peers` | `Peer[]` | Connected peers |
| `status` | `SyncStatus` | Current status |
| `onRetry` | `() => void` | Retry handler |

### Example

```typescript
<Sync
  peers={connectedPeers}
  status={isSyncing ? 'syncing' : 'idle'}
  onRetry={resync}
/>
```

### Styles

```typescript
styles.sync = {
  container: { /* ... */ },
  avatars: { /* ... */ },
  avatar: { /* ... */ },
  title: { /* ... */ },
  subtitle: { /* ... */ },
  button: { /* ... */ },
}
```

---

## Ghost

Placeholder or loading state.

### Import

```typescript
import { Ghost, styles } from '@ariob/ripple';
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `message` | `string` | Display message |

### Example

```typescript
// Loading state
<Ghost message="Loading..." />

// Empty state
<Ghost message="No posts yet. Be the first!" />

// Error state
<Ghost message="Something went wrong. Pull to retry." />
```

### Styles

```typescript
styles.ghost = {
  text: { fontStyle: 'italic', color: textSecondary },
}
```

---

## Suggestion

Recommendation card.

### Import

```typescript
import { Suggestion, styles } from '@ariob/ripple';
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `SuggestionData` | Suggestion content |
| `onAccept` | `() => void` | Accept handler |
| `onDismiss` | `() => void` | Dismiss handler |

### Example

```typescript
<Suggestion
  data={{
    title: 'Follow @alice',
    reason: 'Followed by 3 friends',
    preview: 'Software engineer at...',
  }}
  onAccept={() => follow('alice')}
  onDismiss={() => dismissSuggestion('alice')}
/>
```

### Styles

```typescript
styles.suggestion = {
  container: { /* ... */ },
  body: { /* ... */ },
  button: { /* ... */ },
  buttonText: { /* ... */ },
}
```

---

## AIModel

AI model selection card.

### Import

```typescript
import { AIModel, styles } from '@ariob/ripple';
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `model` | `ModelInfo` | Model details |
| `status` | `ModelStatus` | Download/ready status |
| `progress` | `number` | Download progress (0-1) |
| `onSelect` | `() => void` | Selection handler |

### ModelInfo Type

```typescript
interface ModelInfo {
  id: string;
  name: string;
  size: string;
  description: string;
  capabilities: string[];
}
```

### Example

```typescript
<AIModel
  model={{
    id: 'llama-7b',
    name: 'Llama 7B',
    size: '4.2 GB',
    description: 'Efficient general-purpose model',
    capabilities: ['chat', 'completion'],
  }}
  status={isDownloading ? 'downloading' : isReady ? 'ready' : 'available'}
  progress={downloadProgress}
  onSelect={() => selectModel('llama-7b')}
/>
```

### Styles

```typescript
styles.aiModel = {
  container: { /* ... */ },
  option: { /* ... */ },
  info: { /* ... */ },
  name: { /* ... */ },
  description: { /* ... */ },
  size: { /* ... */ },
  progress: { /* ... */ },
  status: { /* ... */ },
  banner: { /* ... */ },
}
```

---

## Node Composition

### With Shell (Context Menu)

```typescript
function FeedItem({ item }) {
  return (
    <Shell nodeRef={{ id: item.id, type: item.type }}>
      {item.type === 'post' && <Post data={item} />}
      {item.type === 'message' && <Message data={item} />}
      {item.type === 'profile' && <Profile data={item} />}
    </Shell>
  );
}
```

### Generic Node Renderer

```typescript
import { Node } from '@ariob/ripple';

function FeedItem({ item }) {
  return (
    <Shell nodeRef={{ id: item.id, type: item.type }}>
      <Node type={item.type} data={item} />
    </Shell>
  );
}
```

### Custom Node Wrapper

```typescript
function NodeCard({ children, nodeRef, onPress }) {
  const { theme } = useUnistyles();

  return (
    <Shell nodeRef={nodeRef}>
      <Press onPress={onPress}>
        <View style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.md,
          marginVertical: theme.spacing.xs,
        }}>
          {children}
        </View>
      </Press>
    </Shell>
  );
}
```

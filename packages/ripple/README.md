# @ariob/ripple

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gun.js](https://img.shields.io/badge/Gun.js-1E1E1E?style=for-the-badge&logo=javascript&logoColor=white)](https://gun.eco/)

Ripple social network primitives for decentralized feed and relationships.

Built on [@ariob/core](../core) Gun.js primitives.

</div>

---

## 🎯 Overview

**@ariob/ripple** provides the core primitives for building the Ripple decentralized social network. It extends @ariob/core with social-specific features like unified feeds, degree-based filtering, and relationship graphs.

### Key Features

- **🌊 Unified Feed** — Mix posts and DM threads in chronological stream
- **📐 Degree Filtering** — 0° (me), 1° (friends), 2° (extended network)
- **👥 Social Graph** — Friend relationships with automatic degree calculation
- **🔒 Type-Safe** — Full TypeScript support with Zod schemas
- **⚡ Real-Time** — Gun.js P2P sync for instant updates
- **📦 Modular** — Import only what you need

---

## 📦 Installation

```bash
# This package is part of the Ariob monorepo
# Install dependencies from the root:
pnpm install
```

**Dependencies:**
- `@ariob/core` - Gun.js primitives (workspace:*)
- `zod` - Schema validation

---

## 🚀 Quick Start

```typescript
import { feed, relationships, createPost, createThreadId } from '@ariob/ripple';
import { graph, useAuth } from '@ariob/core';

const g = graph();
const { user } = useAuth(g);

// 1. Subscribe to friends feed (degree 1)
feed({ degree: '1' }).subscribe(g);

// 2. Get feed items
const items = feed({ degree: '1' }).get();
// [{ id: 'abc', data: { type: 'post', content: '...', ... } }, ...]

// 3. Create a post
const post = createPost({
  content: 'Hello Ripple!',
  author: user!.pub,
  authorAlias: user!.alias,
  degree: '1'
});

await feed({ degree: '1' }).post(g, post);

// 4. Manage friends
relationships().subscribe(g.user());
await relationships().addFriend(g.user(), 'friend-pub-key', 'Alice');

const friends = relationships().getFriends();
console.log(`${friends.length} friends`);
```

---

## 📚 Core Primitives

### 1. Schemas — Content Types

Type-safe schemas for Ripple content using Zod.

#### Post Schema

```typescript
import { PostSchema, createPost, type Post } from '@ariob/ripple';

// Create a post
const post = createPost({
  content: 'This is my first post!',
  author: user.pub,
  authorAlias: user.alias,
  degree: '1', // Visible to friends
  tags: ['intro', 'hello']
});

// Validate
const result = PostSchema.safeParse(post);
if (result.success) {
  console.log('Valid post:', result.data);
}
```

**Post Fields:**
- `type`: `'post'` (literal)
- `content`: Post text (1-10,000 chars)
- `author`: Author's public key
- `authorAlias`: Author's display name (optional)
- `created`: Unix timestamp (auto-generated)
- `degree`: Visibility scope (`'0'` | `'1'` | `'2'`)
- `tags`: Array of tags (optional)
- `editedAt`: Edit timestamp (optional)

#### Message Schema

```typescript
import { MessageSchema, createMessage, createThreadId, type Message } from '@ariob/ripple';

// Create a DM
const message = createMessage({
  text: 'Hey, how are you?',
  from: user.pub,
  to: friend.pub,
  threadId: createThreadId(user.pub, friend.pub)
});

// Validate
const result = MessageSchema.safeParse(message);
```

**Message Fields:**
- `type`: `'message'` (literal)
- `text`: Message text (1-5,000 chars)
- `from`: Sender's public key
- `to`: Recipient's public key
- `threadId`: Thread identifier
- `created`: Unix timestamp (auto-generated)
- `encrypted`: Encryption flag (default: `true`)
- `read`: Read status (default: `false`)

#### Feed Item Schema

```typescript
import { FeedItemSchema, isPost, isThread, type FeedItem } from '@ariob/ripple';

// Discriminated union of content types
const item: FeedItem = getFeedItem();

// Type-safe narrowing
if (isPost(item)) {
  console.log('Post:', item.content);
} else if (isThread(item)) {
  console.log('Thread:', item.lastMessage);
}
```

---

### 2. Feed — Unified Feed Management

The **feed** primitive manages a unified stream of posts and DM threads with degree-based filtering.

#### Basic Usage

```typescript
import { feed, useFeed, type Degree } from '@ariob/ripple';
import { graph } from '@ariob/core';

const g = graph();

// Subscribe to feed
feed({ degree: '1' }).subscribe(g);

// Get items (sorted by timestamp, newest first)
const items = feed({ degree: '1' }).get();

// Create post
await feed({ degree: '1' }).post(g, {
  content: 'Hello world!',
  author: user.pub,
  authorAlias: user.alias,
  degree: '1'
});

// Send DM
await feed({ degree: '1' }).sendMessage(g, {
  text: 'Private message',
  from: user.pub,
  to: friend.pub,
  threadId: createThreadId(user.pub, friend.pub)
});

// Check state
const loading = feed({ degree: '1' }).loading();
const error = feed({ degree: '1' }).error();

// Unsubscribe
feed({ degree: '1' }).off();
```

#### React Hook

```typescript
import { useFeed } from '@ariob/ripple';
import { useState } from 'react';

function UnifiedFeed() {
  const [degree, setDegree] = useState<Degree>('1');
  const { items, loading, post, sendMessage } = useFeed({ degree });

  if (loading) return <text>Loading...</text>;

  return (
    <view>
      {/* Degree filter */}
      <view>
        <button onTap={() => setDegree('0')}>Me</button>
        <button onTap={() => setDegree('1')}>Friends</button>
        <button onTap={() => setDegree('2')}>Extended</button>
      </view>

      {/* Feed */}
      {items.map(({ id, data }) => (
        <view key={id}>
          {data.type === 'post' && (
            <text>{data.content}</text>
          )}
          {data.type === 'thread' && (
            <text>💬 {data.lastMessage}</text>
          )}
        </view>
      ))}
    </view>
  );
}
```

#### Degree System

**0° (Me)** — Personal content
- Private posts
- Drafts
- Personal notes

**1° (Friends)** — Direct connections
- Friend posts
- Direct messages
- Small groups

**2° (Extended)** — Wider network
- Friends-of-friends
- Public content
- Recommended posts

---

### 3. Relationships — Social Graph

The **relationships** primitive manages friend connections and calculates degrees of separation.

#### Basic Usage

```typescript
import { relationships } from '@ariob/ripple';
import { graph } from '@ariob/core';

const g = graph();

// Subscribe to friends
relationships().subscribe(g.user());

// Add friend
await relationships().addFriend(g.user(), 'alice-pub-key', 'Alice');

// Get all friends
const friends = relationships().getFriends();
// [{ pub: '...', alias: 'Alice', addedAt: 1234567890, degree: '1' }]

// Check relationship
const isMyFriend = relationships().isFriend('alice-pub-key');

// Calculate degree
const degree = relationships().getDegree('alice-pub-key', user.pub);
// Returns: 0 (me) | 1 (friend) | 2 (friend-of-friend) | null (not connected)

// Remove friend
await relationships().removeFriend(g.user(), 'alice-pub-key');

// Unsubscribe
relationships().off();
```

#### React Hook

```typescript
import { useRelationships } from '@ariob/ripple';
import { useEffect } from 'react';

function FriendsList() {
  const g = graph();
  const { friends, loading, addFriend, removeFriend, getDegree } = useRelationships();

  useEffect(() => {
    relationships().subscribe(g.user());
    return () => relationships().off();
  }, []);

  const handleAdd = async (pubKey: string, alias: string) => {
    const result = await addFriend(g.user(), pubKey, alias);
    if (!result.ok) {
      alert('Failed: ' + result.error.message);
    }
  };

  if (loading) return <text>Loading friends...</text>;

  return (
    <view>
      {friends.map(friend => (
        <view key={friend.pub}>
          <text>{friend.alias}</text>
          <text>Degree: {friend.degree}°</text>
          <button onTap={() => removeFriend(g.user(), friend.pub)}>
            Remove
          </button>
        </view>
      ))}
    </view>
  );
}
```

---

## 🗺️ Gun.js Graph Structure

```
gun/
├── users/{pub}/
│   ├── alias
│   ├── pub
│   ├── epub
│   ├── friends/              # Set of friend pub keys
│   │   └── {friendPub}       # Friend metadata
│   └── posts/                # User's posts
│       └── {postId}
│
├── global-feed/
│   ├── 0-me/                 # Personal posts
│   ├── 1-friends/            # Friends' posts
│   └── 2-extended/           # Extended network
│
├── posts/{postId}            # Full post data
│
└── threads/{threadId}/       # DM threads
    ├── participants/         # [pubA, pubB]
    ├── lastMessage
    ├── lastMessageAt
    └── messages/{msgId}      # Encrypted messages
```

---

## 📖 API Reference

### Schemas

| Export | Type | Description |
|--------|------|-------------|
| `PostSchema` | `ZodObject` | Blog post with visibility scope |
| `MessageSchema` | `ZodObject` | Direct message in thread |
| `ThreadMetadataSchema` | `ZodObject` | DM thread preview info |
| `FeedItemSchema` | `ZodUnion` | Discriminated union of content |
| `DegreeEnum` | `ZodEnum` | `'0' \| '1' \| '2'` |
| `createPost()` | Function | Post factory with timestamp |
| `createMessage()` | Function | Message factory |
| `createThreadId()` | Function | Generate thread ID from pub keys |
| `isPost()` | Type guard | Check if FeedItem is Post |
| `isThread()` | Type guard | Check if FeedItem is Thread |

### Feed

| Function | Signature | Description |
|----------|-----------|-------------|
| `feed()` | `(config: FeedConfig) => FeedAPI` | Create feed manager |
| `.subscribe()` | `(graph) => void` | Subscribe to degree feed |
| `.off()` | `() => void` | Unsubscribe |
| `.get()` | `() => Item<FeedItem>[]` | Get sorted items |
| `.post()` | `(graph, post) => Promise<Result>` | Create post |
| `.sendMessage()` | `(graph, message) => Promise<Result>` | Send DM |
| `.loading()` | `() => boolean` | Get loading state |
| `.error()` | `() => Error \| null` | Get error state |
| `useFeed()` | `(config) => FeedHook` | React hook |

### Relationships

| Function | Signature | Description |
|----------|-----------|-------------|
| `relationships()` | `() => RelationshipsAPI` | Create relationship manager |
| `.subscribe()` | `(userRef) => void` | Subscribe to friends |
| `.off()` | `() => void` | Unsubscribe |
| `.addFriend()` | `(userRef, pub, alias?) => Promise<Result>` | Add friend |
| `.removeFriend()` | `(userRef, pub) => Promise<Result>` | Remove friend |
| `.getFriends()` | `() => Friend[]` | Get all friends |
| `.getFriend()` | `(pub) => Friend \| null` | Get specific friend |
| `.isFriend()` | `(pub) => boolean` | Check friendship |
| `.getDegree()` | `(pub, currentUserPub?) => 0\|1\|2\|null` | Calculate separation |
| `useRelationships()` | `() => RelationshipsHook` | React hook |

---

## 🏗️ Architecture

### Package Dependencies

```
@ariob/ripple
    ↓
@ariob/core (graph, node, collection, auth, crypto, Result)
    ↓
Gun.js + SEA
```

### Design Principles

- **Application-Specific** — Ripple social features, not general Gun.js primitives
- **Thin Layer** — Builds on @ariob/core, minimal additional complexity
- **Type-Safe** — Zod schemas for all content types
- **Result Monad** — Explicit error handling, no exceptions
- **Background-Thread Safe** — Works in LynxJS background threads

---

## 🤝 Contributing

This package is part of the Ariob monorepo. See the root README for contribution guidelines.

---

## 📄 License

Private package - See repository root for license information.

---

<div align="center">

**Built with ❤️ for decentralized social networking**

[Ariob Monorepo](../../README.md) • [@ariob/core](../core/README.md)

</div>

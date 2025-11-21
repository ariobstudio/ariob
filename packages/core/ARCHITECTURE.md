# @ariob/core Architecture

> Minimal, production-ready Gun.js primitives for LynxJS. Built on deep understanding of Gun's DAM/HAM/SEA architecture for robust P2P applications.

## Table of Contents

- [Overview](#overview)
- [Gun.js Foundations](#gunjs-foundations)
  - [DAM - Network Layer](#dam---network-layer)
  - [HAM - Conflict Resolution](#ham---conflict-resolution)
  - [SEA - Security](#sea---security)
  - [CAP Theorem & Guarantees](#cap-theorem--guarantees)
- [Architecture Principles](#architecture-principles)
- [Module Design](#module-design)
- [Threading Model](#threading-model)
- [State Management](#state-management)
- [Error Handling](#error-handling)
- [Configuration System](#configuration-system)
- [Mesh Monitoring](#mesh-monitoring)
- [Production Patterns](#production-patterns)

---

## Overview

**@ariob/core** provides a modular, type-safe layer over Gun.js while preserving direct access to the underlying Gun instance. It's designed for production use with:

- **Dual API**: High-level wrappers + direct Gun access
- **DAM-aware mesh monitoring**: Real-time peer health tracking
- **Environment-based configuration**: Easy dev/staging/prod switching
- **LynxJS threading**: Background thread operations for non-blocking UI
- **Type-safe Result monad**: Better error handling than try/catch
- **Minimal dependencies**: Zod, Zustand, and Gun only

---

## Gun.js Foundations

Understanding Gun's architecture is critical for building robust applications. @ariob/core is designed around these core concepts.

### DAM - Network Layer

**DAM** (Daisy-chain Ad-hoc Mesh-network) is Gun's P2P networking layer.

#### Key Concepts

- **Peer Discovery**: Nodes discover other peers through relay servers
- **Message Routing**: Each peer routes messages to its neighbors
- **Deduplication**: Dedupe tables prevent message loops using hashes
- **Auto-reconnection**: Peers automatically reconnect on disconnect
- **Wire Protocol**: JSON-based messages with metadata (`#`, `@`, `.`)

#### How @ariob/core Uses DAM

The `mesh.ts` module provides **DAM-aware monitoring**:

```typescript
import { initMeshMonitoring, useMesh } from '@ariob/core';

// Initialize monitoring
initMeshMonitoring();

// In a component
function NetworkStatus() {
  const { peers, totalIn, totalOut } = useMesh();
  const connected = peers.filter(p => p.connected).length;

  return (
    <view>
      <text>Connected: {connected}/{peers.length}</text>
      <text>Messages: ↓{totalIn} ↑{totalOut}</text>
    </view>
  );
}
```

**Design rationale**: By hooking into Gun's `'in'` and `'out'` events, we track message flow without modifying Gun internals. This enables real-time network health monitoring for production applications.

---

### HAM - Conflict Resolution

**HAM** (Hypothetical Amnesia Machine) is Gun's CRDT conflict resolution algorithm.

#### How HAM Works

1. **State Vectors**: Every node value has a state number (timestamp-like)
2. **Comparison**: When receiving updates, compare state numbers
3. **Resolution**: Higher state wins (newer data)
4. **Lexical Tiebreaker**: If states are equal, lexically larger value wins
5. **Convergence**: All peers eventually converge to same state

#### Important Guarantees

- **Eventual Consistency**: All peers converge given enough time
- **No Strong Consistency**: No guarantees about intermediate states
- **Offline-First**: Writes succeed locally, sync later
- **No Central Authority**: No master node, fully decentralized

#### How @ariob/core Respects HAM

```typescript
// ✅ GOOD - Respects HAM convergence
const profile = node('users/alice/profile', {
  schema: z.object({ name: z.string(), bio: z.string() }),
});

profile.set({ name: 'Alice', bio: 'Developer' });
```

```typescript
// ⚠️ CAUTION - Counter may diverge
// Gun is AP system, not CP - use vector clocks or CRDTs for counters
user.get('count').put(count + 1); // Race condition!
```

**Design rationale**: @ariob/core provides type-safe wrappers but doesn't hide Gun's AP nature. Developers must understand eventual consistency for production apps.

---

### SEA - Security

**SEA** (Security, Encryption, Authorization) is Gun's cryptographic layer.

#### Core Operations

- **`pair()`**: Generate ECDSA keypair (P256)
- **`sign(data, pair)`**: Create digital signature
- **`verify(signed, pub)`**: Verify signature
- **`encrypt(data, secret)`**: AES-GCM encryption
- **`decrypt(encrypted, secret)`**: AES-GCM decryption
- **`work(data, salt, ops)`**: PBKDF2 password hashing
- **`secret(epub, pair)`**: ECDH shared secret
- **`certify(peers, policy, pair)`**: Create capability tokens

#### User Authentication Flow

```typescript
// 1. Generate keypair
const pairResult = await pair();
if (!pairResult.ok) throw pairResult.error;
const keys = pairResult.value;

// 2. Authenticate with Gun
const g = graph();
const user = g.user();
user.auth(keys, (ack) => {
  if (ack.err) console.error(ack.err);
  else console.log('Authenticated:', user.is.pub);
});

// 3. Write to user space (automatically encrypted)
user.get('profile').put({ name: 'Alice' });
```

#### How @ariob/core Uses SEA

The `auth.ts` and `crypto.ts` modules provide:

- **Keypair-based auth**: No passwords, only cryptographic keys
- **Automatic persistence**: Keys stored in localStorage
- **Result-based API**: Type-safe error handling
- **SEA primitives**: Direct access to sign/verify/encrypt/decrypt

```typescript
import { useAuth, pair, sign, verify } from '@ariob/core';

function MyApp() {
  const g = graph();
  const { isLoggedIn, create, user } = useAuth(g);

  const handleCreate = async () => {
    const result = await create('alice'); // Generates keypair internally
    if (result.ok) {
      console.log('Account created:', result.value);
    }
  };

  return isLoggedIn ? <Feed /> : <LoginButton onTap={handleCreate} />;
}
```

**Design rationale**: SEA handles all crypto, but @ariob/core adds Result types and persistence. All auth functions wait for SEA keys to load before resolving to prevent write failures.

---

### Chain Extensions

Gun provides a powerful **FRP (Functional Reactive Programming)** system for extending the chain with custom methods via `Gun.chain`.

@ariob/core includes the **path.js** extension for convenient nested navigation.

#### Built-in Chain Extensions

**Path Navigation** (`path.js` - included):

```typescript
import { graph } from '@ariob/core';

const g = graph();

// Navigate nested paths with dot notation
g.path('users.alice.profile').on((data) => {
  console.log('Profile:', data);
});

// Equivalent to:
g.get('users').get('alice').get('profile').on((data) => {
  console.log('Profile:', data);
});

// Works with arrays too
g.path(['users', 'alice', 'profile']).put({ name: 'Alice' });

// Custom delimiter
g.path('users/alice/profile', '/').on((data) => {
  console.log('Profile:', data);
});
```

#### Creating Custom Extensions

You can add your own methods to Gun's chain:

```typescript
import Gun from 'gun';

// Add a custom method to the Gun chain
Gun.chain.myMethod = function(arg) {
  // 'this' refers to the current Gun chain reference
  const gun = this;

  // Your custom logic here
  console.log('myMethod called with:', arg);

  // Always return 'this' or a Gun reference for chaining
  return gun;
};

// Now available on all Gun instances
const g = graph();
g.get('data').myMethod('test').put({ value: 42 });
```

**Real-world example - Touch (update timestamp):**

```typescript
Gun.chain.touch = function() {
  'background only';
  const gun = this;
  gun.put({ updatedAt: Date.now() });
  return gun;
};

// Usage
user.get('profile').touch(); // Automatically sets updatedAt
```

**Real-world example - Exists check:**

```typescript
Gun.chain.exists = function(callback) {
  'background only';
  const gun = this;

  gun.once((data) => {
    const exists = data !== undefined && data !== null;
    callback(exists, data);
  });

  return gun;
};

// Usage
g.get('users').get(pub).exists((exists, data) => {
  if (exists) {
    console.log('User found:', data);
  } else {
    console.log('User does not exist');
  }
});
```

#### TypeScript Support for Extensions

Add custom methods to the `IGunChainReference` interface:

```typescript
// In your types file
declare module '@ariob/core' {
  interface IGunChainReference<T = any> {
    touch(): IGunChainReference<T>;
    exists(callback: (exists: boolean, data: T) => void): IGunChainReference<T>;
    myMethod(arg: string): IGunChainReference<T>;
  }
}
```

#### Best Practices

1. **Always return `this` or a Gun reference** for method chaining
2. **Use 'background only'** directive for LynxJS thread safety
3. **Keep extensions pure** - avoid side effects beyond Gun operations
4. **Document extensions** - add JSDoc comments for TypeScript autocomplete
5. **Test thoroughly** - extensions affect all Gun chains globally

#### Available Gun Chain Methods

Core Gun chain methods already available:

- `get(key)` - Navigate to child node
- `put(data, callback)` - Write data
- `on(callback, options)` - Subscribe to updates
- `once(callback, options)` - Read once
- `map(options)` - Iterate over set members
- `set(data, callback)` - Add to set
- `path(field, delimiter)` - Navigate paths *(included via path.js)*
- `off()` - Unsubscribe
- `then(callback)` - Promise interface

**Design rationale**: Gun's chain extension system is powerful and well-documented. @ariob/core includes `path.js` for convenience but doesn't wrap or limit the extension API - developers have full access to create custom extensions as needed.

**References:**
- [Gun FRP Documentation](https://github.com/amark/gun/wiki/FRP)
- [Adding Methods to Gun Chain](https://github.com/amark/gun/wiki/Adding-Methods-to-the-Gun-Chain)

---

### CAP Theorem & Guarantees

Gun is an **AP system** (Availability + Partition tolerance).

#### What Gun Guarantees

- ✅ **Availability**: Writes always succeed locally
- ✅ **Partition Tolerance**: Works offline, syncs later
- ✅ **Eventual Consistency**: Peers converge eventually
- ❌ **Strong Consistency**: No guarantees about intermediate states
- ❌ **Linearizability**: No total ordering of operations
- ❌ **Transactions**: No ACID transactions across nodes

#### Production Implications

```typescript
// ✅ SAFE - Last-write-wins (HAM)
user.get('profile/name').put('Alice');

// ✅ SAFE - Idempotent set membership (CRDT)
user.get('friends').get(pub).put(true);

// ⚠️ UNSAFE - Counter increment (race condition)
user.get('count').once((val) => {
  user.get('count').put((val || 0) + 1); // Can diverge!
});

// ✅ SAFE - Use CRDT counter instead
user.get('likes').get(Date.now()).put(true); // Set-based counter
```

**Design rationale**: @ariob/core doesn't try to add CP guarantees on top of AP system. Instead, we provide tools to monitor network health (`mesh.ts`) and document proper CRDT patterns.

---

## Architecture Principles

### 1. Direct Gun Access

Expose the raw Gun instance alongside high-level wrappers.

```typescript
// High-level wrapper
const profile = node('profile', { schema: ProfileSchema });
profile.set({ name: 'Alice' });

// Direct Gun access
const g = graph();
g.get('custom').get('path').put('value');
```

**Why**: Some use cases need Gun's full power. Wrappers are helpers, not jail.

### 2. Minimal Core, Extensible Patterns

Core provides primitives. Applications build business logic.

```typescript
// ✅ CORE - Generic primitives
export function collection(path, config) { /* ... */ }
export function node(path, config) { /* ... */ }

// ✅ APPLICATION - Specific logic
export function useMessages(threadId) {
  return collection(`messages/${threadId}`, {
    schema: MessageSchema,
    index: 'createdAt',
  });
}
```

**Why**: Core stays small, applications compose primitives.

### 3. Type Safety

Zod schemas + TypeScript for runtime and compile-time safety.

```typescript
const UserSchema = z.object({
  alias: z.string(),
  bio: z.string().optional(),
});

const user = node('user/alice', { schema: UserSchema });
user.set({ alias: 'Alice', bio: 'Developer' }); // ✅ Type-checked
user.set({ alias: 123 }); // ❌ Type error
```

### 4. LynxJS Threading

All Gun operations run on background thread with `'background only'` directive.

```typescript
export function graph(): IGunChainReference {
  'background only';
  return graphStore.getState().gun!;
}
```

**Why**: LynxJS dual-thread architecture keeps UI responsive. Gun operations (which may wait on network I/O) run in background.

---

## Module Design

### Core Modules (8 Total)

Each module is self-contained with clear responsibilities:

| Module | Purpose | Key Exports |
|--------|---------|-------------|
| `graph.ts` | Gun instance lifecycle | `graph()`, `createGraph()`, `graphStore` |
| `auth.ts` | User authentication | `useAuth()`, `createAccount()`, `login()` |
| `crypto.ts` | SEA primitives | `pair()`, `sign()`, `verify()`, `encrypt()` |
| `node.ts` | Single object sync | `node()`, `useNode()`, `createNode()` |
| `collection.ts` | Set/map sync | `collection()`, `useCollection()` |
| `config.ts` | Peer management | `getPeers()`, `setPeers()`, `loadProfile()` |
| `mesh.ts` | DAM monitoring | `initMeshMonitoring()`, `useMesh()` |
| `result.ts` | Error handling | `Result.ok()`, `Result.error()` |

### Module Dependencies

```
graph.ts (singleton Gun instance)
  ↓
├─ auth.ts (uses graph)
├─ node.ts (uses graph)
├─ collection.ts (uses graph)
├─ mesh.ts (uses graph)
└─ config.ts (configures graph peers)

crypto.ts (standalone SEA wrapper)
result.ts (standalone type)
```

**Design rationale**: Graph is the foundation, other modules depend on it. Crypto and Result are pure utilities with no dependencies.

---

## Threading Model

LynxJS uses **dual-thread architecture**:

- **Background thread**: Data operations, Gun sync, network I/O
- **Main thread**: UI rendering, animations, gestures

### Threading Directives

```typescript
function backgroundOperation() {
  'background only'; // Runs only on background thread
  const gun = graph();
  gun.get('data').put('value');
}

function mainThreadAnimation() {
  'main thread'; // Runs only on main thread
  Animated.timing(value, { toValue: 1 }).start();
}
```

### Why This Matters

Gun operations can wait on:
- Network I/O (fetching from peers)
- Disk I/O (localStorage reads/writes)
- Crypto operations (SEA signing/encryption)

Running these on main thread would block UI. LynxJS threading keeps app responsive.

### Implementation

All core functions are marked `'background only'`:

```typescript
// graph.ts
export function graph(): IGunChainReference {
  'background only';
  return graphStore.getState().gun!;
}

// node.ts
export function node<T>(path: string, config?: NodeConfig<T>) {
  'background only';
  // ...
}

// auth.ts
export async function createAccount(alias: string, graph: IGunChainReference) {
  'background only';
  // ...
}
```

**React hooks** automatically bridge threads - state updates trigger main thread re-renders.

---

## State Management

### Zustand Stores

@ariob/core uses Zustand for reactive state management:

```typescript
import { define } from './utils/store';

// Create store (Convex-style naming)
const authStore = define<AuthState>({
  user: null,
  keys: null,
  isLoggedIn: false,
});

// Subscribe in React with direct selectors
export function useAuth() {
  const user = authStore((s) => s.user);
  const isLoggedIn = authStore((s) => s.isLoggedIn);
  return { user, isLoggedIn };
}
```

### Store Design Pattern

Each major module has its own store:

- **`graphStore`**: Gun instance and peer configuration
- **`authStore`**: Current user and keys (persisted)
- **`meshStore`**: Peer status and message counts
- **Per-node stores**: Created dynamically by `node()` and `collection()`

### Persistence

Stores persist to `localStorage` when needed:

```typescript
// auth.ts
function persistState(state: AuthState) {
  'background only';
  if (typeof globalThis.localStorage !== 'undefined') {
    globalThis.localStorage.setItem(
      'auth-store',
      JSON.stringify({ user: state.user, keys: state.keys })
    );
  }
}

// Subscribe to changes
authStore.subscribe(() => {
  'background only';
  persistState(authStore.getState());
});
```

**Design rationale**: Zustand is minimal (1KB) and works with LynxJS threading. Persistence is opt-in per store.

---

## Error Handling

### Result Monad

Instead of throwing exceptions, core functions return `Result<T, E>`:

```typescript
export type Result<T, E = Error> = Ok<T> | Err<E>;

interface Ok<T> {
  ok: true;
  value: T;
}

interface Err<E> {
  ok: false;
  error: E;
}
```

### Usage

```typescript
const pairResult = await pair();
if (!pairResult.ok) {
  console.error('Key generation failed:', pairResult.error);
  return;
}

const keys = pairResult.value; // TypeScript knows this is KeyPair
```

### Why Result?

1. **Explicit error handling**: Can't ignore errors
2. **Type-safe**: TypeScript tracks ok/error branches
3. **No try/catch**: Cleaner async code
4. **Composable**: Can chain with `.map()` / `.flatMap()` if needed

### When to Use Result

- ✅ Async operations that may fail (auth, crypto)
- ✅ User-facing operations (create account, login)
- ❌ Internal Gun callbacks (use Gun's `ack` pattern)
- ❌ Synchronous getters (return `null` instead)

**Design rationale**: Result is lightweight (~20 lines) and improves DX without external dependencies (removed `neverthrow`).

---

## Configuration System

### Peer Profiles

Environment-based peer configuration for easy switching:

```typescript
import { loadProfile, getCurrentProfile, PEER_PROFILES } from '@ariob/core';

// Load production relays
loadProfile('prod');

// Check current profile
const current = getCurrentProfile();
console.log(current); // 'prod'

// Available profiles
console.log(PEER_PROFILES);
// {
//   local: { peers: ['http://localhost:8765/gun'] },
//   dev: { peers: ['http://10.0.0.246:8765/gun'] },
//   staging: { peers: ['wss://staging-relay.ariob.com/gun'] },
//   prod: { peers: ['wss://relay1.ariob.com/gun', ...] }
// }
```

### Dynamic Peer Management

```typescript
import { getPeers, setPeers, addPeer, removePeer } from '@ariob/core';

// Get current peers
const peers = getPeers(); // ['http://localhost:8765/gun']

// Add a peer
addPeer('wss://relay.example.com/gun');

// Remove a peer
removePeer('http://localhost:8765/gun');

// Set peers directly
setPeers(['wss://relay1.com/gun', 'wss://relay2.com/gun']);
```

### Persistence

Peer configuration persists to `localStorage` under key `'gun-peers'`. If localStorage is unavailable (e.g., Node.js environment), falls back to `DEFAULT_PEERS`.

**Design rationale**: Apps need different relays for dev/staging/prod. Profile system makes this explicit and easy to switch.

---

## Mesh Monitoring

### Initializing Monitoring

```typescript
import { initMeshMonitoring } from '@ariob/core';

// Call once during app initialization
initMeshMonitoring();
```

This hooks into Gun's `'in'` and `'out'` events to track message flow.

### React Hooks

```typescript
import { useMesh, usePeer } from '@ariob/core';

function NetworkStatus() {
  const { peers, totalIn, totalOut, monitoring } = useMesh();

  return (
    <view>
      <text>Monitoring: {monitoring ? '✓' : '✗'}</text>
      <text>Peers: {peers.length}</text>
      <text>Messages: ↓{totalIn} ↑{totalOut}</text>
    </view>
  );
}

function PeerMonitor({ url }: { url: string }) {
  const peer = usePeer(url);

  if (!peer) return <text>Peer not found</text>;

  return (
    <view>
      <text>{peer.url}</text>
      <text>Status: {peer.connected ? '🟢' : '🔴'}</text>
      <text>Last seen: {new Date(peer.lastSeen).toLocaleTimeString()}</text>
    </view>
  );
}
```

### Imperative API

```typescript
import { getPeerStatus, getAllPeers, addMeshPeer, removeMeshPeer } from '@ariob/core';

// Get specific peer
const status = getPeerStatus('http://localhost:8765/gun');
console.log(status?.connected); // true

// Get all peers
const allPeers = getAllPeers();
console.log(allPeers.filter(p => p.connected).length); // 2

// Add peer dynamically
addMeshPeer('wss://relay.example.com/gun');

// Remove from tracking
removeMeshPeer('wss://old-relay.com/gun');
```

**Design rationale**: Production apps need visibility into network health. DAM monitoring exposes Gun's internal state without modifying Gun itself.

---

## Production Patterns

### 1. Environment Detection

```typescript
import { loadProfile } from '@ariob/core';

// Detect environment
const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
loadProfile(env);
```

### 2. Relay Redundancy

Use multiple relays for high availability:

```typescript
// config.ts
prod: {
  peers: [
    'wss://relay1.ariob.com/gun',
    'wss://relay2.ariob.com/gun',
    'wss://relay3.ariob.com/gun',
  ],
}
```

Gun's DAM layer automatically handles failover.

### 3. Offline Detection

```typescript
import { useMesh } from '@ariob/core';

function OfflineIndicator() {
  const { peers } = useMesh();
  const hasConnection = peers.some(p => p.connected);

  if (hasConnection) return null;

  return (
    <view className="offline-banner">
      <text>⚠️ Offline - changes will sync when reconnected</text>
    </view>
  );
}
```

### 4. Message Rate Limiting

Monitor message flow to detect spam or infinite loops:

```typescript
import { useMesh } from '@ariob/core';
import { useEffect } from 'react';

function useMessageRateMonitor(threshold = 1000) {
  const { totalOut } = useMesh();

  useEffect(() => {
    'background only';
    const interval = setInterval(() => {
      if (totalOut > threshold) {
        console.warn('High message rate detected:', totalOut);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [totalOut, threshold]);
}
```

### 5. CRDT-Safe Counters

Use set-based counting instead of increment:

```typescript
// ❌ UNSAFE - Race condition
user.get('likes').once((count) => {
  user.get('likes').put((count || 0) + 1);
});

// ✅ SAFE - Set-based CRDT counter
user.get('likes').get(Date.now().toString()).put(true);

// Count items
user.get('likes').map().once((items) => {
  const count = Object.keys(items || {}).filter(k => k !== '_').length;
  console.log('Likes:', count);
});
```

### 6. Auto-Recall on Mount

```typescript
import { useAuth, graph } from '@ariob/core';
import { useEffect } from 'react';

function App() {
  const g = graph();
  const { isLoggedIn, recall } = useAuth(g);

  useEffect(() => {
    'background only';
    if (!isLoggedIn) {
      recall(); // Try to restore session
    }
  }, []);

  return isLoggedIn ? <Dashboard /> : <Login />;
}
```

---

## Practical Graph Patterns

### Common Data Structures

#### User Profile with Relationships

```typescript
import { node, collection, graph } from '@ariob/core';
import { z } from 'zod';

// Define schemas
const UserSchema = z.object({
  alias: z.string(),
  pub: z.string(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

const PostSchema = z.object({
  id: z.string(),
  content: z.string(),
  author: z.string(),
  created: z.number(),
});

// Create user node
const user = node(`users/${userPub}`, { schema: UserSchema });
user.set({ alias: 'alice', pub: userPub, bio: 'Developer' });

// User's posts collection
const posts = collection(`users/${userPub}/posts`, { schema: PostSchema });

// User's friends set
const g = graph();
g.get('users').get(userPub).get('friends').set(
  g.get('users').get(friendPub)
);
```

#### Feed Aggregation

```typescript
// Aggregate posts from multiple sources
const feedItems = collection('feed', {
  schema: z.discriminatedUnion('type', [
    z.object({ type: z.literal('post'), ...PostSchema.shape }),
    z.object({ type: z.literal('message'), ...MessageSchema.shape }),
  ]),
});

// Add to feed
g.get('feed').set(g.get('posts').get(postId));
g.get('feed').set(g.get('messages').get(messageId));

// Query feed
feedItems.map().on((item) => {
  if (item.type === 'post') {
    // Render post
  } else {
    // Render message
  }
});
```

#### Threaded Comments

```typescript
// Comment with parent reference
const CommentSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  parentId: z.string().optional(), // Parent comment
  postId: z.string(),
  created: z.number(),
});

// Add comment to post
g.get('posts').get(postId).get('comments').set(
  g.get('comments').get(commentId)
);

// Add reply to comment
g.get('comments').get(parentCommentId).get('replies').set(
  g.get('comments').get(replyId)
);
```

### Querying Patterns

#### Find by Index

```typescript
// Index posts by date
const dateKey = new Date().toISOString().split('T')[0]; // 2025-01-15
g.get('posts-by-date').get(dateKey).set(
  g.get('posts').get(postId)
);

// Query posts from today
g.get('posts-by-date').get(dateKey).map().on((post) => {
  console.log('Today's post:', post.content);
});
```

#### Find by Multiple Criteria

```typescript
// Index by author AND date
g.get('posts-by-author').get(userPub).get(dateKey).set(
  g.get('posts').get(postId)
);

// Query Alice's posts from today
g.get('posts-by-author').get('alice').get(dateKey).map().on((post) => {
  console.log('Alice's post:', post.content);
});
```

---

## Data Modeling Cookbook

### When to Use Each Gun Method

#### `.get()` - Navigate to Node

Use for traversing the graph and accessing specific nodes:

```typescript
// ✅ Navigate to specific user
gun.get('users').get('alice');

// ✅ Traverse path
gun.get('company').get('acme').get('address').get('city');

// ✅ Chain multiple gets
gun.get('posts').get(postId).get('comments').get(commentId);
```

**When to use:** Navigation, path traversal, accessing specific nodes.

#### `.put()` - Write/Update Data

Use for setting scalar values or small objects:

```typescript
// ✅ Set user data
gun.get('users').get('alice').put({
  name: 'Alice',
  age: 30,
});

// ✅ Update single field
gun.get('users').get('alice').put({ bio: 'New bio' });

// ❌ DON'T use for collections
gun.get('users').put(alice); // Overwrites entire users node!
```

**When to use:** Writing data, updating fields, setting values.
**Important:** Use partial updates only - Gun merges automatically.

#### `.set()` - Add to Collection

Use for adding items to sets/collections:

```typescript
// ✅ Add to set
gun.get('users').get('alice').get('posts').set(post);
gun.get('users').get('alice').get('friends').set(friendRef);

// ✅ Multiple items
employees.set(alice);
employees.set(bob);
employees.set(carol);

// ❌ DON'T use put for collections
friends.put(bob); // Overwrites previous friends!
```

**When to use:** Collections, sets, lists of items, many-to-many relationships.

#### `.map()` - Iterate Collection

Use for iterating over sets:

```typescript
// ✅ Iterate all items
gun.get('posts').map().on((post, id) => {
  console.log('Post:', post.content);
});

// ✅ With once (non-reactive)
gun.get('users').map().once((user, pub) => {
  console.log('User:', user.alias);
});
```

**When to use:** Iterating sets, processing collections, rendering lists.

#### `.on()` vs `.once()`

```typescript
// .on() - Subscribe to changes (reactive)
gun.get('users').get('alice').on((data) => {
  // Called on every update
  updateUI(data);
});

// .once() - Read once (non-reactive)
gun.get('config').get('appName').once((name) => {
  // Called only once
  console.log('App:', name);
});
```

**Use `.on()` for:** Live data, user-generated content, real-time updates.
**Use `.once()` for:** Static data, configuration, initial load.

### Structuring User Data

```typescript
// User root
gun.get('users').get(userPub).put({
  alias: 'alice',
  pub: userPub,
  epub: userEpub,
  created: Date.now(),
});

// Separate concerns into sub-nodes
gun.get('users').get(userPub).get('profile').put({
  bio: 'Developer',
  avatar: 'https://...',
  location: 'San Francisco',
});

gun.get('users').get(userPub).get('settings').put({
  theme: 'dark',
  notifications: true,
  language: 'en',
});

// Collections as sets
gun.get('users').get(userPub).get('posts').set(postRef);
gun.get('users').get(userPub).get('friends').set(friendRef);
```

---

## Performance Patterns

### 1. Partial Updates

Only update what changes - Gun merges automatically:

```typescript
// ✅ EFFICIENT - Only sends changed field
user.get('profile').put({ bio: 'New bio' });

// ❌ INEFFICIENT - Re-sends entire object
user.get('profile').once((profile) => {
  profile.bio = 'New bio';
  user.get('profile').put(profile); // Wasteful!
});
```

### 2. Streaming Optimization

Gun returns one level deep. Traverse explicitly for nested data:

```typescript
// ❌ Only gets references
gun.get('company').get('acme').once((data) => {
  console.log(data); // { name: 'ACME', address: { '#': 'ref' } }
});

// ✅ Traverse to get actual data
gun.get('company').get('acme').get('address').once((address) => {
  console.log(address); // { street: '123 Main', city: 'SF' }
});
```

### 3. Efficient Graph Traversal

Use indexes to avoid scanning entire collections:

```typescript
// ❌ SLOW - Scans all posts
gun.get('posts').map().once((post) => {
  if (post.author === 'alice') {
    // Show post
  }
});

// ✅ FAST - Uses index
gun.get('posts-by-author').get('alice').map().once((post) => {
  // Only Alice's posts
});
```

### 4. Debounce Rapid Updates

Batch frequent updates to reduce network traffic:

```typescript
import { useDebounce } from '@ariob/core';

function SearchBox() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    // Only search after user stops typing
    gun.get('search').put({ query: debouncedQuery });
  }, [debouncedQuery]);
}
```

### 5. Pagination

Don't load entire collections - use limits:

```typescript
// ✅ PAGINATED
const pageSize = 20;
let count = 0;

gun.get('posts').map().once((post) => {
  if (count++ < pageSize) {
    renderPost(post);
  }
});

// ✅ TIME-BASED PAGINATION
const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
gun.get('posts').map().once((post) => {
  if (post.created > cutoff) {
    renderPost(post);
  }
});
```

### 6. Caching Strategy

Use `.once()` for data that doesn't change:

```typescript
// Cache user data locally
const userCache = new Map();

function getUser(pub: string) {
  if (userCache.has(pub)) {
    return Promise.resolve(userCache.get(pub));
  }

  return new Promise((resolve) => {
    gun.get('users').get(pub).once((user) => {
      userCache.set(pub, user);
      resolve(user);
    });
  });
}
```

---

## Production Checklist

### Before Deployment

#### 1. Peer Configuration

```typescript
import { loadProfile, PEER_PROFILES } from '@ariob/core';

// Set production relays
loadProfile('prod');

// Verify peers are configured
console.log('Relays:', PEER_PROFILES.prod.peers);
// Should have 2-3 redundant relays
```

#### 2. Error Handling

```typescript
// Use Result monad for critical operations
const result = await createAccount('alice');
if (!result.ok) {
  console.error('Account creation failed:', result.error);
  showErrorToUser(result.error.message);
  return;
}

// Handle Gun callbacks
g.get('data').put(value, (ack) => {
  if (ack.err) {
    console.error('Write failed:', ack.err);
  }
});
```

#### 3. Offline Support

```typescript
import { useMesh } from '@ariob/core';

function OfflineIndicator() {
  const { peers } = useMesh();
  const isOnline = peers.some(p => p.connected);

  if (!isOnline) {
    return <view>⚠️ Offline - changes will sync when reconnected</view>;
  }
  return null;
}
```

#### 4. Data Validation

```typescript
// Always validate with Zod before writing
const result = UserSchema.safeParse(userData);
if (!result.success) {
  console.error('Invalid data:', result.error);
  return;
}

gun.get('users').get(pub).put(result.data);
```

#### 5. Monitoring

```typescript
import { initMeshMonitoring, useMesh } from '@ariob/core';

// Initialize monitoring on app start
initMeshMonitoring();

// Monitor message flow
function NetworkMonitor() {
  const { totalIn, totalOut, peers } = useMesh();

  // Alert if no peers connected
  if (peers.filter(p => p.connected).length === 0) {
    console.warn('No peers connected!');
  }

  // Alert if message rate too high (possible loop)
  if (totalOut > 10000) {
    console.error('High message rate detected!');
  }
}
```

#### 6. Security

```typescript
// Never expose private keys
if (process.env.NODE_ENV === 'production') {
  // Don't log keys
  console.log('User pub:', user.pub); // ✅ OK
  // console.log('User keys:', keys); // ❌ NEVER
}

// Encrypt sensitive data
import { encrypt, decrypt } from '@ariob/core';

const encrypted = await encrypt(sensitiveData, secret);
gun.get('private').put(encrypted);
```

### Performance Targets

- **Initial Load:** <3 seconds
- **Navigation:** <300ms between screens
- **Network Round-trip:** <500ms for relay
- **Message Rate:** <1000 msgs/minute sustained
- **Memory:** <50MB for typical session

---

## Summary

**@ariob/core** is a production-ready Gun.js wrapper designed around:

1. **Gun's Nature**: AP system, eventual consistency, CRDT conflict resolution
2. **DAM Awareness**: Mesh monitoring for network health visibility
3. **SEA Integration**: Cryptographic auth with keypairs, not passwords
4. **LynxJS Threading**: Background operations, non-blocking UI
5. **Type Safety**: Zod schemas + Result monad for better DX
6. **Modular Design**: 8 focused modules, minimal dependencies
7. **Direct Access**: High-level wrappers + raw Gun for flexibility

Use this architecture doc alongside `API.md` for implementation details and `README.md` for quick start examples.

---

**Next Steps**:

- Read [GRAPH_GUIDE.md](./GRAPH_GUIDE.md) for comprehensive graph modeling patterns
- Read [API.md](./API.md) for detailed API reference
- See [README.md](./README.md) for usage examples
- Check [examples/](./examples/) for real-world patterns
- Review Gun.js wiki for deeper DAM/HAM/SEA understanding:
  - [DAM](https://github.com/amark/gun/wiki/DAM)
  - [Conflict Resolution (HAM)](https://github.com/amark/gun/wiki/Conflict-Resolution-with-Guns)
  - [CAP Theorem](https://github.com/amark/gun/wiki/CAP-Theorem)
  - [SEA](https://gun.eco/docs/SEA)

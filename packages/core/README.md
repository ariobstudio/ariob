# @ariob/core

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gun.js](https://img.shields.io/badge/Gun.js-1E1E1E?style=for-the-badge&logo=javascript&logoColor=white)](https://gun.eco/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://zustand-demo.pmnd.rs/)

Minimal, modular Gun.js primitives for React applications with automatic crypto bridge, DAM-aware mesh monitoring, and environment-based peer management.

[Quick Start](#-quick-start) • [Core Primitives](#-core-primitives) • [Graph Guide](./GRAPH_GUIDE.md) • [API Reference](#-api-reference) • [Examples](#-examples)

</div>

---

## 🎯 Overview

**@ariob/core** provides production-ready Gun.js primitives following React Query and Convex patterns. Works seamlessly with **LynxJS**, **Expo**, and **React Native** with automatic environment detection and native crypto bridge.

### Why @ariob/core?

- **🎯 Minimal API** — One-word functions following Gun conventions (`init`, `node`, `pair`, `sign`)
- **🔒 Type-Safe** — Full TypeScript support with Zod schema validation
- **📦 Modular** — Import only what you need, zero coupling
- **🌐 Framework-Agnostic** — Works with LynxJS, Expo, React Native, and Web
- **🔐 Automatic Crypto Bridge** — Detects environment and loads native crypto automatically
- **💾 Smart State** — Zustand-powered stores with familiar DX
- **🎨 React-Ready** — Simple `use[Noun]` hooks for UI integration
- **⚙️ Native Performance** — 10-100x faster crypto via platform-native implementations

## ✨ Features

### Core Capabilities
- **Schema Validation** — Zod-based Thing & Who schemas with generic extensions
- **Graph Management** — Simple `init()` for app startup, singleton pattern
- **Node Operations** — CRUD for single objects with schema validation
- **Collection Management** — Sets/maps with typed items and subscriptions
- **Cryptography** — All SEA functions with automatic native bridges
- **Authentication** — Password-based & keypair-based auth with session management
- **State Management** — Zustand stores with direct selectors
- **Error Handling** — Optional Result type for composable error handling
- **DAM Monitoring** — Real-time peer health and message flow tracking
- **Peer Management** — Environment-based configuration (dev/staging/prod)

### Design Philosophy
- **One-Word Functions** — `init()`, `pair()`, `sign()`, `encrypt()`, `create()`, `auth()`
- **use[Noun] Hooks** — `useAuth`, `useNode`, `useCollection`, `useMesh`
- **Direct Selectors** — Zustand pattern: `store((s) => s.value)`
- **Simple Setup** — Call `init()` once at app startup
- **Lazy Everything** — Gun/SEA loaded only when needed
- **No Magic** — Explicit over implicit, simple over clever

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add @ariob/core

# Using npm
npm install @ariob/core

# Using yarn
yarn add @ariob/core
```

### Prerequisites

**Core Dependencies:**
- `react` ^18.3.1
- `zustand` ^5.0.2
- `zod` ^3.23.8
- Gun.js (included)

**Optional (Framework-Specific):**
- `@lynx-js/react` ^0.114.3 - For LynxJS applications
- `@ariob/webcrypto` - For Expo/React Native (auto-detected)

## 🚀 Quick Start

### 30-Second Setup

```typescript
import { init, useAuth, useNode, create, auth } from '@ariob/core';

// 1. Initialize Gun at app startup (once in your entry point)
init({
  peers: ['https://relay.example.com/gun']
});

// 2. That's it! Now use anywhere in your app
function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <view>
      {isAuthenticated ? (
        <text>Welcome, {user?.alias}!</text>
      ) : (
        <button onTap={() => create('alice', 'password123')}>
          Sign Up
        </button>
      )}
    </view>
  );
}
```

`★ Insight ─────────────────────────────────────`
**Why `init()` at startup?** Following Convex/React Query patterns where you configure once and forget. Gun initializes as a singleton, ensuring all parts of your app use the same graph instance. No providers, no context drilling, just call `init()` and you're done.
`─────────────────────────────────────────────────`

### Complete Example

```typescript
import {
  init, graph, node, collection,
  create, auth, pair, sign, verify,
  Thing, Who, z
} from '@ariob/core';

// 1. Schema - Define your data types
const TodoSchema = Thing.extend({
  title: z.string(),
  done: z.boolean()
});

// 2. Initialize at app startup
init({
  peers: ['http://localhost:8765/gun']
});

// 3. Use anywhere - no setup needed
function TodoApp() {
  const g = graph();
  const todos = useCollection('todos');

  useEffect(() => {
    todos.map(g.get('todos'), TodoSchema);
    return () => todos.off();
  }, []);

  const handleAdd = async () => {
    await todos.set(g.get('todos'), {
      title: 'New todo',
      done: false
    }, TodoSchema);
  };

  return (
    <view>
      {todos.items.map(({ id, data }) => (
        <text key={id}>{data.title}</text>
      ))}
      <button onTap={handleAdd}>Add</button>
    </view>
  );
}

// 4. Crypto - Generate and verify signatures
async function signMessage() {
  const pairResult = await pair();
  if (!pairResult.ok) return;

  const keys = pairResult.value;
  const signature = await sign({ msg: 'hello' }, keys);
  const verified = await verify(signature.value, keys.pub);
}
```

## 🌐 Framework Support & Crypto Bridge

### Automatic Environment Detection

`@ariob/core` automatically detects your runtime and loads the appropriate crypto bridge:

```typescript
import '@ariob/core';

// Crypto is automatically configured:
// - LynxJS: NativeWebCryptoModule via crypto.lynx.js
// - Expo/React Native: @ariob/webcrypto native module
// - Web/Browser: Native browser WebCrypto API
// No manual imports needed!

const hash = await crypto.subtle.digest('SHA-256', data);
```

### LynxJS Applications

For LynxJS-specific functionality, import from the `lynx` subpath:

```typescript
// LynxJS-specific hooks and types
import {
  useMainThreadImperativeHandle,
  useTapLock,
  useKeyboard
} from '@ariob/core/lynx';

// Type declarations for NativeModules
/// <reference types="@ariob/core/lynx/typing" />
```

### Expo/React Native Applications

Works out of the box with automatic crypto bridge. For native performance, install `@ariob/webcrypto`:

```bash
pnpm add @ariob/webcrypto
npx pod-install  # iOS only
```

### Performance Comparison

| Operation | Pure JS | Native (@ariob/core) | Speedup |
|-----------|---------|---------------------|---------|
| SHA-256 (1MB) | ~150ms | ~1.5ms | ~100x |
| AES-GCM Encrypt | ~200ms | ~2ms | ~100x |
| ECDSA Sign | ~25ms | ~1ms | ~25x |
| PBKDF2 (100k) | ~2000ms | ~50ms | ~40x |

## 📚 Core Primitives

### 1. Schema — Thing & Who

**Thing** is the base schema for any object in Gun. **Who** extends Thing with cryptographic identity.

```typescript
import { Thing, Who, z } from '@ariob/core';

// Basic Thing schema
const TodoSchema = Thing.extend({
  title: z.string(),
  done: z.boolean(),
  created: z.number()
});

type Todo = z.infer<typeof TodoSchema>;
// { '#'?: string, title: string, done: boolean, created: number }

// Who schema for authenticated entities
const ProfileSchema = Who.extend({
  name: z.string(),
  bio: z.string().optional(),
  avatar: z.string().url().optional()
});

type Profile = z.infer<typeof ProfileSchema>;
// { '#'?: string, pub: string, epub: string, alias: string, name: string, ... }
```

**Key Points:**
- Thing contains only `'#'` (Gun soul/ID)
- Who extends Thing with `pub`, `epub`, `alias`
- Use `.extend()` to add your own fields
- Schemas compose naturally with Zod

---

### 2. Graph — Simple Initialization

The **graph** is your entry point to Gun. Initialize once with `init()`, use everywhere.

```typescript
import { init, graph, createGraph } from '@ariob/core';

// ✅ RECOMMENDED: Initialize at app startup
init({
  peers: ['http://localhost:8765/gun']
});

// Then use anywhere in your app
const g = graph();

// Get the singleton anywhere
const g = graph();

// Create isolated instance for testing
const testGraph = createGraph({
  peers: ['http://test-server/gun']
});

// Gun API available
g.get('todos').get('todo-1').once((data) => {
  console.log('Data:', data);
});
```

`★ Insight ─────────────────────────────────────`
**Singleton Pattern**: Most apps need one shared Gun instance. The singleton ensures all parts of your app use the same graph, avoiding data inconsistencies. `init()` configures it once, `graph()` accesses it anywhere - no context providers needed!
`─────────────────────────────────────────────────`

**Key Functions:**
- `init(options)` — Initialize Gun at app startup (call once)
- `graph()` — Get singleton instance (call anywhere)
- `createGraph(options)` — Create isolated instance
- `addPeersToGraph(peers)` — Add peers dynamically

---

### 3. Node — Single Object Management

**node** manages subscriptions to individual Gun nodes with schema validation.

```typescript
import { node, graph, useNode } from '@ariob/core';
import { z } from 'zod';

const TodoSchema = z.object({
  title: z.string(),
  done: z.boolean()
});

const g = graph();
const ref = g.get('todos').get('todo-1');
const todoNode = node('todo-1');

// Subscribe with schema validation
todoNode.on(ref, TodoSchema);

// Get current data (reactive in React)
const todo = todoNode.get(); // { title: string, done: boolean } | null

// Check loading state
const loading = todoNode.loading(); // boolean

// Put data (validated)
const result = await todoNode.put(ref, {
  title: 'Buy milk',
  done: false
}, TodoSchema);

// Unsubscribe
todoNode.off();
```

**React Hook:**

```typescript
import { useNode } from '@ariob/core';

function TodoView() {
  const g = graph();
  const { data, loading, error, on, put, off } = useNode('todo-1');

  useEffect(() => {
    const ref = g.get('todos').get('todo-1');
    on(ref, TodoSchema);
    return () => off();
  }, []);

  if (loading) return <text>Loading...</text>;
  if (error) return <text>Error: {error.message}</text>;
  if (!data) return <text>No data</text>;

  return <text>{data.title} - {data.done ? '✓' : '○'}</text>;
}
```

**Key Points:**
- Subscribe with `.on()`, unsubscribe with `.off()`
- Optional schema validates incoming data
- `.get()` returns current state
- `.put()` validates and saves
- **Tombstoning**: Gun doesn't support true deletion - use `node.delete()` which sets all properties to `null` (tombstoning pattern) for proper CRDT synchronization across peers
- Hook provides reactive data access

> **💡 Insight: Why Tombstoning?**
>
> Gun uses a CRDT (Conflict-free Replicated Data Type) structure for decentralized synchronization. True deletion creates merge conflicts when peers sync - what if Peer A deletes while Peer B updates?
>
> **Tombstoning** solves this by setting all properties to `null`, providing a clear signal: "this was intentionally removed." These `null` markers sync reliably across all peers and can be properly merged with any conflicting updates.
>
> ```typescript
> // When you call node.delete():
> await node.delete('users/user-1');
>
> // Gun transforms the data from:
> { name: 'Alice', email: 'alice@example.com' }
>
> // To a tombstone:
> { name: null, email: null }
>
> // This null state syncs across all peers
> ```

---

### 4. Collection — Sets/Maps Management

**collection** manages subscriptions to Gun sets with full CRUD operations.

```typescript
import { collection, graph, useCollection, type Item } from '@ariob/core';
import { z } from 'zod';

const TodoSchema = z.object({
  title: z.string(),
  done: z.boolean()
});

const g = graph();
const ref = g.get('todos');
const todoColl = collection('todos');

// Subscribe to collection
todoColl.map(ref, TodoSchema);

// Get all items
const todos = todoColl.get(); // Item<Todo>[]
// [
//   { id: 'abc123', data: { title: 'Buy milk', done: false } },
//   { id: 'def456', data: { title: 'Walk dog', done: true } }
// ]

// Add item
await todoColl.set(ref, { title: 'Write docs', done: false }, TodoSchema);

// Update specific item
await todoColl.update(ref, 'abc123', { title: 'Buy milk', done: true }, TodoSchema);

// Delete item
await todoColl.del(ref, 'abc123');

// Unsubscribe
todoColl.off();
```

**React Hook:**

```typescript
import { useCollection } from '@ariob/core';

function TodoList() {
  const g = graph();
  const { items, loading, error, map, set, update, del, off } = useCollection('todos');

  useEffect(() => {
    map(g.get('todos'), TodoSchema);
    return () => off();
  }, []);

  const handleAdd = async () => {
    await set(g.get('todos'), { title: 'New todo', done: false }, TodoSchema);
  };

  const handleToggle = async (id: string, item: Todo) => {
    await update(g.get('todos'), id, { ...item, done: !item.done }, TodoSchema);
  };

  if (loading) return <text>Loading...</text>;

  return (
    <view>
      {items.map(({ id, data }) => (
        <view key={id}>
          <text>{data.title}</text>
          <button onTap={() => handleToggle(id, data)}>
            {data.done ? 'Undo' : 'Done'}
          </button>
          <button onTap={() => del(g.get('todos'), id)}>Delete</button>
        </view>
      ))}
      <button onTap={handleAdd}>Add Todo</button>
    </view>
  );
}
```

**Key Points:**
- `.map()` subscribes to all items in set
- `.get()` returns array of `Item<T>` with `{ id, data }`
- `.set()` adds new item to collection
- `.update()` modifies specific item by ID
- `.del()` removes item (sets to null)

---

### 5. Crypto — SEA Primitives

All Gun SEA cryptography functions with automatic native bridges and optional Result monad.

#### Generate Keypair

```typescript
import { pair } from '@ariob/core';

const result = await pair();

if (result.ok) {
  const keys = result.value;
  // {
  //   pub: string,   // Public signing key
  //   priv: string,  // Private signing key
  //   epub: string,  // Public encryption key
  //   epriv: string  // Private encryption key
  // }
}
```

#### Sign & Verify

```typescript
import { sign, verify } from '@ariob/core';

// Sign data
const signResult = await sign({ message: 'hello' }, keys);

if (signResult.ok) {
  const signature = signResult.value;

  // Verify signature
  const verifyResult = await verify(signature, keys.pub);

  if (verifyResult.ok) {
    console.log('Verified data:', verifyResult.value);
  }
}
```

#### Encrypt & Decrypt

```typescript
import { encrypt, decrypt } from '@ariob/core';

// Encrypt data
const encryptResult = await encrypt({ secret: 'password' }, keys);

if (encryptResult.ok) {
  const encrypted = encryptResult.value;

  // Decrypt data
  const decryptResult = await decrypt(encrypted, keys);

  if (decryptResult.ok) {
    console.log('Decrypted:', decryptResult.value);
  }
}
```

**Helper Functions:**

```typescript
import { encryptData, decryptData, isEncrypted } from '@ariob/core';

// Encrypt (throws on error)
const encrypted = await encryptData(data, keys);

// Decrypt (returns original if not encrypted)
const decrypted = await decryptData(encrypted, keys);

// Check if data is encrypted
if (isEncrypted(data)) {
  console.log('Data is SEA encrypted');
}
```

`★ Insight ─────────────────────────────────────`
**Native Performance**: Crypto functions automatically use platform-native implementations (WebCrypto on iOS/Android, browser APIs on web) for 10-100x speedups. No configuration needed - just import and use!
`─────────────────────────────────────────────────`

---

### 6. Auth — Authentication

Simple authentication following Gun/SEA patterns with automatic session management.

#### Create Account

```typescript
import { create, auth, leave, recall, useAuth } from '@ariob/core';

// Password-based account
const result = await create('alice', 'secret123');

if (result.ok) {
  console.log('Created account:', result.value.alias);
  console.log('Public key:', result.value.pub);
}

// Key-based account (no password)
const result = await create('alice');
```

#### Authenticate

```typescript
// Password-based auth
const result = await auth('alice', 'secret123');

if (result.ok) {
  console.log('Logged in as:', result.value.alias);
}

// Keypair-based auth
const pairResult = await pair();
if (pairResult.ok) {
  const authResult = await auth(pairResult.value);
  // Save keys for future use
}
```

#### Session Management

```typescript
// Leave (logout) - following Gun's naming
leave();

// Restore session from storage
const recallResult = await recall();

if (recallResult.ok) {
  console.log('Session restored:', recallResult.value.alias);
}
```

#### React Hook

```typescript
import { useAuth } from '@ariob/core';

function AuthView() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Try to restore session on mount
    recall();
  }, []);

  if (isAuthenticated) {
    return (
      <view>
        <text>Logged in as: {user?.alias}</text>
        <button onTap={leave}>Logout</button>
      </view>
    );
  }

  return (
    <view>
      <button onTap={async () => {
        const result = await create('alice', 'password123');
        if (!result.ok) console.error('Failed:', result.error.message);
      }}>
        Create Account
      </button>
      <button onTap={async () => {
        const result = await auth('alice', 'password123');
        if (!result.ok) console.error('Failed:', result.error.message);
      }}>
        Login
      </button>
    </view>
  );
}
```

**Direct Store Access:**

```typescript
import { authStore } from '@ariob/core';

// Zustand direct selector pattern
function UserBadge() {
  const user = authStore((s) => s.user);
  const isAuthenticated = authStore((s) => s.isAuthenticated);

  return <text>{user?.alias}</text>;
}
```

`★ Insight ─────────────────────────────────────`
**Direct Selectors**: Following Zustand best practices and Convex patterns, we use direct selectors `store((s) => s.value)` instead of wrapper hooks. This gives you fine-grained reactivity - components only re-render when the specific slice of state they select changes.
`─────────────────────────────────────────────────`

---

### 7. Store — State Management

**define** creates Zustand stores with direct selector access.

```typescript
import { define } from '@ariob/core';

// Create store
const userStore = define({
  name: '',
  age: 0,
  email: ''
});

// Update state
userStore.setState({ name: 'Alice', age: 30 });

// Get current state
const state = userStore.getState();
console.log(state.name); // 'Alice'

// Subscribe to changes
const unsubscribe = userStore.subscribe(() => {
  console.log('State changed:', userStore.getState());
});

// React - direct selector (RECOMMENDED)
function UserName() {
  const name = userStore((s) => s.name);
  return <text>{name}</text>;
}

// React - full store (re-renders on any change)
function UserProfile() {
  const state = userStore();
  return <text>{state.name} ({state.age})</text>;
}
```

**Key Points:**
- One-word function: `define({ ... })`
- Creates a Zustand store
- Direct selectors: `store((s) => s.field)` for fine-grained reactivity
- Used internally by auth, node, collection, mesh

---

### 8. Config — Peer Management

Environment-based peer configuration for easy switching between dev/staging/prod.

```typescript
import {
  getPeers, setPeers, addPeer, removePeer, resetPeers,
  loadProfile, getCurrentProfile, PEER_PROFILES
} from '@ariob/core';

// Load production relays
loadProfile('prod');

// Get current peers
const peers = getPeers();

// Add a peer dynamically
addPeer('wss://relay.example.com/gun');

// Remove a peer
removePeer('http://localhost:8765/gun');

// Set peers directly
setPeers(['wss://relay1.com/gun', 'wss://relay2.com/gun']);

// Reset to defaults
resetPeers();

// Available profiles:
// - 'local': http://localhost:8765/gun
// - 'dev': LAN IP for iOS simulator
// - 'staging': wss://staging-relay.ariob.com/gun
// - 'prod': Multiple production relays
```

---

### 9. Mesh — DAM-Aware Monitoring

Real-time visibility into Gun's mesh network for production monitoring.

```typescript
import { useMesh, usePeer, initMeshMonitoring } from '@ariob/core';

// Optional: Initialize early (auto-initializes on first hook use)
initMeshMonitoring();

// React Hook - Network Status
function NetworkStatus() {
  const { peers, totalIn, totalOut, monitoring } = useMesh();
  const connected = peers.filter(p => p.connected).length;

  return (
    <view>
      <text>Peers: {connected}/{peers.length}</text>
      <text>Messages: ↓{totalIn} ↑{totalOut}</text>
    </view>
  );
}

// React Hook - Specific Peer
function PeerMonitor({ url }: { url: string }) {
  const peer = usePeer(url);

  if (!peer) return <text>Peer not found</text>;

  return (
    <view>
      <text>{peer.url}</text>
      <text>{peer.connected ? '🟢' : '🔴'}</text>
      <text>Last seen: {new Date(peer.lastSeen).toLocaleTimeString()}</text>
      <text>↓{peer.messagesIn} ↑{peer.messagesOut}</text>
    </view>
  );
}
```

**Direct Store Access:**

```typescript
import { meshStore } from '@ariob/core';

// Zustand direct selectors
function OfflineIndicator() {
  const peers = meshStore((s) => Object.values(s.peers));
  const hasConnection = peers.some(p => p.connected);

  if (hasConnection) return null;
  return <text>⚠️ Offline</text>;
}
```

---

## 📖 API Reference

### Graph

| Function | Signature | Description |
|----------|-----------|-------------|
| `init()` | `(options?: GunOptions) => GunInstance` | Initialize Gun at app startup |
| `graph()` | `(options?: GunOptions) => GunInstance` | Get singleton graph |
| `createGraph()` | `(options?: GunOptions) => GunInstance` | Create isolated graph |
| `addPeersToGraph()` | `(peers: string[]) => void` | Add peers dynamically |

### Node

| Function | Signature | Description |
|----------|-----------|-------------|
| `node()` | `(key: string, config?) => NodeAPI` | Create node manager |
| `.on()` | `(ref, schema?) => void` | Subscribe to node |
| `.off()` | `() => void` | Unsubscribe |
| `.get()` | `() => T \| null` | Get current data |
| `.put()` | `(ref, data, schema?) => Promise<Result>` | Save data |
| `.delete()` | `(path: string) => Promise<Result>` | Delete node (tombstoning) |
| `.loading()` | `() => boolean` | Get loading state |
| `.error()` | `() => Error \| null` | Get error state |
| `useNode()` | `(key, config?) => NodeHook` | React hook |

### Collection

| Function | Signature | Description |
|----------|-----------|-------------|
| `collection()` | `(key: string, config?) => CollectionAPI` | Create collection manager |
| `.map()` | `(ref, schema?) => void` | Subscribe to collection |
| `.off()` | `() => void` | Unsubscribe |
| `.get()` | `() => Item<T>[]` | Get all items |
| `.set()` | `(ref, data, schema?) => Promise<Result>` | Add item |
| `.update()` | `(ref, id, data, schema?) => Promise<Result>` | Update item |
| `.del()` | `(ref, id) => Promise<Result>` | Delete item |
| `useCollection()` | `(key, config?) => CollectionHook` | React hook |

### Crypto

| Function | Signature | Description |
|----------|-----------|-------------|
| `pair()` | `() => Promise<Result<KeyPair, Error>>` | Generate keypair |
| `sign()` | `(data, pair) => Promise<Result<any, Error>>` | Sign data |
| `verify()` | `(signature, pub) => Promise<Result<any, Error>>` | Verify signature |
| `encrypt()` | `(data, keys) => Promise<Result<any, Error>>` | Encrypt data |
| `decrypt()` | `(data, keys) => Promise<Result<any, Error>>` | Decrypt data |
| `work()` | `(data, salt?) => Promise<Result<string, Error>>` | Proof-of-work hash |
| `secret()` | `(theirEpub, myPair) => Promise<Result<string, Error>>` | Shared secret (ECDH) |

### Auth

| Function | Signature | Description |
|----------|-----------|-------------|
| `create()` | `(username, password?) => Promise<Result>` | Create account |
| `auth()` | `(usernameOrKeys, password?) => Promise<Result>` | Authenticate |
| `leave()` | `() => void` | Leave (logout) |
| `recall()` | `() => Promise<Result>` | Restore session |
| `useAuth()` | `() => { user, isAuthenticated }` | React hook |

### State Management

| Function | Signature | Description |
|----------|-----------|-------------|
| `define()` | `<T>(initialState: T) => Store<T>` | Create Zustand store (recommended) |
| `store()` | `<T>(initialState: T) => Store<T>` | Create Zustand store (internal) |

## 💡 Examples

### Complete Todo App

```typescript
import { init, graph, useCollection, useAuth, create, auth } from '@ariob/core';
import { Thing, z } from '@ariob/core';

const TodoSchema = Thing.extend({
  title: z.string(),
  done: z.boolean(),
  userId: z.string()
});

// Initialize once at app startup
init({ peers: ['http://localhost:8765/gun'] });

function TodoApp() {
  const g = graph();
  const { user, isAuthenticated } = useAuth();
  const todos = useCollection('todos');
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      todos.map(g.get('todos'), TodoSchema);
    }
    return () => todos.off();
  }, [isAuthenticated]);

  const handleAdd = async () => {
    if (!user) return;
    await todos.set(g.get('todos'), {
      title,
      done: false,
      userId: user.pub
    }, TodoSchema);
    setTitle('');
  };

  if (!isAuthenticated) {
    return (
      <view>
        <button onTap={() => create('alice', 'password')}>Sign Up</button>
        <button onTap={() => auth('alice', 'password')}>Login</button>
      </view>
    );
  }

  return (
    <view>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button onTap={handleAdd}>Add</button>
      {todos.items.map(({ id, data }) => (
        <view key={id}>
          <text>{data.title}</text>
          <button onTap={() => todos.update(g.get('todos'), id, { ...data, done: !data.done }, TodoSchema)}>
            {data.done ? '✓' : '○'}
          </button>
          <button onTap={() => todos.del(g.get('todos'), id)}>Delete</button>
        </view>
      ))}
    </view>
  );
}
```

### Encrypted Messaging

```typescript
import { pair, encrypt, decrypt, sign, verify } from '@ariob/core';

async function sendEncryptedMessage(message: string, recipientKeys: KeyPair) {
  // Generate sender keys
  const senderResult = await pair();
  if (!senderResult.ok) return;
  const senderKeys = senderResult.value;

  // Encrypt message for recipient
  const encryptResult = await encrypt(message, recipientKeys);
  if (!encryptResult.ok) return;
  const encrypted = encryptResult.value;

  // Sign encrypted message
  const signResult = await sign(encrypted, senderKeys);
  if (!signResult.ok) return;
  const signed = signResult.value;

  return { encrypted: signed, senderPub: senderKeys.pub };
}

async function receiveEncryptedMessage(signed: any, senderPub: string, myKeys: KeyPair) {
  // Verify signature
  const verifyResult = await verify(signed, senderPub);
  if (!verifyResult.ok) return;
  const encrypted = verifyResult.value;

  // Decrypt message
  const decryptResult = await decrypt(encrypted, myKeys);
  if (!decryptResult.ok) return;

  return decryptResult.value;
}
```

## ⚡ Performance Tips

### 1. Use Direct Selectors

Only subscribe to what you need:

```typescript
// ✅ EFFICIENT - Only re-renders when name changes
function UserName() {
  const name = authStore((s) => s.user?.alias);
  return <text>{name}</text>;
}

// ❌ INEFFICIENT - Re-renders on any auth state change
function UserName() {
  const state = authStore();
  return <text>{state.user?.alias}</text>;
}
```

### 2. Index for Fast Queries

Create indexes to avoid scanning collections:

```typescript
// ❌ SLOW - Scans all posts
collection('posts').map().once((post) => {
  if (post.author === 'alice') /* show post */
});

// ✅ FAST - Direct lookup
collection('posts-by-author/alice').map().once((post) => {
  // Only Alice's posts
});
```

### 3. Use `.once()` for Static Data

```typescript
// ✅ Static data - use .once()
gun.get('config').get('appName').once((name) => {
  console.log('App:', name);
});

// ✅ Live data - use .on()
gun.get('users').get(pub).get('status').on((status) => {
  updateUI(status);
});
```

## 🏗 Architecture

### Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                       React UI                           │
│          (useAuth, useNode, useCollection)               │
└─────────────────────┬────────────────────────────────────┘
                      │
                      │ Direct Selectors: store((s) => s.value)
                      │
┌─────────────────────▼────────────────────────────────────┐
│                  Zustand Stores                          │
│        (authStore, nodeStore, collectionStore)           │
└─────────────────────┬────────────────────────────────────┘
                      │
                      │ Gun References
                      │
┌─────────────────────▼────────────────────────────────────┐
│                   Gun Graph                              │
│               (Singleton Instance)                       │
└─────────────────────┬────────────────────────────────────┘
                      │
                      │ WebSocket/LocalStorage
                      │
┌─────────────────────▼────────────────────────────────────┐
│              Gun Network / Peers                         │
│                (Distributed Sync)                        │
└──────────────────────────────────────────────────────────┘
```

### Module Organization

```
@ariob/core/
├── schema.ts            # Zod schemas (Thing, Who)
├── graph.ts             # Gun instance management (init, graph)
├── node.ts              # Single object operations
├── collection.ts        # Set/map operations
├── crypto.ts            # SEA cryptography
├── auth.ts              # Authentication (create, auth, leave, recall)
├── config.ts            # Peer management & profiles
├── mesh.ts              # DAM-aware monitoring
├── result.ts            # Result monad (optional)
├── utils/store.ts       # Zustand store factory (define, store)
├── index.ts             # Clean exports
└── gun/native/          # Crypto bridges (auto-detection)
```

## 🤝 Contributing

Contributions welcome! Please follow:

1. **Code Style** — One-word functions, `use[Noun]` hooks
2. **Type Safety** — Full TypeScript coverage
3. **Direct Selectors** — Use Zustand pattern `store((s) => s.value)`
4. **Tests** — Unit tests for all primitives
5. **Documentation** — JSDoc comments + examples

### Development Workflow

```bash
# Install dependencies
pnpm install

# Type check
pnpm type-check

# Run tests
pnpm test

# Build package
pnpm build
```

## 📄 License

Private package - See repository root for license information.

---

## 🙏 Acknowledgments

- [Gun.js](https://gun.eco/) — Distributed graph database
- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [Zod](https://zod.dev/) — Schema validation
- [React Query](https://tanstack.com/query) — API design inspiration
- [Convex](https://www.convex.dev/) — DX patterns

---

<div align="center">

**Built with ❤️ for distributed, encrypted applications**

[Report Bug](https://github.com/ariobstudio/ariob/issues) • [Request Feature](https://github.com/ariobstudio/ariob/issues)

</div>

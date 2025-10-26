# @ariob/core

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gun.js](https://img.shields.io/badge/Gun.js-1E1E1E?style=for-the-badge&logo=javascript&logoColor=white)](https://gun.eco/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://zustand-demo.pmnd.rs/)

Production-ready Gun.js primitives for LynxJS with DAM-aware mesh monitoring, environment-based peer management, and Result-based error handling.

[Quick Start](#-quick-start) • [Core Primitives](#-core-primitives) • [API Reference](#-api-reference) • [Examples](#-examples) • [Architecture](#-architecture)

</div>

---

## 🎯 Overview

**@ariob/core** is a production-ready Gun.js wrapper that distills distributed data synchronization into minimal, composable primitives. Built for LynxJS applications with deep understanding of Gun's DAM/HAM/SEA architecture, it provides mesh network monitoring, environment-based peer management, and Result-based error handling for robust P2P applications.

### Why @ariob/core?

- **🎯 Minimal API** — 8 core primitives, one-word function names following Gun conventions
- **🔒 Type-Safe** — Full TypeScript support with Zod schema validation
- **⚡ Result Monad** — Explicit error handling with `Result<T, E>` pattern
- **📦 Modular** — Import only what you need, zero coupling
- **🧵 Thread-Safe** — Lazy-loaded SEA for background thread compatibility
- **💾 Opt-in Persistence** — Zustand middleware for localStorage control
- **🎨 React-Ready** — Simple hooks for UI integration
- **🔐 Cryptography** — Full SEA support (pair/sign/verify/encrypt/decrypt)

## ✨ Features

### Core Capabilities
- **Schema Validation** — Zod-based Thing & Who schemas with generic extensions
- **Graph Management** — Singleton + instance pattern for Gun instances
- **Node Operations** — CRUD for single objects with schema validation
- **Collection Management** — Sets/maps with typed items and subscriptions
- **Cryptography** — All SEA functions wrapped in Result monad
- **Authentication** — Create/login/logout/recall with keypair management
- **Error Handling** — Result type for composable error handling
- **Background Safety** — SEA lazy-loaded for thread isolation
- **DAM Monitoring** — Real-time peer health and message flow tracking
- **Peer Management** — Environment-based configuration (dev/staging/prod)

### Design Philosophy
- **One Word Functions** — `pair()`, `sign()`, `verify()`, `encrypt()`, `decrypt()`
- **Result-Oriented** — All operations return `Result<T, Error>`
- **Schema-First** — Validate with Zod before Gun operations
- **Immutable State** — Zustand stores never mutate
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

- `@lynx-js/react` (peer dependency)
- `zustand` ^5.0.2
- `zod` ^3.23.8
- Gun.js (included)

## 🚀 Quick Start

### 30-Second Example

```typescript
import {
  graph, node, collection, auth, pair, Result,
  Thing, Who, z
} from '@ariob/core';

// 1. Schema - Define your data types
const TodoSchema = Thing.extend({
  title: z.string(),
  done: z.boolean()
});

// 2. Graph - Get the singleton instance
const g = graph();

// 3. Node - Single object management
const todoNode = node('todo-1');
const ref = g.get('todos').get('todo-1');
todoNode.on(ref, TodoSchema);

// Later in your component
const todo = todoNode.get(); // { title: string, done: boolean } | null

// 4. Collection - Sets/maps management
const todoColl = collection('todos');
todoColl.map(g.get('todos'), TodoSchema);

const todos = todoColl.get(); // Item<Todo>[]

// 5. Crypto - Generate keypair
const pairResult = await pair();
if (pairResult.ok) {
  const keys = pairResult.value; // { pub, priv, epub, epriv }
}

// 6. Auth - Create account
const result = await auth(g).create('alice');
await Result.match(result, {
  ok: (user) => console.log('Created:', user.alias),
  error: (err) => console.error('Failed:', err.message)
});

// 7. Result - Error handling
const encrypted = await encrypt(data, keys);
if (encrypted.ok) {
  console.log('Encrypted:', encrypted.value);
} else {
  console.error('Error:', encrypted.error.message);
}
```

## 📚 Core Primitives

### 1. Schema — Thing & Who

**Thing** is the base schema for any object in the Gun universe. **Who** extends Thing with cryptographic identity (keypair).

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
// {
//   '#'?: string,
//   pub: string,
//   epub: string,
//   alias: string,
//   name: string,
//   bio?: string,
//   avatar?: string
// }
```

**Key Points:**
- Thing contains only `'#'` (Gun soul/ID)
- Who extends Thing with `pub`, `epub`, `alias`
- Use `.extend()` to add your own fields
- Schemas compose naturally with Zod

**Why?**
Following Gun/SEA conventions: every node has a soul (`#`), authenticated nodes have keypairs. This separation makes the type system mirror Gun's graph structure.

---

### 2. Graph — Singleton + Instances

The **graph** is your entry point to Gun. Use the singleton for shared state, or create isolated instances for testing.

```typescript
import { graph, createGraph } from '@ariob/core';

// Get the singleton (lazy-initialized)
const g = graph();

// Initialize with options (first call only)
const g = graph({
  peers: ['http://localhost:8765/gun'],
  localStorage: true,
  radisk: true
});

// Create isolated instance
const testGraph = createGraph({
  peers: ['http://test-server/gun']
});

// Gun API available
g.get('todos').get('todo-1').once((data) => {
  console.log('Data:', data);
});
```

**Key Points:**
- `graph()` returns singleton, safe to call multiple times
- Options only apply on first call
- `createGraph()` returns new instance
- All Gun methods available

**Why Singleton?**
Most apps need one shared Gun instance. Singleton pattern ensures all parts of your app use the same graph, avoiding data inconsistencies.

---

### 3. Node — Single Object Management

**node** manages subscriptions to individual Gun nodes with schema validation and Result-based puts.

```typescript
import { node, graph } from '@ariob/core';
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

if (result.ok) {
  console.log('Saved!');
} else {
  console.error('Error:', result.error.message);
}

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
- `.put()` validates and saves, returns Result
- Hook provides reactive data access

**Persistence:**

```typescript
// Enable localStorage persistence
const todoNode = node('todo-1', { persist: true });
```

---

### 4. Collection — Sets/Maps Management

**collection** manages subscriptions to Gun sets (collections of objects) with full CRUD operations.

```typescript
import { collection, graph, type Item } from '@ariob/core';
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

// Add item (creates new node)
const addResult = await todoColl.set(ref, {
  title: 'Write docs',
  done: false
}, TodoSchema);

// Update specific item
const updateResult = await todoColl.update(ref, 'abc123', {
  title: 'Buy milk',
  done: true
}, TodoSchema);

// Delete item
const delResult = await todoColl.del(ref, 'abc123');

// Check state
const loading = todoColl.loading();
const error = todoColl.error();

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
    const ref = g.get('todos');
    map(ref, TodoSchema);
    return () => off();
  }, []);

  const handleAdd = async () => {
    await set(g.get('todos'), {
      title: 'New todo',
      done: false
    }, TodoSchema);
  };

  const handleToggle = async (id: string, item: Todo) => {
    await update(g.get('todos'), id, {
      ...item,
      done: !item.done
    }, TodoSchema);
  };

  const handleDelete = async (id: string) => {
    await del(g.get('todos'), id);
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
          <button onTap={() => handleDelete(id)}>Delete</button>
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
- All operations return Result for error handling

---

### 5. Crypto — SEA Primitives

All Gun SEA cryptography functions wrapped with Result monad and lazy-loading for background thread safety.

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
} else {
  console.error('Failed to generate keypair:', result.error);
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
  const encrypted = encryptResult.value; // SEA encrypted string

  // Decrypt data
  const decryptResult = await decrypt(encrypted, keys);

  if (decryptResult.ok) {
    console.log('Decrypted:', decryptResult.value); // { secret: 'password' }
  }
}
```

#### Proof of Work (Hashing)

```typescript
import { work } from '@ariob/core';

// Hash password with salt
const hashResult = await work('my-password', 'salt-123');

if (hashResult.ok) {
  const hash = hashResult.value; // Proof-of-work hash string
}
```

#### Shared Secret (ECDH)

```typescript
import { secret } from '@ariob/core';

// Generate shared secret for encrypted communication
const secretResult = await secret(theirPublicKey, myKeys);

if (secretResult.ok) {
  const sharedSecret = secretResult.value;
  // Use sharedSecret for symmetric encryption
}
```

#### Certify (Authorization)

```typescript
import { certify } from '@ariob/core';

// Grant write access to specific path
const certResult = await certify(
  ['*'], // All users (or specific public keys)
  { '+': '*', '.': 'todos' }, // Can write to 'todos' path
  authorityKeys
);

if (certResult.ok) {
  const certificate = certResult.value;
  // Share certificate with users
}
```

**Helper Functions:**

```typescript
import { encryptData, decryptData, isEncrypted } from '@ariob/core';

// Encrypt (no Result, throws on error)
const encrypted = await encryptData(data, keys);

// Decrypt (no Result, returns original if not encrypted)
const decrypted = await decryptData(encrypted, keys);

// Check if data is encrypted
if (isEncrypted(data)) {
  console.log('Data is SEA encrypted');
}
```

**Key Points:**
- All crypto functions return `Result<T, Error>`
- Lazy-loaded SEA for background thread safety
- Helper functions (`encryptData`, `decryptData`) for convenience
- Full TypeScript support with KeyPair type

---

### 6. Auth — Authentication

Simple authentication with Gun user system. Supports create/login/logout/recall with automatic keypair management.

#### Create Account

```typescript
import { auth, graph } from '@ariob/core';

const g = graph();

// Create new account (generates keypair automatically)
const result = await auth(g).create('alice');

await Result.match(result, {
  ok: (user) => {
    console.log('Created account:', user.alias);
    console.log('Public key:', user.pub);
    console.log('Encryption key:', user.epub);
  },
  error: (err) => {
    console.error('Failed to create:', err.message);
  }
});
```

#### Login with Keypair

```typescript
// Login with existing keys
const loginResult = await auth(g).login(savedKeys);

if (loginResult.ok) {
  console.log('Logged in as:', loginResult.value.alias);
}
```

#### Logout

```typescript
// Logout current user
auth(g).logout();
```

#### Recall Session

```typescript
// Restore session from localStorage (if persisted)
const recallResult = await auth(g).recall();

if (recallResult.ok) {
  console.log('Session restored:', recallResult.value.alias);
} else {
  // No session to restore
}
```

#### React Hook

```typescript
import { useAuth, graph } from '@ariob/core';

function AuthView() {
  const g = graph();
  const { user, keys, isLoggedIn, create, login, logout, recall } = useAuth(g);

  useEffect(() => {
    // Try to restore session on mount
    recall();
  }, []);

  if (isLoggedIn) {
    return (
      <view>
        <text>Logged in as: {user?.alias}</text>
        <button onTap={logout}>Logout</button>
      </view>
    );
  }

  return (
    <view>
      <button onTap={() => create('alice')}>Create Account</button>
    </view>
  );
}
```

**Key Points:**
- `create()` generates keypair and authenticates
- `login()` authenticates with existing keypair
- `logout()` clears session
- `recall()` restores from localStorage
- Hook provides reactive auth state
- Automatic persistence with Zustand

**Auth Store:**

```typescript
import { useAuthStore } from '@ariob/core';

// Access store directly
const authState = useAuthStore.getState();
console.log('User:', authState.user);
console.log('Keys:', authState.keys);
```

---

### 7. Result — Error Handling

**Result** is a type-safe monad for handling success/failure without exceptions. Inspired by Rust's `Result<T, E>`.

#### Basic Usage

```typescript
import { Result, isOk, isErr } from '@ariob/core';

// Create Result
const success = Result.ok(42);
const failure = Result.error('Something went wrong');

// Check type
if (isOk(success)) {
  console.log('Value:', success.value); // 42
}

if (isErr(failure)) {
  console.log('Error:', failure.error); // 'Something went wrong'
}
```

#### Pattern Matching

```typescript
// Match on Result
const message = Result.match(result, {
  ok: (value) => `Success: ${value}`,
  error: (error) => `Failed: ${error.message}`
});
```

#### Transformations

```typescript
// Map value
const doubled = Result.map(Result.ok(5), x => x * 2);
// Ok(10)

// Map error
const withContext = Result.mapError(
  Result.error('Failed'),
  err => `Database error: ${err}`
);
// Err('Database error: Failed')

// Chain operations
const result = Result.chain(
  Result.ok(5),
  x => Result.ok(x * 2)
);
// Ok(10)
```

#### Error Recovery

```typescript
// Unwrap with default
const value = Result.unwrapOr(result, 0);

// Unwrap or throw
try {
  const value = Result.unwrap(result);
} catch (err) {
  console.error('Result was Err');
}
```

#### Combining Results

```typescript
// All must succeed
const results = Result.all([
  Result.ok(1),
  Result.ok(2),
  Result.ok(3)
]);
// Ok([1, 2, 3])

// Collect all errors
const results = Result.collect([
  Result.ok(1),
  Result.error('err1'),
  Result.error('err2')
]);
// Err(['err1', 'err2'])
```

#### From Functions

```typescript
// Catch exceptions
const result = Result.from(() => JSON.parse(jsonString));

if (result.ok) {
  console.log('Parsed:', result.value);
} else {
  console.error('Parse error:', result.error.message);
}

// From async functions
const result = await Result.fromAsync(async () => {
  const response = await fetch('/api/data');
  return response.json();
});
```

#### Schema Validation

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string(),
  age: z.number()
});

const result = Result.parse(UserSchema, data);

if (result.ok) {
  console.log('Valid user:', result.value);
  // TypeScript knows: { name: string, age: number }
} else {
  console.error('Validation error:', result.error.issues);
  // ZodError with detailed validation errors
}
```

**Key Points:**
- Never throws exceptions
- Type-safe with discriminated unions
- Composable transformations
- Pattern matching support
- Integrates with Zod validation

---

### 8. Index — Clean Exports

All primitives exported from single entry point:

```typescript
import {
  // Schema
  Thing, Who, z,

  // Graph
  graph, createGraph, useGraphStore,

  // Node
  node, useNode, useNodeStore, createNodeStore,

  // Collection
  collection, useCollection, useCollectionStore, createCollectionStore,

  // Crypto
  pair, sign, verify, encrypt, decrypt, work, secret, certify,
  encryptData, decryptData, isEncrypted,

  // Auth
  auth, useAuth, useAuthStore, create, login, logout, recall,

  // Result
  Result, isOk, isErr,

  // Types
  type KeyPair,
  type GunInstance,
  type GunUser,
  type User,
  type Item,
  type Ok,
  type Err
} from '@ariob/core';
```

---

### 8. Config — Peer Management

**Environment-based peer configuration** for easy switching between development, staging, and production relays.

#### Peer Profiles

```typescript
import { loadProfile, getCurrentProfile, PEER_PROFILES } from '@ariob/core';

// Load production relays
loadProfile('prod');

// Check current environment
const profile = getCurrentProfile();
console.log('Using profile:', profile); // 'prod'

// Available profiles:
// - 'local': http://localhost:8765/gun
// - 'dev': LAN IP for iOS simulator
// - 'staging': wss://staging-relay.ariob.com/gun
// - 'prod': Multiple production relays with redundancy

// View all profiles
console.log(PEER_PROFILES);
```

#### Dynamic Peer Management

```typescript
import { getPeers, setPeers, addPeer, removePeer } from '@ariob/core';

// Get current peers
const peers = getPeers();
console.log('Connected to:', peers);

// Add a peer dynamically
addPeer('wss://relay.example.com/gun');

// Remove a peer
removePeer('http://localhost:8765/gun');

// Set peers directly
setPeers(['wss://relay1.com/gun', 'wss://relay2.com/gun']);

// Reset to defaults
resetPeers();
```

**Key Points:**
- Profiles persist to localStorage
- Easy environment switching
- Supports multiple relays for redundancy
- Gun.opt() used for dynamic peer addition

---

### 9. Mesh — DAM-Aware Monitoring

**Real-time visibility** into Gun's mesh network (DAM layer) for production monitoring and debugging.

#### Initialize Monitoring

```typescript
import { initMeshMonitoring } from '@ariob/core';

// Call once during app initialization
initMeshMonitoring();
```

#### React Hooks

```typescript
import { useMesh, usePeer } from '@ariob/core';

function NetworkStatus() {
  const { peers, totalIn, totalOut, monitoring } = useMesh();
  const connected = peers.filter(p => p.connected).length;

  return (
    <view>
      <text>Network: {monitoring ? '✓' : '✗'}</text>
      <text>Peers: {connected}/{peers.length}</text>
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
      <text>{peer.connected ? '🟢' : '🔴'}</text>
      <text>Last seen: {new Date(peer.lastSeen).toLocaleTimeString()}</text>
      <text>↓{peer.messagesIn} ↑{peer.messagesOut}</text>
    </view>
  );
}
```

#### Imperative API

```typescript
import {
  getPeerStatus,
  getAllPeers,
  addMeshPeer,
  removeMeshPeer,
  resetMeshStats
} from '@ariob/core';

// Get specific peer status
const status = getPeerStatus('http://localhost:8765/gun');
console.log('Connected:', status?.connected);

// Get all peers
const allPeers = getAllPeers();
console.log('Total peers:', allPeers.length);

// Add peer dynamically (also updates config)
addMeshPeer('wss://relay.example.com/gun');

// Remove from tracking
removeMeshPeer('wss://old-relay.com/gun');

// Reset message counters
resetMeshStats();
```

**Key Points:**
- Hooks into Gun's `'in'` and `'out'` events
- Tracks message flow per peer
- Real-time connection status
- Useful for offline detection and debugging
- Zero impact on Gun performance

**Production Use Cases:**
```typescript
// Offline indicator
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

// Message rate monitoring
function useMessageRateMonitor(threshold = 1000) {
  const { totalOut } = useMesh();

  useEffect(() => {
    'background only';
    if (totalOut > threshold) {
      console.warn('High message rate detected:', totalOut);
    }
  }, [totalOut, threshold]);
}
```

---

## 🎯 Advanced Patterns

### Custom Schemas

Extend Thing/Who with domain-specific fields:

```typescript
import { Thing, Who, z } from '@ariob/core';

// Blog post
const PostSchema = Thing.extend({
  title: z.string().min(1),
  content: z.string(),
  author: z.string(), // pub key
  published: z.boolean(),
  created: z.number(),
  updated: z.number().optional()
});

// User profile
const ProfileSchema = Who.extend({
  displayName: z.string(),
  bio: z.string().max(280),
  avatar: z.string().url().optional(),
  followers: z.number().default(0),
  following: z.number().default(0)
});

// Validated operations
const postNode = node('post-123');
postNode.on(ref, PostSchema);

const result = await postNode.put(ref, {
  title: 'Hello World',
  content: 'My first post',
  author: user.pub,
  published: true,
  created: Date.now()
}, PostSchema);
```

### Persistence Configuration

Control localStorage persistence per store:

```typescript
// Node with persistence
const persistentNode = node('user-settings', { persist: true });

// Collection with persistence
const persistentColl = collection('favorites', { persist: true });

// Auth already persists by default
const { user, keys } = useAuth(graph());
```

**How it Works:**
Zustand middleware serializes state to localStorage, rehydrates on mount. Only data/items persisted, not subscriptions.

### Error Handling Patterns

#### Pattern 1: Match

```typescript
const result = await pair();

await Result.match(result, {
  ok: async (keys) => {
    // Handle success
    await saveKeys(keys);
  },
  error: async (err) => {
    // Handle error
    showError(err.message);
  }
});
```

#### Pattern 2: Early Return

```typescript
const result = await pair();

if (!result.ok) {
  console.error('Failed:', result.error.message);
  return;
}

// TypeScript knows result.value exists
const keys = result.value;
```

#### Pattern 3: Unwrap with Default

```typescript
const keys = Result.unwrapOr(result, null);

if (!keys) {
  // Handle no keys
  return;
}

// Use keys
```

#### Pattern 4: Chain Operations

```typescript
const result = await Result.fromAsync(async () => {
  const pairResult = await pair();
  const keys = Result.unwrap(pairResult);

  const signResult = await sign(data, keys);
  const signature = Result.unwrap(signResult);

  return signature;
});

if (result.ok) {
  console.log('Signature:', result.value);
}
```

### Testing Patterns

#### Isolated Graphs

```typescript
import { createGraph } from '@ariob/core';

describe('TodoList', () => {
  let testGraph: GunInstance;

  beforeEach(() => {
    // Create isolated graph for each test
    testGraph = createGraph({ localStorage: false });
  });

  it('should add todo', async () => {
    const todoColl = collection('test-todos');
    const ref = testGraph.get('todos');

    todoColl.map(ref, TodoSchema);

    const result = await todoColl.set(ref, {
      title: 'Test todo',
      done: false
    }, TodoSchema);

    expect(result.ok).toBe(true);
  });
});
```

#### Mock Results

```typescript
// Mock crypto functions
jest.mock('@ariob/core', () => ({
  ...jest.requireActual('@ariob/core'),
  pair: jest.fn(() => Promise.resolve(
    Result.ok({
      pub: 'test-pub',
      priv: 'test-priv',
      epub: 'test-epub',
      epriv: 'test-epriv'
    })
  ))
}));
```

### Schema Composition

Reuse schemas across your app:

```typescript
// Base schemas
const TimestampSchema = z.object({
  created: z.number(),
  updated: z.number().optional()
});

const AuthorSchema = z.object({
  authorId: z.string(),
  authorName: z.string()
});

// Composed schemas
const PostSchema = Thing.merge(TimestampSchema).merge(AuthorSchema).extend({
  title: z.string(),
  content: z.string()
});

const CommentSchema = Thing.merge(TimestampSchema).merge(AuthorSchema).extend({
  postId: z.string(),
  text: z.string()
});
```

### Background Thread Safety

SEA is lazy-loaded to ensure thread safety:

```typescript
'background only';

// This works in background thread
import { pair, sign, encrypt } from '@ariob/core';

const keys = await pair(); // Lazy-loads SEA
const signature = await sign(data, keys.value);
const encrypted = await encrypt(data, keys.value);
```

**Why?**
LynxJS runs heavy operations in background thread. Lazy-loading SEA prevents main thread blocking and ensures crypto operations are thread-safe.

## 📖 API Reference

### Schema

| Export | Type | Description |
|--------|------|-------------|
| `Thing` | `ZodObject` | Base schema with optional `#` (soul) |
| `Who` | `ZodObject` | Thing + `pub`, `epub`, `alias` |
| `z` | Re-export | Zod for schema building |

### Graph

| Function | Signature | Description |
|----------|-----------|-------------|
| `graph()` | `(options?: GunOptions) => GunInstance` | Get/init singleton graph |
| `createGraph()` | `(options?: GunOptions) => GunInstance` | Create isolated graph |
| `useGraphStore` | Zustand store | Direct store access |

### Node

| Function | Signature | Description |
|----------|-----------|-------------|
| `node()` | `(key: string, config?) => NodeAPI` | Create node manager |
| `.on()` | `(ref, schema?) => void` | Subscribe to node |
| `.off()` | `() => void` | Unsubscribe |
| `.get()` | `() => T \| null` | Get current data |
| `.put()` | `(ref, data, schema?) => Promise<Result>` | Save data |
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
| `.loading()` | `() => boolean` | Get loading state |
| `.error()` | `() => Error \| null` | Get error state |
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
| `certify()` | `(certificants, policy, authority) => Promise<Result<any, Error>>` | Create certificate |

### Auth

| Function | Signature | Description |
|----------|-----------|-------------|
| `auth()` | `(graph) => AuthAPI` | Create auth manager |
| `.create()` | `(alias) => Promise<AuthResult>` | Create account |
| `.login()` | `(keys) => Promise<AuthResult>` | Login with keys |
| `.logout()` | `() => void` | Logout |
| `.recall()` | `() => Promise<AuthResult>` | Recall session |
| `create()` | `(alias, graph) => Promise<AuthResult>` | Standalone create |
| `login()` | `(keys, graph) => Promise<AuthResult>` | Standalone login |
| `logout()` | `(graph) => void` | Standalone logout |
| `recall()` | `(graph) => Promise<AuthResult>` | Standalone recall |
| `useAuth()` | `(graph) => AuthHook` | React hook |

### Result

| Function | Signature | Description |
|----------|-----------|-------------|
| `Result.ok()` | `<T>(value: T) => Ok<T>` | Create success |
| `Result.error()` | `<E>(error: E) => Err<E>` | Create failure |
| `Result.from()` | `<T>(fn) => Result<T, Error>` | Catch exceptions |
| `Result.fromAsync()` | `<T>(fn) => Promise<Result<T, Error>>` | Catch async exceptions |
| `Result.map()` | `<T, U>(result, fn) => Result<U, E>` | Transform value |
| `Result.mapError()` | `<T, E, F>(result, fn) => Result<T, F>` | Transform error |
| `Result.chain()` | `<T, U>(result, fn) => Result<U, E>` | Chain operations |
| `Result.unwrap()` | `<T>(result) => T` | Get value or throw |
| `Result.unwrapOr()` | `<T>(result, default) => T` | Get value or default |
| `Result.match()` | `<T, E, R>(result, handlers) => R` | Pattern match |
| `Result.all()` | `<T>(results) => Result<T[], E>` | All must succeed |
| `Result.collect()` | `<T>(results) => Result<T[], E[]>` | Collect all errors |
| `Result.parse()` | `<T>(schema, data) => Result<T, ZodError>` | Zod validation |
| `isOk()` | `<T, E>(result) => result is Ok<T>` | Type guard |
| `isErr()` | `<T, E>(result) => result is Err<E>` | Type guard |

## 💡 Real-World Examples

See the comprehensive examples in the [Quick Start](#-quick-start) and [Core Primitives](#-core-primitives) sections above for real-world usage patterns including:

- Todo App with Authentication
- Encrypted Messaging
- Schema Validation
- Error Handling

## 🏗 Architecture

### Design Decisions

#### Why Result Monad?

Traditional exception handling:
```typescript
try {
  const keys = await pair();
  const signature = await sign(data, keys);
} catch (err) {
  // Which operation failed?
  // What type is err?
}
```

Result monad:
```typescript
const pairResult = await pair();
if (!pairResult.ok) {
  // Type-safe error handling
  console.error('Keypair generation failed:', pairResult.error.message);
  return;
}

const signResult = await sign(data, pairResult.value);
if (!signResult.ok) {
  console.error('Signing failed:', signResult.error.message);
  return;
}

// TypeScript knows both succeeded
const signature = signResult.value;
```

Benefits:
- Explicit error handling
- Type-safe error values
- Composable operations
- No hidden control flow

#### Why Zustand?

Zustand provides:
- Minimal boilerplate
- No Provider wrapper
- Direct store access
- Persist middleware
- React hooks
- TypeScript-first

Compared to Redux/Context:
```typescript
// Redux: 100+ lines for store setup
// Context: Provider wrapper hell
// Zustand: 10 lines, done

const useNodeStore = create<NodeStore>((set, get) => ({
  nodes: {},
  get: (key) => get().nodes[key]?.data ?? null
}));
```

#### Why Lazy-Loading SEA?

LynxJS background threads:
```typescript
// ❌ Load SEA on main thread = UI freeze
import SEA from './gun/lib/sea.js';

// ✅ Lazy-load in background thread
'background only';
async function getSEA() {
  const { default: SEA } = await import('./gun/lib/sea.js');
  return SEA;
}
```

SEA is heavy (~200kb), lazy-loading ensures:
- Main thread never blocks
- Background thread isolation
- On-demand initialization

#### Why One-Word Functions?

Following Gun conventions:
```typescript
// Gun API
gun.get('users').put(data);

// @ariob/core API
node('user').put(ref, data);
collection('todos').set(ref, item);

// Crypto
pair();
sign();
encrypt();
```

One-word functions:
- Memorable
- Scannable
- Composable
- Follow Unix philosophy

### Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                       React UI                           │
│                  (useNode, useAuth)                      │
└─────────────────────┬────────────────────────────────────┘
                      │
                      │ Subscribe/Commands
                      │
┌─────────────────────▼────────────────────────────────────┐
│                  Zustand Stores                          │
│        (useNodeStore, useAuthStore, etc.)                │
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
├── schema.ts       # Zod schemas (Thing, Who)
├── graph.ts        # Gun instance management
├── node.ts         # Single object operations
├── collection.ts   # Set/map operations
├── crypto.ts       # SEA cryptography
├── auth.ts         # Authentication
├── config.ts       # Peer management & profiles
├── mesh.ts         # DAM-aware monitoring
├── result.ts       # Result monad
└── index.ts        # Clean exports
```

Each module:
- Single responsibility
- No cross-dependencies (except Result)
- Background-thread safe
- Fully typed
- Tested independently

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Integration Tests

```typescript
import { createGraph, node, collection } from '@ariob/core';

describe('Todo Integration', () => {
  let graph: GunInstance;

  beforeEach(() => {
    graph = createGraph({ localStorage: false });
  });

  it('should create and retrieve todo', async () => {
    const todoNode = node('test-todo');
    const ref = graph.get('todos').get('test-todo');

    // Subscribe
    todoNode.on(ref);

    // Put data
    const result = await todoNode.put(ref, {
      title: 'Test',
      done: false
    });

    expect(result.ok).toBe(true);

    // Wait for sync
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get data
    const data = todoNode.get();
    expect(data).toEqual({
      title: 'Test',
      done: false
    });
  });
});
```

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

1. **Code Style** — Follow existing patterns, one-word functions
2. **Type Safety** — Full TypeScript coverage required
3. **Result Pattern** — All fallible operations return Result
4. **Background Safety** — Mark background-only code
5. **Tests** — Unit tests for all primitives
6. **Documentation** — JSDoc comments + examples

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
- [Rust](https://www.rust-lang.org/) — Result type inspiration

---

<div align="center">

**Built with ❤️ for distributed, encrypted applications**

[Report Bug](https://github.com/ariobstudio/ariob/issues) • [Request Feature](https://github.com/ariobstudio/ariob/issues)

</div>

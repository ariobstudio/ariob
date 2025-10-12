# @ariob/core

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Gun.js](https://img.shields.io/badge/Gun.js-2C3E50?style=for-the-badge&logo=javascript&logoColor=white)](https://gun.eco/)

A minimal, type-safe Gun.js wrapper for React applications.

[Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Examples](#-examples) • [Documentation](#-documentation)

</div>

---

## 🎯 Overview

**@ariob/core** is a minimal wrapper around Gun.js that provides a type-safe, React-friendly API for building decentralized real-time applications.

### Why @ariob/core?

- **🎨 Simple & Clean**: Minimal abstraction over Gun.js primitives
- **🔒 Type-Safe**: Full TypeScript support with generic types
- **⚡ Real-time**: Automatic synchronization across devices
- **🔐 Encrypted**: Optional end-to-end encryption with SEA
- **🪝 Hook-Based**: Convex-inspired React hooks for ergonomic data access
- **🌐 Decentralized**: Peer-to-peer by nature, no central server required

## ✨ Features

- **Graph API** — `createGraph()` for Gun instance creation
- **Single Nodes** — `useNode()` for individual data points
- **Collections** — `useSet()` for managing arrays/lists
- **Authentication** — `useAuth()` for user management
- **Encryption** — `useKeys()` for automatic encryption/decryption
- **Result Type** — Type-safe error handling with `Result<T, E>`
- **SEA Cryptography** — Full SEA API with Result-based helpers
- **Validation** — Zod integration for schema validation
- **Real-time Sync** — Automatic updates across all connected peers
- **TypeScript** — Complete type safety with generics
- **Zero Config** — Works out of the box with sensible defaults

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add @ariob/core

# Using npm
npm install @ariob/core

# Using yarn
yarn add @ariob/core
```

## 🚀 Quick Start

```typescript
import { createGraph, useNode, useSet, useAuth } from '@ariob/core';

// 1. Create a graph instance
const graph = createGraph({
  peers: ['https://gun-relay.example.com/gun'], // Optional peer servers
  localStorage: true // Optional persistence
});

// 2. Use in your React components
function TodoApp() {
  const { user, isLoggedIn, login } = useAuth(graph);
  const todosRef = graph.user().get('todos');
  const { items, add, update, remove } = useSet(todosRef);

  const handleAddTodo = async () => {
    await add({
      title: 'Learn @ariob/core',
      done: false,
      createdAt: Date.now()
    });
  };

  return (
    <div>
      {isLoggedIn ? (
        <>
          <h1>Hello, {user.alias}!</h1>
          <button onClick={handleAddTodo}>Add Todo</button>
          <ul>
            {items.map(({ id, data }) => (
              <li key={id}>
                <input
                  type="checkbox"
                  checked={data.done}
                  onChange={() => update(id, { done: !data.done })}
                />
                {data.title}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <button onClick={() => login('alice', 'password123')}>
          Login
        </button>
      )}
    </div>
  );
}
```

> ★ **Insight**: Think of Gun as a graph database where every node has a unique path. `useNode()` subscribes to a single node, while `useSet()` subscribes to all children of a node, perfect for collections.

## 📚 API Reference

### createGraph()

Factory function to create a Gun instance.

```typescript
const graph = createGraph(options?: GunOptions)
```

**Options:**
- `peers?: string[]` — Relay server URLs for peer-to-peer sync
- `localStorage?: boolean` — Enable browser persistence (default: false)
- `radisk?: boolean` — Enable RadixDB storage adapter (default: false)

**Examples:**

```typescript
// Local-only (no sync)
const graph = createGraph();

// With peer sync
const graph = createGraph({
  peers: ['wss://gun-relay.example.com/gun']
});

// With persistence
const graph = createGraph({
  localStorage: true
});
```

---

### useNode()

Hook for single node operations. Subscribes to real-time updates.

```typescript
const result = useNode<T>(ref: GunNode, keys?: KeyPair)
```

**Returns:**
- `data: T | null` — Current node data
- `put: (data: Partial<T> | null) => Promise<void>` — Update node
- `remove: () => Promise<void>` — Delete node
- `isLoading: boolean` — Loading state
- `error: Error | null` — Error state

**Examples:**

```typescript
// Read and update a user profile
interface Profile {
  name: string;
  bio: string;
  avatar?: string;
}

function UserProfile() {
  const graph = createGraph();
  const profileRef = graph.user().get('profile');
  const { data, put, isLoading } = useNode<Profile>(profileRef);

  const updateName = async (name: string) => {
    await put({ name });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>{data?.bio}</p>
      <button onClick={() => updateName('Alice')}>
        Update Name
      </button>
    </div>
  );
}
```

```typescript
// With encryption
const keys = useKeys();
const secretRef = graph.user().get('secrets');
const { data, put } = useNode(secretRef, keys);

// Data is automatically encrypted when written
await put({ apiKey: 'secret123' });

// And automatically decrypted when read
console.log(data.apiKey); // 'secret123'
```

---

### useSet()

Hook for collection operations. Manages arrays of items with real-time sync.

```typescript
const result = useSet<T>(ref: GunNode, keys?: KeyPair)
```

**Returns:**
- `items: Array<{ id: string, data: T }>` — Collection items
- `add: (data: T, id?: string) => Promise<void>` — Add new item
- `update: (id: string, data: Partial<T>) => Promise<void>` — Update item
- `remove: (id: string) => Promise<void>` — Remove item
- `isLoading: boolean` — Loading state
- `error: Error | null` — Error state

**Examples:**

```typescript
// Manage a todo list
interface Todo {
  title: string;
  done: boolean;
  createdAt: number;
}

function TodoList() {
  const graph = createGraph();
  const todosRef = graph.get('todos');
  const { items, add, update, remove } = useSet<Todo>(todosRef);

  const addTodo = async (title: string) => {
    await add({
      title,
      done: false,
      createdAt: Date.now()
    });
  };

  return (
    <div>
      <button onClick={() => addTodo('New task')}>Add Todo</button>
      <ul>
        {items.map(({ id, data }) => (
          <li key={id}>
            <input
              type="checkbox"
              checked={data.done}
              onChange={() => update(id, { done: !data.done })}
            />
            {data.title}
            <button onClick={() => remove(id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

> ★ **Insight**: The `items` array is sorted by Gun's internal ordering. For custom sorting, use standard JavaScript array methods: `[...items].sort((a, b) => a.data.createdAt - b.data.createdAt)`.

---

### useAuth()

Hook for authentication management with Gun SEA.

```typescript
const auth = useAuth(graph: Gun)
```

**Returns:**
- `user: UserInfo | null` — Current user info (pub, epub, alias)
- `isLoggedIn: boolean` — Login status
- `keys: KeyPair | null` — User's cryptographic keys
- `login: (alias: string, password: string) => Promise<void>` — Login with credentials
- `loginWithKeys: (pair: KeyPair) => Promise<void>` — Login with key pair
- `create: (alias: string, password: string) => Promise<void>` — Create new user
- `logout: () => void` — Logout current user

**Examples:**

```typescript
// Traditional authentication
function LoginForm() {
  const graph = createGraph();
  const { login, create, isLoggedIn, user } = useAuth(graph);
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(alias, password);
      console.log('Logged in as', user?.alias);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignup = async () => {
    try {
      await create(alias, password);
      console.log('Account created!');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  if (isLoggedIn) {
    return <div>Welcome, {user?.alias}!</div>;
  }

  return (
    <div>
      <input value={alias} onChange={e => setAlias(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
}
```

```typescript
// Key-based authentication
function KeyAuth() {
  const graph = createGraph();
  const { loginWithKeys, logout, isLoggedIn } = useAuth(graph);

  const handleImportKeys = async (file: File) => {
    const text = await file.text();
    const keys = JSON.parse(text);
    await loginWithKeys(keys);
  };

  return isLoggedIn ? (
    <button onClick={logout}>Logout</button>
  ) : (
    <input type="file" onChange={e => handleImportKeys(e.target.files[0])} />
  );
}
```

---

### useKeys()

Hook for cryptographic key generation. Used for encryption/decryption.

```typescript
const keys = useKeys(existingKeys?: KeyPair)
```

**Returns:** `KeyPair | null` — Generated or provided key pair

**Examples:**

```typescript
// Generate new keys
function KeyManager() {
  const keys = useKeys();

  const exportKeys = () => {
    const json = JSON.stringify(keys);
    const blob = new Blob([json], { type: 'application/json' });
    // ... download logic
  };

  return (
    <div>
      <p>Public Key: {keys?.pub.slice(0, 20)}...</p>
      <button onClick={exportKeys}>Export Keys</button>
    </div>
  );
}
```

```typescript
// Use existing keys
function EncryptedData() {
  const savedKeys = loadKeysFromStorage();
  const keys = useKeys(savedKeys);

  const dataRef = graph.user().get('encrypted-data');
  const { data, put } = useNode(dataRef, keys);

  // Data is automatically encrypted/decrypted
  await put({ secret: 'confidential' });
}
```

---

### Result Type System

Type-safe error handling inspired by Rust's `Result<T, E>`. Makes errors explicit in function signatures.

```typescript
import { Result, isOk, isErr } from '@ariob/core';
```

**Core Functions:**

- `Result.ok(value)` — Create successful result
- `Result.error(error)` — Create error result
- `Result.parse(schema, data)` — Validate with Zod schema
- `Result.match(result, { ok, error })` — Pattern matching
- `Result.map(result, fn)` — Transform success value
- `Result.chain(result, fn)` — Chain operations
- `Result.all(results)` — Combine multiple results
- `isOk(result)` — Type guard for success
- `isErr(result)` — Type guard for error

**Examples:**

```typescript
import { Result } from '@ariob/core';
import { z } from 'zod';

// Validation with Zod
const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(18)
});

function validateUser(data: unknown) {
  const result = Result.parse(UserSchema, data);

  if (result.ok) {
    console.log('Valid user:', result.value);
    // TypeScript knows result.value is User
  } else {
    console.error('Validation failed:', result.error.issues);
    // TypeScript knows result.error is ZodError
  }
}

// Pattern matching
const result = Result.parse(UserSchema, userData);

Result.match(result, {
  ok: (user) => console.log('Welcome', user.name),
  error: (err) => console.error('Invalid:', err.issues)
});

// Transform values
const ageResult = Result.map(result, (user) => user.age);

// Chain operations
const encrypted = Result.chain(
  Result.parse(UserSchema, data),
  (user) => encrypt(user, keys)
);

// Combine multiple results
const results = Result.all([
  Result.parse(schema1, data1),
  Result.parse(schema2, data2),
  Result.parse(schema3, data3)
]);

if (results.ok) {
  const [val1, val2, val3] = results.value;
}
```

> ★ **Insight**: Result types make errors explicit and type-safe. Unlike try-catch, you can't forget to handle errors—TypeScript forces you to check `result.ok` before accessing the value.

---

### SEA Cryptography

Complete Gun SEA (Security, Encryption, Authorization) API with Result-based error handling.

```typescript
import { encrypt, decrypt, work, secret, sign, verify, pair, certify } from '@ariob/core';
```

#### encrypt()

Encrypts data using SEA encryption.

```typescript
const result = await encrypt(data: any, keys: KeyPair): Promise<Result<any, Error>>
```

**Example:**

```typescript
const keys = await pair();
const encrypted = await encrypt({ secret: 'confidential' }, keys.value);

if (encrypted.ok) {
  console.log('Encrypted:', encrypted.value);
}
```

#### decrypt()

Decrypts data using SEA decryption.

```typescript
const result = await decrypt(data: any, keys: KeyPair): Promise<Result<any, Error>>
```

**Example:**

```typescript
const decrypted = await decrypt(encryptedData, keys);

Result.match(decrypted, {
  ok: (data) => console.log('Decrypted:', data),
  error: (err) => console.error('Decryption failed:', err)
});
```

#### work()

Performs proof-of-work hashing (PBKDF2).

```typescript
const result = await work(data: any, salt?: string): Promise<Result<string, Error>>
```

**Example:**

```typescript
// Hash a password
const hashed = await work('password123', 'optional-salt');

if (hashed.ok) {
  // Store hashed.value safely
  console.log('Hash:', hashed.value);
}
```

#### secret()

Generates shared secret using ECDH (Elliptic Curve Diffie-Hellman).

```typescript
const result = await secret(theirEpub: string, myPair: KeyPair): Promise<Result<string, Error>>
```

**Example:**

```typescript
// Create shared encryption key between two users
const sharedSecret = await secret(alicePublicKey, bobKeys);

if (sharedSecret.ok) {
  // Use sharedSecret.value to encrypt messages between Alice and Bob
}
```

#### sign()

Signs data cryptographically.

```typescript
const result = await sign(data: any, pair: KeyPair): Promise<Result<any, Error>>
```

**Example:**

```typescript
const message = { text: 'Hello, world!', timestamp: Date.now() };
const signed = await sign(message, userKeys);

if (signed.ok) {
  // signed.value contains the signature
  await graph.get('messages').set(signed.value);
}
```

#### verify()

Verifies a signature.

```typescript
const result = await verify(signature: any, pub: string | KeyPair): Promise<Result<any, Error>>
```

**Example:**

```typescript
const verified = await verify(signedMessage, userPublicKey);

if (verified.ok) {
  console.log('Verified message:', verified.value);
} else {
  console.error('Invalid signature');
}
```

#### pair()

Generates a new cryptographic key pair.

```typescript
const result = await pair(): Promise<Result<KeyPair, Error>>
```

**Example:**

```typescript
const keys = await pair();

if (keys.ok) {
  console.log('Public key:', keys.value.pub);
  console.log('Encryption key:', keys.value.epub);
  // Save keys.value securely
}
```

#### certify()

Creates a certificate for selective authorization.

```typescript
const result = await certify(
  certificants: any,
  policy: any,
  authority: KeyPair,
  cb?: any
): Promise<Result<any, Error>>
```

**Example:**

```typescript
// Grant write access to specific users
const cert = await certify(
  [userPublicKey],
  { '+': '*', '.': 'posts' }, // Can write to 'posts'
  authorityKeys
);

if (cert.ok) {
  // Share cert.value with the user
}
```

> ★ **Insight**: SEA functions are cryptographically secure and work in both browser and Node.js. Use `work()` for password hashing, `secret()` for end-to-end encryption between users, and `certify()` for fine-grained access control.

---

### useAuthStore()

Zustand store for advanced auth state management.

```typescript
const store = useAuthStore()
```

**Returns:**
- `user: UserInfo | null` — Current user
- `keys: KeyPair | null` — Current keys
- `isLoggedIn: boolean` — Login status
- `setUser: (user: UserInfo) => void` — Update user
- `setKeys: (keys: KeyPair) => void` — Update keys
- `reset: () => void` — Clear auth state

> ⚠️ **Note**: This is a low-level API. Most users should use `useAuth()` instead.

## 💡 Real-World Examples

### Real-time Chat Room

```typescript
import { createGraph, useSet, useAuth } from '@ariob/core';

interface Message {
  text: string;
  author: string;
  timestamp: number;
}

function ChatRoom({ roomId }: { roomId: string }) {
  const graph = createGraph({
    peers: ['wss://gun-relay.example.com/gun']
  });

  const { user, isLoggedIn } = useAuth(graph);
  const messagesRef = graph.get('rooms').get(roomId).get('messages');
  const { items: messages, add } = useSet<Message>(messagesRef);

  const [text, setText] = useState('');

  const sendMessage = async () => {
    if (!text.trim() || !isLoggedIn) return;

    await add({
      text,
      author: user.alias,
      timestamp: Date.now()
    });

    setText('');
  };

  // Sort messages by timestamp
  const sortedMessages = [...messages].sort(
    (a, b) => a.data.timestamp - b.data.timestamp
  );

  return (
    <div>
      <div>
        {sortedMessages.map(({ id, data }) => (
          <div key={id}>
            <strong>{data.author}</strong>: {data.text}
            <small>{new Date(data.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      {isLoggedIn && (
        <div>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}
```

### Encrypted User Profile

```typescript
import { createGraph, useNode, useKeys, useAuth } from '@ariob/core';

interface Profile {
  name: string; // Public
  bio: string; // Public
  email: string; // Private
  phone: string; // Private
}

function ProfileEditor() {
  const graph = createGraph();
  const { isLoggedIn } = useAuth(graph);
  const keys = useKeys();

  const profileRef = graph.user().get('profile');
  const { data, put, isLoading } = useNode<Profile>(profileRef, keys);

  const [formData, setFormData] = useState<Profile>({
    name: '',
    bio: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleSave = async () => {
    // Email and phone are automatically encrypted
    await put(formData);
  };

  if (!isLoggedIn) return <div>Please login</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <input
        placeholder="Name (public)"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
      />
      <textarea
        placeholder="Bio (public)"
        value={formData.bio}
        onChange={e => setFormData({ ...formData, bio: e.target.value })}
      />
      <input
        placeholder="Email (encrypted)"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        placeholder="Phone (encrypted)"
        value={formData.phone}
        onChange={e => setFormData({ ...formData, phone: e.target.value })}
      />
      <button onClick={handleSave}>Save Profile</button>
    </div>
  );
}
```

### Validated Note Taking

```typescript
import { createGraph, useSet, Result } from '@ariob/core';
import { z } from 'zod';

// Define schema for validation
const NoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  createdAt: z.number(),
  tags: z.array(z.string()).optional()
});

type Note = z.infer<typeof NoteSchema>;

function NotesApp() {
  const graph = createGraph();
  const notesRef = graph.user().get('notes');
  const { items, add } = useSet<Note>(notesRef);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleCreate = async () => {
    // Validate before saving
    const result = Result.parse(NoteSchema, {
      title,
      content: content || undefined,
      createdAt: Date.now()
    });

    // Pattern matching for clean error handling
    await Result.match(result, {
      ok: async (validNote) => {
        await add(validNote);
        setTitle('');
        setContent('');
        console.log('Note saved!');
      },
      error: (err) => {
        console.error('Validation failed:', err.issues);
        // Show user-friendly error messages
        err.issues.forEach(issue => {
          alert(`${issue.path.join('.')}: ${issue.message}`);
        });
      }
    });
  };

  return (
    <div>
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Content (optional)"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <button onClick={handleCreate}>Save Note</button>

      <div>
        {items.map(({ id, data }) => (
          <div key={id}>
            <h3>{data.title}</h3>
            <p>{data.content}</p>
            <small>{new Date(data.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

> ★ **Insight**: Using `Result.parse()` with Zod ensures data is validated before saving. No try-catch needed—just clean pattern matching with full type safety.

---

### Collaborative Counter

```typescript
import { createGraph, useNode } from '@ariob/core';

interface Counter {
  value: number;
  lastUpdated: number;
}

function CollaborativeCounter() {
  const graph = createGraph({
    peers: ['wss://gun-relay.example.com/gun']
  });

  const counterRef = graph.get('shared-counter');
  const { data: counter, put, isLoading } = useNode<Counter>(counterRef);

  const increment = async () => {
    await put({
      value: (counter?.value ?? 0) + 1,
      lastUpdated: Date.now()
    });
  };

  const reset = async () => {
    await put({
      value: 0,
      lastUpdated: Date.now()
    });
  };

  if (isLoading && !counter) return <div>Loading...</div>;

  return (
    <div>
      <h1>{counter?.value ?? 0}</h1>
      {counter?.lastUpdated && (
        <small>Updated: {new Date(counter.lastUpdated).toLocaleTimeString()}</small>
      )}
      <button onClick={increment}>+1</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

> ★ **Insight**: All connected peers see updates in real-time. When one user increments the counter, all other users' UIs update automatically!

## 🔐 TypeScript Support

**@ariob/core** is written in TypeScript and provides complete type definitions.

### Generic Types

All hooks support generic types for full type safety:

```typescript
interface Todo {
  title: string;
  done: boolean;
  tags?: string[];
}

// Type-safe node operations
const { data, put } = useNode<Todo>(todoRef);

// TypeScript knows data is Todo | null
if (data) {
  console.log(data.title); // ✅ OK
  console.log(data.invalid); // ❌ Type error
}

// put() only accepts Todo-compatible data
await put({ title: 'New', done: false }); // ✅ OK
await put({ invalid: 'field' }); // ❌ Type error

// Type-safe collection operations
const { items, add } = useSet<Todo>(todosRef);

// items is Array<{ id: string, data: Todo }>
items.forEach(({ id, data }) => {
  console.log(data.title); // ✅ OK
});

// add() only accepts Todo objects
await add({ title: 'Task', done: false }); // ✅ OK
await add({ wrong: 'type' }); // ❌ Type error
```

### Type Exports

```typescript
import type {
  Gun,
  GunNode,
  GunUser,
  GunOptions,
  KeyPair,
  UserInfo,
  UseNodeResult,
  UseSetResult,
  CollectionItem,
  // Result types
  Result,
  Ok,
  Err
} from '@ariob/core';
```

## 🎯 Best Practices

### 1. Create Graph Instance at App Level

Don't create a new graph in every component. Create once and pass down or use React Context.

```typescript
// ✅ Good: Create once
const graph = createGraph({ localStorage: true });

function App() {
  return <TodoList graph={graph} />;
}

// ❌ Bad: Creates new instance on every render
function TodoList() {
  const graph = createGraph(); // New instance!
  // ...
}
```

### 2. Use Encryption for Private Data

Always use `useKeys()` with `useNode()` or `useSet()` for sensitive data.

```typescript
// ✅ Good: Encrypted
const keys = useKeys();
const { data, put } = useNode(privateRef, keys);
await put({ secretData: 'value' });

// ⚠️ Caution: Unencrypted (public data)
const { data, put } = useNode(publicRef);
await put({ publicData: 'value' });
```

### 3. Handle Loading States

Always check `isLoading` before rendering data-dependent UI.

```typescript
// ✅ Good: Handles loading
const { data, isLoading } = useNode(ref);

if (isLoading && !data) {
  return <div>Loading...</div>;
}

return <div>{data?.value}</div>;

// ❌ Bad: No loading state
const { data } = useNode(ref);
return <div>{data.value}</div>; // Crashes if data is null
```

### 4. Debounce Rapid Updates

For high-frequency updates (like typing), debounce your put operations.

```typescript
import { useMemo } from 'react';

function TextEditor() {
  const { data, put } = useNode(docRef);

  // Debounce saves to every 1 second
  const debouncedPut = useMemo(
    () => debounce(put, 1000),
    [put]
  );

  return (
    <textarea
      value={data?.text}
      onChange={e => debouncedPut({ text: e.target.value })}
    />
  );
}
```

### 5. Clean Up Subscriptions

Gun subscriptions are automatically cleaned up when components unmount. No manual cleanup needed!

```typescript
function MyComponent() {
  const { data } = useNode(ref); // ✅ Auto cleanup on unmount
  return <div>{data?.value}</div>;
}
```

## 🔧 Troubleshooting

### Data Not Syncing

**Problem:** Changes aren't appearing on other devices.

**Solution:** Ensure you're using the same peer server URL and node path.

```typescript
// ✅ Same peers and path
const graph1 = createGraph({ peers: ['wss://peer.wallie.io/gun'] });
const graph2 = createGraph({ peers: ['wss://peer.wallie.io/gun'] });
graph1.get('shared-data'); // Both reference same node
graph2.get('shared-data');

// ❌ Different peers
const graph1 = createGraph({ peers: ['wss://peer1.com/gun'] });
const graph2 = createGraph({ peers: ['wss://peer2.com/gun'] });
```

### Encryption Errors

**Problem:** `SEA.encrypt` or `SEA.decrypt` errors.

**Solution:** Ensure keys are generated and valid before using encryption.

```typescript
// ✅ Good: Check keys exist
const keys = useKeys();
const { put } = useNode(ref, keys);

if (keys) {
  await put({ secret: 'value' });
}

// ❌ Bad: Keys might be null
const keys = useKeys();
const { put } = useNode(ref, keys); // Error if keys is null
await put({ secret: 'value' });
```

### Type Errors with Gun

**Problem:** TypeScript complains about Gun types.

**Solution:** Use type assertions or the provided type exports.

```typescript
import type { GunNode } from '@ariob/core';

// ✅ Type-safe
const ref: GunNode = graph.get('data');
const { data } = useNode(ref);

// Or let TypeScript infer
const ref = graph.get('data');
const { data } = useNode(ref);
```

### Memory Leaks

**Problem:** App performance degrades over time.

**Solution:** Hooks automatically clean up subscriptions. Ensure you're not creating new graph instances in render loops.

```typescript
// ✅ Good: Single instance
const graph = useMemo(() => createGraph(), []);

// ❌ Bad: New instance every render
const graph = createGraph(); // Memory leak!
```

## 📖 Philosophy

**@ariob/core** follows the UNIX philosophy:

- **Do one thing well**: Each hook has a single, clear purpose
- **Composable**: Mix and match hooks as needed
- **Minimal**: No unnecessary abstractions
- **Stable**: Built on proven Gun.js primitives

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`pnpm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Add JSDoc comments to public APIs
- Include usage examples in documentation
- Write unit tests for new features
- Use conventional commits

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Gun.js](https://gun.eco/) — Graph database and P2P sync
- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [Zod](https://zod.dev/) — Runtime validation
- [Convex](https://convex.dev/) — Inspiration for ergonomic hook design

---

<div align="center">

**Built with ❤️ for the Ariob ecosystem**

[Report Bug](https://github.com/ariobstudio/ariob/issues) • [Request Feature](https://github.com/ariobstudio/ariob/issues)

</div>

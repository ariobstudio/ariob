# @ariob/core API Documentation

> Type-safe Gun.js hooks for LynxJS applications with encryption, validation, and Result-based error handling

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Core Hooks](#core-hooks)
   - [useNode](#usenode)
   - [useSet](#useset)
   - [useAuth](#useauth)
4. [Cryptography](#cryptography)
5. [Result Type System](#result-type-system)
6. [Schema Validation](#schema-validation)
7. [Advanced Patterns](#advanced-patterns)
8. [API Reference](#api-reference)
9. [Best Practices](#best-practices)

---

## Overview

**@ariob/core** is a comprehensive Gun.js wrapper library that provides type-safe React hooks optimized for LynxJS's dual-thread architecture. It combines Gun's decentralized real-time database with modern React patterns, encryption, and runtime validation.

### Key Features

- **🧵 Thread-Safe**: Built for LynxJS dual-thread architecture (main thread for UI, background thread for Gun.js)
- **🔐 Encryption**: Automatic SEA encryption/decryption when keys provided
- **✅ Validation**: Optional Zod schema validation for runtime type safety
- **🎯 Type-Safe**: Full TypeScript support with comprehensive type definitions
- **⚡ Reactive**: Real-time updates with automatic state synchronization
- **🦀 Result-based**: Rust-inspired Result<T, E> error handling
- **📦 Code Splitting**: Lazy-loaded crypto modules reduce initial bundle size

### When to Use Which Hook

```typescript
// Single node operations (key-value storage)
useNode()  // ← For: user profiles, settings, document metadata

// Collection operations (sets/arrays)
useSet()   // ← For: chat messages, todo lists, feeds

// Authentication
useAuth()  // ← For: user login, key management, session handling
```

---

## Getting Started

### Installation

The package is already installed in the Ariob monorepo as `@ariob/core`.

### Basic Setup

```typescript
import { createGraph, useNode, useSet, useAuth } from '@ariob/core';

function App() {
  // 1. Create Gun instance (runs on background thread)
  const graph = createGraph({
    peers: ['http://localhost:8765/gun'],
    localStorage: true
  });

  // 2. Use hooks to interact with data
  const userRef = graph.get('users').get('alice');
  const { data, put } = useNode(userRef);

  return (
    <view>
      <text>{data?.name}</text>
    </view>
  );
}
```

### Thread Directives

**IMPORTANT**: All Gun operations must run on the background thread in LynxJS.

```typescript
// ✅ CORRECT - Hook handles thread context automatically
const { data, put } = useNode(userRef);

// ✅ CORRECT - Explicit directive in callbacks
const handleSave = async () => {
  'background only';
  await put({ name: 'Alice' });
};

// ❌ WRONG - Never use Gun on main thread
function handleAnimation(event) {
  'main thread';
  put({ name: 'Alice' }); // ERROR!
}
```

---

## Core Hooks

### useNode

Hook for managing a single Gun node with real-time updates. Ideal for user profiles, settings, and document metadata.

#### Signature

```typescript
function useNode<T = any>(
  ref: IGunChainReference | null,
  keys?: KeyPair,
  schema?: z.ZodSchema<T>
): UseNodeResult<T>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ref` | `IGunChainReference \| null` | Yes | Gun chain reference to the node (null to disable) |
| `keys` | `KeyPair` | No | Optional key pair for automatic encryption/decryption |
| `schema` | `z.ZodSchema<T>` | No | Optional Zod schema for runtime validation |

#### Returns

```typescript
interface UseNodeResult<T> {
  data: T | null;              // Current node data (null if not loaded)
  put: (data: Partial<T> | null) => Promise<void>;  // Update node
  remove: () => Promise<void>; // Delete node (sets to null)
  isLoading: boolean;          // Loading state
  error: Error | null;         // Error that occurred
}
```

#### Example: Basic Usage

```typescript
const graph = createGraph({ peers: ['http://localhost:8765/gun'] });
const userRef = graph.get('users').get('alice');
const { data, put, isLoading, error } = useNode(userRef);

// Update data
await put({ name: 'Alice', age: 30 });

// Read data
console.log(data?.name); // "Alice"
```

#### Example: With Encryption

```typescript
import { pair } from '@ariob/core';

// Generate key pair
const keyResult = await pair();
if (!keyResult.ok) {
  console.error('Key generation failed');
  return;
}

const userKeys = keyResult.value;

// Use hook with encryption
const profileRef = graph.user().get('profile');
const { data, put } = useNode(profileRef, userKeys);

// Data is automatically encrypted before saving
await put({
  email: 'alice@example.com',   // Encrypted
  phone: '+1234567890'            // Encrypted
});

// And automatically decrypted when reading
console.log(data?.email); // "alice@example.com" (decrypted)
```

#### Example: With Schema Validation

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0).max(150),
  email: z.string().email().optional()
});

const { data, put, error } = useNode(userRef, undefined, UserSchema);

// ✅ Valid data
await put({ name: 'Alice', age: 30 });

// ❌ Invalid data - error will be set
await put({ name: '', age: -5 }); // Throws validation error
console.log(error?.message); // "Schema validation failed: ..."
```

#### Example: Real-time Updates

```typescript
function UserProfile({ userId }: { userId: string }) {
  const graph = createGraph({ peers: ['http://localhost:8765/gun'] });
  const userRef = graph.get('users').get(userId);
  const { data, put, isLoading } = useNode(userRef);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Column spacing="md">
      <Text>Name: {data?.name}</Text>
      <Text>Age: {data?.age}</Text>
      <Button
        onTap={() => {
          'background only';
          put({ age: (data?.age || 0) + 1 });
        }}
      >
        Increment Age
      </Button>
    </Column>
  );
}
```

---

### useSet

Hook for managing Gun collections (sets) with real-time updates. Ideal for chat messages, todo lists, feeds, and other collections.

#### Signature

```typescript
function useSet<T = any>(
  ref: IGunChainReference | null,
  keys?: KeyPair,
  schema?: z.ZodSchema<T>
): UseSetResult<T>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ref` | `IGunChainReference \| null` | Yes | Gun chain reference to the collection (null to disable) |
| `keys` | `KeyPair` | No | Optional key pair for automatic encryption/decryption |
| `schema` | `z.ZodSchema<T>` | No | Optional Zod schema for validating collection items |

#### Returns

```typescript
interface UseSetResult<T> {
  items: CollectionItem<T>[];    // Array of items with metadata
  add: (data: T) => Promise<void>;  // Add new item
  update: (id: string, data: Partial<T>) => Promise<void>;  // Update item
  remove: (id: string) => Promise<void>;  // Remove item
  isLoading: boolean;            // Loading state
  error: Error | null;           // Error that occurred
}

interface CollectionItem<T> {
  id: string;    // Unique soul/ID from Gun
  data: T;       // Item data
}
```

#### Example: Basic Usage

```typescript
const graph = createGraph({ peers: ['http://localhost:8765/gun'] });
const todosRef = graph.get('todos');
const { items, add, update, remove, isLoading } = useSet(todosRef);

// Add new item
await add({ title: 'Buy groceries', done: false });

// Update item
const todoId = items[0].id;
await update(todoId, { done: true });

// Remove item
await remove(todoId);

// Read items
items.forEach(({ id, data }) => {
  console.log(id, data.title, data.done);
});
```

#### Example: With Encryption

```typescript
import { pair } from '@ariob/core';

const keyResult = await pair();
const userKeys = keyResult.value;

const messagesRef = graph.user().get('private-messages');
const { items, add } = useSet(messagesRef, userKeys);

// Messages are automatically encrypted
await add({
  text: 'Secret message',
  timestamp: Date.now()
});

// And automatically decrypted when reading
items.forEach(({ data }) => {
  console.log(data.text); // "Secret message" (decrypted)
});
```

#### Example: With Schema Validation

```typescript
import { z } from 'zod';

const TodoSchema = z.object({
  title: z.string().min(1),
  done: z.boolean(),
  createdAt: z.number().optional()
});

const { items, add, error } = useSet(todosRef, undefined, TodoSchema);

// ✅ Valid item
await add({
  title: 'Buy milk',
  done: false,
  createdAt: Date.now()
});

// ❌ Invalid item - error will be set
await add({ title: '', done: 'yes' }); // Throws validation error

// Note: Invalid items from other users are silently skipped
// (logged to console but don't throw)
```

#### Example: Real-time Chat

```typescript
function ChatRoom({ roomId }: { roomId: string }) {
  const graph = createGraph({ peers: ['http://localhost:8765/gun'] });
  const messagesRef = graph.get('rooms').get(roomId).get('messages');
  const { items, add } = useSet(messagesRef);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    'background only';
    if (!input.trim()) return;

    await add({
      text: input,
      sender: 'alice',
      timestamp: Date.now()
    });

    setInput('');
  };

  return (
    <Column spacing="md">
      {/* Messages list */}
      <list className="flex-1">
        {items.map(({ id, data }) => (
          <view key={id} className="message">
            <Text weight="bold">{data.sender}</Text>
            <Text>{data.text}</Text>
          </view>
        ))}
      </list>

      {/* Input */}
      <Input
        value={input}
        onChange={setInput}
        placeholder="Type a message..."
      />
      <Button onTap={sendMessage}>Send</Button>
    </Column>
  );
}
```

---

### useAuth

Hook for managing user authentication with Gun's user system. Handles key generation, login, and session management.

#### Signature

```typescript
function useAuth(
  graph: IGunChainReference
): UseAuthResult
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `graph` | `IGunChainReference` | Yes | Root Gun instance (from `createGraph()`) |

#### Returns

```typescript
interface UseAuthResult {
  user: UserInfo | null;        // Current user info (null if not logged in)
  keys: KeyPair | null;         // Current user's key pair
  isLoggedIn: boolean;          // Whether user is authenticated
  loginWithKeys: (keys: KeyPair) => Promise<AuthResult>;  // Login
  logout: () => void;           // Logout
}

interface UserInfo {
  pub: string;      // Public key
  epub: string;     // Encryption public key
  alias: string;    // Username/alias
}

interface AuthResult {
  ok: boolean;      // Whether login succeeded
  err?: string;     // Error message if failed
  pub?: string;     // Public key if succeeded
}
```

#### Example: Generate Keys and Login

```typescript
import { createGraph, useAuth, pair, Result } from '@ariob/core';

function AuthExample() {
  const graph = createGraph({ peers: ['http://localhost:8765/gun'] });
  const { user, isLoggedIn, loginWithKeys, logout } = useAuth(graph);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    'background only';
    setLoading(true);

    // Generate new key pair
    const keyResult = await pair();

    await Result.match(keyResult, {
      ok: async (keys) => {
        console.log('Keys generated:', keys.pub);

        // Login with keys
        const authResult = await loginWithKeys(keys);

        if (authResult.ok) {
          console.log('✓ Login successful');
        } else {
          console.error('✗ Login failed:', authResult.err);
        }

        setLoading(false);
      },
      error: async (err) => {
        console.error('✗ Key generation failed:', err);
        setLoading(false);
      }
    });
  };

  return (
    <Column spacing="md">
      {isLoggedIn ? (
        <>
          <Text>Logged in as: {user?.alias}</Text>
          <Text>Public key: {user?.pub.substring(0, 20)}...</Text>
          <Button onTap={logout}>Logout</Button>
        </>
      ) : (
        <Button
          onTap={handleLogin}
          disabled={loading}
        >
          {loading ? 'Generating keys...' : 'Generate Keys & Login'}
        </Button>
      )}
    </Column>
  );
}
```

#### Example: Persistent Login

```typescript
// Store keys in secure storage after first login
import { useAuth, pair, Result } from '@ariob/core';

function PersistentAuth() {
  const graph = createGraph({ peers: ['http://localhost:8765/gun'] });
  const { isLoggedIn, loginWithKeys } = useAuth(graph);

  useEffect(() => {
    'background only';

    // Try to restore keys from secure storage
    const restoreSession = async () => {
      // Get keys from native secure storage
      NativeModules.AriobBridge.getSecure('userKeys', async (keysJson) => {
        if (keysJson) {
          const keys = JSON.parse(keysJson);
          await loginWithKeys(keys);
        }
      });
    };

    if (!isLoggedIn) {
      restoreSession();
    }
  }, [isLoggedIn]);

  // Save keys after successful login
  const handleFirstLogin = async () => {
    'background only';
    const keyResult = await pair();

    if (keyResult.ok) {
      const keys = keyResult.value;
      const authResult = await loginWithKeys(keys);

      if (authResult.ok) {
        // Store keys securely for next session
        NativeModules.AriobBridge.storeSecure(
          'userKeys',
          JSON.stringify(keys)
        );
      }
    }
  };

  return (
    <view>
      {isLoggedIn ? (
        <Text>Welcome back!</Text>
      ) : (
        <Button onTap={handleFirstLogin}>Create Account</Button>
      )}
    </view>
  );
}
```

---

## Cryptography

@ariob/core provides lazy-loaded SEA (Security, Encryption, Authorization) cryptography functions. All functions are background-only and return Results for safe error handling.

### Lazy Loading

Crypto functions are automatically code-split into a separate bundle (`crypto.bundle`) and only loaded when needed, reducing initial bundle size.

```typescript
// Crypto module is loaded on first use
import { encrypt, decrypt, pair, sign, verify } from '@ariob/core';

// First call loads the module
const result = await pair(); // Loads crypto.bundle + sea.js.bundle
```

### Key Generation

```typescript
import { pair, Result } from '@ariob/core';

async function generateKeys() {
  'background only';
  const result = await pair();

  return Result.match(result, {
    ok: (keys) => {
      console.log('Public key:', keys.pub);
      console.log('Private key:', keys.priv);
      console.log('Encryption public key:', keys.epub);
      console.log('Encryption private key:', keys.epriv);
      return keys;
    },
    error: (err) => {
      console.error('Key generation failed:', err);
      return null;
    }
  });
}
```

### Encryption & Decryption

```typescript
import { encrypt, decrypt, pair, Result } from '@ariob/core';

async function encryptionExample() {
  'background only';

  // Generate keys
  const keyResult = await pair();
  if (!keyResult.ok) return;
  const keys = keyResult.value;

  // Encrypt data
  const data = { secret: 'my secret message', value: 42 };
  const encryptResult = await encrypt(data, keys);

  if (!encryptResult.ok) {
    console.error('Encryption failed:', encryptResult.error);
    return;
  }

  const encrypted = encryptResult.value;
  console.log('Encrypted:', encrypted); // "SEA{...}"

  // Decrypt data
  const decryptResult = await decrypt(encrypted, keys);

  if (!decryptResult.ok) {
    console.error('Decryption failed:', decryptResult.error);
    return;
  }

  const decrypted = decryptResult.value;
  console.log('Decrypted:', decrypted); // { secret: "my secret message", value: 42 }
}
```

### Signing & Verification

```typescript
import { sign, verify, pair, Result } from '@ariob/core';

async function signingExample() {
  'background only';

  const keyResult = await pair();
  if (!keyResult.ok) return;
  const keys = keyResult.value;

  // Sign data
  const message = { text: 'Hello world', timestamp: Date.now() };
  const signResult = await sign(message, keys);

  if (!signResult.ok) {
    console.error('Signing failed:', signResult.error);
    return;
  }

  const signature = signResult.value;

  // Verify signature
  const verifyResult = await verify(signature, keys.pub);

  if (!verifyResult.ok) {
    console.error('Verification failed:', verifyResult.error);
    return;
  }

  const verified = verifyResult.value;
  console.log('Verified data:', verified); // Original message if signature is valid
}
```

### Password Hashing

```typescript
import { work, Result } from '@ariob/core';

async function hashPassword(password: string, salt?: string) {
  'background only';

  const result = await work(password, salt);

  return Result.match(result, {
    ok: (hash) => {
      console.log('Password hash:', hash);
      return hash;
    },
    error: (err) => {
      console.error('Hashing failed:', err);
      return null;
    }
  });
}

// Usage
const hash1 = await hashPassword('mypassword123');
const hash2 = await hashPassword('mypassword123', 'user-salt');
```

### Shared Secrets (ECDH)

```typescript
import { secret, pair, Result } from '@ariob/core';

async function sharedSecretExample() {
  'background only';

  // Alice generates her keys
  const aliceKeys = (await pair()).value;

  // Bob generates his keys
  const bobKeys = (await pair()).value;

  // Alice derives shared secret with Bob's public key
  const aliceSecretResult = await secret(bobKeys.epub, aliceKeys);

  // Bob derives shared secret with Alice's public key
  const bobSecretResult = await secret(aliceKeys.epub, bobKeys);

  if (aliceSecretResult.ok && bobSecretResult.ok) {
    // Both secrets are identical - they can use this for symmetric encryption
    console.log('Shared secret established');
    console.log('Alice\'s secret === Bob\'s secret:',
      aliceSecretResult.value === bobSecretResult.value
    ); // true
  }
}
```

### Complete Crypto API

```typescript
// Key management
pair(): Promise<Result<KeyPair, Error>>

// Encryption
encrypt(data: any, keys: KeyPair): Promise<Result<any, Error>>
decrypt(data: any, keys: KeyPair): Promise<Result<any, Error>>
encryptData(data: any, keys?: KeyPair): Promise<any>  // Legacy, auto-fallback
decryptData(data: any, keys?: KeyPair): Promise<any>  // Legacy, auto-fallback
isEncrypted(data: any): boolean

// Signing
sign(data: any, pair: KeyPair): Promise<Result<any, Error>>
verify(signature: any, pub: string | KeyPair): Promise<Result<any, Error>>

// Hashing
work(data: any, salt?: string): Promise<Result<string, Error>>

// Key exchange
secret(theirEpub: string, myPair: KeyPair): Promise<Result<string, Error>>

// Authorization
certify(
  certificants: any,
  policy: any,
  authority: KeyPair,
  cb?: any
): Promise<Result<any, Error>>
```

---

## Result Type System

@ariob/core uses a Rust-inspired Result<T, E> type for type-safe error handling without exceptions.

### Result Type

```typescript
type Result<T, E = string> = Ok<T> | Err<E>

interface Ok<T> {
  readonly ok: true;
  readonly value: T;
  readonly error?: never;
}

interface Err<E> {
  readonly ok: false;
  readonly value?: never;
  readonly error: E;
}
```

### Creating Results

```typescript
import { Result } from '@ariob/core';

// Success
const success = Result.ok(42);
console.log(success.ok);     // true
console.log(success.value);  // 42

// Error
const failure = Result.error('Something went wrong');
console.log(failure.ok);     // false
console.log(failure.error);  // "Something went wrong"
```

### Pattern Matching

```typescript
import { Result } from '@ariob/core';

const result = await someAsyncOperation();

const message = Result.match(result, {
  ok: (value) => `Success: ${value}`,
  error: (error) => `Failed: ${error}`
});

console.log(message);
```

### Type Guards

```typescript
import { isOk, isErr } from '@ariob/core';

if (isOk(result)) {
  // TypeScript knows result.value exists
  console.log(result.value);
}

if (isErr(result)) {
  // TypeScript knows result.error exists
  console.error(result.error);
}
```

### Chaining Operations

```typescript
import { Result } from '@ariob/core';

const result = Result.ok(5)
  |> (r => Result.map(r, x => x * 2))     // Ok(10)
  |> (r => Result.map(r, x => x + 1))     // Ok(11)
  |> (r => Result.chain(r, x =>
      x > 10 ? Result.ok(x) : Result.error('Too small')
    ));  // Ok(11)

// Or using helper functions
const doubled = Result.map(result, x => x * 2);
const chained = Result.chain(result, x =>
  x > 5 ? Result.ok(x) : Result.error('Value too small')
);
```

### Unwrapping

```typescript
import { Result } from '@ariob/core';

// Unwrap (throws if error)
const value = Result.unwrap(result);  // Throws if result is Err

// Unwrap with default
const value = Result.unwrapOr(result, 42);  // Returns 42 if error
```

### Working with Multiple Results

```typescript
import { Result } from '@ariob/core';

// All must succeed
const results = [
  Result.ok(1),
  Result.ok(2),
  Result.ok(3)
];

const combined = Result.all(results);  // Ok([1, 2, 3])

// Collect errors
const mixedResults = [
  Result.ok(1),
  Result.error('error 1'),
  Result.error('error 2')
];

const collected = Result.collect(mixedResults);
// Err(['error 1', 'error 2'])
```

### Safe Function Execution

```typescript
import { Result } from '@ariob/core';

// Sync function
const result = Result.from(() => {
  return JSON.parse(jsonString);
});

if (result.ok) {
  console.log('Parsed:', result.value);
} else {
  console.error('Parse error:', result.error);
}

// Async function
const asyncResult = await Result.fromAsync(async () => {
  const response = await fetch('/api/data');
  return response.json();
});
```

---

## Schema Validation

@ariob/core integrates with Zod for runtime schema validation using the Result type system.

### Basic Validation

```typescript
import { z, Result } from '@ariob/core';

const UserSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0).max(150),
  email: z.string().email()
});

const data = { name: 'Alice', age: 30, email: 'alice@example.com' };
const result = Result.parse(UserSchema, data);

if (result.ok) {
  console.log('Valid:', result.value);
  // TypeScript knows the type is { name: string; age: number; email: string }
} else {
  console.error('Validation errors:', result.error.errors);
}
```

### With Hooks

```typescript
import { z } from 'zod';
import { useNode } from '@ariob/core';

const TodoSchema = z.object({
  title: z.string().min(1),
  done: z.boolean(),
  createdAt: z.number().optional()
});

function TodoComponent() {
  const todoRef = graph.get('todos').get('todo-1');
  const { data, put, error } = useNode(todoRef, undefined, TodoSchema);

  // data is typed as { title: string; done: boolean; createdAt?: number } | null

  const handleUpdate = async () => {
    'background only';
    try {
      // Validation happens automatically
      await put({ title: 'New title', done: true });
    } catch (err) {
      // error will contain validation error details
      console.error(error?.message);
    }
  };

  return <view>...</view>;
}
```

### Complex Schemas

```typescript
import { z } from 'zod';

// Nested objects
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zip: z.string().regex(/^\d{5}$/)
});

const UserSchema = z.object({
  name: z.string(),
  address: AddressSchema,
  tags: z.array(z.string()),
  metadata: z.record(z.string(), z.any())
});

// Unions
const MessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: z.string() }),
  z.object({ type: z.literal('image'), url: z.string().url() }),
  z.object({ type: z.literal('video'), url: z.string().url(), duration: z.number() })
]);

// Refinements
const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine((pwd) => /[A-Z]/.test(pwd), 'Must contain uppercase letter')
  .refine((pwd) => /[0-9]/.test(pwd), 'Must contain number');
```

### Transform and Preprocess

```typescript
import { z, Result } from '@ariob/core';

// Transform
const TimestampSchema = z.number()
  .transform((val) => new Date(val));

// Preprocess
const BooleanSchema = z.preprocess(
  (val) => val === 'true' || val === true,
  z.boolean()
);

// Usage
const result = Result.parse(TimestampSchema, 1699564800000);
if (result.ok) {
  console.log(result.value); // Date object
}
```

---

## Advanced Patterns

### Custom Hooks Building on Primitives

```typescript
import { useNode, useSet } from '@ariob/core';
import { z } from 'zod';

// Build feature-specific hooks on top of primitives

const ProfileSchema = z.object({
  name: z.string(),
  avatar: z.string().url().optional(),
  bio: z.string().optional()
});

export function useUserProfile(userId: string, keys?: KeyPair) {
  const graph = createGraph({ peers: ['http://localhost:8765/gun'] });
  const profileRef = graph.get('users').get(userId).get('profile');

  const { data, put, isLoading, error } = useNode(
    profileRef,
    keys,
    ProfileSchema
  );

  const updateProfile = async (updates: Partial<z.infer<typeof ProfileSchema>>) => {
    'background only';
    return put(updates);
  };

  return {
    profile: data,
    updateProfile,
    isLoading,
    error
  };
}

// Usage
function ProfileScreen({ userId }) {
  const { profile, updateProfile, isLoading } = useUserProfile(userId);

  // ...
}
```

### Encrypted Collections

```typescript
import { useSet, useAuth } from '@ariob/core';

function useEncryptedMessages(roomId: string) {
  const graph = createGraph({ peers: ['http://localhost:8765/gun'] });
  const { keys } = useAuth(graph);
  const messagesRef = graph.get('rooms').get(roomId).get('messages');

  const MessageSchema = z.object({
    text: z.string(),
    sender: z.string(),
    timestamp: z.number()
  });

  const { items, add, isLoading } = useSet(messagesRef, keys, MessageSchema);

  const sendMessage = async (text: string, sender: string) => {
    'background only';
    return add({
      text,
      sender,
      timestamp: Date.now()
    });
  };

  return {
    messages: items,
    sendMessage,
    isLoading
  };
}
```

### Optimistic Updates

```typescript
function useOptimisticTodos() {
  const todosRef = graph.get('todos');
  const { items, add, update } = useSet(todosRef);
  const [optimisticItems, setOptimisticItems] = useState(items);

  // Update local state immediately, then sync
  const addOptimistic = async (todo: Todo) => {
    'background only';
    const tempId = `temp-${Date.now()}`;

    // Update UI immediately
    setOptimisticItems([...optimisticItems, { id: tempId, data: todo }]);

    try {
      // Sync to Gun
      await add(todo);
    } catch (err) {
      // Rollback on error
      setOptimisticItems(items);
      throw err;
    }
  };

  useEffect(() => {
    setOptimisticItems(items);
  }, [items]);

  return {
    items: optimisticItems,
    add: addOptimistic,
    update
  };
}
```

### Pagination

```typescript
function usePaginatedSet<T>(
  ref: IGunChainReference,
  pageSize: number = 20
) {
  const { items } = useSet<T>(ref);
  const [page, setPage] = useState(0);

  const paginatedItems = useMemo(() => {
    const start = page * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, page, pageSize]);

  const totalPages = Math.ceil(items.length / pageSize);

  return {
    items: paginatedItems,
    page,
    totalPages,
    nextPage: () => setPage(p => Math.min(p + 1, totalPages - 1)),
    prevPage: () => setPage(p => Math.max(p - 1, 0)),
    goToPage: (p: number) => setPage(Math.max(0, Math.min(p, totalPages - 1)))
  };
}
```

---

## API Reference

### Graph Creation

```typescript
function createGraph(options: GunOptions): IGunChainReference

interface GunOptions {
  peers?: string[] | Record<string, {}>;
  localStorage?: boolean;
  radisk?: boolean;
  file?: string;
  [key: string]: any;
}
```

### Types

```typescript
interface KeyPair {
  pub: string;     // Public signing key
  priv: string;    // Private signing key
  epub: string;    // Encryption public key
  epriv: string;   // Encryption private key
}

interface IGunChainReference {
  get(key: string): IGunChainReference;
  put(data: any, callback?: (ack: any) => void): IGunChainReference;
  on(callback: (data: any, key: string) => void): () => void;
  once(callback: (data: any, key: string) => void): void;
  set(data: any, callback?: (ack: any) => void): IGunChainReference;
  map(): IGunChainReference;
  user(soul?: string): IGunUserReference;
  off(): void;
}

interface IGunUserReference extends IGunChainReference {
  is: KeyPair | null;
  auth(keypair: KeyPair, callback?: (ack: any) => void): void;
  create(keypair: KeyPair, callback?: (ack: any) => void): void;
  leave(): void;
}
```

### Utility Hooks

```typescript
// LynxJS-specific
useMainThreadImperativeHandle<T>(ref: Ref<T>, createHandle: () => T): void
useIntersection(ref: RefObject, options?: IntersectionObserverOptions): boolean
useKeyboard(): UseKeyboardResult
useTapLock(direction?: TapLockDirection, options?: UseTapLockOptions): boolean

// React utilities
useInput(initialValue?: string, options?: UseInputOptions): [string, (e: InputEvent) => void]
useDebounce<T>(value: T, delay: number): T
useTimeout(callback: () => void, delay: number): UseTimeoutReturn
useTimeoutFn(callback: () => void, delay: number): UseTimeoutFnReturn
useUpdate(): () => void
```

---

## Best Practices

### 1. Always Use Thread Directives

```typescript
// ✅ GOOD
const handleSave = async () => {
  'background only';
  await put({ data: 'value' });
};

// ❌ BAD - Missing directive
const handleSave = async () => {
  await put({ data: 'value' });
};
```

### 2. Validate User Input

```typescript
// ✅ GOOD - Validate before storing
const TodoSchema = z.object({
  title: z.string().min(1).max(200),
  done: z.boolean()
});

const { put } = useNode(ref, undefined, TodoSchema);

// ❌ BAD - No validation
const { put } = useNode(ref);
await put({ title: userInput }); // Could be anything!
```

### 3. Handle Errors Gracefully

```typescript
// ✅ GOOD - Check errors
const { data, put, error } = useNode(ref);

if (error) {
  return <Text>Error: {error.message}</Text>;
}

// ❌ BAD - Ignore errors
const { data, put } = useNode(ref);
```

### 4. Use Result Pattern for Crypto

```typescript
// ✅ GOOD - Handle errors with Result
const keyResult = await pair();
if (!keyResult.ok) {
  console.error('Failed:', keyResult.error);
  return;
}
const keys = keyResult.value;

// ❌ BAD - Assume success
const keys = (await pair()).value; // Could be undefined!
```

### 5. Cleanup on Unmount

```typescript
// ✅ GOOD - Hooks handle cleanup automatically
const { data, put } = useNode(ref);

// Cleanup is handled internally by the hook
// No manual cleanup needed

// ❌ BAD - Manual Gun subscriptions without cleanup
useEffect(() => {
  ref.on((data) => {
    setData(data);
  });
  // Missing cleanup!
}, []);
```

### 6. Separate Concerns

```typescript
// ✅ GOOD - Separate data access and UI
function useUserData(userId: string) {
  const userRef = graph.get('users').get(userId);
  return useNode(userRef);
}

function UserProfile({ userId }) {
  const { data, put } = useUserData(userId);
  return <Text>{data?.name}</Text>;
}

// ❌ BAD - Mix concerns
function UserProfile({ userId }) {
  const graph = createGraph({ peers: [...] });
  const userRef = graph.get('users').get(userId);
  const { data, put } = useNode(userRef);
  return <Text>{data?.name}</Text>;
}
```

### 7. Type Your Schemas

```typescript
// ✅ GOOD - Define schema and infer types
const UserSchema = z.object({
  name: z.string(),
  age: z.number()
});

type User = z.infer<typeof UserSchema>;

const { data, put } = useNode<User>(ref, undefined, UserSchema);

// ❌ BAD - Lose type information
const { data, put } = useNode(ref);
```

### 8. Lazy Load Crypto

```typescript
// ✅ GOOD - Crypto is lazy-loaded automatically
import { pair } from '@ariob/core';
const result = await pair(); // Loads on first use

// ❌ BAD - Don't import Gun/SEA directly
import Gun from 'gun';
import SEA from 'gun/sea';  // Loads on main thread!
```

---

## Troubleshooting

### "value is not iterable" Error

**Cause**: Using `Object.entries()` on Gun's special objects
**Solution**: Use whole-object encryption/decryption (already fixed in latest version)

```typescript
// ✅ Current version (fixed)
const result = await decrypt(data, keys);

// ❌ Old version (broken)
for (const [key, value] of Object.entries(data)) {
  await decrypt(value, keys);
}
```

### "Cannot set property 'user' of undefined"

**Cause**: SEA trying to load on main thread
**Solution**: Ensure all Gun operations use `'background only'` directive

```typescript
// ✅ GOOD
const graph = createGraph({ peers: [...] }); // Auto background
const { data, put } = useNode(ref); // Auto background

// ❌ BAD
'main thread';
const graph = createGraph({ peers: [...] }); // Error!
```

### Encryption Not Working

**Cause**: Missing KeyPair parameter
**Solution**: Pass keys to hooks

```typescript
// ✅ GOOD
const { keys } = useAuth(graph);
const { data, put } = useNode(ref, keys);

// ❌ BAD
const { data, put } = useNode(ref); // No encryption!
```

### Schema Validation Failing

**Cause**: Invalid data shape
**Solution**: Check schema definition and data

```typescript
const { error } = useNode(ref, undefined, schema);

if (error) {
  console.error('Validation error:', error.message);
  // Check: Does data match schema shape?
}
```

---

## Examples

See `/apps/ripple/src/screens/TestScreen.tsx` for a comprehensive test harness demonstrating all hooks with real-world usage patterns.

---

## License

MIT © Ariob Studio

---

**Need Help?** Check the [LynxJS documentation](https://lynxjs.org) for LynxJS-specific patterns, or the [Gun.js documentation](https://gun.eco/docs) for Gun database concepts.

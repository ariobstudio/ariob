# @ariob/core API Reference

Complete API documentation for the @ariob/core package.

## Table of Contents

- [Services](#services)
  - [`make()`](#make)
  - [`service()`](#service)
  - [`validator()`](#validator)
  - [`manager()`](#manager)
- [Adapters](#adapters)
  - [`adapt()`](#adapt)
  - [GunAdapter](#gunadapter)
  - [UserAdapter](#useradapter)
  - [MemoryAdapter](#memoryadapter)
- [Utilities](#utilities)
  - [`soul()`](#soul)
  - [`parse()`](#parse)
  - [`stamp()`](#stamp)
  - [`random()`](#random)
  - [`extract()`](#extract)
- [State Management](#state-management)
  - [`createThingStore()`](#createthingstore)
  - [`useWhoStore`](#usewhostore)
- [Hooks](#hooks)
  - [`useThing()`](#usething)
  - [`useWho()`](#usewho)
- [Schemas](#schemas)
  - [ThingSchema](#thingschema)
  - [ContentThingSchema](#contentthingschema)
  - [RelationalThingSchema](#relationalthingschema)
  - [WhoSchema](#whoschema)
- [Error Handling](#error-handling)
  - [AppError](#apperror)
  - [Result Types](#result-types)
- [Authentication](#authentication)
  - [`who` Service](#who-service)
  - [Auth Methods](#auth-methods)
- [Types](#types)

---

## Services

### `make()`

Creates a Thing service with Gun adapter.

**Signature:**
```typescript
function make<T extends Thing>(
  schema: z.ZodType<T>,
  prefix: string,
  options?: ServiceOptions
): ThingService<T>
```

**Parameters:**
- `schema` - Zod schema for validation
- `prefix` - Collection prefix (e.g., 'todos', 'notes')
- `options` - Optional service configuration
  - `scoped?: boolean` - Whether to scope data to authenticated user
  - `userScoped?: boolean` - Deprecated, use `scoped`

**Returns:** ThingService instance with CRUD operations

**Example:**
```typescript
import { make, ThingSchema } from '@ariob/core';
import { z } from 'zod';

const TodoSchema = ThingSchema.extend({
  title: z.string(),
  completed: z.boolean(),
});

const todos = make(TodoSchema, 'todos');

// User-scoped (private) data
const privateTodos = make(TodoSchema, 'todos', { scoped: true });
```

**See also:** [`service()`](#service), [`adapt()`](#adapt), [`validator()`](#validator)

---

### `service()`

Low-level service factory for advanced use cases.

**Signature:**
```typescript
function service<T extends Thing>(
  config: ServiceConfig<T>
): ThingService<T>
```

**Parameters:**
- `config` - Service configuration object
  - `validator: Validator<T>` - Validation service
  - `adapter: Adapter<T>` - Database adapter
  - `manager: Manager` - Subscription manager
  - `prefix: string` - Collection prefix
  - `options: PrepareOptions` - Data preparation options

**Returns:** ThingService instance

**Example:**
```typescript
import { service, validator, manager, Memory } from '@ariob/core';

const adapter = new Memory(TodoSchema);
const todos = service({
  validator: validator(TodoSchema),
  adapter,
  manager: manager(),
  prefix: 'todos',
  options: { prefix: 'todos', type: 'todo' }
});
```

---

### `validator()`

Creates a validation service for a schema.

**Signature:**
```typescript
function validator<T extends Thing>(
  schema: z.ZodType<T>
): Validator<T>
```

**Returns:**
- `check(data: unknown): Result<T, AppError>` - Validate data
- `prepare(input: Partial<T>, options: PrepareOptions): T` - Prepare data with defaults

**Example:**
```typescript
const validate = validator(TodoSchema);

const result = validate.check(data);
result.match(
  (valid) => console.log('Valid:', valid),
  (error) => console.error('Invalid:', error)
);

const prepared = validate.prepare(
  { title: 'New Todo' },
  { prefix: 'todos', type: 'todo' }
);
```

---

### `manager()`

Creates a subscription manager.

**Signature:**
```typescript
function manager(): Manager
```

**Returns:**
- `add(key: string, unsubscribe: () => void): void` - Add subscription
- `remove(key: string): void` - Remove subscription
- `cleanup(): void` - Remove all subscriptions
- `size(): number` - Get subscription count

**Example:**
```typescript
const subscriptions = manager();

const unsubscribe = adapter.watch('todos/123', callback);
subscriptions.add('todos/123', unsubscribe);

// Later
subscriptions.remove('todos/123');
// Or cleanup all
subscriptions.cleanup();
```

---

## Adapters

### `adapt()`

Creates an adapter for database operations.

**Signature:**
```typescript
function adapt<T>(
  gun: GunInstance,
  schema: z.ZodType<T>,
  options?: AdapterOptions
): Adapter<T>
```

**Parameters:**
- `gun` - Gun instance
- `schema` - Zod schema for validation
- `options` - Adapter options
  - `scoped?: boolean` - Use user-scoped storage
  - `user?: GunUser` - User instance (required if scoped)

**Returns:** Adapter instance

**Example:**
```typescript
import { adapt, gun } from '@ariob/core';

// Public data adapter
const adapter = adapt(gun, TodoSchema);

// User-scoped adapter
const privateAdapter = adapt(gun, NoteSchema, {
  scoped: true,
  user: who.instance()
});
```

---

### GunAdapter

Gun database adapter implementation.

**Class:** `Gun<T>`

**Methods:**
- `get(path: string): Promise<Result<T | null, AppError>>` - Get item
- `put(path: string, data: T): Promise<Result<T, AppError>>` - Save item
- `remove(path: string): Promise<Result<boolean, AppError>>` - Delete item
- `list(path: string): Promise<Result<T[], AppError>>` - List items
- `watch(path: string, callback: (data: T | null) => void): () => void` - Subscribe to changes

**Example:**
```typescript
import { Gun } from '@ariob/core';

const adapter = new Gun(gun, TodoSchema);
const result = await adapter.get('todos/123');
```

---

### UserAdapter

User-scoped Gun adapter for private data.

**Class:** `User<T>`

**Methods:** Same as GunAdapter but scoped to authenticated user

**Example:**
```typescript
import { User } from '@ariob/core';

const adapter = new User(userInstance, NoteSchema);
const result = await adapter.get('notes/123'); // Actually gets user/notes/123
```

---

### MemoryAdapter

In-memory adapter for testing.

**Class:** `Memory<T>`

**Methods:** Same as GunAdapter plus:
- `clear(): void` - Clear all data
- `size(): number` - Get item count

**Example:**
```typescript
import { Memory } from '@ariob/core';

const adapter = new Memory(TodoSchema);
await adapter.put('todos/123', todoData);
const result = await adapter.get('todos/123');

// Cleanup after tests
adapter.clear();
```

---

## Utilities

### `soul()`

Creates a Gun path from prefix and ID.

**Signature:**
```typescript
function soul(prefix: string, id: string): string
```

**Example:**
```typescript
const path = soul('todos', '123'); // 'todos/123'
```

---

### `parse()`

Parses a Gun path into components.

**Signature:**
```typescript
function parse(path: string): { prefix: string; id: string } | null
```

**Example:**
```typescript
const parts = parse('todos/123');
// { prefix: 'todos', id: '123' }

const invalid = parse('invalid');
// null
```

---

### `stamp()`

Gets current timestamp.

**Signature:**
```typescript
function stamp(): number
```

**Example:**
```typescript
const now = stamp(); // 1696435200000
```

---

### `random()`

Generates a random ID using SEA.

**Signature:**
```typescript
function random(bytes?: number): string
```

**Parameters:**
- `bytes` - Number of random bytes (default: 16)

**Example:**
```typescript
const id = random();      // 16-byte random string
const short = random(8);  // 8-byte random string
```

---

### `extract()`

Extracts schema type from Zod schema.

**Signature:**
```typescript
function extract(schema: z.ZodType<any>): string | null
```

**Example:**
```typescript
const TodoSchema = z.object({
  schema: z.literal('todo'),
  title: z.string(),
});

const type = extract(TodoSchema); // 'todo'
```

---

## State Management

### `createThingStore()`

Creates a Zustand store for a Thing service.

**Signature:**
```typescript
function createThingStore<T extends Thing>(
  service: ThingService<T>,
  name: string
): () => ThingStore<T>
```

**Parameters:**
- `service` - Thing service instance
- `name` - Store name for debugging

**Returns:** Zustand hook

**Store Interface:**
```typescript
interface ThingStore<T> {
  // State
  items: T[];
  byId: Record<string, T>;
  isLoading: boolean;
  error: AppError | null;

  // Actions
  fetchAll(): Promise<void>;
  fetchById(id: string): Promise<void>;
  create(data: Partial<T>): Promise<Result<T, AppError>>;
  update(id: string, updates: Partial<T>): Promise<Result<T | null, AppError>>;
  remove(id: string): Promise<Result<boolean, AppError>>;
  watch(id: string): () => void;
  cleanup(): void;
  clearError(): void;
  reset(): void;
}
```

**Example:**
```typescript
const useNotesStore = createThingStore(notesService, 'Notes');

function NotesList() {
  const { items, isLoading, fetchAll } = useNotesStore();

  useEffect(() => {
    fetchAll();
  }, []);

  return items.map(note => <Note key={note.id} note={note} />);
}
```

---

### `useWhoStore`

Global authentication store.

**Store Interface:**
```typescript
interface WhoStore {
  // State
  user: Who | null;
  isLoading: boolean;
  error: AppError | null;
  isAuthenticated: boolean;

  // Actions
  init(): Promise<Result<Who | null, AppError>>;
  signup(request: AuthRequest): Promise<Result<Who, AppError>>;
  login(request: AuthRequest): Promise<Result<Who, AppError>>;
  logout(): Promise<Result<void, AppError>>;
  updateProfile(updates: ProfileUpdate): Promise<Result<Who, AppError>>;
  clearError(): void;
}
```

**Example:**
```typescript
import { useWhoStore } from '@ariob/core';

function AuthStatus() {
  const { user, isAuthenticated, logout } = useWhoStore();

  if (!isAuthenticated) return <Login />;

  return (
    <div>
      <span>Logged in as: {user.alias}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Hooks

### `useThing()`

React hook for managing a single Thing entity.

**Signature:**
```typescript
function useThing<T extends Thing>(
  useStore: () => ThingStore<T>,
  id: string | null
): {
  item: T | null;
  isLoading: boolean;
  error: AppError | null;
  update: (updates: Partial<T>) => Promise<Result<T | null, AppError>>;
  remove: () => Promise<Result<boolean, AppError>>;
}
```

**Parameters:**
- `useStore` - Store hook created with `createThingStore`
- `id` - Entity ID to manage

**Example:**
```typescript
function NoteDetail({ noteId }: { noteId: string }) {
  const { item: note, isLoading, update, remove } = useThing(useNotesStore, noteId);

  if (isLoading) return <div>Loading...</div>;
  if (!note) return <div>Not found</div>;

  return (
    <div>
      <h1>{note.title}</h1>
      <button onClick={() => update({ title: 'Updated!' })}>Update</button>
      <button onClick={remove}>Delete</button>
    </div>
  );
}
```

---

### `useWho()`

React hook for authentication.

**Signature:**
```typescript
function useWho(): {
  user: Who | null;
  isLoading: boolean;
  error: AppError | null;
  isAuthenticated: boolean;
  signup: (request: AuthRequest) => Promise<Result<Who, AppError>>;
  login: (request: AuthRequest) => Promise<Result<Who, AppError>>;
  logout: () => Promise<Result<void, AppError>>;
  updateProfile: (updates: ProfileUpdate) => Promise<Result<Who, AppError>>;
}
```

**Example:**
```typescript
function LoginForm() {
  const { signup, login, isLoading, error } = useWho();
  const [alias, setAlias] = useState('');

  const handleSignup = async () => {
    const result = await signup({
      method: 'keypair',
      alias
    });

    result.match(
      (user) => console.log('Welcome:', user.alias),
      (error) => console.error('Signup failed:', error)
    );
  };

  return (
    <form>
      <input value={alias} onChange={(e) => setAlias(e.target.value)} />
      <button onClick={handleSignup} disabled={isLoading}>
        Sign Up
      </button>
      {error && <div>{error.message}</div>}
    </form>
  );
}
```

---

## Schemas

### ThingSchema

Base schema for all entities.

```typescript
const ThingSchema = z.object({
  id: z.string().min(1),           // Unique identifier
  soul: z.string().min(1),         // Gun path: "prefix/id"
  schema: z.string().min(1),       // Type discriminator
  createdAt: z.number(),            // Creation timestamp
  updatedAt: z.number().optional(), // Update timestamp
  public: z.boolean().default(true), // Visibility
  createdBy: z.string().optional(), // Creator's public key
});

type Thing = z.infer<typeof ThingSchema>;
```

---

### ContentThingSchema

Extended schema with content fields.

```typescript
const ContentThingSchema = ThingSchema.extend({
  title: z.string().optional(),
  body: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type ContentThing = z.infer<typeof ContentThingSchema>;
```

---

### RelationalThingSchema

Schema with hierarchical relationships.

```typescript
const RelationalThingSchema = ThingSchema.extend({
  parentId: z.string().optional(),
  rootId: z.string().optional(),
});

type RelationalThing = z.infer<typeof RelationalThingSchema>;
```

---

### WhoSchema

User identity schema.

```typescript
const WhoSchema = z.object({
  id: z.string().min(1),
  schema: z.literal('who'),
  soul: z.string().min(1),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  alias: z.string().min(1).max(50),
  pub: z.string().min(1),           // Public key
  displayName: z.string().max(100).optional(),
  avatar: z.string().optional(),
  public: z.boolean().default(true),
});

type Who = z.infer<typeof WhoSchema>;
```

---

## Error Handling

### AppError

Standard error type for all operations.

```typescript
interface AppError {
  type: ErrorType;
  message: string;
  cause?: unknown;
}

enum ErrorType {
  Validation = 'VALIDATION_ERROR',
  Auth = 'AUTH_ERROR',
  DB = 'DB_ERROR',
  Network = 'NETWORK_ERROR',
  NotFound = 'NOT_FOUND',
  Permission = 'PERMISSION_ERROR',
  Unknown = 'UNKNOWN_ERROR'
}
```

**Error Factories:**
```typescript
import * as Err from '@ariob/core';

Err.validate('Invalid data');
Err.auth('Not authenticated');
Err.db('Database error');
Err.notFound('Item not found');
Err.permission('Access denied');
Err.network('Network error');
Err.unknown('Unknown error');
Err.fromZod(zodError);
```

---

### Result Types

All async operations return `Result` types from `neverthrow`.

```typescript
import { Result } from 'neverthrow';

type Result<T, E> = Ok<T> | Err<E>;
```

**Usage:**
```typescript
const result = await todos.create(data);

// Pattern matching
result.match(
  (todo) => console.log('Success:', todo),
  (error) => console.error('Error:', error)
);

// Chaining
result
  .map((todo) => todo.id)
  .mapErr((error) => error.message)
  .match(
    (id) => console.log('ID:', id),
    (message) => console.error(message)
  );

// Checking
if (result.isOk()) {
  console.log('Success:', result.value);
} else {
  console.error('Error:', result.error);
}
```

---

## Authentication

### `who` Service

Global authentication service singleton.

**Methods:**
```typescript
interface WhoService {
  // Session Management
  init(): Promise<Result<Who | null, AppError>>;
  current(): Who | null;
  instance(): GunUser | null;

  // Authentication
  signup(request: AuthRequest): Promise<Result<Who, AppError>>;
  login(request: AuthRequest): Promise<Result<Who, AppError>>;
  logout(): Promise<Result<void, AppError>>;

  // Profile Management
  updateProfile(updates: ProfileUpdate): Promise<Result<Who, AppError>>;
  getProfile(pub: string): Promise<Result<Who | null, AppError>>;
}
```

**Example:**
```typescript
import { who } from '@ariob/core';

// Initialize on app start
await who.init();

// Sign up
const result = await who.signup({
  method: 'keypair',
  alias: 'alice'
});

// Get current user
const user = who.current();

// Logout
await who.logout();
```

---

### Auth Methods

Three authentication methods supported:

#### Keypair Authentication
```typescript
{
  method: 'keypair',
  alias: string,
  pub?: string,    // Optional, auto-generated if not provided
  priv?: string,   // Optional, auto-generated if not provided
  epub?: string,   // Optional, auto-generated if not provided
  epriv?: string,  // Optional, auto-generated if not provided
}
```

#### Mnemonic Authentication
```typescript
{
  method: 'mnemonic',
  alias: string,
  mnemonic?: string,    // For login/recovery
  passphrase?: string,  // Optional BIP39 passphrase
}
```

#### Traditional Authentication
```typescript
{
  method: 'traditional',
  alias: string,
  passphrase: string,   // Password
}
```

---

## Types

### Core Types

```typescript
// Gun instance type
type GunInstance = any; // Gun.js instance

// Gun user type
type GunUser = any; // Gun user instance

// SEA (Security, Encryption, Authorization)
type SEA = {
  pair(): Promise<KeyPair>;
  sign(data: any, pair: KeyPair): Promise<string>;
  verify(data: any, pub: string): Promise<any>;
  encrypt(data: any, pair: KeyPair): Promise<string>;
  decrypt(data: any, pair: KeyPair): Promise<any>;
  random(bytes: number): string;
  // ... more methods
};

// Key pair
type KeyPair = {
  pub: string;
  priv: string;
  epub: string;
  epriv: string;
};
```

### Service Types

```typescript
interface ThingService<T> {
  create(data: Partial<T>): Promise<Result<T, AppError>>;
  get(id: string): Promise<Result<T | null, AppError>>;
  update(id: string, updates: Partial<T>): Promise<Result<T | null, AppError>>;
  remove(id: string): Promise<Result<boolean, AppError>>;
  list(): Promise<Result<T[], AppError>>;
  watch(id: string, callback: (data: Result<T | null, AppError>) => void): () => void;
  cleanup(): void;
  soul(id: string): string;
}

interface ServiceOptions {
  scoped?: boolean;
  userScoped?: boolean; // Deprecated
}

interface ServiceConfig<T> {
  validator: Validator<T>;
  adapter: Adapter<T>;
  manager: Manager;
  prefix: string;
  options: PrepareOptions;
}
```

### Adapter Types

```typescript
interface Adapter<T> {
  get(path: string): Promise<Result<T | null, AppError>>;
  put(path: string, data: T): Promise<Result<T, AppError>>;
  remove(path: string): Promise<Result<boolean, AppError>>;
  list(path: string): Promise<Result<T[], AppError>>;
  watch(path: string, callback: (data: T | null) => void): () => void;
}

interface AdapterOptions {
  scoped?: boolean;
  user?: GunUser;
}
```

### Validation Types

```typescript
interface Validator<T> {
  check(data: unknown): Result<T, AppError>;
  prepare(input: Partial<T>, options: PrepareOptions): T;
}

interface PrepareOptions {
  prefix: string;
  type: string;
  creator?: string;
}
```

### Subscription Types

```typescript
interface Manager {
  add(key: string, unsubscribe: () => void): void;
  remove(key: string): void;
  cleanup(): void;
  size(): number;
}
```

---

## See Also

- [Architecture](./ARCHITECTURE.md) - System design and patterns
- [Developer Guide](./GUIDE.md) - Step-by-step tutorials
- [Examples](./EXAMPLES.md) - Code examples and patterns
- [Migration Guide](./MIGRATION.md) - Upgrading from older versions
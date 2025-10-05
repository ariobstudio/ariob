# @ariob/core Architecture Guide

Comprehensive technical documentation for the @ariob/core package architecture.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Architectural Principles](#architectural-principles)
- [Layered Architecture](#layered-architecture)
- [Dependency Graph](#dependency-graph)
- [Data Flow](#data-flow)
- [Design Patterns](#design-patterns)
- [Module Reference](#module-reference)
- [Extension Points](#extension-points)
- [Real-World Scenarios](#real-world-scenarios)
- [Performance Characteristics](#performance-characteristics)

---

## Executive Summary

@ariob/core is a composable, type-safe data layer built on UNIX philosophy principles. It provides a clean abstraction over Gun.js for real-time synchronization while maintaining testability, type safety, and developer ergonomics.

### Key Architecture Goals

1. **Composability** - Build complex features from simple, focused modules
2. **Type Safety** - Full TypeScript inference from Zod schemas
3. **Testability** - Swap implementations via adapters
4. **Simplicity** - One-word names, clear responsibilities
5. **Reliability** - Explicit error handling with Result types

### Technology Stack

```
┌─────────────────────────────────────────┐
│           React/ReactLynx               │
│  Modern UI framework with hooks         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│            Zustand                      │
│  Lightweight state management           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         @ariob/core                     │
│  Business logic & abstractions          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│            Gun.js                       │
│  Decentralized database & sync          │
└─────────────────────────────────────────┘
```

---

## Architectural Principles

### 1. UNIX Philosophy

#### Do One Thing Well
Each module has a single, clear responsibility:

```typescript
// ✅ Focused modules
validator.ts    // Only validation logic
manager.ts      // Only subscription management
adapter.ts      // Only database abstraction

// ❌ Monolithic approach
service.ts      // Everything in one file
```

#### Composition Over Complexity
Build complex features by composing simple parts:

```typescript
// Service composed from smaller units
const service = (config: ServiceConfig) => ({
  validator,  // Handles validation
  adapter,    // Handles persistence
  manager,    // Handles subscriptions
});

// Factory composes service with defaults
const make = (schema, prefix, options) =>
  service({
    validator: validator(schema),
    adapter: adapt(gun, schema, options),
    manager: manager(),
    ...
  });
```

#### Silent Success, Loud Failure
Explicit error handling everywhere:

```typescript
// All operations return Result<T, Error>
const result = await service.create(data);

result.match(
  (success) => handleSuccess(success),
  (error) => handleError(error)  // Errors must be handled
);
```

### 2. Type-Driven Development

Types flow from schemas through the entire stack:

```typescript
// 1. Define schema
const TodoSchema = ThingSchema.extend({
  title: z.string(),
  completed: z.boolean(),
});

// 2. Automatic type inference
type Todo = z.infer<typeof TodoSchema>;

// 3. Fully typed service
const todos = make(TodoSchema, 'todos');
//    ^? ThingService<Todo>

// 4. Typed results
const result = await todos.create({ title: 'Task' });
//    ^? Result<Todo, AppError>
```

### 3. Dependency Injection

Dependencies are explicit and injectable:

```typescript
// ✅ Explicit dependencies
const service = (config: {
  validator: Validator<T>;
  adapter: Adapter<T>;
  manager: Manager;
}) => { /* ... */ };

// ❌ Implicit dependencies
const service = () => {
  const gun = require('./gun'); // Hidden!
  // ...
};
```

---

## Layered Architecture

The architecture follows a strict layered pattern with clear boundaries:

```
┌────────────────────────────────────────────────────────────┐
│                    Layer 5: Components                      │
│  React components consuming hooks and stores                │
│  Example: TodoList, NoteEditor, AuthScreen                  │
└────────────────────────┬───────────────────────────────────┘
                         │ Uses hooks
┌────────────────────────▼───────────────────────────────────┐
│                     Layer 4: Hooks                          │
│  React hooks for component integration                      │
│  Files: useThing, useWho, useThingList                     │
│  Exports: thing(), who(), list()                           │
└────────────────────────┬───────────────────────────────────┘
                         │ Uses stores
┌────────────────────────▼───────────────────────────────────┐
│                     Layer 3: Stores                         │
│  Zustand stores for state management                        │
│  Files: thing.store.ts, who.store.ts                       │
│  Exports: createThingStore(), useWhoStore()                │
└────────────────────────┬───────────────────────────────────┘
                         │ Uses services
┌────────────────────────▼───────────────────────────────────┐
│                   Layer 2: Services                         │
│  Business logic, composed from validator + adapter + mgr    │
│  Files: thing/service.ts, who.service.ts                   │
│  Exports: make(), service(), who                           │
└────────────────────────┬───────────────────────────────────┘
                         │ Uses adapters
┌────────────────────────▼───────────────────────────────────┐
│                   Layer 1: Adapters                         │
│  Database abstraction layer                                 │
│  Files: gun.ts, user.ts, memory.ts                         │
│  Exports: adapt(), GunAdapter, UserAdapter, MemoryAdapter  │
└────────────────────────┬───────────────────────────────────┘
                         │ Uses Gun/SEA
┌────────────────────────▼───────────────────────────────────┐
│                   Layer 0: Primitives                       │
│  Gun.js and SEA instances (never modified)                  │
│  Files: gun/core/gun.ts                                    │
│  Exports: gun, sea                                         │
└────────────────────────────────────────────────────────────┘
```

### Layer Dependencies

**Rules:**
- Layers can only depend on layers below them
- Lower layers have no knowledge of upper layers
- Each layer provides an abstraction over the layer below

**Example:**
```typescript
// ✅ Correct: Hooks use stores
const { item } = thing(useStore, id);

// ❌ Wrong: Stores cannot use hooks
const store = () => {
  const hook = useSomething(); // ERROR!
};
```

---

## Dependency Graph

### High-Level Dependencies

```
Components
    ↓
  Hooks ──────────┐
    ↓             │
 Stores           │
    ↓             │
Services ←────────┘
    ↓
 Adapters
    ↓
Gun/SEA
```

### Detailed Module Dependencies

```
gun/hooks/useThing.ts
  ├─→ gun/state/thing.store.ts
  │     ├─→ gun/services/thing/index.ts
  │     │     ├─→ gun/services/thing/validator.ts
  │     │     │     ├─→ gun/lib/utils.ts
  │     │     │     └─→ gun/schema/thing.schema.ts
  │     │     ├─→ gun/services/thing/manager.ts
  │     │     ├─→ gun/adapters/index.ts
  │     │     │     ├─→ gun/adapters/gun.ts
  │     │     │     ├─→ gun/adapters/user.ts
  │     │     │     ├─→ gun/adapters/memory.ts
  │     │     │     └─→ gun/core/gun.ts
  │     │     └─→ gun/services/thing/service.ts
  │     └─→ zustand
  └─→ react

gun/hooks/useWho.ts
  ├─→ gun/state/who.store.ts
  │     ├─→ gun/services/who.service.ts
  │     │     ├─→ gun/core/gun.ts
  │     │     ├─→ gun/lib/storage.ts
  │     │     └─→ gun/schema/who.schema.ts
  │     └─→ zustand
  └─→ react
```

### No Circular Dependencies

The architecture explicitly prevents circular dependencies:

```typescript
// ✅ Linear dependency chain
utils.ts → validator.ts → service.ts → store.ts → hook.ts

// ❌ Circular dependency (prevented by design)
service.ts ⇄ store.ts
```

---

## Data Flow

### Creation Flow

```
User Input
    ↓
Component calls store.create(data)
    ↓
Store calls service.create(data)
    ↓
Service: validator.prepare(data)
    ↓  (adds id, timestamps, soul)
Service: validator.check(prepared)
    ↓  (validates with Zod)
Service: adapter.put(path, validated)
    ↓  (persists to Gun)
Adapter returns Result<T, Error>
    ↓
Service returns Result<T, Error>
    ↓
Store updates state & returns Result
    ↓
Component handles result
```

**Code Example:**

```typescript
// 1. User clicks "Add Todo"
const handleAdd = async () => {
  // 2. Component calls store
  const result = await store.create({ title: 'New task' });

  result.match(
    (todo) => console.log('Created:', todo),
    (error) => console.error('Failed:', error)
  );
};

// 3. Store delegates to service
const create = async (data) => {
  set({ isLoading: true });
  const result = await service.create(data);

  result.match(
    (item) => set({ items: [...items, item], isLoading: false }),
    (error) => set({ error, isLoading: false })
  );

  return result;
};

// 4. Service orchestrates validation and persistence
const create = async (input) => {
  // 4a. Prepare data (add metadata)
  const prepared = validator.prepare(input, options);

  // 4b. Validate
  const validated = validator.check(prepared);
  if (validated.isErr()) return validated;

  // 4c. Persist
  const path = soul(prefix, prepared.id);
  return adapter.put(path, validated.value);
};

// 5. Adapter interacts with Gun
const put = async (path, data) => {
  return new Promise((resolve) => {
    gun.get(path).put(data, (ack) => {
      if (ack.err) resolve(err(Err.db(ack.err)));
      else resolve(ok(data));
    });
  });
};
```

### Read Flow (with Real-Time Updates)

```
Component mounts
    ↓
Hook calls store.watch(id)
    ↓
Store calls service.watch(id, callback)
    ↓
Service calls adapter.watch(path, callback)
    ↓
Adapter subscribes to Gun.on(path)
    ↓
Gun emits updates
    ↓
Adapter validates & calls callback
    ↓
Service calls callback with Result
    ↓
Store updates state
    ↓
Component re-renders with new data
```

**Code Example:**

```typescript
// 1. Component uses hook
function TodoItem({ id }) {
  const { item } = thing(useStore, id);
  // item updates automatically!

  return <div>{item?.title}</div>;
}

// 2. Hook sets up subscription
const thing = (useStore, id) => {
  const store = useStore();

  useEffect(() => {
    // Subscribe on mount
    const unsubscribe = store.watch(id);

    // Cleanup on unmount
    return () => unsubscribe();
  }, [id]);

  return { item: store.byId[id] };
};

// 3. Store manages subscription
const watch = (id) => {
  const unsubscribe = service.watch(id, (result) => {
    result.match(
      (item) => set({ byId: { ...byId, [id]: item } }),
      (error) => set({ error })
    );
  });

  return unsubscribe;
};

// 4. Service delegates to adapter
const watch = (id, callback) => {
  const path = soul(prefix, id);

  const unsubscribe = adapter.watch(path, (data) => {
    if (data === null) callback(ok(null));
    else callback(ok(data));
  });

  manager.add(path, unsubscribe);
  return () => manager.remove(path);
};

// 5. Adapter subscribes to Gun
const watch = (path, callback) => {
  gun.get(path).on((data) => {
    if (!data) {
      callback(null);
      return;
    }

    const validated = check(data);
    validated.match(
      (valid) => callback(valid),
      () => callback(null)
    );
  });

  return () => gun.get(path).off();
};
```

---

## Design Patterns

### 1. Factory Pattern

Used for creating services, adapters, and stores:

```typescript
// Service factory
export const make = <T extends Thing>(
  schema: z.ZodType<T>,
  prefix: string,
  options?: ServiceOptions
): ThingService<T> => {
  const validator = createValidator(schema);
  const adapter = adapt(gun, schema, options);
  const manager = createManager();

  return service({ validator, adapter, manager, prefix, options });
};

// Adapter factory
export const adapt = <T>(
  gun: GunInstance,
  schema: z.ZodType<T>,
  options?: AdapterOptions
): Adapter<T> => {
  if (options?.scoped && options.user) {
    return new UserAdapter(options.user, schema);
  }
  return new GunAdapter(gun, schema);
};

// Store factory
export const createThingStore = <T extends Thing>(
  service: ThingService<T>,
  name: string
) => {
  return create<ThingStore<T>>()(
    devtools((set, get) => ({
      // Store implementation
    }), { name })
  );
};
```

### 2. Adapter Pattern

Abstracts database operations for testability:

```typescript
// Adapter interface
interface Adapter<T> {
  get(path: string): Promise<Result<T | null, AppError>>;
  put(path: string, data: T): Promise<Result<T, AppError>>;
  remove(path: string): Promise<Result<boolean, AppError>>;
  list(path: string): Promise<Result<T[], AppError>>;
  watch(path: string, callback: (data: T | null) => void): () => void;
}

// Production implementation
class GunAdapter<T> implements Adapter<T> {
  constructor(private gun: GunInstance, private schema: z.ZodType<T>) {}
  // ... Gun-specific implementation
}

// Test implementation
class MemoryAdapter<T> implements Adapter<T> {
  private storage = new Map<string, T>();
  // ... In-memory implementation
}

// Usage
const prodService = make(schema, 'todos'); // Uses Gun
const testService = service({
  adapter: new MemoryAdapter(schema)
}); // Uses memory
```

### 3. Result Pattern

Explicit error handling without exceptions:

```typescript
// All async operations return Result<T, Error>
type Result<T, E> = Ok<T> | Err<E>;

// Success case
const ok = <T>(value: T): Ok<T> => ({ _tag: 'ok', value });

// Error case
const err = <E>(error: E): Err<E> => ({ _tag: 'err', error });

// Usage
const result = await service.create(data);

result.match(
  (value) => {
    // Handle success - value is fully typed
    console.log('Created:', value.id);
  },
  (error) => {
    // Handle error - error is fully typed
    switch (error.type) {
      case 'VALIDATION_ERROR':
        console.error('Invalid data:', error.details);
        break;
      case 'AUTH_ERROR':
        console.error('Not authenticated');
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
);
```

### 4. Dependency Injection

Dependencies are passed explicitly:

```typescript
// ✅ Dependencies injected
const service = (config: ServiceConfig<T>) => {
  const { validator, adapter, manager, prefix, options } = config;

  return {
    create: async (input) => {
      const prepared = validator.prepare(input, options);
      const validated = validator.check(prepared);
      if (validated.isErr()) return validated;

      const path = soul(prefix, prepared.id);
      return adapter.put(path, validated.value);
    },
    // ... other methods
  };
};

// Testing: inject mock dependencies
const testService = service({
  validator: mockValidator,
  adapter: new MemoryAdapter(schema),
  manager: mockManager,
  prefix: 'test',
  options: {}
});
```

### 5. Composition Pattern

Complex services built from simple functions:

```typescript
// Small, focused functions
const validator = (schema) => ({
  check: (data) => { /* validate */ },
  prepare: (input) => { /* add metadata */ },
});

const manager = () => ({
  add: (key, fn) => { /* track subscription */ },
  remove: (key) => { /* unsubscribe */ },
  cleanup: () => { /* cleanup all */ },
});

// Composed into service
const service = ({ validator, adapter, manager }) => ({
  create: compose(
    validator.prepare,
    validator.check,
    adapter.put
  ),
  update: compose(
    adapter.get,
    merge,
    validator.check,
    adapter.put
  ),
  // ... etc
});
```

---

## Module Reference

### Layer 0: Primitives (`gun/core/`)

**Purpose:** Gun.js and SEA initialization

**Files:**
- `gun.ts` - Gun instance creation and configuration
- `types.ts` - TypeScript type definitions for Gun/SEA
- `gun.config.ts` - Configuration options

**Key Exports:**
```typescript
export { gun, sea } from '@ariob/core';
```

**Rules:**
- NEVER modify Gun or SEA prototypes
- NEVER extend Gun/SEA classes
- Always use through adapters

### Layer 1: Pure Utilities (`gun/lib/`)

**Purpose:** Side-effect-free utility functions

**Files:**
- `utils.ts` - Pure functions (soul, parse, stamp, random, extract)
- `storage.ts` - Storage abstraction (Web, Native)

**Key Functions:**

```typescript
// Path management
soul(prefix: string, id: string): string
parse(soul: string): { prefix: string; id: string } | null

// ID generation
random(bytes?: number): string

// Timestamps
stamp(): number

// Schema utilities
extract(schema: z.ZodType): string | null

// Storage
storage(): Storage
```

**Characteristics:**
- ✅ Pure functions (no side effects)
- ✅ Fully testable
- ✅ No external dependencies (except Zod)

### Layer 2: Adapters (`gun/adapters/`)

**Purpose:** Database abstraction layer

**Files:**
- `adapter.ts` - Interface definition
- `gun.ts` - Gun database implementation
- `user.ts` - User-scoped Gun implementation
- `memory.ts` - In-memory implementation (testing)
- `index.ts` - Factory and exports

**Interface:**

```typescript
interface Adapter<T> {
  get(path: string): Promise<Result<T | null, AppError>>;
  put(path: string, data: T): Promise<Result<T, AppError>>;
  remove(path: string): Promise<Result<boolean, AppError>>;
  list(path: string): Promise<Result<T[], AppError>>;
  watch(path: string, callback: (data: T | null) => void): () => void;
}
```

**Factory:**

```typescript
adapt<T>(
  gun: GunInstance,
  schema: z.ZodType<T>,
  options?: { scoped?: boolean; user?: GunUser }
): Adapter<T>
```

### Layer 3: Services (`gun/services/`)

**Purpose:** Business logic and data orchestration

**Thing Service Structure:**
```
gun/services/thing/
├── validator.ts    # Validation & preparation
├── manager.ts      # Subscription management
├── service.ts      # Core service logic
├── factory.ts      # Convenience factory
└── index.ts        # Exports
```

**Key Exports:**

```typescript
// High-level factory
make<T>(schema, prefix, options?): ThingService<T>

// Low-level builder
service<T>(config: ServiceConfig<T>): ThingService<T>

// Building blocks
validator<T>(schema: z.ZodType<T>): Validator<T>
manager(): Manager
```

**Service Interface:**

```typescript
interface ThingService<T> {
  create(input: Partial<T>): Promise<Result<T, AppError>>;
  get(id: string): Promise<Result<T | null, AppError>>;
  update(id: string, updates: Partial<T>): Promise<Result<T | null, AppError>>;
  remove(id: string): Promise<Result<boolean, AppError>>;
  list(): Promise<Result<T[], AppError>>;
  watch(id: string, callback: (result: Result<T | null, AppError>) => void): () => void;
  cleanup(): void;
  soul(id: string): string;
}
```

### Layer 4: Stores (`gun/state/`)

**Purpose:** Reactive state management with Zustand

**Files:**
- `thing.store.ts` - Generic Thing store factory
- `who.store.ts` - Authentication store

**Factory:**

```typescript
createThingStore<T>(
  service: ThingService<T>,
  name: string,
  options?: StoreOptions
): () => ThingStore<T>
```

**Store Interface:**

```typescript
interface ThingStore<T> {
  // State
  items: T[];
  byId: Record<string, T>;
  isLoading: boolean;
  error: AppError | null;

  // Actions
  create(data: Partial<T>): Promise<Result<T, AppError>>;
  get(id: string): Promise<Result<T | null, AppError>>;
  update(id: string, updates: Partial<T>): Promise<Result<T | null, AppError>>;
  remove(id: string): Promise<Result<boolean, AppError>>;
  fetch(): Promise<Result<T[], AppError>>;
  watch(id: string): () => void;
  cleanup(): void;
}
```

### Layer 5: Hooks (`gun/hooks/`)

**Purpose:** React integration

**Files:**
- `useThing.ts` - Single item management
- `useWho.ts` - Authentication
- `useThingList.ts` - List management
- `useRealTime.ts` - Real-time subscriptions

**Key Hooks:**

```typescript
// Single item
useThing<T>(
  useStore: () => ThingStore<T>,
  id: string,
  options?: UseThingOptions
): {
  item: T | null;
  update: (updates: Partial<T>) => Promise<Result<T | null, AppError>>;
  remove: () => Promise<Result<boolean, AppError>>;
  isLoading: boolean;
  error: AppError | null;
}

// Authentication
useWho(): {
  user: Who | null;
  isLoading: boolean;
  error: AppError | null;
  isAuthenticated: boolean;
  signup(request: AuthRequest): Promise<Result<Who, AppError>>;
  login(request: AuthRequest): Promise<Result<Who, AppError>>;
  logout(): void;
  updateProfile(updates: Partial<Who>): Promise<Result<Who, AppError>>;
}
```

---

## Extension Points

### 1. Custom Adapters

Implement the `Adapter<T>` interface for custom databases:

```typescript
import { Adapter, AppError } from '@ariob/core';
import { Result, ok, err } from 'neverthrow';

class PostgresAdapter<T> implements Adapter<T> {
  constructor(
    private pool: pg.Pool,
    private schema: z.ZodType<T>,
    private tableName: string
  ) {}

  async get(path: string): Promise<Result<T | null, AppError>> {
    try {
      const { rows } = await this.pool.query(
        'SELECT * FROM $1 WHERE path = $2',
        [this.tableName, path]
      );

      if (rows.length === 0) return ok(null);

      const validated = this.schema.safeParse(rows[0]);
      if (!validated.success) {
        return err(Err.validation(validated.error));
      }

      return ok(validated.data);
    } catch (error) {
      return err(Err.db(error.message));
    }
  }

  // Implement other methods...
}

// Usage
const adapter = new PostgresAdapter(pool, TodoSchema, 'todos');
const todos = service({
  validator: validator(TodoSchema),
  adapter,
  manager: manager(),
  prefix: 'todos',
  options: { prefix: 'todos', type: 'todo' }
});
```

### 2. Custom Validation

Extend the validator with custom logic:

```typescript
const customValidator = <T extends Thing>(schema: z.ZodType<T>) => {
  const base = validator(schema);

  return {
    ...base,

    // Override prepare to add custom metadata
    prepare: (input: Partial<T>, options: PrepareOptions): T => {
      const prepared = base.prepare(input, options);

      return {
        ...prepared,
        // Add custom fields
        version: '2.0',
        source: 'mobile-app',
      } as T;
    },

    // Add custom validation method
    checkUnique: async (field: keyof T, value: any): Promise<boolean> => {
      // Custom uniqueness check
      const existing = await adapter.list();
      return existing.every(item => item[field] !== value);
    },
  };
};
```

### 3. Middleware Pattern

Add middleware for logging, caching, etc:

```typescript
const withLogging = <T extends Thing>(
  service: ThingService<T>
): ThingService<T> => {
  return {
    ...service,

    create: async (input) => {
      console.log('[CREATE] Input:', input);
      const result = await service.create(input);
      console.log('[CREATE] Result:', result);
      return result;
    },

    // Wrap other methods similarly...
  };
};

// Usage
const todos = withLogging(make(TodoSchema, 'todos'));
```

### 4. Custom Hooks

Build custom hooks on top of existing ones:

```typescript
// Filtered list hook
const useCompletedTodos = () => {
  const { items } = useTodos();

  return useMemo(() =>
    items.filter(todo => todo.completed),
    [items]
  );
};

// Paginated hook
const usePaginatedTodos = (page: number, perPage: number) => {
  const { items } = useTodos();

  return useMemo(() => {
    const start = page * perPage;
    const end = start + perPage;
    return items.slice(start, end);
  }, [items, page, perPage]);
};
```

### 5. Schema Composition

Build complex schemas from simple ones:

```typescript
// Base schemas
const TimestampedSchema = z.object({
  createdAt: z.number(),
  updatedAt: z.number().optional(),
});

const AuthoredSchema = z.object({
  createdBy: z.string(),
  modifiedBy: z.string().optional(),
});

// Composed schema
const ArticleSchema = ThingSchema
  .merge(TimestampedSchema)
  .merge(AuthoredSchema)
  .extend({
    title: z.string(),
    content: z.string(),
    published: z.boolean().default(false),
  });
```

---

## Real-World Scenarios

### Scenario 1: Multi-Tenant Blog Platform

```typescript
// Different services for different data scopes
const publicPosts = make(PostSchema, 'posts');
const draftPosts = make(PostSchema, 'drafts', { scoped: true });
const privateNotes = make(NoteSchema, 'notes', { scoped: true });
const userProfiles = make(ProfileSchema, 'profiles');

// Stores
const usePublicPosts = createThingStore(publicPosts, 'PublicPosts');
const useDrafts = createThingStore(draftPosts, 'Drafts');
const useNotes = createThingStore(privateNotes, 'Notes');

// Component
function BlogEditor() {
  const { user } = useWho();
  const { items: drafts, create: createDraft } = useDrafts();
  const { create: publish } = usePublicPosts();

  const publishDraft = async (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (!draft) return;

    // Create public post from draft
    const result = await publish({
      title: draft.title,
      content: draft.content,
      author: user?.alias,
    });

    result.match(
      async (post) => {
        // Remove draft after publishing
        await draftPosts.remove(draftId);
        console.log('Published:', post.id);
      },
      (error) => console.error('Publish failed:', error)
    );
  };

  return (
    <div>
      {drafts.map(draft => (
        <div key={draft.id}>
          <h3>{draft.title}</h3>
          <button onClick={() => publishDraft(draft.id)}>
            Publish
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Scenario 2: Real-Time Collaboration

```typescript
const DocumentSchema = ThingSchema.extend({
  title: z.string(),
  content: z.string(),
  editors: z.array(z.string()),
  locked: z.boolean().default(false),
});

const docs = make(DocumentSchema, 'documents');
const useDocs = createThingStore(docs, 'Documents');

function CollaborativeEditor({ docId }: { docId: string }) {
  const { user } = useWho();
  const { item: doc, update } = useThing(useDocs, docId);
  const [localContent, setLocalContent] = useState('');

  // Sync remote changes to local state
  useEffect(() => {
    if (doc) setLocalContent(doc.content);
  }, [doc?.content]);

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (doc && localContent !== doc.content) {
        update({ content: localContent });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localContent]);

  // Show active editors
  const activeEditors = doc?.editors.filter(e => e !== user?.pub) || [];

  return (
    <div>
      <div className="editors">
        {activeEditors.length > 0 && (
          <span>Also editing: {activeEditors.join(', ')}</span>
        )}
      </div>
      <textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        disabled={doc?.locked}
      />
    </div>
  );
}
```

### Scenario 3: Offline-First Mobile App

```typescript
// Services with offline support
const todos = make(TodoSchema, 'todos', { scoped: true });
const useTodos = createThingStore(todos, 'Todos');

function OfflineTodoApp() {
  const [online, setOnline] = useState(navigator.onLine);
  const { items, create } = useTodos();

  // Track online status
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addTodo = async (title: string) => {
    // Optimistic update - works offline!
    const tempId = random();
    const optimisticTodo = {
      id: tempId,
      title,
      completed: false,
      _pending: true, // Mark as pending
    };

    // Show immediately
    setLocalTodos([...localTodos, optimisticTodo]);

    // Sync when online
    const result = await create({ title, completed: false });

    result.match(
      (todo) => {
        // Replace temp with real
        setLocalTodos(todos =>
          todos.map(t => t.id === tempId ? todo : t)
        );
      },
      (error) => {
        // Retry later or show error
        if (!online) {
          queueForRetry(optimisticTodo);
        }
      }
    );
  };

  return (
    <div>
      {!online && <div className="offline-banner">Offline Mode</div>}
      {/* ... */}
    </div>
  );
}
```

---

## Performance Characteristics

### Memory Footprint

| Component | Memory Usage | Notes |
|-----------|-------------|-------|
| Service | ~1-2 KB | Lightweight, mostly function refs |
| Store | ~5-10 KB | Zustand state + actions |
| Adapter | ~2-5 KB | Minimal overhead |
| Subscriptions | ~1 KB each | Tracked in manager |

**Optimization:** Clean up subscriptions when components unmount.

### Subscription Management

```typescript
// Each service tracks its subscriptions
const manager = () => {
  const subs = new Map<string, () => void>();

  return {
    add: (key, unsub) => subs.set(key, unsub),
    remove: (key) => {
      subs.get(key)?.();
      subs.delete(key);
    },
    cleanup: () => {
      subs.forEach(unsub => unsub());
      subs.clear();
    },
    size: () => subs.size,
  };
};

// Cleanup on service disposal
useEffect(() => {
  return () => service.cleanup();
}, []);
```

### Validation Performance

Zod validation is fast but can be expensive for large objects:

```typescript
// ✅ Good: Validate once
const prepared = validator.prepare(input);
const validated = validator.check(prepared);

// ❌ Bad: Validate multiple times
validator.check(input);
validator.check(input); // Redundant!
```

### Bundle Size

| Module | Minified | Gzipped | Tree-shakeable |
|--------|----------|---------|----------------|
| Core | ~15 KB | ~5 KB | ✅ |
| Services | ~20 KB | ~7 KB | ✅ |
| Stores | ~10 KB | ~4 KB | ✅ |
| Hooks | ~5 KB | ~2 KB | ✅ |
| **Total** | **~50 KB** | **~18 KB** | **✅** |

**Note:** Gun.js adds ~100 KB (not included in above).

---

## Summary

The @ariob/core architecture achieves its goals through:

1. **Strict Layering** - Clear boundaries and dependencies
2. **Composition** - Complex features from simple parts
3. **Type Safety** - Full inference from schemas
4. **Testability** - Adapter pattern enables easy testing
5. **Explicitness** - Result types make errors visible
6. **Simplicity** - One-word names, focused modules

This architecture enables:
- ✅ Rapid development with excellent DX
- ✅ Full test coverage without mocking Gun
- ✅ Easy reasoning about data flow
- ✅ Flexible extension without modification
- ✅ Production-ready reliability

---

**Next Steps:**
- [API Reference](./API.md) - Detailed API documentation
- [Examples](./EXAMPLES.md) - Real-world usage patterns
- [Migration Guide](./MIGRATION.md) - Upgrading existing code

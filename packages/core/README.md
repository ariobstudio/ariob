# @ariob/core

A decentralized application framework built on Gun.js, following UNIX philosophy principles for simplicity, composability, and testability.

## Features

- 🔐 **Multi-Authentication** - Keypair, mnemonic, and traditional authentication methods
- 📦 **Schema-First Design** - Type-safe data validation with Zod
- ⚡ **Real-Time Sync** - Automatic data synchronization across devices via Gun.js
- 🧩 **Composable Architecture** - Small, focused modules that work together
- 🧪 **Testable** - Memory adapter for unit testing without Gun instance
- 🔒 **Secure** - End-to-end encryption with SEA
- 📱 **Cross-Platform** - Works on Web, React Native, iOS, and Android

## Installation

```bash
npm install @ariob/core
```

or

```bash
pnpm add @ariob/core
```

## Quick Start

### Basic Usage

```typescript
import { make, ThingSchema } from '@ariob/core';
import { z } from 'zod';

// Define your schema
const TodoSchema = ThingSchema.extend({
  title: z.string(),
  completed: z.boolean().default(false),
});

// Create a service
const todos = make(TodoSchema, 'todos');

// Use it
const result = await todos.create({
  title: 'Learn @ariob/core',
  completed: false
});

result.match(
  (todo) => console.log('Created:', todo),
  (error) => console.error('Error:', error)
);
```

### Authentication

```typescript
import { who } from '@ariob/core';

// Sign up with traditional auth
const result = await who.signup({
  method: 'traditional',
  alias: 'alice',
  passphrase: 'secure-password-123'
});

// Or use mnemonic
const mnemonicResult = await who.signup({
  method: 'mnemonic',
  alias: 'bob',
  passphrase: 'optional-passphrase'
});

// Access current user
const user = who.current();
console.log('Logged in as:', user?.alias);
```

### React Hooks

```typescript
import { createThingStore, useThing } from '@ariob/core';

// Create a store
const useNotesStore = createThingStore(notesService, 'Notes');

// Use in component
function NoteDetail({ noteId }: { noteId: string }) {
  const { item: note, isLoading, update } = useThing(useNotesStore, noteId);

  if (isLoading) return <div>Loading...</div>;
  if (!note) return <div>Not found</div>;

  return (
    <div>
      <h1>{note.title}</h1>
      <button onClick={() => update({ title: 'Updated!' })}>
        Update
      </button>
    </div>
  );
}
```

## Core Concepts

### Things

Things are the base unit of data in the system. Every entity extends the `Thing` schema:

```typescript
const ThingSchema = z.object({
  id: z.string(),           // Unique identifier
  soul: z.string(),         // Gun path (prefix/id)
  schema: z.string(),       // Type discriminator
  createdAt: z.number(),    // Creation timestamp
  updatedAt: z.number(),    // Last update timestamp
  createdBy: z.string(),    // Creator's public key (optional)
  public: z.boolean(),      // Visibility flag
});
```

### Services

Services provide CRUD operations with real-time subscriptions:

```typescript
interface ThingService<T> {
  create(data: Partial<T>): Promise<Result<T, AppError>>;
  get(id: string): Promise<Result<T | null, AppError>>;
  update(id: string, updates: Partial<T>): Promise<Result<T | null, AppError>>;
  remove(id: string): Promise<Result<boolean, AppError>>;
  list(): Promise<Result<T[], AppError>>;
  watch(id: string, callback: (data: Result<T | null, AppError>) => void): () => void;
  cleanup(): void;
}
```

### Adapters

Adapters abstract database operations, allowing you to swap implementations:

- **GunAdapter** - Production adapter using Gun.js
- **UserAdapter** - User-scoped private data
- **MemoryAdapter** - In-memory storage for testing

### Result Types

All async operations return `Result` types for explicit error handling:

```typescript
const result = await todos.create(data);

result.match(
  (todo) => console.log('Success:', todo),
  (error) => console.error('Error:', error.message)
);
```

## Architecture

The package follows UNIX philosophy with small, composable modules:

```
@ariob/core/
├── adapters/     # Database adapters
├── core/         # Gun initialization
├── hooks/        # React hooks
├── lib/          # Pure utilities
├── schema/       # Data schemas
├── services/     # Business logic
└── state/        # State management
```

## Testing

Use the Memory adapter for testing without a Gun instance:

```typescript
import { Memory, service, validator, manager } from '@ariob/core';

const adapter = new Memory(TodoSchema);
const todos = service({
  validator: validator(TodoSchema),
  adapter,
  manager: manager(),
  prefix: 'todos',
  options: { prefix: 'todos', type: 'todo' }
});

// Test without Gun
await todos.create({ title: 'Test', completed: false });
```

## Documentation

### Main Documentation

- [API Reference](./docs/API.md) - Complete API documentation
- [Architecture](./docs/ARCHITECTURE.md) - System design and patterns

### Module Documentation

- [Gun Module](./gun/README.md) - Gun.js integration and services
  - [Core](./gun/core/README.md) - Gun.js initialization and utilities
  - [Schemas](./gun/schema/README.md) - Data validation with Zod
  - [Services](./gun/services/README.md) - Business logic and CRUD operations
  - [State](./gun/state/README.md) - Zustand state management
  - [Hooks](./gun/hooks/README.md) - React hooks

### Additional Resources

- [Frozen Data](./docs/concepts/frozen-data.md) - Content-addressed storage patterns

## License

MIT

## Support

For issues and questions, please visit our [GitHub repository](https://github.com/ariobstudio/ariob).
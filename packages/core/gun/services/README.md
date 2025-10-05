# Gun Services

Business logic layer with type-safe operations and error handling.

## Overview

Services provide a functional interface for working with Gun.js data.

- Type-safe CRUD operations
- Real-time subscriptions
- Result types for error handling
- User-scoped data support
- Soul generation for Gun.js paths

## Core Services

### Thing Service

The `make` function creates a type-safe service for any schema:

```typescript
import { make, ThingSchema } from '@ariob/core';
import { z } from 'zod';

// Define schema
const TodoSchema = ThingSchema.extend({
  text: z.string(),
  completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

// Create service
const todoService = make(TodoSchema, 'todos');

// Use service
const result = await todoService.create({
  text: 'Build an awesome app',
  completed: false,
  priority: 'high',
});

result.match(
  (todo) => console.log('Created todo:', todo.id),
  (error) => console.error('Failed:', error.message)
);
```

### Who Service

Authentication service supporting multiple methods:

```typescript
import { who } from '@ariob/core';

// Keypair authentication (recommended)
const result = await who.signup({
  method: 'keypair',
  alias: 'alice',
});

// Mnemonic authentication
const result = await who.signup({
  method: 'mnemonic',
  alias: 'bob',
  passphrase: 'optional-extra-security',
});

// Traditional authentication
const result = await who.signup({
  method: 'traditional',
  alias: 'charlie',
  passphrase: 'secure-password-123',
});

// Check current user
const currentUser = who.current();
console.log('Logged in as:', currentUser?.alias);
```

## Service API

### Creating Services

```typescript
import { make, ServiceOptions } from '@ariob/core';

// Basic service
const publicService = make(schema, 'prefix');

// User-scoped service (data stored under authenticated user)
const privateService = make(schema, 'private-prefix', {
  userScoped: true,
});
```

### Service Methods

All services implement the `ThingService<T>` interface:

```typescript
interface ThingService<T> {
  // Create a new entity
  create(data: Omit<T, 'id' | 'soul' | 'createdAt' | 'schema' | 'createdBy'>): Promise<Result<T, AppError>>;

  // Get entity by ID
  get(id: string): Promise<Result<T | null, AppError>>;

  // Update entity
  update(id: string, updates: Partial<T>): Promise<Result<T | null, AppError>>;

  // Remove entity
  remove(id: string): Promise<Result<boolean, AppError>>;

  // List all entities
  list(): Promise<Result<T[], AppError>>;

  // Watch entity for real-time updates
  watch(id: string, callback: (result: Result<T | null, AppError>) => void): () => void;

  // Clean up all subscriptions
  cleanup(): void;

  // Get Gun.js soul path
  soul(id: string): string;
}
```

## Complete Examples

### Task Management

```typescript
import { make, ThingSchema } from '@ariob/core';
import { z } from 'zod';

const TaskSchema = ThingSchema.extend({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']).default('todo'),
  assignedTo: z.string().optional(),
  dueDate: z.number().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

type Task = z.infer<typeof TaskSchema>;

// Create service
const taskService = make(TaskSchema, 'tasks');

// Create task
async function createTask(input: {
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
  priority?: Task['priority'];
}) {
  const result = await taskService.create({
    title: input.title,
    description: input.description,
    assignedTo: input.assignedTo,
    dueDate: input.dueDate?.getTime(),
    priority: input.priority || 'medium',
    status: 'todo',
  });

  return result.match(
    (task) => {
      console.log('Task created:', task.id);
      return task;
    },
    (error) => {
      console.error('Failed to create task:', error);
      throw error;
    }
  );
}

// Real-time monitoring
function watchTask(taskId: string) {
  const unsubscribe = taskService.watch(taskId, (result) => {
    result.match(
      (task) => {
        if (task) {
          console.log('Task updated:', task.status);
          updateUI(task);
        } else {
          console.log('Task deleted');
          removeFromUI(taskId);
        }
      },
      (error) => console.error('Watch error:', error)
    );
  });

  return unsubscribe;
}

// Bulk operations
async function assignTasksToUser(taskIds: string[], userId: string) {
  const results = await Promise.all(
    taskIds.map(id =>
      taskService.update(id, {
        assignedTo: userId,
        status: 'in-progress'
      })
    )
  );

  const succeeded = results.filter(r => r.isOk()).length;
  console.log(`Assigned ${succeeded}/${taskIds.length} tasks`);
}
```

### Private User Data

```typescript
import { make, ThingSchema } from '@ariob/core';
import { z } from 'zod';

const SettingsSchema = ThingSchema.extend({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sound: z.boolean().default(true),
  }),
  privacy: z.object({
    profileVisible: z.boolean().default(true),
    showOnlineStatus: z.boolean().default(true),
  }),
  language: z.string().default('en'),
});

// User-scoped service - data only accessible by authenticated user
const settingsService = make(SettingsSchema, 'settings', {
  userScoped: true,
});

// Settings manager
class UserSettings {
  private static SETTINGS_ID = 'default';

  static async load() {
    const result = await settingsService.get(this.SETTINGS_ID);

    if (result.isOk() && result.value) {
      return result.value;
    }

    return this.createDefaults();
  }

  static async save(updates: Partial<z.infer<typeof SettingsSchema>>) {
    const result = await settingsService.update(this.SETTINGS_ID, {
      ...updates,
      updatedAt: Date.now(),
    });

    if (result.isErr()) {
      if (result.error.type === 'NOT_FOUND') {
        return this.createDefaults(updates);
      }
      throw result.error;
    }

    return result.value;
  }

  private static async createDefaults(overrides?: any) {
    const result = await settingsService.create({
      theme: 'auto',
      notifications: {
        email: true,
        push: true,
        sound: true,
      },
      privacy: {
        profileVisible: true,
        showOnlineStatus: true,
      },
      language: 'en',
      ...overrides,
    });

    if (result.isErr()) throw result.error;
    return result.value;
  }
}
```

## Error Handling

All service methods return `Result` types:

```typescript
// Handle specific error types
const result = await service.create(data);

result.match(
  (item) => {
    console.log('Success:', item);
  },
  (error) => {
    switch (error.type) {
      case 'VALIDATION_ERROR':
        console.error('Invalid data:', error.details);
        break;
      case 'AUTH_ERROR':
        console.error('Authentication required');
        break;
      case 'NETWORK_ERROR':
        console.error('Connection failed');
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
);

// Or use unwrap with try/catch
try {
  const item = (await service.create(data)).unwrap();
  console.log('Created:', item);
} catch (error) {
  console.error('Failed:', error);
}
```

## Best Practices

1. **Define schemas first** - Let your data model drive implementation
2. **Use Result types** - Handle errors explicitly
3. **Clean up subscriptions** - Always call unsubscribe function
4. **Check authentication** - Verify user is logged in for user-scoped services
5. **Validate inputs** - Let Zod handle validation
6. **Use TypeScript** - Get full type safety

## Performance Tips

1. **Batch operations** when possible
2. **Use watch selectively** - Only subscribe to displayed data
3. **Clean up unused services** - Call `service.cleanup()` when done
4. **Limit list operations** - Gun.js loads all data, paginate in UI

## Security Considerations

1. **User-scoped data** is only accessible by the authenticated user
2. **Public data** is readable by anyone but writable only by authenticated users
3. **Validate all inputs** - Schemas provide first-line defense
4. **Don't store sensitive data unencrypted** - Use SEA for encryption
5. **Check ownership** before allowing updates

## See Also

- [Gun Module](../README.md) - Gun.js integration
- [Schema Module](../schema/README.md) - Data validation
- [State Module](../state/README.md) - Zustand stores
- [Hooks Module](../hooks/README.md) - React hooks
- [Main Documentation](../../README.md) - Package overview

# Gun Services

Business logic layer for Gun.js with type-safe operations and error handling.

## Overview

Services provide a clean, functional interface for working with Gun.js data. They handle:

- **Type-safe CRUD operations** with Zod validation
- **Real-time subscriptions** with automatic cleanup
- **Error handling** using Result types
- **User-scoped data** for authenticated operations
- **Soul generation** for consistent Gun.js paths

## Core Services

### Thing Service

The `make` function creates a type-safe service for any schema:

```typescript
import { make, ThingSchema } from '@ariob/core';
import { z } from 'zod';

// Define your schema
const TodoSchema = ThingSchema.extend({
  text: z.string(),
  completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

// Create the service
const todoService = make(TodoSchema, 'todos');

// Use the service
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

Authentication service supporting multiple auth methods:

```typescript
import { who } from '@ariob/core';

// Keypair authentication (recommended)
const result = await who.signup({
  method: 'keypair',
  alias: 'alice',
  // Keys are auto-generated if not provided
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

### Task Management System

```typescript
import { make, ThingSchema, who } from '@ariob/core';
import { z } from 'zod';

// Task schema with relationships
const TaskSchema = ThingSchema.extend({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']).default('todo'),
  assignedTo: z.string().optional(), // User's public key
  projectId: z.string().optional(),
  dueDate: z.number().optional(),
  tags: z.array(z.string()).default([]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

type Task = z.infer<typeof TaskSchema>;

// Create services
const taskService = make(TaskSchema, 'tasks');
const myTasksService = make(TaskSchema, 'my-tasks', { userScoped: true });

// Task creation with validation
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
    tags: [],
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

// Real-time task monitoring
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

  // Clean up when done
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

### Collaborative Document System

```typescript
import { make, ContentThingSchema, who } from '@ariob/core';
import { z } from 'zod';

// Document schema with versioning
const DocumentSchema = ContentThingSchema.extend({
  content: z.string(),
  format: z.enum(['markdown', 'html', 'plain']).default('markdown'),
  collaborators: z.array(z.string()).default([]),
  revisions: z.array(z.object({
    content: z.string(),
    editedBy: z.string(),
    timestamp: z.number(),
  })).default([]),
  locked: z.boolean().default(false),
  lockedBy: z.string().optional(),
});

type Document = z.infer<typeof DocumentSchema>;

const docService = make(DocumentSchema, 'docs');

// Collaborative editing with conflict detection
class DocumentEditor {
  private currentDoc: Document | null = null;
  private unsubscribe: (() => void) | null = null;

  async open(docId: string) {
    // Get initial document
    const result = await docService.get(docId);
    if (result.isErr()) throw result.error;
    
    this.currentDoc = result.value;
    
    // Watch for changes
    this.unsubscribe = docService.watch(docId, (result) => {
      result.match(
        (doc) => {
          if (doc) {
            this.handleRemoteUpdate(doc);
          }
        },
        (error) => console.error('Watch error:', error)
      );
    });
  }

  async save(content: string) {
    if (!this.currentDoc) return;

    const user = who.current();
    if (!user) throw new Error('Must be authenticated');

    // Check if locked by another user
    if (this.currentDoc.locked && this.currentDoc.lockedBy !== user.pub) {
      throw new Error('Document is locked by another user');
    }

    // Save revision
    const revision = {
      content: this.currentDoc.content,
      editedBy: user.pub,
      timestamp: Date.now(),
    };

    const result = await docService.update(this.currentDoc.id, {
      content,
      revisions: [...this.currentDoc.revisions, revision],
      updatedAt: Date.now(),
    });

    if (result.isErr()) throw result.error;
  }

  async lock() {
    if (!this.currentDoc) return;
    
    const user = who.current();
    if (!user) throw new Error('Must be authenticated');

    await docService.update(this.currentDoc.id, {
      locked: true,
      lockedBy: user.pub,
    });
  }

  async unlock() {
    if (!this.currentDoc) return;
    
    await docService.update(this.currentDoc.id, {
      locked: false,
      lockedBy: undefined,
    });
  }

  private handleRemoteUpdate(doc: Document) {
    // Handle conflict resolution
    if (this.currentDoc && doc.updatedAt! > this.currentDoc.updatedAt!) {
      console.log('Document updated by another user');
      // Implement your conflict resolution strategy
      this.currentDoc = doc;
      this.notifyUI(doc);
    }
  }

  close() {
    this.unsubscribe?.();
    this.currentDoc = null;
  }
}
```

### Private User Data

```typescript
import { make, ThingSchema, who } from '@ariob/core';
import { z } from 'zod';

// Settings schema
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

    // Create default settings
    return this.createDefaults();
  }

  static async save(updates: Partial<z.infer<typeof SettingsSchema>>) {
    const current = await this.load();
    
    const result = await settingsService.update(this.SETTINGS_ID, {
      ...updates,
      updatedAt: Date.now(),
    });

    if (result.isErr()) {
      // If update failed, might need to create
      if (result.error.type === 'NOT_FOUND') {
        return this.createDefaults(updates);
      }
      throw result.error;
    }

    return result.value;
  }

  private static async createDefaults(overrides?: Partial<z.infer<typeof SettingsSchema>>) {
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

// Usage in ReactLynx component
function SettingsScreen() {
  const { user } = useWho();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      UserSettings.load().then(s => {
        setSettings(s);
        setLoading(false);
      });
    }
  }, [user]);

  const updateTheme = async (theme: 'light' | 'dark' | 'auto') => {
    const updated = await UserSettings.save({ theme });
    setSettings(updated);
  };

  if (!user) return <text>Please login to access settings</text>;
  if (loading) return <text>Loading settings...</text>;

  return (
    <view className="settings">
      <text className="title">Settings</text>
      
      <view className="setting-group">
        <text>Theme</text>
        <select 
          value={settings.theme}
          onChange={(e) => updateTheme(e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </view>
    </view>
  );
}
```

## Error Handling

All service methods return `Result` types for explicit error handling:

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

1. **Define schemas first** - Let your data model drive the implementation
2. **Use Result types** - Handle errors explicitly, don't ignore them
3. **Clean up subscriptions** - Always call the unsubscribe function
4. **Check authentication** - Verify user is logged in for user-scoped services
5. **Validate inputs** - Let Zod handle validation automatically
6. **Use TypeScript** - Get full type safety and auto-completion

## Performance Tips

1. **Batch operations** when possible:
```typescript
// Instead of multiple individual updates
const results = await Promise.all(
  ids.map(id => service.update(id, data))
);
```

2. **Use watch selectively** - Only subscribe to data you're actively displaying
3. **Clean up unused services** - Call `service.cleanup()` when done
4. **Limit list operations** - Gun.js loads all data, so paginate in your UI

## Security Considerations

1. **User-scoped data** is only accessible by the authenticated user
2. **Public data** is readable by anyone but writable only by authenticated users
3. **Validate all inputs** - Schemas provide first-line defense
4. **Don't store sensitive data unencrypted** - Use SEA for encryption
5. **Check ownership** before allowing updates
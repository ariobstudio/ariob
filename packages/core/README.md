# 📦 @ariob/core

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gun.js](https://img.shields.io/badge/Gun.js-2C3E50?style=for-the-badge&logo=javascript&logoColor=white)](https://gun.eco/)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=typescript&logoColor=white)](https://zod.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://zustand-demo.pmnd.rs/)

Minimal, schema-first functional architecture for building decentralized applications with Gun.js.

[Installation](#-installation) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Examples](#-examples)

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Installation](#-installation)
- [Core Concepts](#-core-concepts)
- [Authentication](#-authentication)
- [Real-time Features](#-real-time-features)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

@ariob/core provides a clean, type-safe foundation for building decentralized applications. It combines the power of Gun.js for decentralized data storage with modern TypeScript patterns for a superior developer experience.

### Key Benefits

- ✅ **Type Safety** - Full TypeScript support with runtime validation
- 🚀 **Developer Experience** - Simple, intuitive APIs
- 🔄 **Real-time Updates** - Automatic synchronization across devices
- 🛡️ **Error Handling** - Functional approach with Result types
- 📱 **Cross-platform** - Works with ReactLynx and standard React

## ✨ Features

- **🔐 Multi-auth Support** - Keypair, mnemonic, and traditional authentication
- **📊 Schema-first Design** - Define your data with Zod schemas
- **⚡ Real-time State** - Reactive state management with Zustand
- **🔗 ReactLynx Ready** - Optimized hooks for UI integration
- **💾 Session Persistence** - Automatic session restoration
- **🌐 Decentralized** - No central server required
- **🔒 User Scoping** - Private data isolation per user

## 📦 Installation

```bash
# npm
npm install @ariob/core

# yarn
yarn add @ariob/core

# pnpm
pnpm add @ariob/core
```

## 🚀 Core Concepts

### 1. 📝 Schemas (Data Models)

Define your data structure using Zod schemas for runtime type safety:

```typescript
import { z } from 'zod';
import { ThingSchema } from '@ariob/core';

// Extend the base Thing schema
const NoteSchema = ThingSchema.extend({
  title: z.string().min(1, 'Title is required'),
  content: z.string(),
  tags: z.array(z.string()).default([]),
  pinned: z.boolean().default(false),
  category: z.enum(['personal', 'work', 'ideas']).default('personal'),
});

type Note = z.infer<typeof NoteSchema>;
```

#### Available Base Schemas

- `ThingSchema` - Base schema with id, soul, timestamps, version
- `ContentThingSchema` - Extended with title, body, tags
- `RelationalThingSchema` - Includes parent/child relationships
- `WhoSchema` - User identity schema

### 2. 🔧 Services (Business Logic)

Services handle all data operations with Gun.js:

```typescript
import { make } from '@ariob/core';

// Public service - data visible to all users
const notesService = make(NoteSchema, 'notes');

// Private service - data scoped to authenticated user
const privateNotesService = make(NoteSchema, 'private-notes', {
  userScoped: true
});

// Use the service
const result = await notesService.create({
  title: 'My First Note',
  content: 'Hello, decentralized world!',
  tags: ['demo', 'first'],
  category: 'personal'
});

// Handle the result
result.match(
  (note) => console.log('Created:', note),
  (error) => console.error('Error:', error)
);
```

### 3. 🏪 Stores (State Management)

Create reactive stores with Zustand for real-time updates:

```typescript
import { createThingStore } from '@ariob/core';

// Create stores for your services
const useNotesStore = createThingStore(notesService, 'NotesStore');
const usePrivateNotesStore = createThingStore(privateNotesService, 'PrivateNotesStore');

// Use in components
function NotesList() {
  const { 
    items, 
    isLoading, 
    error,
    fetchAll, 
    create, 
    update, 
    remove 
  } = useNotesStore();
  
  useEffect(() => {
    fetchAll();
  }, []);
  
  if (isLoading) return <Text>Loading notes...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return (
    <View className="notes-list">
      {items.map(note => (
        <NoteCard key={note.id} note={note} />
      ))}
    </View>
  );
}
```

### 4. 🪝 Hooks (ReactLynx Integration)

Simplified hooks for managing individual items:

```typescript
import { useThing } from '@ariob/core';

function NoteDetail({ noteId }: { noteId: string }) {
  const { 
    item: note, 
    update, 
    remove,
    isLoading,
    error 
  } = useThing(useNotesStore, noteId);
  
  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!note) return <Text>Note not found</Text>;
  
  const handleTogglePin = async () => {
    const result = await update({ pinned: !note.pinned });
    result.match(
      () => console.log('Updated!'),
      (err) => console.error('Update failed:', err)
    );
  };
  
  return (
    <View className="note-detail">
      <Text className="title">{note.title}</Text>
      <Text className="content">{note.content}</Text>
      <Button onPress={handleTogglePin}>
        {note.pinned ? '📌 Unpin' : '📍 Pin'}
      </Button>
      <Button onPress={remove} variant="danger">
        Delete Note
      </Button>
    </View>
  );
}
```

## 🔐 Authentication

Multi-method authentication system with automatic session persistence:

### Keypair Authentication (Recommended)

```typescript
import { useWho } from '@ariob/core';

function AuthScreen() {
  const { 
    user,
    isLoading,
    error,
    signup,
    login,
    logout,
    isAuthenticated 
  } = useWho();
  
  const [alias, setAlias] = useState('');
  
  const handleKeyPairSignup = async () => {
    const result = await signup({
      method: 'keypair',
      alias: alias,
      // Keys are auto-generated if not provided
    });
    
    result.match(
      (user) => {
        console.log('Welcome:', user.alias);
        // Navigate to main app
      },
      (error) => {
        console.error('Signup failed:', error);
        // Show error to user
      }
    );
  };
  
  if (isAuthenticated) {
    return <MainApp />;
  }
  
  return (
    <View className="auth-screen">
      <TextInput
        value={alias}
        onChangeText={setAlias}
        placeholder="Choose your alias"
      />
      <Button 
        onPress={handleKeyPairSignup}
        disabled={!alias || isLoading}
      >
        Sign Up with Keypair
      </Button>
      {error && <Text className="error">{error.message}</Text>}
    </View>
  );
}
```

### Mnemonic Authentication

```typescript
// Generate mnemonic during signup
const handleMnemonicSignup = async () => {
  const result = await signup({
    method: 'mnemonic',
    alias: 'alice',
    passphrase: 'optional-extra-security',
  });
  
  result.match(
    (user) => {
      // IMPORTANT: Save the mnemonic securely!
      const mnemonic = whoService.getMnemonic();
      // Show mnemonic to user for backup
    },
    (error) => console.error(error)
  );
};

// Login with existing mnemonic
const handleMnemonicLogin = async (mnemonic: string) => {
  const result = await login({
    method: 'mnemonic',
    alias: 'alice',
    mnemonic,
    passphrase: 'optional-extra-security',
  });
};
```

### Traditional Authentication

```typescript
const handleTraditionalAuth = async () => {
  // Signup
  await signup({
    method: 'traditional',
    alias: 'bob',
    passphrase: 'secure-password-123',
  });
  
  // Login
  await login({
    method: 'traditional',
    alias: 'bob',
    passphrase: 'secure-password-123',
  });
};
```

## ⚡ Real-time Features

### Live Data Updates

```typescript
function LiveDashboard() {
  const { items: notes } = useNotesStore();
  const [stats, setStats] = useState({ total: 0, pinned: 0 });
  
  // Stats update automatically when notes change
  useEffect(() => {
    setStats({
      total: notes.length,
      pinned: notes.filter(n => n.pinned).length
    });
  }, [notes]);
  
  return (
    <View className="dashboard">
      <Text>Total Notes: {stats.total}</Text>
      <Text>Pinned: {stats.pinned}</Text>
    </View>
  );
}
```

### Manual Subscriptions

```typescript
function NoteWatcher({ noteId }: { noteId: string }) {
  const [note, setNote] = useState<Note | null>(null);
  
  useEffect(() => {
    // Subscribe to specific note changes
    const unsubscribe = notesService.watch(noteId, (result) => {
      result.match(
        (updatedNote) => setNote(updatedNote),
        (error) => console.error('Watch error:', error)
      );
    });
    
    // Cleanup on unmount
    return () => unsubscribe();
  }, [noteId]);
  
  return note ? <NoteView note={note} /> : <Text>Loading...</Text>;
}
```

## 📚 API Reference

### Services API

#### `make<T>(schema, prefix, options?)`

Creates a service for managing data of type T.

```typescript
const service = make(Schema, 'prefix', {
  userScoped: true, // Store under authenticated user
});
```

**Service Methods:**

| Method | Description | Returns |
|--------|-------------|---------|
| `create(data)` | Create new item | `Promise<Result<T, ServiceError>>` |
| `get(id)` | Get item by ID | `Promise<Result<T \| null, ServiceError>>` |
| `update(id, updates)` | Update item | `Promise<Result<T \| null, ServiceError>>` |
| `remove(id)` | Delete item | `Promise<Result<boolean, ServiceError>>` |
| `list()` | List all items | `Promise<Result<T[], ServiceError>>` |
| `watch(id, callback)` | Subscribe to changes | `() => void` (unsubscribe) |
| `cleanup()` | Clean up all subscriptions | `void` |

### Stores API

#### `createThingStore(service, name)`

Creates a Zustand store for a service.

```typescript
const useStore = createThingStore(service, 'StoreName');
```

**Store State & Actions:**

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `items` | `T[]` | All items in the store |
| `isLoading` | `boolean` | Loading state |
| `error` | `ServiceError \| null` | Last error |
| `fetchAll()` | `async function` | Fetch all items |
| `get(id)` | `async function` | Get specific item |
| `create(data)` | `async function` | Create new item |
| `update(id, updates)` | `async function` | Update item |
| `remove(id)` | `async function` | Remove item |
| `clearError()` | `function` | Clear error state |
| `reset()` | `function` | Reset store to initial state |

### Hooks API

#### `useThing(useStore, id)`

Hook for managing a single item.

```typescript
const {
  item,        // The current item data
  isLoading,   // Loading state
  error,       // Error state
  update,      // Update function
  remove,      // Remove function
} = useThing(useNotesStore, noteId);
```

#### `useWho()`

Authentication hook.

```typescript
const {
  user,           // Current user
  isLoading,      // Loading state
  error,          // Error state
  isAuthenticated,// Auth status
  signup,         // Signup function
  login,          // Login function
  logout,         // Logout function
  updateProfile,  // Update user profile
} = useWho();
```

## 💡 Examples

### Complete Todo App

<details>
<summary>Click to expand full example</summary>

```typescript
import { useState, useEffect } from '@lynx-js/react';
import { 
  View, 
  Text, 
  TextInput, 
  Button,
  FlatList 
} from '@lynx-js/react';
import { 
  useWho, 
  useThing, 
  createThingStore, 
  make, 
  ThingSchema 
} from '@ariob/core';
import { z } from 'zod';

// Define schema
const TodoSchema = ThingSchema.extend({
  text: z.string().min(1),
  completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
});

type Todo = z.infer<typeof TodoSchema>;

// Create service and store
const todosService = make(TodoSchema, 'todos', { userScoped: true });
const useTodosStore = createThingStore(todosService, 'TodosStore');

// Main App
export function TodoApp() {
  const { user, isAuthenticated } = useWho();
  
  if (!isAuthenticated) {
    return <AuthScreen />;
  }
  
  return <TodoList />;
}

// Todo List Component
function TodoList() {
  const { items, create, isLoading, fetchAll } = useTodosStore();
  const [newTodoText, setNewTodoText] = useState('');
  
  useEffect(() => {
    fetchAll();
  }, []);
  
  const handleAddTodo = async () => {
    if (!newTodoText.trim()) return;
    
    const result = await create({
      text: newTodoText,
      priority: 'medium',
    });
    
    result.match(
      () => setNewTodoText(''),
      (error) => alert(error.message)
    );
  };
  
  const sortedTodos = [...items].sort((a, b) => {
    // Sort by completion status, then priority
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return (
    <View className="todo-container">
      <View className="header">
        <Text className="title">My Todos</Text>
        <Text className="subtitle">
          {items.filter(t => !t.completed).length} remaining
        </Text>
      </View>
      
      <View className="add-todo">
        <TextInput
          value={newTodoText}
          onChangeText={setNewTodoText}
          placeholder="What needs to be done?"
          onSubmitEditing={handleAddTodo}
        />
        <Button onPress={handleAddTodo}>Add</Button>
      </View>
      
      <FlatList
        data={sortedTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TodoItem todoId={item.id} />}
        ListEmptyComponent={
          <Text className="empty">No todos yet. Add one above!</Text>
        }
      />
    </View>
  );
}

// Individual Todo Item
function TodoItem({ todoId }: { todoId: string }) {
  const { item: todo, update, remove } = useThing(useTodosStore, todoId);
  
  if (!todo) return null;
  
  const priorityColors = {
    low: '#gray',
    medium: '#blue',
    high: '#red',
  };
  
  return (
    <View className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <Button
        onPress={() => update({ completed: !todo.completed })}
        variant="ghost"
      >
        {todo.completed ? '✓' : '○'}
      </Button>
      
      <Text className="todo-text">{todo.text}</Text>
      
      <View style={{ backgroundColor: priorityColors[todo.priority] }} />
      
      <Button onPress={remove} variant="ghost">
        ×
      </Button>
    </View>
  );
}
```

</details>

## 🎯 Best Practices

### 1. ✅ Always Initialize First

```typescript
// In your app's entry point
const App = () => {
  const { init } = useWho();
  
  useEffect(() => {
    init(); // Restores session if available
  }, []);
  
  return <MainApp />;
};
```

### 2. 🛡️ Handle Errors Gracefully

```typescript
const handleCreate = async (data: any) => {
  const result = await service.create(data);
  
  result.match(
    (item) => {
      // Success - update UI
      showSuccessToast('Created successfully!');
    },
    (error) => {
      // Handle specific error types
      switch (error.type) {
        case 'VALIDATION_ERROR':
          showValidationErrors(error.details);
          break;
        case 'AUTH_ERROR':
          redirectToLogin();
          break;
        default:
          showErrorToast(error.message);
      }
    }
  );
};
```

### 3. 🧹 Clean Up Subscriptions

```typescript
function LiveComponent({ id }: { id: string }) {
  useEffect(() => {
    const unsubscribe = service.watch(id, (result) => {
      // Handle updates
    });
    
    // Always return cleanup function
    return () => unsubscribe();
  }, [id]);
}
```

### 4. 🔒 Use User Scoping for Privacy

```typescript
// ❌ BAD: Private data in public space
const diary = make(DiarySchema, 'diary');

// ✅ GOOD: Private data scoped to user
const diary = make(DiarySchema, 'diary', { userScoped: true });
```

### 5. 📊 Optimize Re-renders

```typescript
// Use selectors to minimize re-renders
const useFilteredNotes = (category: string) => {
  return useNotesStore(
    (state) => state.items.filter(note => note.category === category)
  );
};
```

## ❓ Troubleshooting

### Common Issues & Solutions

<details>
<summary><strong>Session not persisting across app restarts</strong></summary>

**Cause:** `init()` not called on app startup

**Solution:**
```typescript
// Call init in your app's entry point
useEffect(() => {
  useWhoStore.getState().init();
}, []);
```
</details>

<details>
<summary><strong>User-scoped operations failing</strong></summary>

**Cause:** User not authenticated

**Solution:**
```typescript
// Always check authentication before user-scoped operations
const { user } = useWho();
if (!user) {
  // Redirect to login
  return;
}
```
</details>

<details>
<summary><strong>"Invalid hook call" errors</strong></summary>

**Cause:** React version mismatch

**Solution:**
Ensure all React imports come from `@lynx-js/react`:
```typescript
// ❌ Wrong
import React from 'react';

// ✅ Correct
import React from '@lynx-js/react';
```
</details>

## 🔒 Security Considerations

- **Private Keys**: Stored encrypted in device storage
- **Public Keys**: Safe to share and store anywhere
- **User Data**: Use `userScoped: true` for private data
- **Validation**: Always validate with Zod schemas
- **Authentication**: Never store plaintext passwords

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

<div align="center">
Part of the <a href="../../README.md">Ariob Platform</a>
</div> 
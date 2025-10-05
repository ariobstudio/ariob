# Gun Module

Decentralized data synchronization and authentication using Gun.js.

## Overview

The Gun module provides:

- **Decentralized data storage** - Real-time synchronization via Gun.js
- **Authentication system** - Multi-method user authentication (keypair, mnemonic, traditional)
- **Type-safe services** - CRUD operations with Zod validation
- **React integration** - Hooks and stores for reactive UIs
- **Schema-first design** - Data models defined with Zod schemas
- **Encrypted storage** - SEA cryptographic operations

## Module Structure

```
gun/
├── core/           # Gun.js instance and initialization
├── hooks/          # React hooks for data access
├── lib/            # Utilities and helpers
├── schema/         # Zod data schemas
├── services/       # Business logic and CRUD operations
│   ├── who.service.ts    # Authentication
│   └── thing.service.ts  # Generic data management
└── state/          # Zustand state stores
    ├── who.store.ts      # Auth state
    └── thing.store.ts    # Data state
```

## Quick Start

### Authentication

```typescript
import { who } from '@ariob/core/gun/services';
import { useWhoStore } from '@ariob/core/gun/state';

// In your app initialization
const initApp = async () => {
  // Initialize who service (restores session if available)
  const store = useWhoStore.getState();
  await store.init();
  
  if (store.user) {
    console.log('Welcome back,', store.user.alias);
  } else {
    // New user - show signup/login screen
  }
};

// Signup with keypair (recommended)
const handleSignup = async (alias: string) => {
  const store = useWhoStore.getState();
  const result = await store.signup({
    method: 'keypair',
    alias
  });
  
  result.match(
    (user) => console.log('Account created!', user),
    (error) => console.error('Signup failed:', error)
  );
};
```

### Data Services

```typescript
import { make } from '@ariob/core/gun/services';
import { createThingStore } from '@ariob/core/gun/state';
import { z } from 'zod';

// Define your schema
const NoteSchema = z.object({
  id: z.string(),
  soul: z.string(),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  version: z.number(),
  // Your custom fields
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
  encrypted: z.boolean().default(false)
});

type Note = z.infer<typeof NoteSchema>;

// Create services
const publicNotes = make(NoteSchema, 'notes');
const privateNotes = make(NoteSchema, 'private-notes', { userScoped: true });

// Create stores
const usePublicNotesStore = createThingStore(publicNotes, 'PublicNotes');
const usePrivateNotesStore = createThingStore(privateNotes, 'PrivateNotes');
```

### React Components

```tsx
import React, { useEffect } from 'react';
import { useWhoStore } from '@ariob/core/gun/state';

function NotesApp() {
  const { user, isLoading, init } = useWhoStore();
  const { items: notes, fetchAll, create } = usePrivateNotesStore();
  
  useEffect(() => {
    // Initialize on mount
    init();
  }, []);
  
  useEffect(() => {
    // Fetch notes when user is authenticated
    if (user) {
      fetchAll();
    }
  }, [user]);
  
  const handleCreateNote = async () => {
    if (!user) return;
    
    const result = await create({
      title: 'My Private Note',
      content: 'This is only visible to me!',
      tags: ['personal'],
      encrypted: true
    });
    
    result.match(
      (note) => console.log('Created note:', note),
      (error) => alert('Failed to create note: ' + error.message)
    );
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <LoginScreen />;
  
  return (
    <div>
      <h1>Welcome, {user.alias}!</h1>
      <button onClick={handleCreateNote}>Create Note</button>
      {notes.map(note => (
        <div key={note.id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          {note.encrypted && <span>🔒 Encrypted</span>}
        </div>
      ))}
    </div>
  );
}
```

## Core Components

### WhoService - Authentication

Handles user authentication with automatic session persistence.

```typescript
// Initialize (restores session)
await who.init();

// Signup with mnemonic
const result = await who.signup({
  method: 'mnemonic',
  alias: 'alice',
  passphrase: 'optional-security'
});

// Get current user
const userResult = await who.current();
userResult.match(
  (user) => console.log('Current user:', user),
  (error) => console.error('Not authenticated')
);

// Update profile
await who.update({ 
  displayName: 'Alice Cooper',
  bio: 'Decentralized app enthusiast'
});

// Export credentials for backup
const creds = who.getCredentials();
// Save these securely!

// Logout
who.logout();
```

### ThingService - Data Management

Provides generic CRUD operations with schema validation and real-time sync.

```typescript
// Create a service
const taskService = make(TaskSchema, 'tasks', { 
  userScoped: true // Private to user
});

// CRUD Operations
const task = await taskService.create({
  title: 'Build awesome app',
  priority: 'high'
});

const retrieved = await taskService.get(task.id);
await taskService.update(task.id, { completed: true });
await taskService.remove(task.id);

// List all items
const allTasks = await taskService.list();

// Real-time subscription
const unsubscribe = taskService.watch(task.id, (result) => {
  result.match(
    (updated) => console.log('Task updated:', updated),
    (error) => console.error('Watch error:', error)
  );
});

// Cleanup when done
unsubscribe();
```

## API Reference

### WhoService API

| Method | Description | Returns |
|--------|-------------|---------|
| `init()` | Initialize service and restore session | `Promise<Result<User \| null, ServiceError>>` |
| `signup(request)` | Create new account | `Promise<Result<User, ServiceError>>` |
| `login(request)` | Login with credentials | `Promise<Result<User, ServiceError>>` |
| `current()` | Get current authenticated user | `Promise<Result<User \| null, ServiceError>>` |
| `update(updates)` | Update user profile | `Promise<Result<User, ServiceError>>` |
| `get(publicKey)` | Get any user's public profile | `Promise<Result<PublicProfile \| null, ServiceError>>` |
| `logout()` | Logout and clear session | `void` |
| `getCredentials()` | Export credentials for backup | `string \| null` |

### ThingService API

| Method | Description | Returns |
|--------|-------------|---------|
| `create(data)` | Create new item | `Promise<Result<T, ServiceError>>` |
| `get(id)` | Get item by ID | `Promise<Result<T \| null, ServiceError>>` |
| `update(id, updates)` | Update item | `Promise<Result<T \| null, ServiceError>>` |
| `remove(id)` | Delete item | `Promise<Result<boolean, ServiceError>>` |
| `list()` | List all items | `Promise<Result<T[], ServiceError>>` |
| `watch(id, callback)` | Subscribe to item changes | `() => void` |
| `cleanup()` | Clean up all subscriptions | `void` |

### Store Hooks

```typescript
// Authentication store
const {
  user,            // Current user
  isLoading,       // Loading state
  error,           // Last error
  isAuthenticated, // Auth status
  init,            // Initialize
  signup,          // Sign up
  login,           // Log in
  logout,          // Log out
  updateProfile,   // Update profile
} = useWhoStore();

// Data store (from createThingStore)
const {
  items,      // All items
  isLoading,  // Loading state
  error,      // Last error
  fetchAll,   // Fetch all items
  get,        // Get specific item
  create,     // Create item
  update,     // Update item
  remove,     // Remove item
  clearError, // Clear error
  reset,      // Reset store
} = useDataStore();
```

## Best Practices

### 1. Initialize Early
```typescript
// In your app's entry point
useEffect(() => {
  useWhoStore.getState().init();
}, []);
```

### 2. Handle Errors Gracefully
```typescript
const result = await service.operation();
result.match(
  (data) => handleSuccess(data),
  (error) => {
    switch (error.type) {
      case 'AUTH_ERROR':
        redirectToLogin();
        break;
      case 'VALIDATION_ERROR':
        showValidationErrors(error.details);
        break;
      default:
        showGenericError(error.message);
    }
  }
);
```

### 3. Clean Up Subscriptions
```typescript
useEffect(() => {
  const unsubscribe = service.watch(id, callback);
  return () => unsubscribe();
}, [id]);
```

### 4. Use User Scoping for Privacy
```typescript
// ❌ Bad: Public data for private content
const diary = make(DiarySchema, 'diary');

// ✅ Good: User-scoped for privacy
const diary = make(DiarySchema, 'diary', { userScoped: true });
```

### 5. Validate Schemas
```typescript
// Define strict schemas
const StrictSchema = z.object({
  required: z.string().min(1),
  optional: z.string().optional(),
  validated: z.string().email()
});
```

## Security

### Security Features

- Encrypted credential storage
- SEA cryptographic key pairs
- User-scoped data isolation
- Schema validation for all inputs
- No plaintext password storage

### Security Guidelines

1. **Backup Credentials** - Always allow users to export and backup credentials
2. **Use Strong Passphrases** - Encourage strong passphrases for traditional auth
3. **Validate All Input** - Use Zod schemas to validate all user input
4. **Scope Private Data** - Use `userScoped: true` for sensitive data
5. **Regular Security Audits** - Review and update security practices regularly

## See Also

- [Core Module](../core/README.md) - Gun.js initialization and configuration
- [Schema Module](../schema/README.md) - Data validation with Zod
- [Services Module](../services/README.md) - Business logic layer
- [State Module](../state/README.md) - Zustand stores
- [Hooks Module](../hooks/README.md) - React hooks
- [Main Documentation](../../README.md) - Package overview
- [API Reference](../docs/API.md) - Complete API documentation 
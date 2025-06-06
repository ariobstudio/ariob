# 🔫 @ariob/gun - Decentralized Identity & Data Management

<div align="center">

[![Gun.js](https://img.shields.io/badge/Gun.js-2C3E50?style=for-the-badge&logo=javascript&logoColor=white)](https://gun.eco/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SEA](https://img.shields.io/badge/SEA-Encryption-green?style=for-the-badge)](https://gun.eco/docs/SEA)

A simplified, secure package for decentralized identity management and data persistence using GunDB with native storage integration.

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Core Services](#-core-services)
- [API Reference](#-api-reference)
- [Best Practices](#-best-practices)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

This package provides the Gun.js integration layer for the Ariob platform, offering:

### Core Services
- **🔐 WhoService** - User identity and authentication with automatic session persistence
- **📊 ThingService** - Generic data management with optional user scoping

### Built With
- 🔫 **GunDB** - Decentralized, real-time data synchronization
- 🔐 **SEA** - Security, Encryption, Authorization for cryptographic operations
- 💾 **NativeLocalStorage** - Persistent sessions across app restarts
- ✅ **Result Pattern** - Type-safe error handling using `neverthrow`

## 🏗️ Architecture

```
┌──────────────────────┐     ┌─────────────────────┐
│  NativeLocalStorage  │────▶│   who.service.ts    │
│  (Session Persist)   │     │   (Auth + Profile)  │
└──────────────────────┘     └──────────┬──────────┘
                                        │
                                        ▼
┌──────────────────────┐     ┌─────────────────────┐
│   thing.service.ts   │────▶│       GunDB         │
│   (Data CRUD)        │     │   (Decentralized)   │
└──────────────────────┘     └─────────────────────┘
                                        │
                                        ▼
┌──────────────────────┐     ┌─────────────────────┐
│   who.store.ts       │     │   thing.store.ts    │
│   (Zustand State)    │     │   (Zustand State)   │
└──────────────────────┘     └─────────────────────┘
```

### Directory Structure

```
gun/
├── core/           # Core Gun.js utilities and initialization
├── hooks/          # React hooks for Gun.js integration
├── lib/            # Shared libraries and utilities
├── schema/         # Zod schemas for data validation
├── services/       # Business logic services
│   ├── who.service.ts    # Authentication service
│   └── thing.service.ts  # Data management service
└── state/          # Zustand stores for state management
    ├── who.store.ts      # Auth state
    └── thing.store.ts    # Data state
```

## 🚀 Quick Start

### 1. Initialize and Authenticate

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

### 2. Create a Data Service

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

### 3. Use in Components

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

## 🔧 Core Services

### WhoService - Authentication & Identity

The WhoService handles all authentication operations with automatic session persistence.

#### Features
- 🔑 Multiple authentication methods (keypair, mnemonic, traditional)
- 💾 Automatic session persistence using NativeLocalStorage
- 👤 User profile management
- 🔐 Secure credential storage
- 🌐 Public profile discovery

#### Example Usage

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

The ThingService provides generic CRUD operations with optional user scoping.

#### Features
- 📝 Schema-based validation
- 🔄 Real-time synchronization
- 👤 Optional user scoping for private data
- 🎯 Type-safe operations
- 📡 Live subscriptions

#### Example Usage

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

## 📚 API Reference

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

## 🎯 Best Practices

### 1. Always Initialize First
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

## 🔒 Security

### Key Security Features

- **🔐 Encrypted Storage** - Private keys stored encrypted in NativeLocalStorage
- **🔑 Public/Private Keys** - SEA cryptographic key pairs for security
- **👤 User Isolation** - User-scoped data is cryptographically isolated
- **🛡️ Input Validation** - All data validated against schemas
- **🚫 No Plaintext Passwords** - Passwords are never stored in plaintext

### Security Best Practices

1. **Backup Credentials** - Always allow users to export and backup credentials
2. **Use Strong Passphrases** - Encourage strong passphrases for traditional auth
3. **Validate All Input** - Use Zod schemas to validate all user input
4. **Scope Private Data** - Use `userScoped: true` for sensitive data
5. **Regular Security Audits** - Review and update security practices regularly

## ❓ Troubleshooting

### Common Issues

<details>
<summary><strong>Session not persisting</strong></summary>

**Cause:** NativeLocalStorage not properly configured

**Solution:**
- Ensure NativeLocalStorageModule is configured in your app
- Check that credentials are valid before storing
- Verify `init()` is called on app startup
</details>

<details>
<summary><strong>User-scoped operations failing</strong></summary>

**Cause:** User not authenticated

**Solution:**
```typescript
// Always check authentication
const user = await who.current();
if (!user) {
  // Redirect to login
  return;
}
```
</details>

<details>
<summary><strong>Data not syncing</strong></summary>

**Cause:** Gun relay server issues

**Solution:**
- Check Gun server connection
- Verify network connectivity
- Configure Gun peers properly:
```typescript
import Gun from 'gun';

const gun = Gun({
  peers: ['https://relay.example.com/gun']
});
```
</details>

<details>
<summary><strong>Performance issues</strong></summary>

**Cause:** Too many active subscriptions

**Solution:**
- Clean up subscriptions when components unmount
- Use pagination for large datasets
- Implement debouncing for frequent updates
</details>

## 📄 License

MIT License - Part of the [Ariob Platform](../../../README.md)

---

<div align="center">
Built with ❤️ using Gun.js
</div> 
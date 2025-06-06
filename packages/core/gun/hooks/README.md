# Gun Hooks

React hooks for interacting with Gun.js data in ReactLynx applications.

## Overview

The hooks module provides a clean, reactive interface for working with Gun.js data in ReactLynx components. All hooks handle real-time updates, cleanup, and error states automatically.

## Available Hooks

### `useWho()`

Authentication hook that manages user state and auth operations.

```typescript
import { useWho } from '@ariob/core';

function MyComponent() {
  const {
    user,           // Current authenticated user
    isAuthenticated, // Boolean auth state
    isLoading,      // Loading state
    error,          // Error state
    signup,         // Signup function
    login,          // Login function
    logout          // Logout function
  } = useWho();

  // Component logic...
}
```

### `useThing(store, id)`

Hook for managing a single entity with real-time updates.

```typescript
import { useThing } from '@ariob/core';

function ItemDetail({ itemId }: { itemId: string }) {
  const {
    item,      // Current item data
    isLoading, // Loading state
    error,     // Error state
    update,    // Update function
    remove     // Delete function
  } = useThing(useItemStore, itemId);

  if (isLoading) return <text>Loading...</text>;
  if (error) return <text>Error: {error.message}</text>;
  if (!item) return <text>Item not found</text>;

  return (
    <view className="item-detail">
      <text>{item.title}</text>
    </view>
  );
}
```

### `useThingList(store, options?)`

Hook for managing lists of entities with filtering and real-time updates.

```typescript
import { useThingList } from '@ariob/core';

function ItemList() {
  const {
    items,        // Array of items
    isLoading,    // Loading state
    error,        // Error state
    hasMore,      // Pagination flag
    loadMore,     // Load more function
    refresh,      // Refresh function
    filters,      // Current filters
    setFilters    // Update filters
  } = useThingList(useItemStore, {
    filters: { public: true },
    limit: 20,
    orderBy: 'createdAt'
  });

  return (
    <view className="item-list">
      {items.map(item => (
        <view key={item.id}>{item.title}</view>
      ))}
    </view>
  );
}
```

### `useRealTime(callback, deps)`

Low-level hook for real-time subscriptions with automatic cleanup.

```typescript
import { useRealTime } from '@ariob/core';
import { gun } from '@ariob/core';

function RealtimeComponent() {
  const [messages, setMessages] = useState<string[]>([]);

  useRealTime(() => {
    // Subscribe to Gun.js data
    const unsubscribe = gun.get('chat').get('messages').on((data) => {
      if (data) {
        setMessages(prev => [...prev, data]);
      }
    });

    // Return cleanup function
    return unsubscribe;
  }, []); // Dependencies array

  return (
    <view className="messages">
      {messages.map((msg, i) => (
        <text key={i}>{msg}</text>
      ))}
    </view>
  );
}
```

## Complete Examples

### Authentication Flow

```typescript
import { useWho } from '@ariob/core';
import { useState } from '@lynx-js/react';

function AuthExample() {
  const { user, isAuthenticated, signup, login, logout, error, isLoading } = useWho();
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<'keypair' | 'traditional'>('keypair');
  const [isSignup, setIsSignup] = useState(true);

  const handleAuth = async () => {
    const authFn = isSignup ? signup : login;
    
    if (authMethod === 'keypair') {
      await authFn({
        method: 'keypair',
        alias
      });
    } else {
      await authFn({
        method: 'traditional',
        alias,
        passphrase: password
      });
    }
  };

  if (isAuthenticated) {
    return (
      <view className="user-profile">
        <text className="welcome">Welcome, {user?.alias}!</text>
        <text className="pub-key">Public Key: {user?.pub}</text>
        <view className="logout-btn" bindtap={logout}>
          <text>Logout</text>
        </view>
      </view>
    );
  }

  return (
    <view className="auth-form">
      <text className="title">{isSignup ? 'Sign Up' : 'Login'}</text>
      
      <input
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        placeholder="Choose an alias"
        className="input"
      />
      
      {authMethod === 'traditional' && (
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input"
        />
      )}
      
      <view className="auth-method">
        <view 
          className={`method-btn ${authMethod === 'keypair' ? 'active' : ''}`}
          bindtap={() => setAuthMethod('keypair')}
        >
          <text>Keypair</text>
        </view>
        <view 
          className={`method-btn ${authMethod === 'traditional' ? 'active' : ''}`}
          bindtap={() => setAuthMethod('traditional')}
        >
          <text>Password</text>
        </view>
      </view>
      
      <view className="submit-btn" bindtap={handleAuth}>
        <text>{isLoading ? 'Loading...' : isSignup ? 'Sign Up' : 'Login'}</text>
      </view>
      
      <view className="toggle" bindtap={() => setIsSignup(!isSignup)}>
        <text>
          {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </text>
      </view>
      
      {error && <text className="error">{error.message}</text>}
    </view>
  );
}
```

### Real-time Collaborative Notes

```typescript
import { useThing, useThingList, useWho } from '@ariob/core';
import { make, createThingStore, ContentThingSchema } from '@ariob/core';
import { z } from 'zod';

// Define schema
const NoteSchema = ContentThingSchema.extend({
  color: z.string().default('#ffffff'),
  collaborators: z.array(z.string()).default([]),
  lastEditedBy: z.string().optional(),
});

// Create service and store
const notesService = make(NoteSchema, 'collab-notes');
const useNotesStore = createThingStore(notesService, 'CollabNotesStore');

// Notes List Component
function CollaborativeNotes() {
  const { user } = useWho();
  const { items, create, isLoading } = useThingList(useNotesStore, {
    filters: {
      $or: [
        { public: true },
        { createdBy: user?.pub },
        { collaborators: { $contains: user?.pub } }
      ]
    }
  });

  const handleCreateNote = async () => {
    await create({
      title: 'New Collaborative Note',
      body: '',
      color: '#ffe4b5',
      collaborators: [],
      public: true
    });
  };

  return (
    <view className="notes-container">
      <view className="header">
        <text className="title">Collaborative Notes</text>
        <view className="create-btn" bindtap={handleCreateNote}>
          <text>+ New Note</text>
        </view>
      </view>
      
      <view className="notes-grid">
        {isLoading ? (
          <text>Loading notes...</text>
        ) : (
          items.map(note => (
            <NoteCard key={note.id} noteId={note.id} />
          ))
        )}
      </view>
    </view>
  );
}

// Individual Note Card with Real-time Updates
function NoteCard({ noteId }: { noteId: string }) {
  const { user } = useWho();
  const { item: note, update } = useThing(useNotesStore, noteId);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  if (!note) return null;

  const handleEdit = () => {
    setEditText(note.body || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    await update({
      body: editText,
      lastEditedBy: user?.pub,
      updatedAt: Date.now()
    });
    setIsEditing(false);
  };

  const isCollaborator = note.collaborators.includes(user?.pub || '');
  const canEdit = note.public || note.createdBy === user?.pub || isCollaborator;

  return (
    <view 
      className="note-card"
      style={{ backgroundColor: note.color }}
    >
      <text className="note-title">{note.title}</text>
      
      {isEditing ? (
        <view className="edit-mode">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="edit-textarea"
          />
          <view className="edit-actions">
            <view className="save-btn" bindtap={handleSave}>
              <text>Save</text>
            </view>
            <view className="cancel-btn" bindtap={() => setIsEditing(false)}>
              <text>Cancel</text>
            </view>
          </view>
        </view>
      ) : (
        <view className="view-mode">
          <text className="note-body">{note.body || 'Empty note...'}</text>
          {canEdit && (
            <view className="edit-btn" bindtap={handleEdit}>
              <text>Edit</text>
            </view>
          )}
        </view>
      )}
      
      <view className="note-meta">
        {note.lastEditedBy && (
          <text className="last-edit">
            Last edited by: {note.lastEditedBy === user?.pub ? 'You' : 'Someone else'}
          </text>
        )}
        <text className="collaborator-count">
          {note.collaborators.length} collaborators
        </text>
      </view>
    </view>
  );
}
```

### User-Scoped Private Data

```typescript
import { useWho, useThing } from '@ariob/core';
import { make, createThingStore, ThingSchema } from '@ariob/core';
import { z } from 'zod';

// Private journal schema
const JournalEntrySchema = ThingSchema.extend({
  date: z.string(),
  mood: z.enum(['happy', 'sad', 'neutral', 'excited', 'anxious']),
  content: z.string(),
  tags: z.array(z.string()).default([]),
});

// User-scoped service (data stored under user's Gun instance)
const journalService = make(JournalEntrySchema, 'journal', { 
  userScoped: true 
});
const useJournalStore = createThingStore(journalService, 'JournalStore');

function PrivateJournal() {
  const { user, isAuthenticated } = useWho();
  const { items, create } = useThingList(useJournalStore);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<'happy' | 'sad' | 'neutral' | 'excited' | 'anxious'>('neutral');

  if (!isAuthenticated) {
    return (
      <view className="auth-prompt">
        <text>Please login to access your private journal</text>
      </view>
    );
  }

  const handleAddEntry = async () => {
    if (!content.trim()) return;

    await create({
      date: new Date().toISOString(),
      mood,
      content,
      tags: [],
    });

    setContent('');
    setMood('neutral');
  };

  return (
    <view className="journal">
      <text className="title">My Private Journal</text>
      
      <view className="new-entry">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How was your day?"
          className="content-input"
        />
        
        <view className="mood-selector">
          {(['happy', 'sad', 'neutral', 'excited', 'anxious'] as const).map(m => (
            <view
              key={m}
              className={`mood-btn ${mood === m ? 'active' : ''}`}
              bindtap={() => setMood(m)}
            >
              <text>{m}</text>
            </view>
          ))}
        </view>
        
        <view className="add-btn" bindtap={handleAddEntry}>
          <text>Add Entry</text>
        </view>
      </view>
      
      <view className="entries">
        {items.map(entry => (
          <JournalEntry key={entry.id} entryId={entry.id} />
        ))}
      </view>
    </view>
  );
}

function JournalEntry({ entryId }: { entryId: string }) {
  const { item: entry, remove } = useThing(useJournalStore, entryId);
  
  if (!entry) return null;

  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    neutral: '😐',
    excited: '🎉',
    anxious: '😰',
  };

  return (
    <view className="journal-entry">
      <view className="entry-header">
        <text className="entry-date">
          {new Date(entry.date).toLocaleDateString()}
        </text>
        <text className="entry-mood">{moodEmojis[entry.mood]}</text>
      </view>
      <text className="entry-content">{entry.content}</text>
      <view className="delete-btn" bindtap={remove}>
        <text>Delete</text>
      </view>
    </view>
  );
}
```

## Best Practices

1. **Always handle loading and error states** - Provide feedback to users
2. **Use type-safe stores** - Let TypeScript guide your implementation
3. **Leverage real-time updates** - Data syncs automatically across clients
4. **Clean up subscriptions** - Hooks handle this automatically
5. **Check authentication** - Verify `isAuthenticated` before accessing user data
6. **Use ReactLynx elements** - Ensure cross-platform compatibility

## Error Handling

All hooks return error states that should be handled:

```typescript
function MyComponent() {
  const { item, error, isLoading } = useThing(useStore, id);

  if (isLoading) {
    return <text>Loading...</text>;
  }

  if (error) {
    switch (error.type) {
      case 'NOT_FOUND':
        return <text>Item not found</text>;
      case 'AUTH_ERROR':
        return <text>Please login to view this</text>;
      case 'NETWORK_ERROR':
        return <text>Connection error. Please try again.</text>;
      default:
        return <text>Something went wrong: {error.message}</text>;
    }
  }

  return <view>{/* Your content */}</view>;
}
```

## TypeScript Support

All hooks are fully typed. Define your schemas and let TypeScript infer the rest:

```typescript
// Define your schema
const ProductSchema = ThingSchema.extend({
  name: z.string(),
  price: z.number(),
  inStock: z.boolean(),
});

type Product = z.infer<typeof ProductSchema>;

// Create service and store
const productService = make(ProductSchema, 'products');
const useProductStore = createThingStore(productService, 'ProductStore');

// Use in component - fully typed!
function ProductView({ productId }: { productId: string }) {
  const { item, update } = useThing(useProductStore, productId);
  
  // TypeScript knows item is Product | null
  // update() expects Partial<Product>
}
``` 
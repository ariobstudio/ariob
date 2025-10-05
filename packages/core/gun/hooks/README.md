# Gun Hooks

React hooks for Gun.js data integration.

## Overview

Provides clean, reactive hooks for working with Gun.js data in React components.

- Real-time updates
- Automatic cleanup
- Error handling
- TypeScript support
- Loading states

## Available Hooks

### useWho()

Authentication hook managing user state:

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

### useThing(store, id)

Manage a single entity with real-time updates:

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
    <view>
      <text>{item.title}</text>
    </view>
  );
}
```

### useThingList(store, options?)

Manage lists of entities with filtering:

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
    <view>
      {items.map(item => (
        <view key={item.id}>{item.title}</view>
      ))}
    </view>
  );
}
```

## Complete Examples

### Authentication Flow

```typescript
import { useWho } from '@ariob/core';
import { useState } from 'react';

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
      <view>
        <text>Welcome, {user?.alias}!</text>
        <text>Public Key: {user?.pub}</text>
        <view bindtap={logout}><text>Logout</text></view>
      </view>
    );
  }

  return (
    <view>
      <text>{isSignup ? 'Sign Up' : 'Login'}</text>

      <input
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        placeholder="Choose an alias"
      />

      {authMethod === 'traditional' && (
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
      )}

      <view bindtap={handleAuth}>
        <text>{isLoading ? 'Loading...' : isSignup ? 'Sign Up' : 'Login'}</text>
      </view>

      <view bindtap={() => setIsSignup(!isSignup)}>
        <text>
          {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </text>
      </view>

      {error && <text>{error.message}</text>}
    </view>
  );
}
```

### Real-time Item Management

```typescript
import { useThing, useWho } from '@ariob/core';

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

  return (
    <view>
      <text>{note.title}</text>

      {isEditing ? (
        <view>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <view bindtap={handleSave}><text>Save</text></view>
          <view bindtap={() => setIsEditing(false)}><text>Cancel</text></view>
        </view>
      ) : (
        <view>
          <text>{note.body || 'Empty note...'}</text>
          <view bindtap={handleEdit}><text>Edit</text></view>
        </view>
      )}
    </view>
  );
}
```

### User-Scoped Private Data

```typescript
import { useWho, useThing } from '@ariob/core';

function PrivateJournal() {
  const { user, isAuthenticated } = useWho();
  const { items, create } = useThingList(useJournalStore);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<'happy' | 'sad' | 'neutral'>('neutral');

  if (!isAuthenticated) {
    return (
      <view>
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
    <view>
      <text>My Private Journal</text>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="How was your day?"
      />

      <view bindtap={handleAddEntry}><text>Add Entry</text></view>

      {items.map(entry => (
        <JournalEntry key={entry.id} entryId={entry.id} />
      ))}
    </view>
  );
}
```

## Best Practices

1. **Handle loading and error states** - Provide feedback to users
2. **Use type-safe stores** - Let TypeScript guide implementation
3. **Leverage real-time updates** - Data syncs automatically
4. **Clean up subscriptions** - Hooks handle this automatically
5. **Check authentication** - Verify `isAuthenticated` before accessing user data
6. **Use React best practices** - Follow React patterns and conventions

## Error Handling

All hooks return error states:

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

All hooks are fully typed:

```typescript
// Define schema
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

## See Also

- [Gun Module](../README.md) - Gun.js integration
- [State Module](../state/README.md) - Zustand stores
- [Services Module](../services/README.md) - Business logic
- [Main Documentation](../../README.md) - Package overview

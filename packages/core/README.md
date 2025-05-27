# @ariob/core

A comprehensive TypeScript library for decentralized social networking built on Gun.js. This package provides authentication, data management, and real-time synchronization capabilities for the Ariob platform.

## Features

- 🔐 **Multi-Account Authentication** - Support for multiple user accounts with secure key management
- 🔄 **Real-time Data Sync** - Built on Gun.js for peer-to-peer data synchronization
- 📝 **Schema Validation** - Type-safe data structures with Zod validation
- 🎣 **React Hooks** - Ready-to-use hooks for React applications
- 🛡️ **Error Handling** - Comprehensive error handling with neverthrow
- 🏪 **State Management** - Zustand-based stores for predictable state updates
- 🔒 **Secure Storage** - Encrypted local storage for sensitive data

## Installation

```bash
npm install @ariob/core
# or
pnpm add @ariob/core
# or
yarn add @ariob/core
```

## Quick Start

### Basic Authentication

```tsx
import { useAuth } from '@ariob/core';

function LoginComponent() {
  const { user, isAuthenticated, login, logout, isLoading, error } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return isAuthenticated ? (
    <div>
      <h2>Welcome, {user?.alias}!</h2>
      <button onClick={logout}>Logout</button>
    </div>
  ) : (
    <button onClick={() => login('user-keypair')}>
      Login
    </button>
  );
}
```

### Multi-Account Management

```tsx
import { useMultiAuth } from '@ariob/core';

function AccountSwitcher() {
  const { 
    accounts, 
    currentUser, 
    switchAccount, 
    createAccount, 
    removeAccount,
    isAuthenticated 
  } = useMultiAuth();

  return (
    <div>
      <h3>Current User: {currentUser?.alias}</h3>
      
      <h4>Available Accounts:</h4>
      <ul>
        {accounts.map(account => (
          <li key={account.id}>
            <button onClick={() => switchAccount(account.id)}>
              {account.alias}
            </button>
            <button onClick={() => removeAccount(account.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      
      <button onClick={() => createAccount('new-user')}>
        Create New Account
      </button>
    </div>
  );
}
```

### Real-time Data with Things

```tsx
import { useThing, useThingList } from '@ariob/core';

function PostsList() {
  const { things: posts, isLoading } = useThingList({
    schema: 'post',
    limit: 10
  });

  if (isLoading) return <div>Loading posts...</div>;

  return (
    <div>
      {posts.map(post => (
        <PostItem key={post.id} postId={post.id} />
      ))}
    </div>
  );
}

function PostItem({ postId }: { postId: string }) {
  const { thing: post, update, isLoading } = useThing(postId);

  if (isLoading || !post) return <div>Loading...</div>;

  return (
    <div>
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      <button onClick={() => update({ likes: (post.likes || 0) + 1 })}>
        Like ({post.likes || 0})
      </button>
    </div>
  );
}
```

## API Reference

### Hooks

#### Authentication Hooks

- **`useAuth()`** - Basic single-user authentication
- **`useMultiAuth()`** - Multi-account authentication management

#### Data Hooks

- **`useThing(id: string)`** - Subscribe to a single data object
- **`useThingList(options)`** - Subscribe to a list of data objects
- **`useRealTime(path: string)`** - Low-level real-time data subscription

### Services

#### Authentication Services

- **`who.signup(options)`** - Create a new user account
- **`who.login(keyPair)`** - Authenticate with existing credentials
- **`who.logout()`** - End current session
- **`who.current()`** - Get current authenticated user

#### Account Management

- **`AccountService.createAccount(options)`** - Create new account
- **`AccountService.importAccount(credentials)`** - Import existing account
- **`AccountService.switchAccount(id)`** - Switch active account
- **`AccountService.removeAccount(id)`** - Remove account

#### Data Services

- **`thing.create(data)`** - Create new data object
- **`thing.get(id)`** - Retrieve data object
- **`thing.update(id, updates)`** - Update data object
- **`thing.delete(id)`** - Delete data object
- **`thing.list(options)`** - Query multiple objects

### Schemas

#### User Schema (Who)

```typescript
interface Who {
  id: string;
  schema: 'who';
  alias: string;
  pub: string;
  epub: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  // ... additional fields
}
```

#### Thing Schema

```typescript
interface Thing {
  id: string;
  schema: string;
  soul: string;
  createdAt: number;
  updatedAt?: number;
  createdBy: string;
  // ... additional fields based on schema type
}
```

### Error Handling

The library uses `neverthrow` for functional error handling:

```tsx
import { who } from '@ariob/core';

async function handleLogin(keyPair: string) {
  const result = await who.login(keyPair);
  
  result.match(
    (user) => {
      console.log('Login successful:', user.alias);
    },
    (error) => {
      console.error('Login failed:', error.message);
      // Handle specific error types
      switch (error.type) {
        case 'AUTH_INVALID_CREDENTIALS':
          // Show invalid credentials message
          break;
        case 'NETWORK_ERROR':
          // Show network error message
          break;
        default:
          // Show generic error message
      }
    }
  );
}
```

## Configuration

### Environment Variables

```bash
# Optional: Custom Gun.js peers
GUN_PEERS=["http://localhost:8765/gun", "https://gun-manhattan.herokuapp.com/gun"]

# Optional: Enable debug logging
DEBUG=gun:*
```

### TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react-jsx"
  }
}
```

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Type Checking

```bash
pnpm type-check
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related Packages

- **@ariob/andromeda** - React application using this core library
- **@lynx-js/react** - Lynx framework for cross-platform development

## Support

For questions and support, please open an issue on the GitHub repository. 
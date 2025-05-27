# Gun Module Documentation

## Overview

The Gun module provides a complete decentralized identity and data management system built on top of [Gun.js](https://gun.eco/). It offers cryptographic key pair generation, secure authentication, multi-account support, real-time synchronization, and encrypted storage capabilities.

## Architecture

```
packages/core/gun/
├── core/           # Gun instance, configuration, and type definitions
├── hooks/          # React hooks for Gun integration
├── lib/            # Utility libraries and native storage
├── schema/         # Zod schemas for data validation
├── services/       # Business logic and data management
├── state/          # Zustand stores for state management
├── thing/          # Entity management framework
└── who/            # User identity and profile management
```

## Key Features

- **🔐 Decentralized Identity**: Cryptographic key pairs for secure authentication
- **👥 Multi-Account Support**: Create, import, and switch between multiple accounts
- **🔄 Real-Time Sync**: Profile synchronization across devices with conflict resolution
- **🛡️ Secure Storage**: Encrypted local storage with integrity verification
- **⚡ Offline-First**: Eventual consistency with offline queue support
- **🔗 P2P Network**: Direct peer-to-peer communication via Gun's mesh network

## Quick Start

### Installation

```bash
npm install @ariob/core
```

### Basic Usage

```typescript
import { gun, who, AccountService } from '@ariob/core/gun';

// Initialize Gun connection
gun.on('hi', peer => console.log('Connected to peer:', peer));

// Create a new account
const accountResult = await AccountService.createAccount({
  alias: 'my-username'
});

if (accountResult.isOk()) {
  const account = accountResult.value;
  console.log('Account created:', account.alias);
  
  // Switch to the new account
  const loginResult = await AccountService.switchAccount(account.id);
  if (loginResult.isOk()) {
    console.log('Logged in as:', loginResult.value.alias);
  }
}
```

## Module Documentation

### [Core Module](./core/README.md)
Gun instance configuration, peer connections, and core type definitions.

### [Services Module](./services/README.md)
Business logic for account management, authentication, and data operations.

### [State Module](./state/README.md)
Zustand stores for reactive state management and persistence.

### [Schema Module](./schema/README.md)
Zod schemas for data validation and type safety.

### [Hooks Module](./hooks/README.md)
React hooks for seamless Gun integration in components.

### [Thing Module](./thing/README.md)
Generic entity management framework for decentralized data.

### [Who Module](./who/README.md)
User identity, profiles, and authentication management.

### [Lib Module](./lib/README.md)
Utility libraries and native storage integration.

## Common Patterns

### Error Handling

All services use the `neverthrow` Result pattern for robust error handling:

```typescript
import { AccountService } from '@ariob/core/gun/services';

const result = await AccountService.createAccount({ alias: 'username' });

if (result.isOk()) {
  // Success case
  const account = result.value;
  console.log('Account created:', account);
} else {
  // Error case
  const error = result.error;
  console.error('Failed to create account:', error.message);
}
```

### Reactive State

Use Zustand stores for reactive state management:

```typescript
import { useSessionStore } from '@ariob/core/gun/state';

function MyComponent() {
  const { user, isAuthenticated, setUser } = useSessionStore();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.alias}!</div>;
}
```

### Real-Time Synchronization

Enable automatic profile synchronization:

```typescript
import { who } from '@ariob/core/gun/services';

// Configure sync settings
who.configureSyncSettings({
  conflictResolution: 'timestamp',
  syncIntervalMs: 30000,
  onSyncStatusChanged: (status) => {
    console.log('Sync status:', status);
  }
});

// Update profile (automatically syncs)
const updateResult = await who.updateProfile({
  displayName: 'New Display Name',
  bio: 'Updated bio'
});
```

## Security Considerations

### Key Management
- Private keys are generated client-side and never leave the device
- Keys are encrypted using Gun SEA before local storage
- Each account has isolated cryptographic materials

### Data Encryption
- All sensitive data is encrypted using Gun SEA
- Device-specific encryption keys for additional security
- Integrity verification prevents data corruption

### Network Security
- P2P connections use Gun's built-in encryption
- No central server stores user data
- WebRTC for direct peer-to-peer communication

## Performance

### Optimization Strategies
- Delta-based synchronization minimizes data transfer
- Offline queuing for disconnected operation
- Background sync with configurable intervals
- Lazy loading of profile data

### Storage Efficiency
- Native storage integration for Lynx compatibility
- Automatic cleanup of old sync deltas
- Configurable retention policies

## Troubleshooting

### Common Issues

**Connection Problems**
```typescript
// Check peer connections
gun.on('hi', peer => console.log('Connected:', peer));
gun.on('bye', peer => console.log('Disconnected:', peer));
```

**Authentication Failures**
```typescript
// Verify account credentials
const credentialsResult = await AccountService.getAccountCredentials(accountId);
if (credentialsResult.isErr()) {
  console.error('Invalid credentials:', credentialsResult.error);
}
```

**Sync Issues**
```typescript
// Check sync status
const syncStatus = who.getSyncStatus();
console.log('Sync status:', syncStatus);

// Manual sync trigger
await who.syncProfile();
```

## Contributing

1. Follow the existing code patterns and error handling
2. Use TypeScript for type safety
3. Add comprehensive tests for new features
4. Update documentation for API changes
5. Ensure Lynx compatibility for native features

## License

MIT License - see LICENSE file for details. 
# Gun Services Module

## Overview

The Services module contains business logic for decentralized identity management, authentication, and secure storage. All services use the `neverthrow` Result pattern for robust error handling and follow a simplified, security-first approach.

## Services

- **[AccountService](#accountservice)** - Multi-account management and authentication
- **[WhoService](#whoservice)** - User identity and profile management  
- **[SecureStorageService](#securestorageservice)** - Encrypted storage with integrity verification

## AccountService

Manages multiple user accounts with secure credential storage and seamless switching.

### Key Features
- Create new accounts with unique key pairs
- Import/export accounts for backup and recovery
- Secure account switching with proper isolation
- Encrypted credential storage
- Account metadata management

### Basic Usage

```typescript
import { AccountService } from '@ariob/core/gun/services';

// Create a new account
const createResult = await AccountService.createAccount({
  alias: 'my-username'
});

if (createResult.isOk()) {
  const account = createResult.value;
  console.log('Account created:', account.alias);
  
  // Switch to the new account
  const switchResult = await AccountService.switchAccount(account.id);
  if (switchResult.isOk()) {
    console.log('Switched to account:', switchResult.value.alias);
  }
}
```

## WhoService

Simple, secure service for user identity and profile management with real-time Gun synchronization.

### Key Features
- Secure account creation (signup) with key pair generation
- Authentication with encrypted credential storage
- Profile management with validation
- Real-time synchronization via Gun's built-in CRDT capabilities
- Public profile data only (private keys never stored in database)

### Authentication

```typescript
import { who } from '@ariob/core/gun/services';

// Create new account
const signupResult = await who.signup({
  alias: 'my-username',
  passphrase: 'secure-passphrase' // optional
});

if (signupResult.isOk()) {
  const user = signupResult.value;
  console.log('Account created:', user.alias);
}

// Login with credentials
const credentials = who.getCredentials(); // Get from secure storage
if (credentials) {
  const loginResult = await who.login(JSON.stringify(credentials));
  if (loginResult.isOk()) {
    console.log('Logged in as:', loginResult.value.alias);
  }
}

// Check authentication status
const currentUser = await who.current();
if (currentUser.isOk() && currentUser.value) {
  console.log('Currently authenticated as:', currentUser.value.alias);
}
```

### Profile Management

```typescript
// Update profile
const updateResult = await who.update({
  displayName: 'John Doe',
  bio: 'Software developer',
  location: 'San Francisco',
  website: 'https://johndoe.dev'
});

if (updateResult.isOk()) {
  console.log('Profile updated:', updateResult.value);
}

// Get profile data
const profile = await who.get(publicKey);
if (profile.isOk() && profile.value) {
  console.log('Profile:', profile.value);
}

// Logout
who.logout();
```

### Security Features

- **Private Key Protection**: Private keys never stored in profile schema
- **Public Profile Data**: Only safe, public information stored in Gun database
- **Credential Export**: Secure backup/restore functionality
- **Real-time Sync**: Automatic synchronization via Gun's CRDT capabilities

## SecureStorageService

Provides encrypted storage for sensitive data with integrity verification and session management.

### Key Features
- AES-GCM encryption for all sensitive data
- SHA-256 integrity verification
- Session timeout and auto-logout
- Device-specific encryption keys
- Recovery information storage

### Basic Usage

```typescript
import { secureStorage } from '@ariob/core/gun/services';

// Store encrypted data
const storeResult = await secureStorage.storeEncrypted(
  'user-preferences',
  { theme: 'dark', language: 'en' }
);

if (storeResult.isOk()) {
  console.log('Data stored securely');
}

// Retrieve encrypted data
const retrieveResult = await secureStorage.retrieveEncrypted<UserPreferences>(
  'user-preferences'
);

if (retrieveResult.isOk() && retrieveResult.value) {
  const preferences = retrieveResult.value;
  console.log('User preferences:', preferences);
}
```

### Session Management

```typescript
// Configure session security
secureStorage.setSessionConfig({
  sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
  autoLogoutEnabled: true,
  rememberSession: true
});

// Set session event handlers
secureStorage.setSessionHandlers({
  onSessionExpired: () => {
    console.log('Session expired, logging out...');
    who.logout();
  },
  onSessionWarning: () => {
    console.log('Session expiring soon...');
  }
});

// Check session status
const sessionStatus = secureStorage.getSessionStatus();
console.log('Session active:', sessionStatus.isActive);

// Extend session
secureStorage.extendSession();
```

## Architecture Principles

### 1. Security First
- Private keys never stored in database schemas
- All sensitive data encrypted before storage
- Separation of public and private data
- Device-specific encryption keys

### 2. Simplicity
- Minimal, focused APIs
- No over-engineering or unnecessary complexity
- Clear separation of concerns
- Easy to understand and maintain

### 3. Gun Integration
- Leverages Gun's built-in CRDT for conflict resolution
- Real-time synchronization without custom sync services
- Uses Gun's native authentication and encryption
- Follows Gun's decentralized principles

## Error Handling

All services use the `neverthrow` Result pattern:

```typescript
import { Result, ok, err } from 'neverthrow';

const result = await who.signup({ alias: 'username' });

if (result.isOk()) {
  const user = result.value;
  console.log('Success:', user);
} else {
  const error = result.error;
  console.error('Error:', error.message);
}
```

## Testing

### Unit Testing

```typescript
describe('WhoService', () => {
  it('should create account successfully', async () => {
    const result = await who.signup({
      alias: 'testuser'
    });
    
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.alias).toBe('testuser');
      expect(result.value.pub).toBeDefined();
      expect(result.value.priv).toBeUndefined(); // Private key not in profile
    }
  });
});
```
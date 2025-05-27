# Gun Core Module

## Overview

The Core module provides the foundational Gun.js configuration, peer connections, and TypeScript type definitions for the entire decentralized identity system.

## Files

- `gun.ts` - Main Gun instance configuration and SEA integration
- `types.ts` - TypeScript type definitions for Gun and SEA

## Gun Instance Configuration

### Basic Setup

```typescript
import { gun, sea } from '@ariob/core/gun/core';

// Gun instance is pre-configured with:
// - SEA (Security, Encryption, Authorization) module
// - AXE conflict resolution algorithm
// - Peer connections to the decentralized network
// - WebRTC and WebSocket transports

console.log('Gun instance:', gun);
console.log('SEA cryptography:', sea);
```

### Peer Connections

The Gun instance is configured with multiple peer connections for redundancy:

```typescript
// Default peer configuration includes:
// - Local relay server (if available)
// - Public Gun relay servers
// - WebRTC for direct peer-to-peer connections

// Monitor peer connections
gun.on('hi', (peer) => {
  console.log('Connected to peer:', peer);
});

gun.on('bye', (peer) => {
  console.log('Disconnected from peer:', peer);
});

// Add custom peers
gun.opt({
  peers: ['https://your-custom-relay.com/gun'],
  localStorage:  , // Disabled in favor of native storage
  radisk: false, // Disabled for security
});
```

## SEA Integration

### Cryptographic Operations

Gun SEA provides all cryptographic functionality:

```typescript
import { sea } from '@ariob/core/gun/core';

// Generate key pairs
const keyPair = await sea.pair();
console.log('Generated key pair:', {
  pub: keyPair.pub,     // Public key
  priv: keyPair.priv,   // Private key (keep secret!)
  epub: keyPair.epub,   // Elliptic public key
  epriv: keyPair.epriv, // Elliptic private key (keep secret!)
});

// Encrypt data
const encryptedData = await sea.encrypt('sensitive data', keyPair);
console.log('Encrypted:', encryptedData);

// Decrypt data
const decryptedData = await sea.decrypt(encryptedData, keyPair);
console.log('Decrypted:', decryptedData);

// Create digital signatures
const signature = await sea.sign('message to sign', keyPair);
console.log('Signature:', signature);

// Verify signatures
const isValid = await sea.verify(signature, keyPair.pub);
console.log('Valid signature:', isValid);

// Generate key derivation (for passwords/hashing)
const derived = await sea.work('password', 'salt');
console.log('Derived key:', derived);
```

## Type Definitions

### Core Types

```typescript
import type { 
  GunInstance, 
  GunNode, 
  GunUser, 
  SeaInstance, 
  KeyPair 
} from '@ariob/core/gun/core/types';

// Gun instance type
const gunInstance: GunInstance = gun;

// User authentication type
const user: GunUser = gun.user();

// SEA instance type
const seaInstance: SeaInstance = sea;

// Key pair structure
const keyPair: KeyPair = {
  pub: 'public-key-string',
  priv: 'private-key-string',
  epub: 'elliptic-public-key',
  epriv: 'elliptic-private-key'
};
```

### Authentication Types

```typescript
import type { AuthResult, UserCredentials } from '@ariob/core/gun/core/types';

// Authentication result type
interface AuthResult {
  ack: number;
  get: string;
  gun: GunInstance;
  put: any;
  root: any;
  soul: string;
  err?: string;
}

// User credentials for login
interface UserCredentials {
  pub: string;
  priv: string;
  epub: string;
  epriv: string;
}
```

## Configuration Options

### Custom Gun Configuration

```typescript
import Gun from 'gun';
import 'gun/sea';
import 'gun/axe';

// Create custom Gun instance
const customGun = Gun({
  peers: ['wss://your-relay.com/gun'],
  localStorage: false,
  radisk: false,
  axe: true, // Enable conflict resolution
});

// Configure SEA options
customGun.SEA = Gun.SEA;
```

### Environment-Specific Setup

```typescript
// Development configuration
if (process.env.NODE_ENV === 'development') {
  gun.opt({
    peers: ['http://localhost:8765/gun'],
    localStorage: false,
  });
}

// Production configuration
if (process.env.NODE_ENV === 'production') {
  gun.opt({
    peers: [
      'wss://relay1.example.com/gun',
      'wss://relay2.example.com/gun',
    ],
    localStorage: false,
    radisk: false,
  });
}
```

## Advanced Usage

### Custom Event Handlers

```typescript
// Network state monitoring
gun.on('auth', (user) => {
  console.log('User authenticated:', user);
});

gun.on('out', (message) => {
  console.log('Outgoing message:', message);
});

gun.on('in', (message) => {
  console.log('Incoming message:', message);
});

// Error handling
gun.on('error', (error) => {
  console.error('Gun error:', error);
});
```

### Performance Monitoring

```typescript
// Monitor sync performance
let syncCount = 0;
gun.on('hi', () => syncCount++);

setInterval(() => {
  console.log('Active peer connections:', syncCount);
  syncCount = 0;
}, 10000);

// Monitor data flow
let dataIn = 0;
let dataOut = 0;

gun.on('in', (message) => {
  dataIn += JSON.stringify(message).length;
});

gun.on('out', (message) => {
  dataOut += JSON.stringify(message).length;
});
```

### Security Hardening

```typescript
// Disable potential security risks
gun.opt({
  localStorage: false,  // Use native storage instead
  radisk: false,        // Disable disk caching
  file: false,          // Disable file system access
});

// Validate peer connections
gun.on('hi', (peer) => {
  if (!peer.includes('trusted-domain.com')) {
    console.warn('Untrusted peer connection:', peer);
  }
});
```

## Best Practices

### 1. Connection Management
```typescript
// Always handle connection states
gun.on('hi', (peer) => {
  // Connection established
  updateNetworkStatus(true);
});

gun.on('bye', (peer) => {
  // Connection lost
  updateNetworkStatus(false);
});
```

### 2. Error Handling
```typescript
// Wrap Gun operations in try-catch
try {
  const result = await gun.user().get('profile').once();
  return result;
} catch (error) {
  console.error('Gun operation failed:', error);
  throw error;
}
```

### 3. Resource Cleanup
```typescript
// Clean up listeners when components unmount
useEffect(() => {
  const unsubscribe = gun.user().get('profile').on(callback);
  
  return () => {
    unsubscribe(); // Clean up listener
  };
}, []);
```

### 4. Type Safety
```typescript
// Always use TypeScript types
import type { GunInstance } from '@ariob/core/gun/core/types';

function processGunData(gunInstance: GunInstance) {
  // Type-safe Gun operations
  return gunInstance.user().get('profile');
}
```

## Troubleshooting

### Common Issues

**Peer Connection Failures**
```typescript
// Debug peer connections
gun.opt({ peers: [] }); // Clear all peers
gun.opt({ peers: ['http://localhost:8765/gun'] }); // Add single peer
```

**SEA Authentication Issues**
```typescript
// Verify SEA is loaded
if (!gun.SEA) {
  console.error('SEA module not loaded');
}

// Check key pair validity
const isValidKey = gun.SEA.verify && typeof gun.SEA.verify === 'function';
```

**Memory Leaks**
```typescript
// Properly unsubscribe from Gun listeners
const ref = gun.get('data').on(callback);
// Later...
ref.off(); // Unsubscribe
```

## API Reference

### gun (GunInstance)
- `gun.get(key)` - Get a reference to data
- `gun.put(data)` - Store data
- `gun.user()` - Get user context
- `gun.on(event, callback)` - Listen to events
- `gun.opt(options)` - Configure Gun instance

### sea (SeaInstance)
- `sea.pair()` - Generate key pair
- `sea.encrypt(data, key)` - Encrypt data
- `sea.decrypt(data, key)` - Decrypt data
- `sea.sign(data, key)` - Create signature
- `sea.verify(signature, publicKey)` - Verify signature
- `sea.work(data, salt)` - Key derivation

For more detailed API documentation, see the [Gun.js documentation](https://gun.eco/docs/). 
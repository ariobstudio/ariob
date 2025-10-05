# Gun Core

Gun.js initialization and core utilities.

## Overview

Provides pre-configured Gun.js instance and SEA cryptographic operations.

- Gun.js database instance
- SEA cryptographic utilities
- Cross-platform configuration
- Real-time synchronization
- Offline-first support

## Quick Start

### Basic Usage

```typescript
import { gun, sea } from '@ariob/core';

// Gun instance is ready to use
gun.get('test').put({ hello: 'world' });

// SEA for cryptographic operations
const keyPair = await sea.pair();
const encrypted = await sea.encrypt('secret', keyPair);
```

### Custom Configuration

```typescript
import Gun from 'gun';
import 'gun/sea';

// Create custom Gun instance
const customGun = new Gun({
  peers: [
    'https://gun-relay1.example.com/gun',
    'https://gun-relay2.example.com/gun',
  ],
  localStorage: false,
  radisk: true,
  multicast: true,
});
```

## Core Concepts

### Souls (Unique IDs)

Every piece of data in Gun has a "soul" - a unique path identifier:

```typescript
// Souls are paths to data
gun.get('users').get('alice').put({ name: 'Alice' });
// Soul: users/alice

// Generate unique souls
import { nanoid } from 'nanoid';
const id = nanoid();
gun.get(`posts/${id}`).put({ title: 'My Post' });
```

### Graph Structure

Gun stores data as a graph with relationships:

```typescript
// Create relationships
const post = gun.get('posts/123');
const author = gun.get('users/alice');

// Link post to author
post.get('author').put(author);

// Link author to posts
author.get('posts').set(post);
```

### Real-time Subscriptions

```typescript
// Subscribe to changes
gun.get('chat/messages').on((data, key) => {
  console.log('New message:', data);
});

// Subscribe once
gun.get('users/alice').once((data) => {
  console.log('User data:', data);
});

// Map over items
gun.get('todos').map().on((todo, id) => {
  console.log(`Todo ${id}:`, todo);
});
```

## SEA (Security, Encryption, Authorization)

### Key Pair Generation

```typescript
import { sea } from '@ariob/core';

// Generate a new key pair
const pair = await sea.pair();
console.log('Public key:', pair.pub);
console.log('Private key:', pair.priv);

// Generate from mnemonic
const mnemonic = 'brave ocean feed ...'; // 12-word phrase
const seed = await sea.work(mnemonic, 'optional-salt');
const pair2 = await sea.pair(seed);
```

### Encryption/Decryption

```typescript
// Symmetric encryption
const secret = 'shared-secret-key';
const encrypted = await sea.encrypt('Hello World', secret);
const decrypted = await sea.decrypt(encrypted, secret);

// Asymmetric encryption
const alice = await sea.pair();
const bob = await sea.pair();

// Bob encrypts for Alice
const sharedSecret = await sea.secret(bob, alice.pub);
const encrypted2 = await sea.encrypt('Secret message', sharedSecret);

// Alice decrypts
const sharedSecret2 = await sea.secret(alice, bob.pub);
const decrypted2 = await sea.decrypt(encrypted2, sharedSecret2);
```

### Digital Signatures

```typescript
// Sign data
const pair = await sea.pair();
const data = { message: 'Hello', timestamp: Date.now() };
const signature = await sea.sign(data, pair);

// Verify signature
const verification = await sea.verify(signature, pair.pub);
console.log('Valid:', verification === data);
```

## User Authentication

Gun provides built-in user authentication:

```typescript
import { gun } from '@ariob/core';

// Create user
const user = gun.user();
user.create('alice', 'password', (ack) => {
  if (ack.err) {
    console.error('Signup failed:', ack.err);
  } else {
    console.log('User created!');
  }
});

// Login
user.auth('alice', 'password', (ack) => {
  if (ack.err) {
    console.error('Login failed:', ack.err);
  } else {
    console.log('Logged in!');
    console.log('Public key:', user.is.pub);
  }
});

// Store user data
user.get('profile').put({
  name: 'Alice',
  bio: 'Decentralized app developer',
});

// Logout
user.leave();
```

## Advanced Patterns

### Pagination

```typescript
async function paginate(path: string, limit: number, offset: number) {
  const items: any[] = [];
  let count = 0;

  return new Promise((resolve) => {
    gun.get(path).map().once((data, key) => {
      if (count >= offset && items.length < limit) {
        items.push({ ...data, id: key });
      }
      count++;

      if (items.length >= limit) {
        resolve(items);
      }
    });

    // Timeout to resolve with partial results
    setTimeout(() => resolve(items), 1000);
  });
}

// Usage
const page1 = await paginate('posts', 10, 0);
const page2 = await paginate('posts', 10, 10);
```

### Conflict Resolution

Gun uses CRDTs (Conflict-free Replicated Data Types) for automatic conflict resolution:

```typescript
// Gun automatically merges concurrent updates
const task = gun.get('tasks/123');

// User A updates
task.put({ title: 'Updated by A', updatedAt: Date.now() });

// User B updates simultaneously
task.put({ description: 'Updated by B', updatedAt: Date.now() });

// Result: Both updates are merged
// { title: 'Updated by A', description: 'Updated by B', updatedAt: <later timestamp> }
```

## Best Practices

1. **Use `.once()` for single reads** instead of `.on()` when you don't need updates
2. **Limit `.map()` operations** on large datasets
3. **Debounce rapid updates** to reduce network traffic
4. **Clean up subscriptions** to prevent memory leaks
5. **Use soul paths efficiently** - shorter paths are faster

## Security Considerations

1. **Never expose private keys** in client-side code
2. **Validate all data** before storing
3. **Use encryption** for sensitive data
4. **Implement access control** at the application level
5. **Be aware of public data** - anything not encrypted is readable by all peers

## Debugging

### Enable Debug Logging

```typescript
// Enable Gun debug logs
localStorage.setItem('gun/log', 'true');

// Custom logging
gun.on('out', function(msg) {
  console.log('Gun OUT:', msg);
});

gun.on('in', function(msg) {
  console.log('Gun IN:', msg);
});
```

### Inspect Data

```typescript
// View raw data
gun.get('users/alice').once((data, key) => {
  console.log('Raw data:', data);
  console.log('Soul:', key);
});

// Check peers
console.log('Connected peers:', gun._.opt.peers);

// Check if user is authenticated
console.log('Authenticated:', gun.user().is);
```

## See Also

- [Gun Module](../README.md) - Gun.js integration overview
- [Schema Module](../schema/README.md) - Data validation
- [Services Module](../services/README.md) - Business logic
- [Main Documentation](../../README.md) - Package overview
- [Gun.js Documentation](https://gun.eco/docs/)
- [SEA Documentation](https://gun.eco/docs/SEA)

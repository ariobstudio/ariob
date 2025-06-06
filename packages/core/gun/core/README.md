# Gun Core

Core Gun.js configuration and initialization for decentralized data synchronization.

## Overview

The core module provides:

- **Gun.js instance** configured for optimal performance
- **SEA (Security, Encryption, Authorization)** for cryptographic operations
- **Cross-platform compatibility** for ReactLynx applications
- **Real-time synchronization** across peers
- **Offline-first capabilities** with automatic sync

## Gun.js Basics

Gun is a decentralized, real-time, offline-first database that:

- **Syncs automatically** between all connected peers
- **Works offline** and syncs when connection returns
- **Provides cryptography** through the SEA module
- **Scales horizontally** without central servers

## Configuration

### Basic Setup

```typescript
import { gun, sea } from '@ariob/core';

// Gun instance is pre-configured and ready to use
gun.get('test').put({ hello: 'world' });

// SEA is available for cryptographic operations
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
  localStorage: false, // Disable for server-side
  radisk: true,       // Enable Radix storage engine
  multicast: true,    // Enable local network discovery
});
```

## Core Concepts

### Souls (Unique IDs)

Every piece of data in Gun has a "soul" - a unique identifier:

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

Gun stores data as a graph:

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
// Symmetric encryption (shared secret)
const secret = 'shared-secret-key';
const encrypted = await sea.encrypt('Hello World', secret);
const decrypted = await sea.decrypt(encrypted, secret);

// Asymmetric encryption (public key)
const alice = await sea.pair();
const bob = await sea.pair();

// Bob encrypts for Alice (using her public key)
const secret = await sea.secret(bob, alice.pub);
const encrypted2 = await sea.encrypt('Secret message', secret);

// Alice decrypts (using her key pair)
const secret2 = await sea.secret(alice, bob.pub);
const decrypted2 = await sea.decrypt(encrypted2, secret2);
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

## ReactLynx Integration

### Real-time Hook

```typescript
import { useEffect, useState } from '@lynx-js/react';
import { gun } from '@ariob/core';

function useGunData(path: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = gun.get(path);
    
    // Subscribe to changes
    const off = ref.on((data) => {
      setData(data);
      setLoading(false);
    });

    // Cleanup
    return () => {
      off();
    };
  }, [path]);

  return { data, loading };
}

// Usage in component
function MessageDisplay() {
  const { data: message, loading } = useGunData('messages/latest');

  if (loading) return <text>Loading...</text>;
  
  return (
    <view className="message">
      <text>{message?.text || 'No message'}</text>
      <text className="timestamp">
        {new Date(message?.timestamp).toLocaleString()}
      </text>
    </view>
  );
}
```

### Collaborative Editor

```typescript
import { gun } from '@ariob/core';
import { useState, useEffect, useCallback } from '@lynx-js/react';

function CollaborativeEditor({ documentId }: { documentId: string }) {
  const [content, setContent] = useState('');
  const [lastUpdate, setLastUpdate] = useState(0);
  const docRef = gun.get(`docs/${documentId}`);

  // Subscribe to changes
  useEffect(() => {
    const off = docRef.on((data) => {
      if (data && data.content && data.timestamp > lastUpdate) {
        setContent(data.content);
        setLastUpdate(data.timestamp);
      }
    });

    return () => off();
  }, [documentId, lastUpdate]);

  // Debounced save
  const saveContent = useCallback(
    debounce((newContent: string) => {
      docRef.put({
        content: newContent,
        timestamp: Date.now(),
        editor: gun.user().is?.pub || 'anonymous',
      });
    }, 500),
    [documentId]
  );

  return (
    <view className="editor">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          saveContent(e.target.value);
        }}
        className="editor-input"
        placeholder="Start typing..."
      />
      <text className="status">
        Last updated: {new Date(lastUpdate).toLocaleString()}
      </text>
    </view>
  );
}
```

## Advanced Patterns

### Pagination

```typescript
// Paginate large lists
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

### Offline Queue

```typescript
class OfflineQueue {
  private queue: Array<() => Promise<void>> = [];
  private online = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.online = true;
      this.flush();
    });

    window.addEventListener('offline', () => {
      this.online = false;
    });
  }

  async add(operation: () => Promise<void>) {
    if (this.online) {
      await operation();
    } else {
      this.queue.push(operation);
    }
  }

  async flush() {
    while (this.queue.length > 0) {
      const operation = this.queue.shift()!;
      try {
        await operation();
      } catch (error) {
        console.error('Failed to sync:', error);
        this.queue.unshift(operation); // Retry later
        break;
      }
    }
  }
}

// Usage
const queue = new OfflineQueue();

async function saveData(data: any) {
  await queue.add(async () => {
    gun.get('data').put(data);
  });
}
```

## Performance Best Practices

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

## Common Issues

### Data Not Syncing

```typescript
// Ensure peers are configured
const gun = new Gun({
  peers: ['https://your-relay.com/gun'],
});

// Check connection
gun.on('hi', (peer) => {
  console.log('Connected to peer:', peer);
});
```

### Authentication Errors

```typescript
// Handle auth errors properly
user.auth(alias, pass, (ack) => {
  if (ack.err) {
    if (ack.err.includes('Wrong user')) {
      console.error('User not found');
    } else if (ack.err.includes('Wrong password')) {
      console.error('Invalid password');
    }
  }
});
```

### Memory Leaks

```typescript
// Always clean up subscriptions
const subscriptions = new Set<() => void>();

function subscribe(path: string, callback: (data: any) => void) {
  const off = gun.get(path).on(callback);
  subscriptions.add(off);
  return off;
}

function cleanup() {
  subscriptions.forEach(off => off());
  subscriptions.clear();
}

// Clean up on unmount
useEffect(() => {
  return cleanup;
}, []);
```

## Resources

- [Gun.js Documentation](https://gun.eco/docs/)
- [SEA Documentation](https://gun.eco/docs/SEA)
- [Gun.js GitHub](https://github.com/amark/gun)
- [Community Chat](https://chat.gun.eco/) 
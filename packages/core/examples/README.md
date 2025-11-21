# @ariob/core Examples

Real-world examples demonstrating production patterns with @ariob/core.

## Examples Index

### 1. [Authentication Flow](./01-auth-flow.md)
Complete authentication implementation with account creation, login, and session persistence.

**Topics:**
- Creating accounts with keypair generation
- Login with existing keys
- Session recall from localStorage
- Logout and cleanup

---

### 2. [Mesh Monitoring](./02-mesh-monitoring.md)
Monitor Gun's P2P mesh network for production visibility and debugging.

**Topics:**
- Initializing DAM monitoring
- React components for network status
- Peer health tracking
- Message flow metrics

---

### 3. [Peer Management](./03-peer-management.md)
Environment-based peer configuration for dev/staging/prod workflows.

**Topics:**
- Loading peer profiles
- Dynamic peer addition/removal
- Environment detection
- Relay redundancy

---

### 4. [Offline Detection](./04-offline-first.md)
Build offline-first applications with proper sync indicators.

**Topics:**
- Detecting network status
- Offline UI indicators
- Optimistic updates
- Sync conflict handling

---

### 5. [Encrypted Chat](./05-encrypted-chat.md)
End-to-end encrypted messaging with Gun and SEA.

**Topics:**
- User-to-user encryption
- Message signing and verification
- Shared secret generation
- Trust model

---

### 6. [CRDT Patterns](./06-crdt-patterns.md)
Conflict-free data structures for distributed apps.

**Topics:**
- Set-based counters
- Last-write-wins registers
- Causal ordering
- Avoiding race conditions

---

## Running Examples

All examples are written for LynxJS and assume you have @ariob/core installed:

```bash
pnpm add @ariob/core
```

Each example file contains:
- Full working code
- Step-by-step explanations
- Production considerations
- Common pitfalls to avoid

## Example Structure

Examples follow this pattern:

```typescript
/**
 * Example: [Name]
 *
 * [Description of what this demonstrates]
 */

import { /* ... */ } from '@ariob/core';

// 1. Setup
// Code for initializing the example

// 2. Implementation
// Core logic demonstrating the pattern

// 3. Usage
// How to use in a component
function ExampleComponent() {
  // ...
}

// 4. Production Notes
// Important considerations for real-world use
```

## Learning Path

Recommended order for learning @ariob/core:

1. **Start here:** [Authentication Flow](./01-auth-flow.md) - Core auth patterns
2. **Then:** [Peer Management](./03-peer-management.md) - Environment setup
3. **Next:** [Mesh Monitoring](./02-mesh-monitoring.md) - Network visibility
4. **After:** [Offline Detection](./04-offline-first.md) - Handling disconnects
5. **Advanced:** [Encrypted Chat](./05-encrypted-chat.md) - E2E encryption
6. **Expert:** [CRDT Patterns](./06-crdt-patterns.md) - Distributed data structures

## Additional Resources

- [API Reference](../API.md) - Complete API documentation
- [Architecture](../ARCHITECTURE.md) - Gun.js DAM/HAM/SEA deep dive
- [README](../README.md) - Quick start and core primitives
- [Gun.js Wiki](https://github.com/amark/gun/wiki) - Official Gun documentation

## Contributing Examples

Have a useful pattern? Add it to this directory!

1. Create `0X-example-name.md`
2. Follow the example structure above
3. Add to this README index
4. Submit PR with clear description

---

**Happy coding!** 🚀

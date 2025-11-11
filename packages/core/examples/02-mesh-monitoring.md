# Example: Mesh Monitoring

Monitor Gun's P2P mesh network (DAM layer) for production visibility and debugging.

## Overview

@ariob/core provides **DAM-aware** monitoring that hooks into Gun's `'in'` and `'out'` events to track:
- Peer connection status
- Message flow (incoming/outgoing)
- Last seen timestamps
- Network health

This is essential for production applications to detect offline states, debug sync issues, and monitor relay health.

---

## 1. Basic Setup

Mesh monitoring auto-initializes when you use `useMesh()` or `usePeer()` hooks:

```typescript
import { useMesh } from '@ariob/core';

// Monitoring starts automatically on first hook use
export function App() {
  const { peers, totalIn, totalOut } = useMesh(); // Auto-initializes monitoring

  return <YourAppContent />;
}
```

**Optional:** You can manually initialize early if you need tracking before rendering:

```typescript
import { initMeshMonitoring } from '@ariob/core';

export function App() {
  useEffect(() => {
    'background only';
    // Optional: Initialize early for immediate tracking
    initMeshMonitoring();
  }, []);

  return <YourAppContent />;
}
```

---

## 2. Network Status Component

Display real-time connection status:

```typescript
import { useMesh } from '@ariob/core';

function NetworkStatus() {
  const { peers, totalIn, totalOut, monitoring } = useMesh();

  // Calculate connected peers
  const connected = peers.filter(p => p.connected).length;
  const total = peers.length;

  // Determine status
  const isOnline = connected > 0;
  const statusColor = isOnline ? 'green' : 'red';
  const statusText = isOnline ? 'Online' : 'Offline';

  return (
    <view className="network-status">
      <view className="status-row">
        <view className={`status-indicator ${statusColor}`} />
        <text className="status-text">{statusText}</text>
      </view>

      <text className="peer-count">
        Peers: {connected}/{total}
      </text>

      <text className="message-stats">
        ↓ {totalIn} ↑ {totalOut}
      </text>

      {!monitoring && (
        <text className="warning">
          ⚠️ Monitoring not initialized
        </text>
      )}
    </view>
  );
}
```

---

## 3. Peer List Component

Display detailed status for each peer:

```typescript
import { useMesh } from '@ariob/core';

function PeerList() {
  const { peers } = useMesh();

  return (
    <view className="peer-list">
      <text className="header">Connected Peers</text>

      {peers.map((peer) => (
        <PeerRow key={peer.url} peer={peer} />
      ))}

      {peers.length === 0 && (
        <text className="empty">No peers configured</text>
      )}
    </view>
  );
}

function PeerRow({ peer }: { peer: PeerStatus }) {
  const statusIcon = peer.connected ? '🟢' : '🔴';
  const lastSeenText = peer.lastSeen > 0
    ? new Date(peer.lastSeen).toLocaleTimeString()
    : 'Never';

  return (
    <view className="peer-row">
      <text className="peer-status">{statusIcon}</text>

      <view className="peer-info">
        <text className="peer-url">{peer.url}</text>
        <text className="peer-last-seen">Last seen: {lastSeenText}</text>
      </view>

      <view className="peer-stats">
        <text>↓ {peer.messagesIn}</text>
        <text>↑ {peer.messagesOut}</text>
      </view>
    </view>
  );
}
```

---

## 4. Offline Indicator

Show banner when app loses connection:

```typescript
import { useMesh } from '@ariob/core';

function OfflineIndicator() {
  const { peers } = useMesh();
  const hasConnection = peers.some(p => p.connected);

  // Don't show banner if online
  if (hasConnection) return null;

  return (
    <view className="offline-banner">
      <text className="offline-icon">⚠️</text>
      <text className="offline-message">
        You're offline. Changes will sync when reconnected.
      </text>
    </view>
  );
}

// Use in your app shell
export function AppShell({ children }) {
  return (
    <view className="app-shell">
      <OfflineIndicator />
      {children}
    </view>
  );
}
```

---

## 5. Message Rate Monitor

Detect abnormally high message rates (potential infinite loops):

```typescript
import { useMesh } from '@ariob/core';
import { useEffect, useState } from '@lynx-js/react';

function useMessageRateMonitor(threshold = 1000) {
  const { totalOut } = useMesh();
  const [lastTotal, setLastTotal] = useState(0);
  const [isHighRate, setIsHighRate] = useState(false);

  useEffect(() => {
    'background only';

    const interval = setInterval(() => {
      const delta = totalOut - lastTotal;

      if (delta > threshold) {
        console.warn('[Mesh] High message rate detected:', delta, 'msgs/sec');
        setIsHighRate(true);
      } else {
        setIsHighRate(false);
      }

      setLastTotal(totalOut);
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [totalOut, lastTotal, threshold]);

  return isHighRate;
}

// Use in a debug panel
function DebugPanel() {
  const isHighRate = useMessageRateMonitor(500);

  if (!isHighRate) return null;

  return (
    <view className="debug-warning">
      <text>⚠️ High message rate - check for infinite loops!</text>
    </view>
  );
}
```

---

## 6. Imperative API

Use outside React components:

```typescript
import {
  getPeerStatus,
  getAllPeers,
  addMeshPeer,
  removeMeshPeer,
  resetMeshStats
} from '@ariob/core';

// Get specific peer status
function checkPeerHealth(url: string) {
  const status = getPeerStatus(url);

  if (!status) {
    console.log('Peer not found:', url);
    return false;
  }

  if (!status.connected) {
    console.warn('Peer disconnected:', url);
    return false;
  }

  const timeSinceLastSeen = Date.now() - status.lastSeen;
  if (timeSinceLastSeen > 30000) { // 30 seconds
    console.warn('Peer stale:', url, timeSinceLastSeen + 'ms');
    return false;
  }

  return true;
}

// Get all connected peers
function getHealthyPeers() {
  const allPeers = getAllPeers();
  return allPeers.filter(p => p.connected);
}

// Add peer dynamically
function addRelay(url: string) {
  console.log('[Mesh] Adding relay:', url);
  addMeshPeer(url);
}

// Reset stats (e.g., for debugging)
function clearMeshStats() {
  console.log('[Mesh] Resetting statistics');
  resetMeshStats();
}
```

---

## 7. Production Dashboard

Complete monitoring dashboard:

```typescript
import { useMesh } from '@ariob/core';

function MeshDashboard() {
  const { peers, totalIn, totalOut, monitoring } = useMesh();
  const isHighRate = useMessageRateMonitor(1000);

  const connected = peers.filter(p => p.connected);
  const disconnected = peers.filter(p => !p.connected);

  return (
    <view className="mesh-dashboard">
      <text className="title">Network Dashboard</text>

      {/* Overall Status */}
      <view className="status-card">
        <text className="card-title">Status</text>
        {monitoring ? (
          <>
            <text>✓ Monitoring active</text>
            <text>Peers: {connected.length}/{peers.length}</text>
            <text>Messages: ↓{totalIn} ↑{totalOut}</text>
          </>
        ) : (
          <text className="error">✗ Monitoring not initialized</text>
        )}
      </view>

      {/* Alerts */}
      {isHighRate && (
        <view className="alert-card warning">
          <text>⚠️ High message rate detected</text>
        </view>
      )}

      {connected.length === 0 && (
        <view className="alert-card error">
          <text>✗ No peers connected</text>
        </view>
      )}

      {/* Peer List */}
      <view className="peers-card">
        <text className="card-title">Connected Peers</text>
        {connected.map(peer => (
          <PeerRow key={peer.url} peer={peer} />
        ))}
      </view>

      {disconnected.length > 0 && (
        <view className="peers-card">
          <text className="card-title">Disconnected Peers</text>
          {disconnected.map(peer => (
            <PeerRow key={peer.url} peer={peer} />
          ))}
        </view>
      )}
    </view>
  );
}
```

---

## Production Notes

### 1. Performance Impact

- **Zero overhead** when monitoring is not initialized
- **Minimal overhead** when initialized (<1% CPU)
- Message tracking uses simple counters, no expensive operations
- Safe to run in production 24/7

### 2. When to Use

**Always use in production for:**
- Detecting offline state
- Debugging sync issues
- Monitoring relay health
- Alerting on network problems

**Don't use for:**
- Message content inspection (only tracks metadata)
- Peer-to-peer message routing decisions
- Security/authorization checks

### 3. Common Pitfalls

❌ **Don't manually initialize unless needed:**
```typescript
// BAD - unnecessary manual initialization
function App() {
  useEffect(() => {
    'background only';
    initMeshMonitoring(); // ❌ Hooks auto-initialize!
  }, []);

  const { peers } = useMesh(); // Already auto-initializes
}
```

✅ **Do rely on auto-initialization:**
```typescript
// GOOD - just use the hooks
function App() {
  const { peers } = useMesh(); // ✓ Auto-initializes on first call
  return <NetworkStatus />;
}
```

❌ **Don't assume instant updates:**
```typescript
// BAD - status may not update immediately
addMeshPeer('wss://relay.com/gun');
const status = getPeerStatus('wss://relay.com/gun');
console.log(status.connected); // ❌ May be false initially
```

✅ **Do wait for connection:**
```typescript
// GOOD - use reactive hook
const peer = usePeer('wss://relay.com/gun');
// React will re-render when connected changes
```

### 4. Debugging Tips

**Check if monitoring is active:**
```typescript
const { monitoring } = useMesh();
if (!monitoring) {
  console.error('Mesh monitoring not initialized!');
}
```

**Log peer changes:**
```typescript
const { peers } = useMesh();
useEffect(() => {
  console.log('[Mesh] Peer status changed:', peers);
}, [peers]);
```

**Track message flow:**
```typescript
const { totalIn, totalOut } = useMesh();
useEffect(() => {
  console.log('[Mesh] Messages:', { in: totalIn, out: totalOut });
}, [totalIn, totalOut]);
```

---

## Related Examples

- [Peer Management](./03-peer-management.md) - Environment-based peer configuration
- [Offline Detection](./04-offline-first.md) - Building offline-first UIs
- [CRDT Patterns](./06-crdt-patterns.md) - Handling sync conflicts

---

## Additional Resources

- [ARCHITECTURE.md - DAM Layer](../ARCHITECTURE.md#dam---network-layer)
- [Gun.js DAM Wiki](https://github.com/amark/gun/wiki/DAM)
- [mesh.ts source](../mesh.ts)

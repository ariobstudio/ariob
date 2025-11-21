# Example: Peer Management

Environment-based peer configuration for seamless dev/staging/prod workflows.

## Overview

@ariob/core provides **environment-based peer profiles** that make it easy to switch between:
- **Local** development (`localhost:8765`)
- **Dev** environment (LAN IP for iOS simulator)
- **Staging** environment (staging relays)
- **Production** environment (multiple redundant relays)

Profiles persist to `localStorage` and can be changed dynamically.

---

## 1. Loading Peer Profiles

Switch environments with a single function call:

```typescript
import { loadProfile, getCurrentProfile } from '@ariob/core';

// Load production relays
loadProfile('prod');

// Load local development
loadProfile('local');

// Load dev environment (for iOS simulator)
loadProfile('dev');

// Check current profile
const current = getCurrentProfile();
console.log('Using profile:', current); // 'prod' | 'local' | 'dev' | 'staging' | null
```

**Available Profiles:**
- `'local'` - `http://localhost:8765/gun`
- `'dev'` - LAN IP for iOS simulator (e.g., `http://10.0.0.246:8765/gun`)
- `'staging'` - `wss://staging-relay.ariob.com/gun`
- `'prod'` - Multiple production relays with redundancy

---

## 2. Environment Detection

Automatically load the correct profile based on environment:

```typescript
import { loadProfile } from '@ariob/core';

function initializePeers() {
  'background only';

  // Detect environment from process.env or other config
  const env = process.env.NODE_ENV;

  switch (env) {
    case 'production':
      loadProfile('prod');
      console.log('[Config] Loaded production relays');
      break;

    case 'staging':
      loadProfile('staging');
      console.log('[Config] Loaded staging relay');
      break;

    case 'development':
    default:
      loadProfile('dev');
      console.log('[Config] Loaded development relay');
      break;
  }
}

// Call during app initialization
export function App() {
  useEffect(() => {
    'background only';
    initializePeers();
  }, []);

  return <YourApp />;
}
```

---

## 3. Environment Switcher Component

Allow users to change environments in development:

```typescript
import {
  getCurrentProfile,
  loadProfile,
  PEER_PROFILES
} from '@ariob/core';
import { useState } from '@lynx-js/react';

function EnvironmentSwitcher() {
  const [currentProfile, setCurrentProfile] = useState(getCurrentProfile);

  const handleSwitch = (profileName: string) => {
    'background only';

    loadProfile(profileName as keyof typeof PEER_PROFILES);
    setCurrentProfile(profileName);

    console.log('[Config] Switched to:', profileName);

    // Optionally reload app to reconnect with new peers
    // window.location.reload();
  };

  return (
    <view className="environment-switcher">
      <text className="title">Environment</text>

      {Object.entries(PEER_PROFILES).map(([name, profile]) => (
        <button
          key={name}
          className={currentProfile === name ? 'active' : ''}
          onTap={() => handleSwitch(name)}
        >
          <text>{profile.name}</text>
          {currentProfile === name && <text> ✓</text>}
        </button>
      ))}

      <text className="current-profile">
        Current: {currentProfile || 'Custom'}
      </text>
    </view>
  );
}
```

---

## 4. Dynamic Peer Management

Add/remove peers at runtime:

```typescript
import {
  getPeers,
  setPeers,
  addPeer,
  removePeer,
  resetPeers
} from '@ariob/core';

// Get current peers
function listPeers() {
  const peers = getPeers();
  console.log('Current peers:', peers);
  return peers;
}

// Add a new relay
function addRelay(url: string) {
  'background only';

  console.log('[Config] Adding peer:', url);
  addPeer(url);

  // Peer is now in config and being connected to
  const peers = getPeers();
  console.log('[Config] Updated peers:', peers);
}

// Remove a relay
function removeRelay(url: string) {
  'background only';

  console.log('[Config] Removing peer:', url);
  removePeer(url);

  const peers = getPeers();
  console.log('[Config] Updated peers:', peers);
}

// Set peers directly (overwrites existing)
function setCustomPeers(urls: string[]) {
  'background only';

  console.log('[Config] Setting custom peers:', urls);
  setPeers(urls);
}

// Reset to defaults
function resetToDefaults() {
  'background only';

  console.log('[Config] Resetting to defaults');
  resetPeers();
}
```

---

## 5. Peer Manager Component

UI for managing peers dynamically:

```typescript
import { useState, useEffect } from '@lynx-js/react';
import { getPeers, addPeer, removePeer } from '@ariob/core';

function PeerManager() {
  const [peers, setPeersState] = useState<string[]>([]);
  const [newPeerUrl, setNewPeerUrl] = useState('');

  // Load peers on mount
  useEffect(() => {
    'background only';
    const currentPeers = getPeers();
    setPeersState(currentPeers);
  }, []);

  const handleAddPeer = () => {
    'background only';

    if (!newPeerUrl.trim()) return;

    // Validate URL
    try {
      new URL(newPeerUrl);
    } catch {
      console.error('[Config] Invalid URL:', newPeerUrl);
      return;
    }

    addPeer(newPeerUrl);
    setPeersState(getPeers());
    setNewPeerUrl('');
  };

  const handleRemovePeer = (url: string) => {
    'background only';

    removePeer(url);
    setPeersState(getPeers());
  };

  return (
    <view className="peer-manager">
      <text className="title">Relay Peers</text>

      {/* Current Peers */}
      <view className="peer-list">
        {peers.map((url) => (
          <view key={url} className="peer-item">
            <text className="peer-url">{url}</text>
            <button
              className="remove-button"
              onTap={() => handleRemovePeer(url)}
            >
              <text>Remove</text>
            </button>
          </view>
        ))}
      </view>

      {/* Add New Peer */}
      <view className="add-peer">
        <input
          className="peer-input"
          placeholder="wss://relay.example.com/gun"
          value={newPeerUrl}
          onChange={(e) => setNewPeerUrl(e.target.value)}
        />
        <button className="add-button" onTap={handleAddPeer}>
          <text>Add Peer</text>
        </button>
      </view>
    </view>
  );
}
```

---

## 6. Production Relay Redundancy

Configure multiple relays for high availability:

```typescript
import { loadProfile, PEER_PROFILES } from '@ariob/core';

// View production profile
console.log(PEER_PROFILES.prod);
// {
//   name: 'Production',
//   peers: [
//     'wss://relay1.ariob.com/gun',
//     'wss://relay2.ariob.com/gun',
//     'wss://relay3.ariob.com/gun',
//   ],
//   description: 'Production relays with redundancy'
// }

// Load production with automatic failover
loadProfile('prod');

// Gun will automatically connect to all peers
// If one fails, others continue syncing
```

**Production Pattern:**
- Use 3+ relays in different regions (US, EU, Asia)
- Gun's DAM layer handles automatic failover
- No manual intervention needed for relay failures
- Data syncs across all available peers

---

## 7. Custom Profile Creation

Create your own profiles:

```typescript
import { setPeers } from '@ariob/core';

// Custom staging environment
const customStaging = {
  name: 'Custom Staging',
  peers: [
    'wss://staging-us.myapp.com/gun',
    'wss://staging-eu.myapp.com/gun',
  ],
};

// Load custom profile
function loadCustomProfile(profile: { peers: string[] }) {
  'background only';

  setPeers(profile.peers);
  console.log('[Config] Loaded custom profile:', profile.peers);
}

loadCustomProfile(customStaging);
```

---

## 8. Persistence

Peer configuration automatically persists to `localStorage`:

```typescript
import { loadProfile, getPeers } from '@ariob/core';

// On first app launch
loadProfile('prod');

// User closes app, reopens later
const peers = getPeers();
// Still returns production peers - no need to reload!

// Peers persist across app restarts
```

**Storage Key:** `'gun-peers'`

**Fallback:** If `localStorage` is unavailable (e.g., Node.js), falls back to `DEFAULT_PEERS`.

---

## Production Notes

### 1. When to Switch Environments

**During development:**
- Use `'local'` for backend development
- Use `'dev'` for mobile app development (iOS simulator)

**During testing:**
- Use `'staging'` for QA testing
- Test with production-like configuration

**In production:**
- Use `'prod'` with multiple relays
- Never use `'local'` or `'dev'` in production builds

### 2. Environment Variables

Recommended setup with environment variables:

```typescript
// config.ts
export function getEnvironmentProfile(): string {
  const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;

  switch (env) {
    case 'production':
      return 'prod';
    case 'staging':
      return 'staging';
    case 'development':
    default:
      return 'dev';
  }
}

// App.tsx
import { loadProfile } from '@ariob/core';
import { getEnvironmentProfile } from './config';

export function App() {
  useEffect(() => {
    'background only';
    const profile = getEnvironmentProfile();
    loadProfile(profile as any);
    console.log('[Config] Loaded profile:', profile);
  }, []);

  return <YourApp />;
}
```

### 3. Common Pitfalls

❌ **Don't hardcode peers in code:**
```typescript
// BAD - peers hardcoded
const gun = Gun({ peers: ['http://localhost:8765/gun'] });
```

✅ **Do use peer profiles:**
```typescript
// GOOD - uses configuration
loadProfile('dev');
const gun = graph();
```

❌ **Don't mix environments:**
```typescript
// BAD - mixing local and prod
setPeers([
  'http://localhost:8765/gun',
  'wss://relay.ariob.com/gun',
]);
```

✅ **Do use consistent environments:**
```typescript
// GOOD - consistent environment
loadProfile('prod'); // All production relays
```

### 4. Testing Different Environments

Test environment switching in development:

```typescript
// Test all profiles
async function testAllProfiles() {
  for (const [name, profile] of Object.entries(PEER_PROFILES)) {
    console.log(`\nTesting profile: ${name}`);
    loadProfile(name as any);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const peers = getPeers();
    console.log('Loaded peers:', peers);
  }
}
```

---

## Related Examples

- [Mesh Monitoring](./02-mesh-monitoring.md) - Monitor peer connection status
- [Offline Detection](./04-offline-first.md) - Handle connectivity issues
- [ARCHITECTURE.md - Config System](../ARCHITECTURE.md#configuration-system)

---

## Additional Resources

- [config.ts source](../config.ts)
- [Gun.js Configuration](https://gun.eco/docs/API#gun-constructor)
- [Relay Deployment Guide](https://github.com/amark/gun/wiki/Deploy)

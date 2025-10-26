/**
 * Configuration System
 *
 * Manages application configuration with localStorage persistence.
 * Currently handles Gun.js peer configuration.
 */

/**
 * Default Gun.js relay peers
 * Using Mac IP instead of localhost for iOS simulator compatibility
 */
export const DEFAULT_PEERS = ['http://10.0.0.246:8765/gun'];

/**
 * localStorage key for peer configuration
 */
const PEERS_STORAGE_KEY = 'gun-peers';

/**
 * Peer configuration interface
 */
export interface PeerConfig {
  peers: string[];
}

/**
 * Get peers from localStorage or return defaults
 *
 * @returns Array of peer URLs
 *
 * @example
 * ```typescript
 * const peers = getPeers();
 * console.log(peers); // ['ws://localhost:8765/gun']
 * ```
 */
export function getPeers(): string[] {
  'background only';

  try {
    // Check if localStorage is available
    if (typeof globalThis.localStorage === 'undefined') {
      console.log('[Config] localStorage not available, using default peers');
      return [...DEFAULT_PEERS];
    }

    const stored = globalThis.localStorage.getItem(PEERS_STORAGE_KEY);

    if (!stored) {
      console.log('[Config] No stored peers, using defaults');
      return [...DEFAULT_PEERS];
    }

    const parsed = JSON.parse(stored) as string[];

    // Validate that it's an array of strings
    if (!Array.isArray(parsed) || parsed.some((p) => typeof p !== 'string')) {
      console.warn('[Config] Invalid peer config in storage, using defaults');
      return [...DEFAULT_PEERS];
    }

    // If array is empty, return defaults
    if (parsed.length === 0) {
      console.log('[Config] Empty peer array in storage, using defaults');
      return [...DEFAULT_PEERS];
    }

    console.log('[Config] Loaded peers from storage:', parsed);
    return parsed;
  } catch (error) {
    console.error('[Config] Error loading peers from storage:', error);
    return [...DEFAULT_PEERS];
  }
}

/**
 * Save peers to localStorage
 *
 * @param peers - Array of peer URLs to save
 *
 * @example
 * ```typescript
 * setPeers(['ws://localhost:8765/gun', 'https://relay.peer.com/gun']);
 * ```
 */
export function setPeers(peers: string[]): void {
  'background only';

  try {
    // Check if localStorage is available
    if (typeof globalThis.localStorage === 'undefined') {
      console.warn('[Config] localStorage not available, cannot save peers');
      return;
    }

    // Validate input
    if (!Array.isArray(peers)) {
      throw new Error('Peers must be an array');
    }

    if (peers.some((p) => typeof p !== 'string')) {
      throw new Error('All peers must be strings');
    }

    globalThis.localStorage.setItem(PEERS_STORAGE_KEY, JSON.stringify(peers));
    console.log('[Config] Saved peers to storage:', peers);
  } catch (error) {
    console.error('[Config] Error saving peers to storage:', error);
    throw error;
  }
}

/**
 * Add a new peer to the configuration
 *
 * @param peer - Peer URL to add
 *
 * @example
 * ```typescript
 * addPeer('wss://my-relay.com/gun');
 * ```
 */
export function addPeer(peer: string): void {
  'background only';

  const currentPeers = getPeers();

  // Don't add duplicates
  if (currentPeers.includes(peer)) {
    console.log('[Config] Peer already exists:', peer);
    return;
  }

  const updatedPeers = [...currentPeers, peer];
  setPeers(updatedPeers);
  console.log('[Config] Added peer:', peer);
}

/**
 * Remove a peer from the configuration
 *
 * @param peer - Peer URL to remove
 *
 * @example
 * ```typescript
 * removePeer('ws://localhost:8765/gun');
 * ```
 */
export function removePeer(peer: string): void {
  'background only';

  const currentPeers = getPeers();
  const updatedPeers = currentPeers.filter((p) => p !== peer);

  if (updatedPeers.length === currentPeers.length) {
    console.log('[Config] Peer not found:', peer);
    return;
  }

  setPeers(updatedPeers);
  console.log('[Config] Removed peer:', peer);
}

/**
 * Reset peers to defaults
 *
 * @example
 * ```typescript
 * resetPeers();
 * ```
 */
export function resetPeers(): void {
  'background only';
  setPeers([...DEFAULT_PEERS]);
  console.log('[Config] Reset peers to defaults');
}

/**
 * Get peer configuration object suitable for Gun.js initialization
 *
 * @returns PeerConfig object
 *
 * @example
 * ```typescript
 * const config = getPeerConfig();
 * const gun = Gun(config);
 * ```
 */
export function getPeerConfig(): PeerConfig {
  'background only';
  return { peers: getPeers() };
}

// ============================================================================
// Peer Profiles
// ============================================================================

/**
 * Peer profile with name and description
 */
export interface PeerProfile {
  /** Profile name */
  name: string;
  /** Peer URLs */
  peers: string[];
  /** Profile description */
  description?: string;
}

/**
 * Predefined peer profiles for different environments
 */
export const PEER_PROFILES: Record<string, PeerProfile> = {
  local: {
    name: 'Local Development',
    peers: ['http://localhost:8765/gun'],
    description: 'Local relay on default port',
  },
  dev: {
    name: 'Development',
    peers: DEFAULT_PEERS, // Your Mac IP for iOS simulator
    description: 'Development relay on LAN',
  },
  staging: {
    name: 'Staging',
    peers: ['wss://staging-relay.ariob.com/gun'],
    description: 'Staging environment relay',
  },
  prod: {
    name: 'Production',
    peers: [
      'wss://relay1.ariob.com/gun',
      'wss://relay2.ariob.com/gun',
      'wss://relay3.ariob.com/gun',
    ],
    description: 'Production relays with redundancy',
  },
};

/**
 * Load a peer profile by name.
 * Sets the peers configuration to the profile's peer list.
 *
 * @param profileName - Name of the profile to load
 *
 * @example
 * ```typescript
 * // Load production profile
 * loadProfile('prod');
 *
 * // Load local development profile
 * loadProfile('local');
 * ```
 */
export function loadProfile(profileName: keyof typeof PEER_PROFILES): void {
  'background only';

  const profile = PEER_PROFILES[profileName];
  if (!profile) {
    throw new Error(`Unknown profile: ${profileName}`);
  }

  setPeers(profile.peers);
  console.log(`[Config] Loaded profile: ${profile.name}`, profile.peers);
}

/**
 * Get the current profile name based on loaded peers.
 * Returns null if peers don't match any profile (custom configuration).
 *
 * @returns Profile name or null
 *
 * @example
 * ```typescript
 * const profile = getCurrentProfile();
 * if (profile) {
 *   console.log('Using profile:', profile);
 * } else {
 *   console.log('Using custom peers');
 * }
 * ```
 */
export function getCurrentProfile(): string | null {
  'background only';

  const currentPeers = getPeers();

  for (const [name, profile] of Object.entries(PEER_PROFILES)) {
    if (JSON.stringify(profile.peers) === JSON.stringify(currentPeers)) {
      return name;
    }
  }

  return null; // Custom peers
}

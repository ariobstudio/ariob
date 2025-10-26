/**
 * Graph Store
 *
 * Universal singleton store for Gun graph instances.
 * Provides default shared graph + ability to create custom instances.
 */

// Import native bridges for iOS/Android
// CRITICAL: crypto.js must be loaded to provide WebCrypto polyfill and btoa/atob that handle Arrays
import './gun/native/crypto.js';
import './gun/native/websocket.js';
import './gun/native/localStorage.js';
import './gun/lib/yson.js';
import Gun from './gun/lib/gun.js';
// CRITICAL: Import our custom SEA with base64 fix
import './gun/lib/sea.js';
// Import Gun path extension for path-based navigation
import './gun/lib/path.js';
import { createStore } from './utils/createStore';
import { getPeers } from './config';

/**
 * Gun instance configuration options
 */
export interface GunOptions {
  /** Array of peer URLs to connect to */
  peers?: string[];
  /** Enable localStorage persistence */
  localStorage?: boolean;
  /** Enable radisk persistence */
  radisk?: boolean;
  /** Additional Gun options */
  [key: string]: any;
}

/**
 * Gun chain reference interface
 */
export interface IGunChainReference<T = any> {
  get: (path: string) => IGunChainReference<T>;
  put: (data: Partial<T> | null, callback?: (ack: any) => void) => IGunChainReference<T>;
  on: (callback: (data: T, key: string) => void, options?: any) => IGunChainReference<T>;
  once: (callback: (data: T, key: string) => void, options?: any) => IGunChainReference<T>;
  map: (options?: any) => IGunChainReference<T[]>;
  set: (data: T, callback?: (ack: any) => void) => IGunChainReference<T>;
  path: (field: string | string[], delimiter?: string) => IGunChainReference<T>;
  off: () => void;
  then: (callback: (data: T) => void) => Promise<T>;
  [key: string]: any;
}

/**
 * Gun instance with user management
 */
export interface GunInstance extends IGunChainReference {
  user: () => GunUser;
  // Override the on method to handle both subscription and event listening
  on: ((callback: (data: any, key: string) => void, options?: any) => IGunChainReference) &
      ((event: string, callback: (data: any) => void) => void);
}

/**
 * Gun user instance for authentication
 */
export interface GunUser extends IGunChainReference {
  create: (pair: KeyPair | string, passphrase?: string, callback?: (ack: any) => void) => GunUser;
  auth: (pairOrAlias: KeyPair | string, callbackOrPassphrase?: ((ack: any) => void) | string, callback?: (ack: any) => void) => GunUser;
  leave: () => void;
  recall: (options?: any, callback?: (ack: any) => void) => GunUser;
  is?: {
    pub: string;
    epub: string;
    alias: string;
  } | null;
}

/**
 * Cryptographic key pair
 */
export interface KeyPair {
  /** Public signing key */
  pub: string;
  /** Private signing key */
  priv: string;
  /** Public encryption key */
  epub: string;
  /** Private encryption key */
  epriv: string;
}

/**
 * Graph store state
 */
interface GraphState {
  /** Default singleton graph instance */
  instance: GunInstance | null;
  /** Current peer configuration */
  peers: string[];
}

/**
 * Custom store for default graph singleton
 */
const graphStore = createStore<GraphState>({
  instance: null,
  peers: [],
});

/**
 * Graph store actions
 */
const graphActions = {
  init: (options?: GunOptions): GunInstance => {
    'background only';

    // Load peers from config if not explicitly provided
    const peers = options?.peers || getPeers();

    // Validate peers array
    if (!Array.isArray(peers)) {
      console.error('[Graph] Peers must be an array, got:', typeof peers);
      throw new Error('Peers must be an array');
    }

    if (peers.some(p => typeof p !== 'string')) {
      console.error('[Graph] All peers must be strings');
      throw new Error('All peers must be strings');
    }

    // Disable localStorage for now - LynxJS apps use in-memory storage
    const finalOptions = {
      ...options,
      peers,
      localStorage: false
    };

    const gun = Gun(finalOptions) as unknown as GunInstance;

    // Store instance and peers
    graphStore.setState({ instance: gun, peers });

    return gun;
  },

  addPeers: (peers: string[]): void => {
    'background only';

    // Validate input
    if (!Array.isArray(peers) || peers.some(p => typeof p !== 'string')) {
      console.error('[Graph] Invalid peers array');
      throw new Error('Peers must be an array of strings');
    }

    const state = graphStore.getState();

    if (!state.instance) {
      graphActions.init({ peers });
      return;
    }

    // Use Gun's .opt() to add peers dynamically
    state.instance.opt({ peers });

    // Update store with merged peer list
    const currentPeers = state.peers || [];
    const uniquePeers = Array.from(new Set([...currentPeers, ...peers]));

    graphStore.setState({ peers: uniquePeers });
  },

  get: (): GunInstance => {
    'background only';
    const state = graphStore.getState();

    // Lazy init if not already initialized
    if (!state.instance) {
      return graphActions.init();
    }

    return state.instance;
  },
};

/**
 * Get or initialize the default graph instance.
 *
 * @param options - Optional configuration for first initialization
 * @returns Default Gun instance
 *
 * @example
 * ```typescript
 * // Get default graph (lazy init)
 * const g = graph();
 *
 * // Initialize with config (first call only)
 * const g = graph({ peers: ['http://localhost:8765/gun'] });
 *
 * // Subsequent calls return same instance
 * const same = graph();
 * ```
 */
export function graph(options?: GunOptions): GunInstance {
  'background only';
  const state = graphStore.getState();

  // If options provided and instance doesn't exist, init with options
  if (options && !state.instance) {
    return graphActions.init(options);
  }

  // Otherwise get existing (or lazy init)
  return graphActions.get();
}

/**
 * Creates a new isolated Gun graph instance.
 * Use when you need a separate graph that doesn't share state with the default.
 *
 * @param options - Configuration options for the Gun instance
 * @returns New Gun instance (not stored in singleton)
 *
 * @example
 * ```typescript
 * // Create isolated graph for testing
 * const testGraph = createGraph({
 *   peers: ['http://test-server/gun']
 * });
 *
 * // Create local-only graph
 * const localGraph = createGraph({ localStorage: true });
 * ```
 */
export function createGraph(options?: GunOptions): GunInstance {
  'background only';

  const gun = Gun(options) as unknown as GunInstance;
  return gun;
}

/**
 * Add peers to the existing Gun instance dynamically.
 * Uses Gun's .opt() method to connect to new peers without recreating the instance.
 *
 * @param peers - Array of peer URLs to add
 *
 * @example
 * ```typescript
 * // Add new relay peers
 * addPeersToGraph(['wss://relay1.com/gun', 'wss://relay2.com/gun']);
 * ```
 */
export function addPeersToGraph(peers: string[]): void {
  'background only';
  graphActions.addPeers(peers);
}

// Export the store for advanced use cases
export { graphStore };

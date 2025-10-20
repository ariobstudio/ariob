/**
 * Graph Store
 *
 * Universal singleton store for Gun graph instances.
 * Provides default shared graph + ability to create custom instances.
 */

// Import native bridges for iOS/Android
import './gun/native/crypto.js';
import './gun/native/websocket.js';
import './gun/native/localStorage.js';
import './gun/lib/yson.js';
import Gun from './gun/lib/gun.js';
import { createStore } from './utils/createStore';

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
}

/**
 * Custom store for default graph singleton
 */
const graphStore = createStore<GraphState>({
  instance: null,
});

/**
 * Graph store actions
 */
const graphActions = {
  init: (options?: GunOptions): GunInstance => {
    'background only';
    console.log('[Graph] Initializing default graph with options:', options);

    const gun = Gun(options) as unknown as GunInstance;
    (globalThis as any).gun = gun;

    graphStore.setState({ instance: gun });
    return gun;
  },

  get: (): GunInstance => {
    'background only';
    const state = graphStore.getState();

    // Lazy init if not already initialized
    if (!state.instance) {
      console.log('[Graph] Lazy initializing default graph');
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
  console.log('[Graph] Creating new isolated instance with options:', options);

  const gun = Gun(options) as unknown as GunInstance;
  return gun;
}

// Export the store for advanced use cases
export { graphStore };

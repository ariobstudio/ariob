/**
 * Graph Factory
 *
 * Clean wrapper around Gun initialization providing a typed interface
 * for creating and configuring Gun instances.
 */

// Import native bridges for iOS/Android
import './native/crypto.js';
import './native/websocket.js';
import Gun from './lib/gun.js';


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
 * Creates a new Gun graph instance with optional configuration.
 *
 * @param options - Configuration options for the Gun instance
 * @returns Configured Gun instance
 *
 * @example
 * ```typescript
 * // Local-only instance
 * const graph = createGraph();
 *
 * // With peer connections
 * const graph = createGraph({
 *   peers: ['https://gun-server.example.com/gun']
 * });
 *
 * // With localStorage persistence
 * const graph = createGraph({
 *   localStorage: true
 * });
 * ```
 */
export function createGraph(options?: GunOptions): GunInstance {
  // Initialize Gun with provided options
  const gun = Gun(options) as unknown as GunInstance;
  return gun;
}

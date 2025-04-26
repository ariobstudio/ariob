import Gun from 'gun';
import 'gun/sea';

// Types for Gun data and callbacks
export type GunDataCallback<T = any> = (data: T, key: string) => void;
export type GunPutAck = { err?: Error; ok?: boolean; };

/**
 * Gun service with enhanced functionality
 * Inspired by ChainGun patterns for better integration
 */
class GunService {
  private gun: any;
  private initialized = false;
  private peers: string[] = [];

  constructor() {
    // Will be initialized with init()
    this.gun = null;
  }

  /**
   * Initialize Gun with peers configuration
   * @param peers Array of peer URLs
   * @param options Additional Gun options
   * @returns The Gun instance
   */
  init(peers: string[] = [], options: any = {}) {
    if (this.initialized) {
      console.warn('Gun already initialized');
      return this.gun;
    }

    // Default Gun relay server
    const defaultPeer = process.env.NODE_ENV === 'production'
      ? 'https://your-production-relay.com/gun'
      : 'http://localhost:8765/gun';

    // Combine default with provided peers
    this.peers = [defaultPeer, ...peers].filter(Boolean);

    // Initialize Gun with peers and options
    this.gun = Gun({
      peers: this.peers,
      localStorage: false,
      radisk: true,
      ...options
    });

    this.initialized = true;
    return this.gun;
  }

  /**
   * Get the Gun instance, initializing if needed
   */
  getGun() {
    if (!this.initialized) {
      return this.init();
    }
    return this.gun;
  }

  /**
   * Get the Gun user instance
   */
  user() {
    return this.getGun().user();
  }

  /**
   * Access Gun SEA (Security, Encryption, Authorization) methods
   */
  get SEA() {
    return Gun.SEA;
  }

  /**
   * Create a node reference from path
   * @param path Path string with dots (e.g., 'users.profiles')
   * @returns Gun node reference
   */
  path(path: string) {
    const parts = path.split('.');
    let ref = this.getGun();
    
    for (const part of parts) {
      ref = ref.get(part);
    }
    
    return ref;
  }

  /**
   * Promise wrapper for Gun's put operation
   * @param ref Gun reference
   * @param data Data to put
   * @returns Promise resolving to acknowledgment
   */
  put(ref: any, data: any): Promise<GunPutAck> {
    return new Promise((resolve) => {
      ref.put(data, (ack: GunPutAck) => {
        resolve(ack);
      });
    });
  }

  /**
   * Promise wrapper for Gun's once operation
   * @param ref Gun reference
   * @returns Promise resolving to data
   */
  once<T = any>(ref: any): Promise<T | null> {
    return new Promise((resolve) => {
      ref.once((data: T) => {
        resolve(data);
      });
    });
  }
}

// Create and export a singleton instance
export const gunService = new GunService();

// Initialize Gun with default settings
export const gun = gunService.init();

// Export the service as default
export default gunService;

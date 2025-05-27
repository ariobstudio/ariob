export interface GunChain<T = any> {
  get: (path: string) => GunChain<T>;
  put: (
    data: Partial<T> | null,
    callback?: (ack: any) => void,
  ) => GunChain<T>;
  on: (callback: (data: T, key: string) => void, options?: any) => GunChain<T>;
  once: (
    callback: (data: T, key: string) => void,
    options?: any,
  ) => GunChain<T>;
  map: (options?: any) => GunChain<T[]>;
  set: (data: T, callback?: (ack: any) => void) => GunChain<T>;
  time: (options?: any) => GunChain<T>;
  off: () => void;
  then: (callback: (user: GunUser) => void) => void;
}

export interface GunUser extends GunChain<any> {
  create: (
    pair: KeyPair,
    callback?: (ack: any) => void,
  ) => GunUser;
  auth: (
    pairOrAlias: KeyPair | string,
    callbackOrPassphrase?: ((ack: any) => void) | string,
    callback?: (ack: any) => void,
  ) => GunUser;
  leave: () => void;
  delete: (
    alias: string,
    passphrase: string,
    callback?: (ack: any) => void,
  ) => void;
  recall: (options?: any, callback?: (ack: any) => void) => GunUser;
  is: KeyPair | null;
}

export interface GunInstance {
  get: (path: string) => GunChain;
  user: () => GunUser;
  on: (event: string, callback: (data: any) => void) => void;
  sea: SEA;
  state: (options?: any) => number;
}

export interface SEA {
  pair: () => Promise<KeyPair>;
  sign: (data: any, pair: KeyPair) => Promise<string>;
  verify: (data: any, pair: KeyPair | string) => Promise<any>;
  encrypt: (data: any, pair: KeyPair | string) => Promise<string>;
  decrypt: (data: any, pair: KeyPair | string) => Promise<any>;
  work: (data: any, salt?: any, options?: any) => Promise<string>;
  random: (bytes?: number) => string;
}

export interface KeyPair {
  pub: string; // Public key
  priv: string; // Private key
  epub: string; // Elliptic public key
  epriv: string; // Elliptic private key
}

export interface WhoCredentials {
  alias: string;
  pub: string;
  epub: string;
  sea: any;
}

interface GunOptions {
  peers?: string[];
  localStorage?: boolean;
  radisk?: boolean;
  [key: string]: any;
}

interface GunChain<T = any> {
  get: (path: string) => GunChain<T>;
  put: (data: Partial<T> | null, callback?: (ack: any) => void) => GunChain<T>;
  on: (callback: (data: T, key: string) => void, options?: any) => GunChain<T>;
  once: (callback: (data: T, key: string) => void, options?: any) => GunChain<T>;
  map: (options?: any) => GunChain<T[]>;
  set: (data: T, callback?: (ack: any) => void) => GunChain<T>;
  time: (options?: any) => GunChain<T>;
  off: () => void;
  then: (callback: (user: GunUser) => void) => void;
}

interface KeyPair {
  pub: string;
  priv: string;
  epub: string;
  epriv: string;
}

interface GunUser extends GunChain<any> {
  create: (pair: KeyPair | string, passphrase?: string, callback?: (ack: any) => void) => GunUser;
  auth: (pairOrAlias: KeyPair | string, callbackOrPassphrase?: ((ack: any) => void) | string, callback?: (ack: any) => void) => GunUser;
  leave: () => void;
  delete: (alias: string, passphrase: string, callback?: (ack: any) => void) => void;
  recall: (options?: any, callback?: (ack: any) => void) => GunUser;
  is: KeyPair | null;
}

interface GunStatic {
  (options?: GunOptions): GunInstance;
  state: any;
}

interface SEAType {
  pair: () => Promise<KeyPair>;
  sign: (data: any, pair: KeyPair, callback?: (result: any) => void, options?: any) => Promise<any>;
  verify: (data: any, pair: KeyPair | string, callback?: (result: any) => void, options?: any) => Promise<any>;
  encrypt: (data: any, pair: KeyPair | string, callback?: (result: any) => void, options?: any) => Promise<any>;
  decrypt: (data: any, pair: KeyPair | string, callback?: (result: any) => void, options?: any) => Promise<any>;
  work: (data: any, salt?: any, callback?: (result: any) => void, options?: any) => Promise<string>;
  random: (bytes?: number) => string;
  secret: (key: any, pair: KeyPair, callback?: (result: any) => void, options?: any) => Promise<string>;
  certify: (certificants: any, policy: any, authority: KeyPair, callback?: (result: any) => void, options?: any) => Promise<any>;
}

interface GunInstance extends GunChain {
  user: () => GunUser;
  on: (event: string, callback: (data: any) => void) => void;
  state: any;
  sea: SEAType;
}

declare const Gun: GunStatic;
export default Gun;

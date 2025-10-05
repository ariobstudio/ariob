interface KeyPair {
  pub: string;
  priv: string;
  epub: string;
  epriv: string;
}

interface SEA {
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

declare const SEA: SEA;
export default SEA;

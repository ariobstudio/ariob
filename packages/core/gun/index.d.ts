// TypeScript Declarations for Gun

declare module '@gun' {
  // Type definitions
  interface GunChain {}

  interface GunChainReference<DataType = any, ReferenceKey = any> {
    // Core chain methods
    get(key: string): GunChainReference;
    put(data: any): GunChainReference;
    map(): GunChainReference;
    on(cb: Function, options?: any): GunChainReference;
    set(data: any): GunChainReference;
    once(cb: Function, options?: any): GunChainReference;
    // More methods would be defined here
  }
  
  interface SEAPair {
    pub: string;
    priv: string;
    epub: string;
    epriv: string;
  }

  interface SEA {
    pair(): Promise<SEAPair>;
    work(data: any, pair?: SEAPair, options?: any): Promise<string>;
    encrypt(data: any, pair: string | SEAPair): Promise<string>;
    decrypt(data: string, pair: string | SEAPair): Promise<any>;
    sign(data: any, pair: SEAPair): Promise<string>;
    verify(data: any, pair: SEAPair | string): Promise<any>;
    secret(data: string, pair: SEAPair, options?: any): Promise<string>;
    certify(data: any, certificate?: any, options?: any): Promise<string>;
  }

  // Gun constructor interface
  interface GunStatic {
    // Gun constructor properties
    chain: GunChain;
    chaingun: GunChain;
    back: any;
    // Methods
    (options?: any): GunChainReference;
    new(options?: any): GunChainReference;
    create(): GunStatic;
    // Static properties
    SEA: SEA;
  }

  const Gun: GunStatic;
  export = Gun;
}

// Allow modular imports 
declare module '@gun/src/*' {
  const module: any;
  export = module;
}

declare module '@gun/lib/*' {
  const module: any;
  export = module;
}

declare module '@gun/sea/*' {
  const module: any;
  export = module;
} 
// declare let NativeModules: {
// }
declare module "*.png?inline";

// Define Lynx JSX types in global namespace
declare namespace JSX {
  interface IntrinsicElements {
    'view': any;
    'text': any;
    'scroll-view': any;
    'input': any;
    'image': any;
  }
}

// Define global variables directly
declare const lynx: {
  __globalProps: {
    theme: 'Light' | 'Dark';
    preferredTheme?: 'Auto' | 'Light' | 'Dark';
    platform: string;
    isNotchScreen?: boolean;
  }
};

// Define NativeModules directly
declare const NativeModules: {
  NativeWebCryptoModule: {
    // Core Web Crypto API methods
    digest(options: string, data: string): Promise<string | null>;
    generateKey(algorithm: string, extractable: boolean, keyUsages: string): Promise<string | null>;
    exportKey(format: string, key: string): Promise<string | null>;
    importKey(format: string, keyData: string, algorithm: string, extractable: boolean, keyUsages: string): Promise<string | null>;
    sign(algorithm: string, key: string, data: string): Promise<string | null>;
    verify(algorithm: string, key: string, signature: string, data: string): Promise<boolean>;
    encrypt(algorithm: string, key: string, data: string): Promise<string | null>;
    decrypt(algorithm: string, key: string, data: string): Promise<string | null>;
    deriveBits(algorithm: string, key: string, length: number): Promise<string | null>;
    deriveKey(algorithm: string, baseKey: string, derivedKeyAlgorithm: string, extractable: boolean, keyUsages: string): Promise<string | null>;

    // TextEncoder/TextDecoder equivalents
    textEncode(text: string): Promise<string>;
    textDecode(data: string): Promise<string>;

    // Random values generator
    getRandomValues(length: number): Promise<string>;
  };
  ExplorerModule: {
    openScan(): void;
    openSchema(url: string): void;
    openDevtoolSwitchPage(): void;
    saveThemePreferences(key: string, value: string): void;
  };
};

// @ts-ignore
declare module '*.png?inline';

// Define Lynx JSX types in global namespace
declare namespace JSX {
  interface IntrinsicElements {
    input: any;
    view: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
      bindtap?: (event?: any) => void;
      bindlongpress?: (event?: any) => void;
      bindtouchstart?: (event?: any) => void;
      bindtouchmove?: (event?: any) => void;
      bindtouchend?: (event?: any) => void;
      bindtouchcancel?: (event?: any) => void;
    };
    text: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & {
      bindtap?: (event?: any) => void;
    };
    image: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
      bindtap?: (event?: any) => void;
      binderror?: (event?: any) => void;
      bindload?: (event?: any) => void;
    };
    scrollview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
      bindscroll?: (event?: any) => void;
      bindscrolltolower?: (event?: any) => void;
      bindscrolltoupper?: (event?: any) => void;
      scrollX?: boolean;
      scrollY?: boolean;
      scrollTop?: number;
      scrollLeft?: number;
      scrollIntoView?: string;
      scrollWithAnimation?: boolean;
    };
  }
}

// Key handle reference for native crypto operations
interface CryptoKeyHandle {
  handle?: string;
  secretKeyHandle?: string;
  algorithm: Record<string, any>;
  extractable: boolean;
  usages: string[];
  type: 'secret' | 'private' | 'public';
}

// Key pair structure returned by generateKey
interface CryptoKeyPair {
  privateKey: CryptoKeyHandle;
  publicKey: CryptoKeyHandle;
}

// @ts-ignore
declare const NativeModules: {
  NativeWebCryptoModule: {
    /** Compute a digest of the given data using the specified hash algorithm. */
    digest(algorithm: Record<string, any>, data: Uint8Array): ArrayBuffer | null;
    /** Generate a new cryptographic key.  Supported algorithms: AES‑GCM, ECDSA (P‑256), ECDH (P‑256). */
    generateKey(algorithm: Record<string, any>, extractable: boolean, keyUsages: string[]): any | null;
    /** Export a key in JWK or raw format. */
    exportKey(format: 'jwk'|'raw', key: Record<string, any>): Record<string, any> | ArrayBuffer | null;
    /** Import a key from JWK or raw format. */
    importKey(format: 'jwk'|'raw', keyData: any, algorithm: Record<string, any>, extractable: boolean, keyUsages: string[]): Record<string, any> | null;
    /** Sign data with an ECDSA private key. */
    sign(algorithm: Record<string, any>, key: Record<string, any>, data: Uint8Array): ArrayBuffer | null;
    /**
     * Verify an ECDSA signature.  The signature must be provided in raw
     * concatenated r||s form (64 bytes for P‑256) as defined by IEEE&nbsp;P1363【654682988880564†L235-L243】.
     */
    verify(algorithm: Record<string, any>, key: Record<string, any>, signature: Uint8Array, data: Uint8Array): boolean;
    /** Encrypt data using AES‑GCM.  Returns ciphertext||tag. */
    encrypt(algorithm: Record<string, any>, key: Record<string, any>, data: Uint8Array): ArrayBuffer | null;
    /** Decrypt data using AES‑GCM.  Input must be ciphertext||tag. */
    decrypt(algorithm: Record<string, any>, key: Record<string, any>, data: Uint8Array): ArrayBuffer | null;
    /** Derive raw bits using ECDH or PBKDF2. */
    deriveBits(algorithm: Record<string, any>, baseKey: Record<string, any>, length: number): ArrayBuffer | null;
    /** Derive a key from a base key (ECDH or PBKDF2). */
    deriveKey(algorithm: Record<string, any>, baseKey: Record<string, any>, derivedKeyType: Record<string, any>, extractable: boolean, keyUsages: string[]): Record<string, any> | null;
    /** Encode a string to a Uint8Array using UTF‑8. */
    textEncode(text: string): Uint8Array;
    /** Decode a Uint8Array to a UTF‑8 string. */
    textDecode(data: Uint8Array): string;
    /**
     * Fill a buffer with cryptographically random values.  When called from
     * JavaScript, this function returns the passed typed array synchronously
     * if the native implementation is synchronous, or a Promise that
     * resolves to the filled array if asynchronous.  Returns null if the
     * requested length is out of bounds (0 < length ≤ 65536).
     */
    getRandomValues(length: number): Uint8Array | Promise<Uint8Array> | null;
    /** Encode a string to Base64 (standard) like btoa(). */
    btoa(data: string): string | null;
    /** Decode a Base64 string (standard) like atob(). */
    atob(data: string): string | null;
  };
  ExplorerModule: {
    openScan(): void;
    openSchema(url: string): void;
    openDevtoolSwitchPage(): void;
    saveThemePreferences(key: string, value: string): void;
  };
  NativeLocalStorageModule: {
    setStorageItem(key: string, value: string): void;
    getStorageItem(key: string): string | null;
    clearStorage(): void;
  };
};

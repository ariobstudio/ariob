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

// @ts-ignore
declare const NativeModules: {
  NativeWebCryptoModule: {
    // Core Web Crypto API methods
    digest(options: string, data: string): Promise<string | null>;
    generateKey(
      algorithm: string,
      extractable: boolean,
      keyUsages: string,
    ): Promise<string | null>;
    exportKey(format: string, key: string): Promise<string | null>;
    importKey(
      format: string,
      keyData: string,
      algorithm: string,
      extractable: boolean,
      keyUsages: string,
    ): Promise<string | null>;
    sign(algorithm: string, key: string, data: string): Promise<string | null>;
    verify(
      algorithm: string,
      key: string,
      signature: string,
      data: string,
    ): Promise<boolean>;
    encrypt(
      algorithm: string,
      key: string,
      data: string,
    ): Promise<string | null>;
    decrypt(
      algorithm: string,
      key: string,
      data: string,
    ): Promise<string | null>;
    deriveBits(
      algorithm: string,
      key: string,
      length: number,
    ): Promise<string | null>;
    deriveKey(
      algorithm: string,
      baseKey: string,
      derivedKeyAlgorithm: string,
      extractable: boolean,
      keyUsages: string,
    ): Promise<string | null>;

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
  NativeLocalStorageModule: {
    setStorageItem(key: string, value: string): void;
    getStorageItem(key: string): string | null;
    clearStorage(): void;
  };
};

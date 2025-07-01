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
    digest(algorithm: Record<string, any>, data: Uint8Array): ArrayBuffer | null;
    generateKey(algorithm: Record<string, any>, extractable: boolean, keyUsages: string[]): any | null;
    exportKey(format: 'jwk'|'raw', key: Record<string, any>): Record<string, any> | ArrayBuffer | null;
    importKey(format:'jwk'|'raw', keyData:any, algorithm:Record<string,any>,
              extractable:boolean, keyUsages:string[]): Record<string,any> | null;
    sign(algorithm:Record<string,any>, key:Record<string,any>, data:Uint8Array): ArrayBuffer | null;
    verify(algorithm:Record<string,any>, key:Record<string,any>, signature:Uint8Array, data:Uint8Array): boolean;
    encrypt(algorithm:Record<string,any>, key:Record<string,any>, data:Uint8Array): ArrayBuffer | null;
    decrypt(algorithm:Record<string,any>, key:Record<string,any>, data:Uint8Array): ArrayBuffer | null;
    deriveBits(algorithm:Record<string,any>, baseKey:Record<string,any>, length:number): ArrayBuffer | null;
    deriveKey(algorithm:Record<string,any>, baseKey:Record<string,any>, derivedKeyType:Record<string,any>,
              extractable:boolean, keyUsages:string[]): Record<string,any> | null;
    textEncode(text:string): Uint8Array;
    textDecode(data:Uint8Array): string;
    getRandomValues(length:number): Uint8Array | null;
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

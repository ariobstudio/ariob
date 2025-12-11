import type { BaseEvent, InputProps, StandardProps } from '@lynx-js/types';

declare global {
  declare module '*.png?inline';
  declare let NativeModules: {
    NativeWebCryptoModule: {
      // Core Web Crypto API methods
      digest(options: string, data: string): Promise<string | null>;
      generateKey(
        algorithm: object,
        extractable: boolean,
        keyUsages: string[],
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
  
      textEncode(text: string): Promise<string>;
      textDecode(data: string): Promise<string>;
  
      getRandomValues(length: number): Promise<string>;
    };
    ExplorerModule: {
      openScan(): void;
      openSchema(url: string): void;
      /**
       * @deprecated Use `openSchema()` instead.
       */
      openDevtoolSwitchPage(): void;
      saveThemePreferences(key: string, value: string): void;
    };
    NativeLocalStorageModule: {
      setStorageItem(key: string, value: string): void;
      getStorageItem(key: string): string | null;
      clearStorage(): void;
    };
    NativeAIModule: {
      // Model Management
      listAvailableModels(): string;
      listLoadedModels(): string;
      isModelLoaded(modelName: string): string;
      loadModel(requestJSON: string, callback: (result: string) => void): void;
      unloadModel(modelName: string): string;
  
      // Text Generation
      generateChat(requestJSON: string, callback: (result: string) => void): void;
    };
  };
}

declare module '@lynx-js/types' {
  interface GlobalProps {
    preferredTheme?: string;
    theme: string;
    isNotchScreen: boolean;
  }

  interface CarouselProps extends StandardProps {
    children?: React.ReactNode;
    className?: string;
    'current-page'?: number;
    'paging-enabled'?: boolean;
    bindpagechange?: (e: BaseEvent) => void;
  }

  interface IntrinsicElements extends Lynx.IntrinsicElements {
    input: InputProps;
    textarea: TextAreaProps;
    text: TextProps;
    image: ImageProps;
    scrollview: ScrollViewProps;
    view: ViewProps;
    pager: PagerProps;
  }
}

// @ts-ignore


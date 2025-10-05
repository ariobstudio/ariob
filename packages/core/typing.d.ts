import type { BaseEvent, InputProps, StandardProps } from '@lynx-js/types';

declare global {
  declare module '*.png?inline';
  declare let NativeModules: {
    NativeWebCryptoModule: {
      /**
       * Digest the data
       * @param algorithm 
       * @param data 
       */
      digest(algorithm: object, data: string): string;

      /**
       * Generate a key
       * @param algorithm 
       * @param extractable 
       * @param keyUsages 
       */
      generateKey(
        algorithm: object,
        extractable: boolean,
        keyUsages: string[],
      ): {
        privateKey?: string;
        publicKey?: string;
        secretKeyHandle?: string;
        error?: string;
      };

      exportKey(
        format: string,
        keyHandle: string
      ): {
        raw?: string;
        kty?: string;
        k?: string;
        d?: string;
        x?: string;
        y?: string;
        crv?: string;
        alg?: string;
        ext?: boolean;
        error?: string;
      };

      importKey(
        format: string,
        keyData: any,
        algorithm: object,
        extractable: boolean,
        keyUsages: string[],
      ): string;

      sign(algorithm: object, keyHandle: string, data: string): string;

      verify(
        algorithm: object,
        keyHandle: string,
        signature: string,
        data: string,
      ): number;

      encrypt(
        algorithm: object,
        keyHandle: string,
        data: string,
      ): string;

      decrypt(
        algorithm: object,
        keyHandle: string,
        data: string,
      ): string;

      deriveBits(
        algorithm: object,
        baseKeyHandle: string,
        length?: number,
      ): string;

      // Utility methods
      textEncode(text: string): string;
      textDecode(data: string): string;
      getRandomValues(length: number): string;
      btoa(binaryString: string): string;
      atob(base64String: string): string;
    };
  };
}
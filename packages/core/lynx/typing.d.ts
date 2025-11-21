import type { BaseEvent, InputProps, StandardProps } from '@lynx-js/types';

/**
 * LynxJS-specific type declarations
 *
 * This file contains type definitions for LynxJS native modules and platform-specific APIs.
 * These types are only available when running in LynxJS environment.
 */

declare global {
  /**
   * LynxJS Native Modules
   *
   * These modules provide access to native platform functionality through the LynxJS bridge.
   */
  declare let NativeModules: {
    /**
     * Native WebCrypto Module
     *
     * Provides cryptographic operations using native iOS/Android crypto APIs.
     * Implements a subset of the W3C WebCrypto API.
     */
    NativeWebCryptoModule: {
      /**
       * Digest the data
       * @param algorithm - Algorithm specification object
       * @param data - Base64-encoded data to hash
       * @returns Base64-encoded hash digest
       */
      digest(algorithm: object, data: string): string;

      /**
       * Generate a key
       * @param algorithm - Algorithm specification with parameters
       * @param extractable - Whether key can be exported
       * @param keyUsages - Array of intended key usage strings
       * @returns Key generation result with handles or error
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

      /**
       * Export a key to external format
       * @param format - Export format ('raw' or 'jwk')
       * @param keyHandle - Handle to key to export
       * @returns Exported key data or error
       */
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

      /**
       * Import a key from external format
       * @param format - Key format ('raw' or 'jwk')
       * @param keyData - Key material
       * @param algorithm - Algorithm specification
       * @param extractable - Whether key can be exported
       * @param keyUsages - Array of intended usages
       * @returns Key handle string
       */
      importKey(
        format: string,
        keyData: any,
        algorithm: object,
        extractable: boolean,
        keyUsages: string[],
      ): string;

      /**
       * Sign data with a private key
       * @param algorithm - Signing algorithm
       * @param keyHandle - Handle to private key
       * @param data - Base64-encoded data to sign
       * @returns Base64-encoded signature
       */
      sign(algorithm: object, keyHandle: string, data: string): string;

      /**
       * Verify a signature with a public key
       * @param algorithm - Verification algorithm
       * @param keyHandle - Handle to public key
       * @param signature - Base64-encoded signature
       * @param data - Base64-encoded original data
       * @returns 1 if valid, 0 if invalid
       */
      verify(
        algorithm: object,
        keyHandle: string,
        signature: string,
        data: string,
      ): number;

      /**
       * Encrypt data
       * @param algorithm - Encryption algorithm
       * @param keyHandle - Handle to encryption key
       * @param data - Base64-encoded plaintext
       * @returns Base64-encoded ciphertext
       */
      encrypt(
        algorithm: object,
        keyHandle: string,
        data: string,
      ): string;

      /**
       * Decrypt data
       * @param algorithm - Decryption algorithm
       * @param keyHandle - Handle to decryption key
       * @param data - Base64-encoded ciphertext
       * @returns Base64-encoded plaintext
       */
      decrypt(
        algorithm: object,
        keyHandle: string,
        data: string,
      ): string;

      /**
       * Derive bits from a base key
       * @param algorithm - Key derivation algorithm
       * @param baseKeyHandle - Handle to base key
       * @param length - Number of bits to derive
       * @returns Base64-encoded derived bits
       */
      deriveBits(
        algorithm: object,
        baseKeyHandle: string,
        length?: number,
      ): string;

      // Utility methods

      /**
       * Encode text to UTF-8 bytes
       * @param text - String to encode
       * @returns Base64-encoded UTF-8 bytes
       */
      textEncode(text: string): string;

      /**
       * Decode UTF-8 bytes to text
       * @param data - Base64-encoded UTF-8 bytes
       * @returns Decoded string
       */
      textDecode(data: string): string;

      /**
       * Generate cryptographically secure random values
       * @param length - Number of bytes to generate
       * @returns Base64-encoded random bytes
       */
      getRandomValues(length: number): string;
    };

    /**
     * Native WebSocket Module
     *
     * Provides native WebSocket implementation for real-time communication.
     */
    NativeWebSocketModule: {
      /**
       * Connect to a WebSocket server
       * @param url - WebSocket URL (ws:// or wss://)
       * @param id - Unique connection identifier
       */
      connect(url: string, id: number): void;

      /**
       * Send a message through WebSocket
       * @param id - Connection identifier
       * @param message - Message to send
       */
      send(id: number, message: string): void;

      /**
       * Close a WebSocket connection
       * @param id - Connection identifier
       * @param code - Close status code
       * @param reason - Close reason string
       */
      close(id: number, code: number, reason: string): void;
    };
  };
}

export {};

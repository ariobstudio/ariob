// declare let NativeModules: {
// }

declare let NativeModules: {
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

        // TextEncoder/TextDecoder equivalents
        textEncode(text: string): Promise<string>;
        textDecode(data: string): Promise<string>;

        // Random values generator
        getRandomValues(length: number): Promise<string>;
    }
}

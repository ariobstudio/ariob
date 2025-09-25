export interface NativeWebCryptoModule {
    /** 
     * Compute a digest. 
     * @param options JSON string with algorithm like '{"name":"SHA-256"}'
     * @param data Base64 encoded data to hash
     * @returns Base64 encoded hash or JSON error string
     */
    digest(options: string, data: string): string;
  
    /** 
     * Generate a new cryptographic key.
     * @param algorithm JSON string with algorithm parameters
     * @param extractable Whether the key can be exported
     * @param keyUsages JSON array string of allowed operations
     * @returns JSON string with generated key(s) or JSON error string
     */
    generateKey(algorithm: string, extractable: boolean, keyUsages: string): string;
  
    /** 
     * Export a key in the specified format.
     * @param format Export format ("jwk" or "raw")
     * @param key JSON string containing the key to export
     * @returns JSON string (for jwk) or Base64 string (for raw) or JSON error string
     */
    exportKey(format: string, key: string): string;
  
    /** 
     * Import a key from external format.
     * @param format Import format ("jwk" or "raw") 
     * @param keyData JSON string (for jwk) or Base64 string (for raw)
     * @param algorithm JSON string with algorithm parameters
     * @param extractable Whether the imported key can be exported
     * @param keyUsages JSON array string of allowed operations
     * @returns JSON string containing imported key or JSON error string
     */
    importKey(format: string, keyData: string, algorithm: string, extractable: boolean, keyUsages: string): string;
  
    /** 
     * Sign data with a private key.
     * @param algorithm JSON string with algorithm parameters
     * @param key JSON string containing the private key
     * @param data Base64 encoded data to sign
     * @returns Base64 encoded signature or JSON error string
     */
    sign(algorithm: string, key: string, data: string): string;
  
    /** 
     * Verify a signature.
     * @param algorithm JSON string with algorithm parameters  
     * @param key JSON string containing the public key
     * @param signature Base64 encoded signature
     * @param data Base64 encoded signed data
     * @returns "true", "false", or JSON error string
     */
    verify(algorithm: string, key: string, signature: string, data: string): string;
  
    /** 
     * Encrypt data using the specified algorithm.
     * @param algorithm JSON string with algorithm parameters (including IV)
     * @param key JSON string containing the encryption key
     * @param data Base64 encoded data to encrypt
     * @returns Base64 encoded encrypted data or JSON error string
     */
    encrypt(algorithm: string, key: string, data: string): string;
  
    /** 
     * Decrypt data using the specified algorithm.
     * @param algorithm JSON string with algorithm parameters (including IV)  
     * @param key JSON string containing the decryption key
     * @param data Base64 encoded encrypted data
     * @returns Base64 encoded decrypted data or empty string on failure
     */
    decrypt(algorithm: string, key: string, data: string): string;
  
    /** 
     * Derive key material from a base key.
     * @param algorithm JSON string with derivation parameters
     * @param baseKey JSON string containing the base key
     * @param length Length of derived material in bits
     * @returns Base64 encoded derived material or JSON error string
     */
    deriveBits(algorithm: string, baseKey: string, length: number): string;
  
    /** 
     * Encode text to UTF-8 bytes.
     * @param text Text to encode
     * @returns Base64 encoded UTF-8 bytes or JSON error string
     */
    textEncode(text: string): string;
  
    /** 
     * Decode UTF-8 bytes to text.
     * @param data Base64 encoded UTF-8 bytes
     * @returns Decoded text or JSON error string
     */
    textDecode(data: string): string;
  
    /** 
     * Generate cryptographically secure random bytes.
     * @param length Number of random bytes to generate
     * @returns Base64 encoded random bytes or JSON error string
     */
    getRandomValues(length: number): string;

    /** 
     * Encode a string to Base64 (standard) like btoa().
     * @param data String to encode
     * @returns Base64 encoded string
     */
    btoa(data: string): string;
    /** 
     * Decode a Base64 string (standard) like atob().
     * @param data Base64 encoded string
     * @returns Binary string
     */
    atob(data: string): string;
  }
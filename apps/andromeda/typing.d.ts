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
  NativeMLXModule: {
    // Model Management
    /**
     * Load a model with specified configuration
     * @param config JSON string containing model configuration
     * @returns JSON string with model info or error
     */
    loadModel(config: string): string;
    
    /**
     * Unload a model from memory
     * @param modelId The ID of the model to unload
     * @returns JSON string with status or error
     */
    unloadModel(modelId: string): string;
    
    /**
     * List all currently loaded models
     * @returns JSON string with array of loaded models
     */
    listLoadedModels(): string;
    
    /**
     * Get detailed information about a loaded model
     * @param modelId The ID of the model
     * @returns JSON string with model info or error
     */
    getModelInfo(modelId: string): string;
    
    // Inference Methods
    /**
     * Run inference on a model
     * @param request JSON string containing inference request
     * @returns JSON string with inference result or error
     */
    inference(request: string): string;
    
    /**
     * Run streaming inference on a model
     * @param request JSON string containing inference request
     * @param onChunk Callback function for each chunk
     * @returns JSON string with streaming status
     */
    streamInference(request: string, onChunk: (chunk: string) => void): string;
    
    // Convenience Methods for Specific Model Types
    /**
     * Generate text using an LLM
     * @param modelId The ID of the loaded LLM
     * @param prompt The text prompt
     * @param options Optional JSON string with generation options
     * @returns JSON string with generated text or error
     */
    generateText(modelId: string, prompt: string, options?: string): string;
    
    /**
     * Generate an image from text prompt
     * @param modelId The ID of the loaded image generation model
     * @param prompt The text prompt for image generation
     * @param options Optional JSON string with generation options
     * @returns JSON string with base64 encoded image or error
     */
    generateImage(modelId: string, prompt: string, options?: string): string;
    
    /**
     * Analyze an image with optional text prompt
     * @param modelId The ID of the loaded vision model
     * @param imageData Base64 encoded image data
     * @param prompt Optional text prompt for the analysis
     * @returns JSON string with analysis result or error
     */
    analyzeImage(modelId: string, imageData: string, prompt?: string): string;
    
    /**
     * Synthesize speech from text
     * @param modelId The ID of the loaded TTS model
     * @param text The text to synthesize
     * @param options Optional JSON string with synthesis options
     * @returns JSON string with base64 encoded audio or error
     */
    synthesizeSpeech(modelId: string, text: string, options?: string): string;
    
    /**
     * Transcribe audio to text
     * @param modelId The ID of the loaded Whisper/ASR model
     * @param audioData Base64 encoded audio data
     * @param options Optional JSON string with transcription options
     * @returns JSON string with transcription or error
     */
    transcribeAudio(modelId: string, audioData: string, options?: string): string;
    
    // Memory Management
    /**
     * Clear all cached models from memory
     * @returns JSON string with status
     */
    clearModelCache(): string;
    
    /**
     * Get available memory information
     * @returns JSON string with memory stats
     */
    getAvailableMemory(): string;
    
    /**
     * Set maximum memory usage for models
     * @param bytes Maximum memory in bytes
     * @returns JSON string with updated limit
     */
    setMaxMemoryUsage(bytes: number): string;
  };
};

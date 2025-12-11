/**
 * Native AI operations module providing JavaScript interface to MLX AI models.
 *
 * This module exposes high-level functions for interacting with the NativeAIModule
 * bridge, including model discovery, loading, and text generation. All operations
 * are designed to run efficiently on background threads per Lynx architecture.
 *
 * @module operations
 */

import {
  buildChatRequest,
  extractModelNames,
  extractModels,
  type ChatTemplateParams,
  type EmbeddingsParams,
  type EmbeddingsResult,
  type GenerateChatOptions,
  type ModelConfiguration,
  type ModelRegistration,
  type NativeAIMessage,
  type NativeAIModelInfo,
  type NativeResponse,
  type TokenCountResult,
  type TokenizeParams,
  type VLMGenerateParams,
  type VLMGenerateResult,
  parseNativeResult,
} from './core';

/**
 * Subset interface of the native bridge exposed by NativeAIModule.
 *
 * This interface defines the contract between JavaScript and the native Swift/Objective-C
 * implementation. All methods communicate via JSON strings for cross-language compatibility.
 *
 * @interface NativeAIModuleBridge
 * @private
 */
interface NativeAIModuleBridge {
  /** Lists all available models registered with MLX */
  listAvailableModels?: () => string;
  /** Lists models currently loaded in memory */
  listLoadedModels?: () => string;
  /** Checks if a specific model is loaded */
  isModelLoaded?: (modelName: string) => string;
  /** Downloads a model without loading it into memory */
  downloadModel?: (requestJSON: string, callback: (result: string) => void) => void;
  /** Loads a model into memory with progress callbacks */
  loadModel?: (requestJSON: string, callback: (result: string) => void) => void;
  /** Unloads a model from memory */
  unloadModel?: (modelName: string) => string;
  /** Generates streaming chat responses */
  generateChat?: (requestJSON: string, callback: (result: string) => void) => void;
  /** Generates responses with image inputs (VLM) */
  generateWithImage?: (requestJSON: string, callback: (result: string) => void) => void;
  /** Generates embeddings for text inputs */
  getEmbeddings?: (requestJSON: string, callback: (result: string) => void) => void;
  /** Counts tokens in text */
  countTokens?: (requestJSON: string, callback: (result: string) => void) => void;
  /** Encodes text to token IDs */
  encodeText?: (requestJSON: string, callback: (result: string) => void) => void;
  /** Decodes token IDs to text */
  decodeTokens?: (requestJSON: string, callback: (result: string) => void) => void;
  /** Applies chat template to messages */
  applyChatTemplate?: (requestJSON: string, callback: (result: string) => void) => void;
  /** Registers a model configuration dynamically */
  registerModel?: (requestJSON: string) => string;
  /** Loads a model with inline configuration */
  loadModelWithConfig?: (requestJSON: string, callback: (result: string) => void) => void;
  /** Lists all dynamically registered models */
  listRegisteredModels?: () => string;
}

/**
 * Global NativeModules object provided by Lynx runtime.
 *
 * @private
 */
declare const NativeModules: {
  NativeAIModule?: NativeAIModuleBridge;
} | undefined;

/**
 * Safely retrieves the NativeAIModule instance from the global scope.
 *
 * Performs runtime checks to ensure the module is available. Returns null
 * if running in an environment without native module support.
 *
 * @returns {NativeAIModuleBridge | null} The native module instance or null
 * @private
 *
 * @example
 * ```typescript
 * const module = getNativeModule();
 * if (module?.listAvailableModels) {
 *   const models = module.listAvailableModels();
 * }
 * ```
 */
function getNativeModule(): NativeAIModuleBridge | null {
  if (typeof NativeModules === 'undefined') {
    console.warn('[NativeAI] NativeModules is undefined in this environment');
    return null;
  }
  const module = NativeModules.NativeAIModule;
  if (!module) {
    console.warn('[NativeAI] NativeAIModule is unavailable');
    return null;
  }
  return module;
}

/**
 * Retrieves metadata for all models registered on the device.
 *
 * This synchronous function queries the native module for all available models,
 * including both loaded and unloaded models. The operation is optimized to run
 * on a background thread to avoid blocking the UI.
 *
 * @returns {NativeAIModelInfo[]} Array of model metadata objects
 *
 * @example
 * ```typescript
 * const models = fetchAvailableModels();
 * console.log(models);
 * // [
 * //   { name: 'gemma3:2b', type: 'llm', huggingFaceId: 'google/gemma-2b' },
 * //   { name: 'llama3:1b', type: 'llm', huggingFaceId: 'meta/llama-3-1b' }
 * // ]
 * ```
 *
 * @see {@link fetchAvailableModelsAsync} for the async version
 */
export function fetchAvailableModels(): NativeAIModelInfo[] {
  const module = getNativeModule();
  if (!module?.listAvailableModels) {
    return [];
  }

  try {
    const raw = module.listAvailableModels();
    const parsed = parseNativeResult<
      { models?: NativeAIModelInfo[] } | NativeAIModelInfo[]
    >(raw, 'listAvailableModels');
    return extractModels(parsed as NativeResponse<{ models?: NativeAIModelInfo[] }>);
  } catch (error) {
    console.error('[NativeAI] Failed to parse available models', error);
    return [];
  }
}

/**
 * Asynchronously retrieves metadata for all registered models.
 *
 * Async version of fetchAvailableModels that defers execution to the next tick,
 * ensuring UI responsiveness. All async functions automatically run on background
 * threads per Lynx architecture - no special directive needed.
 *
 * @returns {Promise<NativeAIModelInfo[]>} Promise resolving to array of model metadata
 *
 * @example
 * ```typescript
 * const models = await fetchAvailableModelsAsync();
 * models.forEach(model => {
 *   console.log(`${model.displayName}: ${model.status}`);
 * });
 * ```
 *
 * @see {@link fetchAvailableModels} for the synchronous version
 */
export async function fetchAvailableModelsAsync(): Promise<NativeAIModelInfo[]> {
  return new Promise((resolve) => {
    // Use setTimeout to defer to next tick, preventing UI blocking
    setTimeout(() => {
      resolve(fetchAvailableModels());
    }, 0);
  });
}

/**
 * Returns the names of models currently loaded in memory.
 *
 * Queries the native module for active model containers. These are models
 * that have been loaded and are ready for immediate inference without
 * additional loading time.
 *
 * @returns {string[]} Array of loaded model names
 *
 * @example
 * ```typescript
 * const loadedModels = fetchLoadedModelNames();
 * console.log(loadedModels); // ['gemma3:2b', 'llama3:1b']
 *
 * // Check if specific model is in the loaded set
 * const isGemmaLoaded = loadedModels.includes('gemma3:2b');
 * ```
 *
 * @see {@link fetchLoadedModelNamesAsync} for the async version
 * @see {@link isNativeModelLoaded} to check a specific model
 */
export function fetchLoadedModelNames(): string[] {
  const module = getNativeModule();
  if (!module?.listLoadedModels) {
    return [];
  }

  try {
    const raw = module.listLoadedModels();
    const parsed = parseNativeResult<
      { models?: Array<NativeAIModelInfo | string> } | Array<NativeAIModelInfo | string>
    >(raw, 'listLoadedModels');
    return extractModelNames(parsed as NativeResponse<{ models?: NativeAIModelInfo[] }>);
  } catch (error) {
    console.error('[NativeAI] Failed to parse loaded models', error);
    return [];
  }
}

/**
 * Asynchronously returns names of loaded models.
 *
 * Async version of fetchLoadedModelNames that runs on background thread
 * per Lynx architecture. Useful when you need non-blocking access to
 * loaded model state.
 *
 * @returns {Promise<string[]>} Promise resolving to array of model names
 *
 * @example
 * ```typescript
 * const loadedModels = await fetchLoadedModelNamesAsync();
 * if (loadedModels.length === 0) {
 *   console.log('No models loaded. Please load a model first.');
 * }
 * ```
 *
 * @see {@link fetchLoadedModelNames} for the synchronous version
 */
export async function fetchLoadedModelNamesAsync(): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fetchLoadedModelNames());
    }, 0);
  });
}

/**
 * Checks whether a specific model is currently loaded in memory.
 *
 * Performs a fast lookup to determine if the model has an active container.
 * This is useful for conditional loading logic and UI state management.
 *
 * @param {string} modelName - The model identifier to check (e.g., 'gemma3:2b')
 * @returns {boolean} True if the model is loaded and ready for inference
 *
 * @example
 * ```typescript
 * const isLoaded = isNativeModelLoaded('gemma3:2b');
 * if (!isLoaded) {
 *   console.log('Model needs to be loaded before use');
 *   await loadNativeModel('gemma3:2b');
 * }
 * ```
 *
 * @see {@link fetchLoadedModelNames} to get all loaded models
 * @see {@link loadNativeModel} to load a model
 */
export function isNativeModelLoaded(modelName: string): boolean {
  const module = getNativeModule();
  if (!module?.isModelLoaded) {
    return false;
  }

  try {
    const raw = module.isModelLoaded(modelName);
    const parsed = parseNativeResult<{ model?: string; loaded?: boolean }>(raw, 'isModelLoaded');
    return Boolean(parsed?.data && (parsed.data as { loaded?: boolean }).loaded);
  } catch (error) {
    console.error('[NativeAI] Failed to determine model load state', error);
    return false;
  }
}

/**
 * Downloads a model's files without loading it into memory.
 *
 * Initiates an asynchronous model download operation. The model files are downloaded
 * from Hugging Face and cached locally, but NOT loaded into memory. This is useful
 * for pre-downloading models for offline use or separating download from loading.
 *
 * Progress events are emitted via the 'native_ai:model' global event channel with
 * types: 'download_started', 'download_progress', 'download_complete', 'download_error'.
 *
 * All async functions run on background thread per Lynx architecture - no directive needed.
 *
 * @param {string} modelName - The model identifier to download (e.g., 'gemma3:2b')
 * @returns {Promise<NativeResponse<{ model: string; status: string }> | null>}
 *   Promise resolving to download result or null on failure
 *
 * @example
 * ```typescript
 * const result = await downloadNativeModel('gemma3:2b');
 * if (result?.success) {
 *   console.log('Model downloaded successfully');
 *   // Now you can load it separately
 *   await loadNativeModel('gemma3:2b');
 * }
 * ```
 *
 * @example With Progress Tracking
 * ```typescript
 * // Listen to download progress events
 * globalThis.addEventListener('native_ai:model', (event) => {
 *   if (event.type === 'download_progress') {
 *     console.log(`Downloading ${event.model}: ${event.percentage}%`);
 *   } else if (event.type === 'download_complete') {
 *     console.log(`Download complete: ${event.model}`);
 *   }
 * });
 *
 * await downloadNativeModel('gemma3:2b');
 * ```
 *
 * @throws Returns error response if model not found or download fails
 * @see {@link loadNativeModel} to load a downloaded model into memory
 */
export async function downloadNativeModel(
  modelName: string,
): Promise<NativeResponse<{ model: string; status: string }> | null> {
  const module = getNativeModule();
  if (!module?.downloadModel) {
    console.warn('[downloadNativeModel] Module not available');
    return null;
  }

  console.log('[downloadNativeModel] Downloading model:', modelName);

  return await new Promise((resolve) => {
    const request = JSON.stringify({ model: modelName });
    console.log('[downloadNativeModel] Request payload:', request);

    // Add timeout to prevent hanging (10 minutes for large models)
    const timeout = setTimeout(() => {
      console.warn('[downloadNativeModel] Timeout after 600s for model:', modelName);
      resolve({ success: false, message: 'Model download timeout' });
    }, 600000);

    try {
      console.log('[downloadNativeModel] Calling native module for:', modelName);
      module?.downloadModel?.(request, (result: string) => {
        clearTimeout(timeout);
        console.log('[downloadNativeModel] ✓ Callback received for:', modelName);
        const parsed = parseNativeResult<{ model: string; status: string }>(result, 'downloadModel');
        resolve(parsed);
      });
      console.log('[downloadNativeModel] Call dispatched, waiting...');
    } catch (error) {
      clearTimeout(timeout);
      console.error('[downloadNativeModel] ✗ Exception:', modelName, error);
      resolve({ success: false, message: (error as Error).message });
    }
  });
}

/**
 * Loads a model into memory with progress tracking and timeout protection.
 *
 * Initiates an asynchronous model loading operation. The model files are downloaded
 * from Hugging Face (if not cached) and loaded into memory. Progress events are
 * emitted via the 'native_ai:model' global event channel.
 *
 * All async functions run on background thread per Lynx architecture - no directive needed.
 *
 * @param {string} modelName - The model identifier to load (e.g., 'gemma3:2b')
 * @returns {Promise<NativeResponse<NativeAIModelInfo | Record<string, unknown>> | null>}
 *   Promise resolving to load result or null on failure
 *
 * @example
 * ```typescript
 * const result = await loadNativeModel('gemma3:2b');
 * if (result?.success) {
 *   console.log('Model loaded successfully:', result.data);
 * } else {
 *   console.error('Failed to load model:', result?.message);
 * }
 * ```
 *
 * @example With Progress Tracking
 * ```typescript
 * // Listen to progress events
 * globalThis.addEventListener('native_ai:model', (event) => {
 *   if (event.type === 'download_progress') {
 *     console.log(`Download: ${event.percentage}%`);
 *   }
 * });
 *
 * await loadNativeModel('gemma3:2b');
 * ```
 *
 * @throws Returns error response if model not found or loading fails
 * @see {@link ensureModelLoaded} for idempotent loading
 * @see {@link unloadNativeModel} to free memory
 */
export async function loadNativeModel(
  modelName: string,
): Promise<NativeResponse<NativeAIModelInfo | Record<string, unknown>> | null> {
  const module = getNativeModule();
  if (!module?.loadModel) {
    console.warn('[loadNativeModel] Module not available');
    return null;
  }

  console.log('[loadNativeModel] Loading model:', modelName);

  return await new Promise((resolve) => {
    const request = JSON.stringify({ model: modelName });
    console.log('[loadNativeModel] Request payload:', request);

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.warn('[loadNativeModel] Timeout after 60s for model:', modelName);
      resolve({ success: false, message: 'Model loading timeout' });
    }, 60000);

    try {
      console.log('[loadNativeModel] Calling native module for:', modelName);
      module?.loadModel?.(request, (result: string) => {
        clearTimeout(timeout);
        console.log('[loadNativeModel] ✓ Callback received for:', modelName);
        const parsed = parseNativeResult<NativeAIModelInfo | Record<string, unknown>>(result, 'loadModel');
        resolve(parsed);
      });
      console.log('[loadNativeModel] Call dispatched, waiting...');
    } catch (error) {
      clearTimeout(timeout);
      console.error('[loadNativeModel] ✗ Exception:', modelName, error);
      resolve({ success: false, message: (error as Error).message });
    }
  });
}

/**
 * Ensures a model is loaded and ready for inference.
 *
 * Idempotent operation that checks if the model is already loaded before
 * attempting to load it. Optionally forces a reload even if already loaded.
 *
 * @param {string} modelName - The model identifier
 * @param {Object} [options] - Loading options
 * @param {boolean} [options.reload=false] - Force reload even if already loaded
 * @returns {Promise<boolean>} True if model is ready for use, false otherwise
 *
 * @example Basic Usage
 * ```typescript
 * const ready = await ensureModelLoaded('gemma3:2b');
 * if (ready) {
 *   // Model is loaded and ready for inference
 *   await generateNativeChat('gemma3:2b', messages);
 * }
 * ```
 *
 * @example Force Reload
 * ```typescript
 * // Reload model to apply new configuration
 * const ready = await ensureModelLoaded('gemma3:2b', { reload: true });
 * ```
 *
 * @see {@link loadNativeModel} for direct loading
 * @see {@link isNativeModelLoaded} to check load status
 */
export async function ensureModelLoaded(
  modelName: string,
  options: { reload?: boolean } = {},
): Promise<boolean> {
  const { reload = false } = options;
  if (!reload && isNativeModelLoaded(modelName)) {
    return true;
  }

  const result = await loadNativeModel(modelName);
  return Boolean(result?.success);
}


/**
 * Generates streaming chat responses with retry logic and real-time events.
 *
 * Initiates a streaming text generation request. The response is delivered in chunks
 * via the 'native_ai:stream' global event channel. The returned promise resolves when
 * generation completes (success or failure).
 *
 * Intermediate chunk callbacks are propagated through global events with status:
 * - 'started': Generation has begun
 * - 'chunk': New text fragment available
 * - 'info': Performance statistics
 * - 'tool_call': Model invoked a function/tool
 * - 'complete': Generation finished successfully
 * - 'error': Generation failed
 *
 * Runs on background thread by default per Lynx architecture - no directive needed.
 *
 * @param {string} modelName - The model to use for generation
 * @param {NativeAIMessage[]} messages - Conversation history
 * @param {GenerateChatOptions} [options] - Generation parameters (temperature, maxTokens)
 * @returns {Promise<NativeResponse<Record<string, unknown>> | null>}
 *   Promise resolving to final generation result
 *
 * @example Basic Chat
 * ```typescript
 * const result = await generateNativeChat(
 *   'gemma3:2b',
 *   [{ role: 'user', content: 'What is AI?' }],
 *   { temperature: 0.7, maxTokens: 256 }
 * );
 *
 * if (result?.success) {
 *   console.log('Response:', result.data.content);
 * }
 * ```
 *
 * @example With Stream Listening
 * ```typescript
 * // Listen to streaming events
 * globalThis.addEventListener('native_ai:stream', (event) => {
 *   switch (event.status) {
 *     case 'started':
 *       console.log('Generation started for', event.model);
 *       break;
 *     case 'chunk':
 *       console.log('Chunk:', event.delta);
 *       updateUI(event.content); // Update UI with accumulated text
 *       break;
 *     case 'complete':
 *       console.log('Done! Stats:', event.metadata?.statistics);
 *       break;
 *   }
 * });
 *
 * await generateNativeChat('gemma3:2b', messages);
 * ```
 *
 * @example With Retry on Failure
 * ```typescript
 * // The function automatically retries up to 3 times on failure
 * const result = await generateNativeChat('gemma3:2b', messages);
 * // Returns null only after all retries exhausted
 * ```
 *
 * @throws Returns error response if model not loaded or generation fails after retries
 * @see {@link useNativeAIStream} React hook for stream management
 */
export async function generateNativeChat(
  modelName: string,
  messages: NativeAIMessage[],
  options: GenerateChatOptions = {},
): Promise<NativeResponse<Record<string, unknown>> | null> {
  const module = getNativeModule();
  if (!module?.generateChat) {
    console.warn('[generateNativeChat] Module not available');
    return null;
  }

  const requestPayload = buildChatRequest(modelName, messages, options);
  const payload = JSON.stringify(requestPayload);
  console.log('[generateNativeChat] Starting generation with model:', modelName);

  const maxRetries = 2; // Simple retry: try 3 times total

  for (let attempt = 0; attempt < maxRetries + 1; attempt++) {
    try {
      const result = await new Promise<NativeResponse<Record<string, unknown>> | null>((resolve) => {
        try {
          module?.generateChat?.(payload, (result: string) => {
            const parsed = parseNativeResult<Record<string, unknown>>(result, 'generateChat');
            if (!parsed) {
              resolve(null);
              return;
            }

            const data = (parsed.data ?? {}) as Record<string, unknown>;
            const status = typeof data.status === 'string' ? (data.status as string) : undefined;

            if (!status || status === 'generated' || parsed.success === false) {
              resolve(parsed);
            }
          });
        } catch (error) {
          console.error('[NativeAI] generateChat threw an exception', error);
          resolve({ success: false, message: (error as Error).message });
        }
      });

      // If successful or this is the last attempt, return the result
      if (result?.success !== false || attempt === maxRetries) {
        return result;
      }

      // Wait briefly before retrying
      if (attempt < maxRetries) {
        console.warn(`[NativeAI] Generation attempt ${attempt + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`[NativeAI] Generation attempt ${attempt + 1} failed:`, error);
      if (attempt === maxRetries) {
        return { success: false, message: (error as Error).message };
      }
    }
  }

  return { success: false, message: 'Generation failed after retries' };
}


/**
 * Unloads a model from memory to free resources.
 *
 * Removes the model container from the cache, freeing up memory and GPU resources.
 * This is useful for memory management when switching between models or when
 * a model is no longer needed.
 *
 * @param {string} modelName - The model identifier to unload
 * @returns {boolean} True if model was successfully unloaded, false otherwise
 *
 * @example
 * ```typescript
 * // Unload unused model to free memory
 * const unloaded = unloadNativeModel('gemma3:2b');
 * if (unloaded) {
 *   console.log('Model unloaded successfully');
 * }
 * ```
 *
 * @example Memory Management
 * ```typescript
 * // Load new model and unload old one
 * await loadNativeModel('llama3:1b');
 * unloadNativeModel('gemma3:2b'); // Free up memory
 * ```
 *
 * @see {@link loadNativeModel} to load a model
 * @see {@link isNativeModelLoaded} to check load status
 */
export function unloadNativeModel(modelName: string): boolean {
  const module = getNativeModule();
  if (!module?.unloadModel) {
    return false;
  }

  try {
    const raw = module.unloadModel(modelName);
    const parsed = parseNativeResult<{ success?: boolean }>(raw, 'unloadModel');
    return Boolean(parsed?.success);
  } catch (error) {
    console.error('[NativeAI] Failed to unload model', error);
    return false;
  }
}

/**
 * Generates text responses from vision-language models with image inputs.
 *
 * Enables multimodal generation by combining text prompts with image data.
 * Images can be provided as raw ArrayBuffer data or as URLs. The VLM processes
 * both modalities to generate contextual responses.
 *
 * Runs on background thread by default per Lynx architecture - no directive needed.
 *
 * @param {string} modelName - The VLM model identifier to use
 * @param {VLMGenerateParams} params - Generation parameters including prompt and image
 * @returns {Promise<VLMGenerateResult>} Promise resolving to generation result
 *
 * @example With Image Buffer
 * ```typescript
 * // Load image as ArrayBuffer
 * const imageBuffer = await fetch('/path/to/image.jpg')
 *   .then(res => res.arrayBuffer());
 *
 * const result = await generateWithImage('llava:7b', {
 *   prompt: 'Describe what you see in this image in detail',
 *   imageData: imageBuffer,
 *   temperature: 0.7,
 *   maxTokens: 256
 * });
 *
 * if (result.success) {
 *   console.log('VLM Response:', result.text);
 * }
 * ```
 *
 * @example With Image URL
 * ```typescript
 * const result = await generateWithImage('llava:7b', {
 *   prompt: 'What objects are visible in this photo?',
 *   imageURL: 'https://example.com/photo.jpg',
 *   maxTokens: 128
 * });
 * ```
 *
 * @example Medical Image Analysis
 * ```typescript
 * const result = await generateWithImage('medical-vlm', {
 *   prompt: 'Identify any abnormalities in this X-ray',
 *   imageData: xrayBuffer,
 *   temperature: 0.3 // Lower temperature for more precise analysis
 * });
 * ```
 *
 * @throws Returns error result if model not loaded or generation fails
 * @see {@link ensureModelLoaded} to ensure VLM is ready
 */
export async function generateWithImage(
  modelName: string,
  params: VLMGenerateParams
): Promise<VLMGenerateResult> {
  const module = getNativeModule();
  if (!module?.generateWithImage) {
    return { success: false, error: 'generateWithImage not available' };
  }

  return await new Promise((resolve) => {
    const payloadObj: {
      model: string;
      prompt: string;
      imageData?: ArrayBuffer;
      imageURL?: string;
      temperature?: number;
      maxTokens?: number;
    } = {
      model: modelName,
      prompt: params.prompt,
    };

    if (params.imageData) payloadObj.imageData = params.imageData;
    if (params.imageURL) payloadObj.imageURL = params.imageURL;
    if (params.temperature !== undefined) payloadObj.temperature = params.temperature;
    if (params.maxTokens !== undefined) payloadObj.maxTokens = params.maxTokens;

    const payload = JSON.stringify(payloadObj);
    console.log('[generateWithImage] Starting VLM generation with model:', modelName);

    try {
      module?.generateWithImage?.(payload, (result: string) => {
        const parsed = parseNativeResult<VLMGenerateResult>(result, 'generateWithImage');
        if (!parsed?.data) {
          resolve({ success: false, error: parsed?.message || 'Unknown error' });
          return;
        }
        resolve(parsed.data);
      });
    } catch (error) {
      console.error('[NativeAI] generateWithImage threw an exception', error);
      resolve({ success: false, error: (error as Error).message });
    }
  });
}

/**
 * Generates dense vector embeddings for text inputs.
 *
 * Converts text strings into high-dimensional vector representations that capture
 * semantic meaning. These embeddings are useful for similarity search, clustering,
 * classification, and other machine learning tasks.
 *
 * Runs on background thread by default per Lynx architecture - no directive needed.
 *
 * @param {string} modelName - The embedding model identifier to use
 * @param {EmbeddingsParams} params - Parameters including texts to embed
 * @returns {Promise<EmbeddingsResult>} Promise resolving to embeddings result
 *
 * @example Single Text
 * ```typescript
 * const result = await getEmbeddings('sentence-transformers', {
 *   texts: ['Machine learning is fascinating']
 * });
 *
 * if (result.success && result.embeddings) {
 *   console.log('Embedding shape:', result.shape); // e.g., [1, 768]
 *   console.log('First embedding:', result.embeddings[0]);
 * }
 * ```
 *
 * @example Batch Embeddings
 * ```typescript
 * const documents = [
 *   'Natural language processing',
 *   'Computer vision and image recognition',
 *   'Reinforcement learning agents'
 * ];
 *
 * const result = await getEmbeddings('all-minilm-l6-v2', {
 *   texts: documents
 * });
 *
 * if (result.success && result.embeddings) {
 *   // Use embeddings for similarity search
 *   const queryEmbedding = result.embeddings[0];
 *   // Calculate cosine similarity, etc.
 * }
 * ```
 *
 * @example Semantic Search
 * ```typescript
 * // Embed documents
 * const docs = await getEmbeddings('embedding-model', {
 *   texts: documentTexts
 * });
 *
 * // Embed query
 * const query = await getEmbeddings('embedding-model', {
 *   texts: ['What is machine learning?']
 * });
 *
 * // Compare embeddings to find most relevant documents
 * ```
 *
 * @throws Returns error result if model not loaded or embedding generation fails
 * @see {@link ensureModelLoaded} to ensure embedding model is ready
 */
export async function getEmbeddings(
  modelName: string,
  params: EmbeddingsParams
): Promise<EmbeddingsResult> {
  const module = getNativeModule();
  if (!module?.getEmbeddings) {
    return { success: false, error: 'getEmbeddings not available' };
  }

  return await new Promise((resolve) => {
    const payload = JSON.stringify({
      model: modelName,
      texts: params.texts,
    });

    console.log('[getEmbeddings] Generating embeddings with model:', modelName);

    try {
      module?.getEmbeddings?.(payload, (result: string) => {
        const parsed = parseNativeResult<EmbeddingsResult>(result, 'getEmbeddings');
        if (!parsed?.data) {
          resolve({ success: false, error: parsed?.message || 'Unknown error' });
          return;
        }
        resolve(parsed.data);
      });
    } catch (error) {
      console.error('[NativeAI] getEmbeddings threw an exception', error);
      resolve({ success: false, error: (error as Error).message });
    }
  });
}

/**
 * Counts the number of tokens in text using the model's tokenizer.
 *
 * Useful for estimating prompt length, calculating API costs, and ensuring
 * text fits within model context windows. Faster than full encoding since
 * it only returns the count.
 *
 * Runs on background thread by default per Lynx architecture - no directive needed.
 *
 * @param {string} modelName - The model whose tokenizer to use
 * @param {TokenizeParams} params - Parameters including text and tokenization options
 * @returns {Promise<TokenCountResult>} Promise resolving to token count
 *
 * @example Basic Token Counting
 * ```typescript
 * const result = await countTokens('gemma3:2b', {
 *   text: 'How many tokens is this sentence?',
 *   addSpecialTokens: true
 * });
 *
 * if (result.success) {
 *   console.log('Token count:', result.count); // e.g., 8
 * }
 * ```
 *
 * @example Context Window Check
 * ```typescript
 * const MAX_CONTEXT = 2048;
 * const result = await countTokens('gemma3:2b', {
 *   text: longDocument,
 *   addSpecialTokens: true
 * });
 *
 * if (result.success && result.count) {
 *   if (result.count > MAX_CONTEXT) {
 *     console.warn(`Text too long: ${result.count} tokens (max: ${MAX_CONTEXT})`);
 *   }
 * }
 * ```
 *
 * @example Cost Estimation
 * ```typescript
 * const result = await countTokens('gpt-4', {
 *   text: userPrompt,
 *   addSpecialTokens: true
 * });
 *
 * if (result.success && result.count) {
 *   const costPerToken = 0.00003;
 *   const estimatedCost = result.count * costPerToken;
 *   console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);
 * }
 * ```
 *
 * @throws Returns error result if model not loaded or tokenization fails
 * @see {@link encodeText} to get actual token IDs
 * @see {@link ensureModelLoaded} to ensure model is ready
 */
export async function countTokens(
  modelName: string,
  params: TokenizeParams
): Promise<TokenCountResult> {
  const module = getNativeModule();
  if (!module?.countTokens) {
    return { success: false, error: 'countTokens not available' };
  }

  return await new Promise((resolve) => {
    const payload = JSON.stringify({
      model: modelName,
      text: params.text,
      addSpecialTokens: params.addSpecialTokens ?? true,
    });

    try {
      module?.countTokens?.(payload, (result: string) => {
        const parsed = parseNativeResult<TokenCountResult>(result, 'countTokens');
        if (!parsed?.data) {
          resolve({ success: false, error: parsed?.message || 'Unknown error' });
          return;
        }
        resolve(parsed.data);
      });
    } catch (error) {
      console.error('[NativeAI] countTokens threw an exception', error);
      resolve({ success: false, error: (error as Error).message });
    }
  });
}

/**
 * Encodes text into token IDs using the model's tokenizer.
 *
 * Converts text strings into arrays of integer token IDs that can be processed
 * by the model. Useful for understanding how text is tokenized, implementing
 * custom processing, or analyzing tokenizer behavior.
 *
 * Runs on background thread by default per Lynx architecture - no directive needed.
 *
 * @param {string} modelName - The model whose tokenizer to use
 * @param {TokenizeParams} params - Parameters including text and tokenization options
 * @returns {Promise<TokenCountResult>} Promise resolving to token IDs and count
 *
 * @example Basic Encoding
 * ```typescript
 * const result = await encodeText('gemma3:2b', {
 *   text: 'Hello, world!',
 *   addSpecialTokens: true
 * });
 *
 * if (result.success && result.tokens) {
 *   console.log('Token IDs:', result.tokens); // e.g., [1, 15496, 11, 1917, 0]
 *   console.log('Token count:', result.count); // e.g., 5
 * }
 * ```
 *
 * @example Tokenizer Analysis
 * ```typescript
 * const text = 'artificial intelligence';
 * const result = await encodeText('llama3:1b', {
 *   text,
 *   addSpecialTokens: false
 * });
 *
 * if (result.success && result.tokens) {
 *   console.log(`"${text}" tokenizes to ${result.count} tokens`);
 *   console.log('Token IDs:', result.tokens);
 * }
 * ```
 *
 * @example Compare with/without Special Tokens
 * ```typescript
 * const text = 'Test text';
 *
 * const withSpecial = await encodeText('model', {
 *   text,
 *   addSpecialTokens: true
 * });
 *
 * const withoutSpecial = await encodeText('model', {
 *   text,
 *   addSpecialTokens: false
 * });
 *
 * console.log('With special tokens:', withSpecial.tokens);
 * console.log('Without special tokens:', withoutSpecial.tokens);
 * ```
 *
 * @throws Returns error result if model not loaded or encoding fails
 * @see {@link decodeTokens} to convert token IDs back to text
 * @see {@link countTokens} for faster count-only operation
 * @see {@link ensureModelLoaded} to ensure model is ready
 */
export async function encodeText(
  modelName: string,
  params: TokenizeParams
): Promise<TokenCountResult> {
  const module = getNativeModule();
  if (!module?.encodeText) {
    return { success: false, error: 'encodeText not available' };
  }

  return await new Promise((resolve) => {
    const payload = JSON.stringify({
      model: modelName,
      text: params.text,
      addSpecialTokens: params.addSpecialTokens ?? true,
    });

    try {
      module?.encodeText?.(payload, (result: string) => {
        const parsed = parseNativeResult<TokenCountResult>(result, 'encodeText');
        if (!parsed?.data) {
          resolve({ success: false, error: parsed?.message || 'Unknown error' });
          return;
        }
        resolve(parsed.data);
      });
    } catch (error) {
      console.error('[NativeAI] encodeText threw an exception', error);
      resolve({ success: false, error: (error as Error).message });
    }
  });
}

/**
 * Decodes token IDs back into text using the model's tokenizer.
 *
 * Converts arrays of integer token IDs into human-readable text strings.
 * This is the inverse operation of encodeText and is useful for understanding
 * model outputs or implementing custom generation logic.
 *
 * Runs on background thread by default per Lynx architecture - no directive needed.
 *
 * @param {string} modelName - The model whose tokenizer to use
 * @param {number[]} tokens - Array of token IDs to decode
 * @returns {Promise<{ success: boolean; text?: string; error?: string }>} Promise resolving to decoded text
 *
 * @example Basic Decoding
 * ```typescript
 * const result = await decodeTokens('gemma3:2b', [1, 15496, 11, 1917, 0]);
 *
 * if (result.success) {
 *   console.log('Decoded text:', result.text); // "Hello, world!"
 * }
 * ```
 *
 * @example Round-trip Encoding/Decoding
 * ```typescript
 * const originalText = 'Machine learning is amazing';
 *
 * // Encode to tokens
 * const encoded = await encodeText('model', { text: originalText });
 *
 * if (encoded.success && encoded.tokens) {
 *   // Decode back to text
 *   const decoded = await decodeTokens('model', encoded.tokens);
 *
 *   if (decoded.success) {
 *     console.log('Original:', originalText);
 *     console.log('Round-trip:', decoded.text);
 *     console.log('Match:', originalText === decoded.text);
 *   }
 * }
 * ```
 *
 * @example Partial Generation
 * ```typescript
 * // Decode partial token sequences during custom generation
 * const tokensSoFar = [15496, 11, 1917];
 * const result = await decodeTokens('model', tokensSoFar);
 *
 * if (result.success) {
 *   console.log('Partial text:', result.text);
 * }
 * ```
 *
 * @throws Returns error result if model not loaded or decoding fails
 * @see {@link encodeText} to convert text to token IDs
 * @see {@link ensureModelLoaded} to ensure model is ready
 */
export async function decodeTokens(
  modelName: string,
  tokens: number[]
): Promise<{ success: boolean; text?: string; error?: string }> {
  const module = getNativeModule();
  if (!module?.decodeTokens) {
    return { success: false, error: 'decodeTokens not available' };
  }

  return await new Promise((resolve) => {
    const payload = JSON.stringify({
      model: modelName,
      tokens,
    });

    try {
      module?.decodeTokens?.(payload, (result: string) => {
        const parsed = parseNativeResult<{ text?: string }>(result, 'decodeTokens');
        if (!parsed?.data) {
          resolve({ success: false, error: parsed?.message || 'Unknown error' });
          return;
        }
        const text = parsed.data.text;
        resolve(text !== undefined ? { success: true, text } : { success: false, error: 'No text returned' });
      });
    } catch (error) {
      console.error('[NativeAI] decodeTokens threw an exception', error);
      resolve({ success: false, error: (error as Error).message });
    }
  });
}

/**
 * Applies the model's chat template to format messages into a prompt string.
 *
 * Converts structured message arrays into the specific prompt format required
 * by the model. Different models use different chat templates (e.g., ChatML,
 * Llama format, Gemma format). This function handles the formatting automatically.
 *
 * Optionally supports tool/function definitions for models with function calling.
 *
 * Runs on background thread by default per Lynx architecture - no directive needed.
 *
 * @param {string} modelName - The model whose chat template to use
 * @param {ChatTemplateParams} params - Parameters including messages and optional tools
 * @returns {Promise<{ success: boolean; prompt?: string; error?: string }>} Promise resolving to formatted prompt
 *
 * @example Basic Chat Template
 * ```typescript
 * const result = await applyChatTemplate('gemma3:2b', {
 *   messages: [
 *     { role: 'system', content: 'You are a helpful assistant' },
 *     { role: 'user', content: 'What is AI?' },
 *     { role: 'assistant', content: 'AI stands for Artificial Intelligence' },
 *     { role: 'user', content: 'Tell me more' }
 *   ]
 * });
 *
 * if (result.success) {
 *   console.log('Formatted prompt:', result.prompt);
 *   // Output format depends on model's template (e.g., ChatML, Llama, etc.)
 * }
 * ```
 *
 * @example With Function Calling
 * ```typescript
 * const result = await applyChatTemplate('llama3:8b', {
 *   messages: [
 *     { role: 'user', content: 'What is the weather in Paris?' }
 *   ],
 *   tools: [{
 *     type: 'function',
 *     function: {
 *       name: 'get_weather',
 *       description: 'Get current weather for a location',
 *       parameters: {
 *         type: 'object',
 *         properties: {
 *           location: { type: 'string', description: 'City name' },
 *           units: { type: 'string', enum: ['celsius', 'fahrenheit'] }
 *         },
 *         required: ['location']
 *       }
 *     }
 *   }]
 * });
 *
 * if (result.success) {
 *   console.log('Prompt with tools:', result.prompt);
 * }
 * ```
 *
 * @example Multi-turn Conversation
 * ```typescript
 * const conversationHistory: NativeAIMessage[] = [
 *   { role: 'system', content: 'You are a coding assistant' },
 *   { role: 'user', content: 'Write a Python function to sort a list' },
 *   { role: 'assistant', content: 'def sort_list(lst):\n    return sorted(lst)' },
 *   { role: 'user', content: 'Make it sort in reverse order' }
 * ];
 *
 * const result = await applyChatTemplate('codellama:7b', {
 *   messages: conversationHistory
 * });
 *
 * if (result.success) {
 *   // Use formatted prompt for generation
 *   console.log('Formatted conversation:', result.prompt);
 * }
 * ```
 *
 * @throws Returns error result if model not loaded or template application fails
 * @see {@link generateNativeChat} which applies templates automatically
 * @see {@link ensureModelLoaded} to ensure model is ready
 */
export async function applyChatTemplate(
  modelName: string,
  params: ChatTemplateParams
): Promise<{ success: boolean; prompt?: string; error?: string }> {
  const module = getNativeModule();
  if (!module?.applyChatTemplate) {
    return { success: false, error: 'applyChatTemplate not available' };
  }

  return await new Promise((resolve) => {
    const payloadObj: {
      model: string;
      messages: NativeAIMessage[];
      tools?: any[];
    } = {
      model: modelName,
      messages: params.messages,
    };

    if (params.tools) payloadObj.tools = params.tools;

    const payload = JSON.stringify(payloadObj);

    try {
      module?.applyChatTemplate?.(payload, (result: string) => {
        const parsed = parseNativeResult<{ prompt?: string }>(result, 'applyChatTemplate');
        if (!parsed?.data) {
          resolve({ success: false, error: parsed?.message || 'Unknown error' });
          return;
        }
        const prompt = parsed.data.prompt;
        resolve(prompt !== undefined ? { success: true, prompt } : { success: false, error: 'No prompt returned' });
      });
    } catch (error) {
      console.error('[NativeAI] applyChatTemplate threw an exception', error);
      resolve({ success: false, error: (error as Error).message });
    }
  });
}

/**
 * Registers a model configuration for later use.
 *
 * Models registered this way become available for loading by name using the
 * standard loadNativeModel function. This eliminates the need to hardcode
 * model configurations in the native layer.
 *
 * Registration is synchronous and persistent for the app session. Registered
 * models appear in the available models list.
 *
 * @param {ModelRegistration} registration - Complete model registration with name and configuration
 * @returns {NativeResponse<{model: string, registered: boolean}>} Response indicating success or failure
 *
 * @example Basic Registration
 * ```typescript
 * const result = registerModel({
 *   name: "My Llama Model",
 *   configuration: {
 *     id: "mlx-community/Llama-3.2-1B-Instruct-4bit",
 *     type: "llm"
 *   }
 * });
 *
 * if (result.success) {
 *   console.log('Model registered:', result.data?.model);
 *   // Now you can load it with loadNativeModel("My Llama Model")
 * }
 * ```
 *
 * @example Full Configuration
 * ```typescript
 * const result = registerModel({
 *   name: "Qwen Assistant",
 *   configuration: {
 *     id: "mlx-community/Qwen-3-0.5B-Instruct-4bit",
 *     type: "llm",
 *     extraEOSTokens: ["</s>", "<|endoftext|>"],
 *     defaultPrompt: "You are a helpful AI assistant",
 *     revision: "main"
 *   }
 * });
 *
 * if (result.success) {
 *   await loadNativeModel("Qwen Assistant");
 * }
 * ```
 *
 * @example Register Multiple Models
 * ```typescript
 * const models: ModelRegistration[] = [
 *   {
 *     name: "Llama 1B",
 *     configuration: {
 *       id: "mlx-community/Llama-3.2-1B-Instruct-4bit",
 *       type: "llm"
 *     }
 *   },
 *   {
 *     name: "Qwen 500M",
 *     configuration: {
 *       id: "mlx-community/Qwen-3-0.5B-Instruct-4bit",
 *       type: "llm"
 *     }
 *   }
 * ];
 *
 * models.forEach(model => {
 *   const result = registerModel(model);
 *   console.log(`${model.name}: ${result.success ? 'registered' : 'failed'}`);
 * });
 * ```
 *
 * @see {@link loadNativeModel} to load a registered model
 * @see {@link loadModelWithConfig} to load without registration
 * @see {@link listRegisteredModels} to view all registered models
 */
export function registerModel(
  registration: ModelRegistration
): NativeResponse<{model: string, registered: boolean}> {
  const module = getNativeModule();
  if (!module?.registerModel) {
    return {
      success: false,
      message: 'registerModel not available'
    };
  }

  try {
    console.log('[registerModel] Registering model:', registration.name);
    const requestJSON = JSON.stringify(registration);
    console.log('[registerModel] Request payload:', requestJSON);

    const raw = module.registerModel(requestJSON);
    const parsed = parseNativeResult<{model: string, registered: boolean}>(
      raw,
      'registerModel'
    );
    console.log('[registerModel] Registration result:', parsed);
    return parsed || { success: false, message: 'Failed to parse response' };
  } catch (error) {
    console.error('[registerModel] Failed to register model:', error);
    return {
      success: false,
      message: (error as Error).message
    };
  }
}

/**
 * Loads a model with inline configuration without pre-registration.
 *
 * This is the recommended way to load custom models dynamically. The model
 * configuration is provided directly, eliminating the need for separate
 * registration. The model is loaded with the specified configuration and
 * becomes available for inference.
 *
 * Progress events are emitted via the 'native_ai:model' global event channel,
 * just like standard model loading.
 *
 * Runs on background thread by default per Lynx architecture - no directive needed.
 *
 * @param {string} name - Display name for this model instance
 * @param {ModelConfiguration} configuration - Complete model configuration
 * @returns {Promise<NativeResponse<NativeAIModelInfo>>} Promise resolving to load result
 *
 * @example Basic Usage
 * ```typescript
 * const result = await loadModelWithConfig(
 *   "temp-llama",
 *   {
 *     id: "mlx-community/Llama-3.2-1B-Instruct-4bit",
 *     type: "llm"
 *   }
 * );
 *
 * if (result?.success) {
 *   console.log('Model loaded:', result.data);
 *   // Generate with this model
 *   await generateNativeChat("temp-llama", messages);
 * }
 * ```
 *
 * @example With Full Configuration
 * ```typescript
 * const result = await loadModelWithConfig(
 *   "custom-qwen",
 *   {
 *     id: "mlx-community/Qwen-3-0.5B-Instruct-4bit",
 *     type: "llm",
 *     extraEOSTokens: ["</s>"],
 *     defaultPrompt: "You are a helpful coding assistant",
 *     revision: "main"
 *   }
 * );
 *
 * if (result?.success) {
 *   console.log('Custom Qwen loaded successfully');
 * }
 * ```
 *
 * @example Load Vision Model
 * ```typescript
 * const result = await loadModelWithConfig(
 *   "vision-assistant",
 *   {
 *     id: "mlx-community/llava-1.5-7b-4bit",
 *     type: "vlm",
 *     defaultPrompt: "Describe what you see in detail"
 *   }
 * );
 *
 * if (result?.success) {
 *   // Use for image generation
 *   await generateWithImage("vision-assistant", {
 *     prompt: "What's in this image?",
 *     imageData: buffer
 *   });
 * }
 * ```
 *
 * @example With Progress Tracking
 * ```typescript
 * // Listen to loading progress
 * globalThis.addEventListener('native_ai:model', (event) => {
 *   if (event.type === 'download_progress') {
 *     console.log(`Downloading: ${event.percentage}%`);
 *   }
 * });
 *
 * const result = await loadModelWithConfig("my-model", {
 *   id: "mlx-community/model-4bit",
 *   type: "llm"
 * });
 * ```
 *
 * @example Dynamic Model Selection
 * ```typescript
 * // Load different models based on user selection
 * async function loadUserModel(modelId: string) {
 *   const config: ModelConfiguration = {
 *     id: modelId,
 *     type: modelId.includes('llava') ? 'vlm' : 'llm'
 *   };
 *
 *   const result = await loadModelWithConfig(
 *     `user-model-${Date.now()}`,
 *     config
 *   );
 *
 *   return result?.success ?? false;
 * }
 * ```
 *
 * @throws Returns error response if model not found or loading fails
 * @see {@link registerModel} for pre-registration approach
 * @see {@link loadNativeModel} to load registered models by name
 * @see {@link ModelConfiguration} for configuration details
 */
export async function loadModelWithConfig(
  name: string,
  configuration: ModelConfiguration
): Promise<NativeResponse<NativeAIModelInfo> | null> {
  const module = getNativeModule();
  if (!module?.loadModelWithConfig) {
    return {
      success: false,
      message: 'loadModelWithConfig not available'
    };
  }

  return await new Promise((resolve) => {
    const request = JSON.stringify({ name, configuration });
    console.log('[loadModelWithConfig] Loading model with config:', name);

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.warn('[loadModelWithConfig] Timeout after 60s for model:', name);
      resolve({ success: false, message: 'Model loading timeout' });
    }, 60000);

    try {
      module?.loadModelWithConfig?.(request, (result: string) => {
        clearTimeout(timeout);
        console.log('[loadModelWithConfig] Received result for:', name);
        resolve(
          parseNativeResult<NativeAIModelInfo>(result, 'loadModelWithConfig')
        );
      });
    } catch (error) {
      clearTimeout(timeout);
      console.error('[loadModelWithConfig] Exception for model:', name, error);
      resolve({ success: false, message: (error as Error).message });
    }
  });
}

/**
 * Lists all dynamically registered models.
 *
 * Returns metadata for models that have been registered using registerModel.
 * This does not include hardcoded models from the native layer, only those
 * registered dynamically from TypeScript.
 *
 * @returns {NativeAIModelInfo[]} Array of registered model metadata
 *
 * @example
 * ```typescript
 * const registered = listRegisteredModels();
 * console.log('Registered models:', registered);
 * // [
 * //   { name: 'My Llama Model', type: 'llm', huggingFaceId: 'mlx-community/...' },
 * //   { name: 'Qwen Assistant', type: 'llm', huggingFaceId: 'mlx-community/...' }
 * // ]
 * ```
 *
 * @example Check If Model Is Registered
 * ```typescript
 * const registered = listRegisteredModels();
 * const isRegistered = registered.some(m => m.name === "My Custom Model");
 *
 * if (!isRegistered) {
 *   registerModel({
 *     name: "My Custom Model",
 *     configuration: { id: "mlx-community/model", type: "llm" }
 *   });
 * }
 * ```
 *
 * @example Display Registered Models in UI
 * ```typescript
 * const models = listRegisteredModels();
 * models.forEach(model => {
 *   console.log(`${model.displayName || model.name}`);
 *   console.log(`  Type: ${model.type}`);
 *   console.log(`  ID: ${model.huggingFaceId}`);
 * });
 * ```
 *
 * @see {@link registerModel} to register new models
 * @see {@link fetchAvailableModels} to list all available models (including hardcoded)
 */
export function listRegisteredModels(): NativeAIModelInfo[] {
  const module = getNativeModule();
  if (!module?.listRegisteredModels) {
    return [];
  }

  try {
    const raw = module.listRegisteredModels();
    const parsed = parseNativeResult<
      { models?: NativeAIModelInfo[] } | NativeAIModelInfo[]
    >(raw, 'listRegisteredModels');
    return extractModels(parsed as NativeResponse<{ models?: NativeAIModelInfo[] }>);
  } catch (error) {
    console.error('[NativeAI] Failed to parse registered models', error);
    return [];
  }
}

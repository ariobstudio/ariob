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
  type GenerateChatOptions,
  type NativeAIMessage,
  type NativeAIModelInfo,
  type NativeResponse,
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
  /** Loads a model into memory with progress callbacks */
  loadModel?: (request: string, callback: (result: string) => void) => void;
  /** Unloads a model from memory */
  unloadModel?: (modelName: string) => string;
  /** Generates streaming chat responses */
  generateChat?: (request: string, callback: (result: string) => void) => void;
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
    return null;
  }

  return await new Promise((resolve) => {
    const request = JSON.stringify({ model: modelName });

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.warn('[NativeAI] loadModel timeout after 60s');
      resolve({ success: false, message: 'Model loading timeout' });
    }, 60000);

    try {
      module?.loadModel?.(request, (result: string) => {
        clearTimeout(timeout);
        resolve(
          parseNativeResult<NativeAIModelInfo | Record<string, unknown>>(result, 'loadModel'),
        );
      });
    } catch (error) {
      clearTimeout(timeout);
      console.error('[NativeAI] loadModel threw an exception', error);
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
    return null;
  }

  const payload = buildChatRequest(modelName, messages, options);
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

import type { BaseEvent, InputProps, StandardProps } from '@lynx-js/types';

/**
 * Request interfaces for native bridge methods.
 * These types define the structure of objects passed to native methods.
 */

/** Request object for loading a model */
interface LoadModelRequest {
  model: string;
}

/** Request object for loading a model with configuration */
interface LoadModelWithConfigRequest {
  name: string;
  configuration: {
    id: string;
    type: 'llm' | 'vlm';
    extraEOSTokens?: string[];
    defaultPrompt?: string;
    revision?: string;
  };
}

/** Request object for registering a model */
interface RegisterModelRequest {
  name: string;
  configuration: {
    id: string;
    type: 'llm' | 'vlm';
    extraEOSTokens?: string[];
    defaultPrompt?: string;
    revision?: string;
  };
}

/** Message structure for chat requests */
interface NativeAIMessageRequest {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Request object for chat generation */
interface GenerateChatRequest {
  model: string;
  messages: NativeAIMessageRequest[];
  temperature?: number;
  maxTokens?: number;
}

/** Image input for VLM requests */
interface ImageInput {
  base64?: string;
  url?: string;
}

/** Request object for image generation */
interface GenerateWithImageRequest {
  model: string;
  prompt: string;
  images: ImageInput[];
  temperature?: number;
  maxTokens?: number;
}

/** Request object for embeddings generation */
interface GetEmbeddingsRequest {
  model: string;
  texts: string[];
}

/** Request object for token counting */
interface CountTokensRequest {
  model: string;
  text: string;
  addSpecialTokens?: boolean;
}

/** Request object for text encoding */
interface EncodeTextRequest {
  model: string;
  text: string;
  addSpecialTokens?: boolean;
}

/** Request object for token decoding */
interface DecodeTokensRequest {
  model: string;
  tokens: number[];
}

/** Request object for applying chat template */
interface ApplyChatTemplateRequest {
  model: string;
  messages: NativeAIMessageRequest[];
  tools?: any[];
}

/** Request object for downloading a model */
interface DownloadModelRequest {
  model: string;
  revision?: string;
}

/**
 * Type definition for NativeAIModule following Lynx native module specification.
 *
 * Type Mappings (TypeScript -> Swift -> Objective-C):
 * - string -> NSString
 * - number -> Double (primitives) or NSNumber (in objects)
 * - boolean -> BOOL (primitives) or NSNumber (in objects)
 * - (value: T) => void -> block void (^)(id)
 * - object -> NSDictionary
 * - array -> NSArray
 *
 * All callback functions use the pattern: (value: type) => void
 * which maps to block void (^)(id) on iOS.
 *
 * Request objects are passed as native dictionaries (NSDictionary in Objective-C).
 * Response callbacks still receive JSON strings for backward compatibility.
 */
declare global {
  declare let NativeModules: {
    NativeAIModule: {
      // MARK: - Model Management

      /**
       * Lists all available models that can be loaded.
       * @returns JSON string containing array of model names or model info objects
       */
      listAvailableModels(): string;

      /**
       * Lists all currently loaded models in memory.
       * @returns JSON string containing array of loaded model names
       */
      listLoadedModels(): string;

      /**
       * Checks if a specific model is loaded in memory.
       * @param modelName - Name of the model to check
       * @returns JSON string with boolean result: {"success": true, "data": true/false}
       */
      isModelLoaded(modelName: string): string;

      /**
       * Loads a model into memory asynchronously.
       * @param request - Object with model loading parameters
       * @param callback - Callback invoked with JSON result string when loading completes
       */
      loadModel(request: LoadModelRequest, callback: (result: string) => void): void;

      /**
       * Unloads a model from memory to free up resources.
       * @param modelName - Name of the model to unload
       * @returns JSON string with success/failure result
       */
      unloadModel(modelName: string): string;

      // MARK: - Dynamic Model Configuration

      /**
       * Registers a new model configuration for dynamic loading.
       * @param request - Object with model registration details
       * @returns JSON string with success/failure result
       */
      registerModel(request: RegisterModelRequest): string;

      /**
       * Unregisters a previously registered model configuration.
       * @param modelName - Name of the registered model to remove
       * @returns JSON string with success/failure result
       */
      unregisterModel(modelName: string): string;

      /**
       * Lists all registered model configurations.
       * @returns JSON string containing array of registered model configurations
       */
      listRegisteredModels(): string;

      /**
       * Loads a model using dynamic configuration.
       * @param request - Object with model name and configuration
       * @param callback - Callback invoked with JSON result string when loading completes
       */
      loadModelWithConfig(request: LoadModelWithConfigRequest, callback: (result: string) => void): void;

      // MARK: - Text Generation

      /**
       * Generates text from a chat conversation using streaming.
       * @param request - Object with generation parameters including model, messages, and options
       * @param callback - Callback invoked with JSON result string when generation completes
       */
      generateChat(request: GenerateChatRequest, callback: (result: string) => void): void;

      // MARK: - Vision-Language Model Generation

      /**
       * Generates text from an image and prompt using a VLM model.
       * @param request - Object with VLM parameters including model, prompt, and images
       * @param callback - Callback invoked with JSON result string when generation completes
       */
      generateWithImage(request: GenerateWithImageRequest, callback: (result: string) => void): void;

      // MARK: - Embeddings Generation

      /**
       * Generates embeddings for text strings.
       * @param request - Object with model and texts to embed
       * @param callback - Callback invoked with JSON result containing embedding vectors
       */
      getEmbeddings(request: GetEmbeddingsRequest, callback: (result: string) => void): void;

      // MARK: - Token Utilities

      /**
       * Counts the number of tokens in a text string.
       * @param request - Object with model, text, and tokenization options
       * @param callback - Callback invoked with JSON result containing token count
       */
      countTokens(request: CountTokensRequest, callback: (result: string) => void): void;

      /**
       * Encodes text into token IDs.
       * @param request - Object with model, text, and tokenization options
       * @param callback - Callback invoked with JSON result containing token ID array
       */
      encodeText(request: EncodeTextRequest, callback: (result: string) => void): void;

      /**
       * Decodes token IDs back into text.
       * @param request - Object with model and tokens to decode
       * @param callback - Callback invoked with JSON result containing decoded text
       */
      decodeTokens(request: DecodeTokensRequest, callback: (result: string) => void): void;

      // MARK: - Chat Template

      /**
       * Applies the model's chat template to format messages.
       * @param request - Object with model, messages, and optional tools
       * @param callback - Callback invoked with JSON result containing formatted prompt
       */
      applyChatTemplate(request: ApplyChatTemplateRequest, callback: (result: string) => void): void;

      // MARK: - Model Download Management

      /**
       * Downloads a model from HuggingFace with progress tracking.
       * @param request - Object with model name and optional revision
       * @param callback - Callback invoked with progress updates and completion
       */
      downloadModel(request: DownloadModelRequest, callback: (result: string) => void): void;

      /**
       * Pauses an ongoing model download.
       * @param modelName - Name of the model being downloaded
       * @returns JSON string with success/failure result
       */
      pauseModelDownload(modelName: string): string;

      /**
       * Resumes a paused model download.
       * @param modelName - Name of the model to resume downloading
       * @returns JSON string with success/failure result
       */
      resumeModelDownload(modelName: string): string;

      /**
       * Cancels an ongoing or paused model download.
       * @param modelName - Name of the model download to cancel
       * @returns JSON string with success/failure result
       */
      cancelModelDownload(modelName: string): string;

      // MARK: - Model Cache Management

      /**
       * Deletes the cached files for a model.
       * @param modelName - Name of the model cache to delete
       * @returns JSON string with success/failure result
       */
      deleteModelCache(modelName: string): string;

      /**
       * Gets the size of a model's cached files.
       * @param modelName - Name of the model to check
       * @returns JSON string with size information
       */
      getModelSize(modelName: string): string;

      /**
       * Checks if there's an update available for a model.
       * @param modelName - Name of the model to check for updates
       * @returns JSON string with update availability information
       */
      checkModelUpdate(modelName: string): string;
    };
  };
}


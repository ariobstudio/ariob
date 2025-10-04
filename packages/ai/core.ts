/**
 * Core type definitions, interfaces, and utility functions for the Native AI module.
 *
 * This module provides the foundational types and helpers for interacting with
 * MLX-powered AI models through the Lynx native bridge. It handles message formatting,
 * response parsing, event type guards, and data transformation.
 *
 * @module core
 */

/**
 * Role types for AI chat messages, following standard chat completion conventions.
 */
export type NativeAIRole = 'system' | 'user' | 'assistant';

/**
 * Represents a single message in a chat conversation.
 *
 * @interface NativeAIMessage
 * @property {NativeAIRole} role - The role of the message sender (system, user, or assistant)
 * @property {string} content - The text content of the message
 *
 * @example
 * ```typescript
 * const message: NativeAIMessage = {
 *   role: 'user',
 *   content: 'What is the capital of France?'
 * };
 * ```
 */
export interface NativeAIMessage {
  role: NativeAIRole;
  content: string;
}

/**
 * Configuration options for MLX model instances.
 *
 * @interface NativeAIModelConfiguration
 * @property {string} [id] - Hugging Face model identifier
 * @property {string} [revision] - Git revision/branch of the model
 * @property {string} [cacheDirectory] - Local filesystem path where model files are cached
 * @property {string} [defaultPrompt] - Default system prompt for this model
 */
export interface NativeAIModelConfiguration {
  id?: string;
  revision?: string;
  cacheDirectory?: string;
  defaultPrompt?: string;
}

/**
 * Complete model configuration for dynamic loading.
 *
 * This interface provides all the information needed to load and configure
 * a model at runtime without hardcoding model definitions in the native layer.
 *
 * @interface ModelConfiguration
 * @property {string} id - Model identifier from HuggingFace (e.g., "mlx-community/Llama-3.2-1B-Instruct-4bit")
 * @property {('llm' | 'vlm')} type - Model type (llm for language models, vlm for vision-language models)
 * @property {string[]} [extraEOSTokens] - Extra end-of-sequence tokens specific to this model
 * @property {string} [defaultPrompt] - Default system prompt for this model
 * @property {string} [revision] - Git revision/branch to use (e.g., "main", "v1.0")
 *
 * @example Basic LLM Configuration
 * ```typescript
 * const config: ModelConfiguration = {
 *   id: "mlx-community/Llama-3.2-1B-Instruct-4bit",
 *   type: "llm"
 * };
 * ```
 *
 * @example Full Configuration with Optional Fields
 * ```typescript
 * const config: ModelConfiguration = {
 *   id: "mlx-community/Qwen-3-0.5B-Instruct-4bit",
 *   type: "llm",
 *   extraEOSTokens: ["</s>", "<|endoftext|>"],
 *   defaultPrompt: "You are a helpful AI assistant",
 *   revision: "main"
 * };
 * ```
 *
 * @example Vision-Language Model Configuration
 * ```typescript
 * const config: ModelConfiguration = {
 *   id: "mlx-community/llava-1.5-7b-4bit",
 *   type: "vlm",
 *   defaultPrompt: "You are a vision AI that can describe images"
 * };
 * ```
 */
export interface ModelConfiguration {
  id: string;
  type: 'llm' | 'vlm';
  extraEOSTokens?: string[];
  defaultPrompt?: string;
  revision?: string;
}

/**
 * Model registration request for dynamic model loading.
 *
 * Combines a human-readable display name with a complete model configuration.
 * Once registered, models can be loaded by name without re-specifying configuration.
 *
 * @interface ModelRegistration
 * @property {string} name - Display name for the model (shown in UI, used as identifier)
 * @property {ModelConfiguration} configuration - Full model configuration details
 *
 * @example Register Custom Model
 * ```typescript
 * const registration: ModelRegistration = {
 *   name: "My Llama Model",
 *   configuration: {
 *     id: "mlx-community/Llama-3.2-1B-Instruct-4bit",
 *     type: "llm",
 *     extraEOSTokens: ["</s>"],
 *     defaultPrompt: "You are a helpful AI assistant"
 *   }
 * };
 * ```
 *
 * @example Register Vision Model
 * ```typescript
 * const registration: ModelRegistration = {
 *   name: "LLaVA Vision Assistant",
 *   configuration: {
 *     id: "mlx-community/llava-1.5-7b-4bit",
 *     type: "vlm",
 *     defaultPrompt: "Describe what you see in detail"
 *   }
 * };
 * ```
 *
 * @see {@link registerModel} to register a model
 * @see {@link loadModelWithConfig} to load without registration
 */
export interface ModelRegistration {
  name: string;
  configuration: ModelConfiguration;
}

/**
 * Comprehensive metadata about an available or loaded AI model.
 *
 * @interface NativeAIModelInfo
 * @property {string} name - Unique identifier for the model (e.g., "gemma3:2b")
 * @property {string} [displayName] - Human-readable name for UI display
 * @property {string} [type] - Model type ('llm' for language models, 'vlm' for vision-language models)
 * @property {NativeAIModelConfiguration} [configuration] - Model configuration details
 * @property {string} [status] - Current status ('loaded', 'available', 'loading')
 * @property {number} [loadedAt] - Unix timestamp (seconds) when model was loaded into memory
 * @property {string} [huggingFaceId] - Hugging Face repository identifier
 * @property {string} [revision] - Model revision identifier
 * @property {string} [cacheDirectory] - Local cache directory path
 *
 * @example
 * ```typescript
 * const modelInfo: NativeAIModelInfo = {
 *   name: 'gemma3:2b',
 *   displayName: 'Gemma 3 (2B)',
 *   type: 'llm',
 *   status: 'loaded',
 *   loadedAt: 1704067200,
 *   huggingFaceId: 'google/gemma-2b'
 * };
 * ```
 */
export interface NativeAIModelInfo {
  name: string;
  displayName?: string;
  type?: string;
  configuration?: NativeAIModelConfiguration;
  status?: string;
  loadedAt?: number;
  huggingFaceId?: string;
  revision?: string;
  cacheDirectory?: string;
  [key: string]: unknown;
}

/**
 * Standard response wrapper for all native bridge operations.
 *
 * All native bridge methods return responses wrapped in this structure
 * to provide consistent error handling and metadata.
 *
 * @interface NativeResponse
 * @template T - The type of the response data payload
 * @property {boolean} [success] - Indicates whether the operation succeeded
 * @property {T} [data] - The response payload (only present on success)
 * @property {string} [message] - Error message or additional information
 * @property {number} [timestamp] - Unix timestamp (seconds) when response was generated
 *
 * @example
 * ```typescript
 * const response: NativeResponse<NativeAIModelInfo> = {
 *   success: true,
 *   data: { name: 'gemma3:2b', status: 'loaded' },
 *   timestamp: 1704067200
 * };
 * ```
 */
export interface NativeResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  timestamp?: number;
}

/**
 * Default system prompt used when no custom system message is provided.
 *
 * @constant {string}
 */
export const DEFAULT_SYSTEM_PROMPT = 'You are a helpful assistant.';

/**
 * Event name for AI streaming events broadcast by the native module.
 *
 * @constant {string}
 */
export const NATIVE_AI_STREAM_EVENT = 'native_ai:stream';

/**
 * Event name for model lifecycle events (loading, loaded, error) broadcast by the native module.
 *
 * @constant {string}
 */
export const NATIVE_AI_MODEL_EVENT = 'native_ai:model';

/**
 * Performance statistics for text generation operations.
 *
 * @interface NativeAIStatistics
 * @property {number} [promptTokenCount] - Number of tokens in the input prompt
 * @property {number} [generationTokenCount] - Number of tokens generated in response
 * @property {number} [promptTime] - Time (seconds) to process the prompt
 * @property {number} [generationTime] - Time (seconds) to generate the response
 * @property {number} [promptTokensPerSecond] - Prompt processing speed (tokens/second)
 * @property {number} [tokensPerSecond] - Generation speed (tokens/second)
 *
 * @example
 * ```typescript
 * const stats: NativeAIStatistics = {
 *   promptTokenCount: 45,
 *   generationTokenCount: 128,
 *   promptTime: 0.15,
 *   generationTime: 2.3,
 *   tokensPerSecond: 55.6
 * };
 * ```
 */
export interface NativeAIStatistics {
  promptTokenCount?: number;
  generationTokenCount?: number;
  promptTime?: number;
  generationTime?: number;
  promptTokensPerSecond?: number;
  tokensPerSecond?: number;
}

/**
 * Represents a tool/function call made by the AI model.
 *
 * @interface NativeAIToolCall
 * @property {number} [index] - Sequential index of this tool call
 * @property {string} name - Name of the function/tool being called
 * @property {Record<string, unknown>} arguments - Parsed arguments for the tool call
 *
 * @example
 * ```typescript
 * const toolCall: NativeAIToolCall = {
 *   index: 0,
 *   name: 'get_weather',
 *   arguments: { location: 'Paris', units: 'celsius' }
 * };
 * ```
 */
export interface NativeAIToolCall {
  index?: number;
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * Additional metadata attached to generation responses.
 *
 * @interface NativeAIMetadata
 * @property {NativeAIStatistics} [statistics] - Performance metrics for the generation
 * @property {NativeAIToolCall[]} [toolCalls] - Array of tool calls made during generation
 */
export interface NativeAIMetadata {
  statistics?: NativeAIStatistics;
  toolCalls?: NativeAIToolCall[];
  [key: string]: unknown;
}

/**
 * Union type representing all possible streaming event payloads.
 *
 * Events are emitted during text generation to provide real-time updates
 * on generation progress, chunks of generated text, performance statistics,
 * and completion/error states.
 *
 * @example Started Event
 * ```typescript
 * {
 *   status: 'started',
 *   streamId: 'stream-abc123',
 *   model: 'gemma3:2b',
 *   messages: 3,
 *   temperature: 0.7,
 *   maxTokens: 256
 * }
 * ```
 *
 * @example Chunk Event
 * ```typescript
 * {
 *   status: 'chunk',
 *   streamId: 'stream-abc123',
 *   model: 'gemma3:2b',
 *   delta: 'The capital',
 *   content: 'The capital',
 *   index: 0,
 *   timestamp: 1704067200.5
 * }
 * ```
 *
 * @example Complete Event
 * ```typescript
 * {
 *   status: 'complete',
 *   streamId: 'stream-abc123',
 *   model: 'gemma3:2b',
 *   content: 'The capital of France is Paris.',
 *   duration: 2.3,
 *   metadata: { statistics: { ... } }
 * }
 * ```
 */
export type NativeAIStreamEvent =
  | {
      status: 'started';
      streamId: string;
      model: string;
      messages: number;
      temperature: number;
      maxTokens?: number;
    }
  | {
      status: 'chunk';
      streamId: string;
      model: string;
      delta: string;
      content: string;
      index: number;
      timestamp?: number;
    }
  | {
      status: 'info';
      streamId: string;
      model: string;
      statistics: NativeAIStatistics;
    }
  | {
      status: 'tool_call';
      streamId: string;
      model: string;
      tool: {
        name: string;
        arguments: Record<string, unknown>;
      };
    }
  | {
      status: 'complete';
      streamId: string;
      model: string;
      content: string;
      duration: number;
      metadata?: NativeAIMetadata;
    }
  | {
      status: 'error';
      streamId: string;
      model: string;
      message: string;
    };

/**
 * Union type representing all possible model lifecycle event payloads.
 *
 * These events are emitted during model loading to track download progress,
 * loading state, and errors.
 *
 * @example Loading Started
 * ```typescript
 * { type: 'loading_started', model: 'gemma3:2b' }
 * ```
 *
 * @example Download Progress
 * ```typescript
 * {
 *   type: 'download_progress',
 *   model: 'gemma3:2b',
 *   progress: 0.65,
 *   percentage: 65
 * }
 * ```
 *
 * @example Loaded
 * ```typescript
 * {
 *   type: 'loaded',
 *   model: 'gemma3:2b',
 *   summary: { name: 'gemma3:2b', status: 'loaded' }
 * }
 * ```
 */
export type NativeAIModelEvent =
  | {
      type: 'download_started';
      model: string;
    }
  | {
      type: 'download_progress';
      model: string;
      progress: number;
      percentage: number;
    }
  | {
      type: 'download_complete';
      model: string;
    }
  | {
      type: 'download_error';
      model?: string;
      message: string;
    }
  | {
      type: 'loading_started';
      model: string;
    }
  | {
      type: 'loaded';
      model: string;
      summary: NativeAIModelInfo | Record<string, unknown>;
    }
  | {
      type: 'error';
      model?: string;
      message: string;
    };

/**
 * Options for text generation requests.
 *
 * @interface GenerateChatOptions
 * @property {number} [temperature] - Sampling temperature (0.0-2.0). Higher values increase randomness. Default: 0.7
 * @property {number} [maxTokens] - Maximum number of tokens to generate. Default: 256
 *
 * @example
 * ```typescript
 * const options: GenerateChatOptions = {
 *   temperature: 0.9,
 *   maxTokens: 512
 * };
 * ```
 */
export interface GenerateChatOptions {
  temperature?: number;
  maxTokens?: number;
}

/**
 * Schema definition for tool/function declarations.
 *
 * Defines the structure of a tool that can be invoked by the AI model
 * during generation. Tools follow the OpenAI function calling specification.
 *
 * @interface ToolSchema
 * @property {string} type - The type of tool (typically 'function')
 * @property {Object} function - Function definition
 * @property {string} function.name - Name of the function
 * @property {string} function.description - Human-readable description of what the function does
 * @property {Record<string, any>} function.parameters - JSON Schema defining the function parameters
 *
 * @example
 * ```typescript
 * const weatherTool: ToolSchema = {
 *   type: 'function',
 *   function: {
 *     name: 'get_weather',
 *     description: 'Get current weather for a location',
 *     parameters: {
 *       type: 'object',
 *       properties: {
 *         location: { type: 'string', description: 'City name' },
 *         units: { type: 'string', enum: ['celsius', 'fahrenheit'] }
 *       },
 *       required: ['location']
 *     }
 *   }
 * };
 * ```
 */
export interface ToolSchema {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

/**
 * Parameters for vision-language model (VLM) generation requests.
 *
 * Extends standard chat options to support multimodal inputs including images.
 * Images can be provided either as raw ArrayBuffer data or as URLs.
 *
 * @interface VLMGenerateParams
 * @extends GenerateChatOptions
 * @property {string} prompt - The text prompt for the VLM
 * @property {ArrayBuffer} [imageData] - Raw image data as ArrayBuffer
 * @property {string} [imageURL] - URL to an image resource
 *
 * @example With Image Data
 * ```typescript
 * const params: VLMGenerateParams = {
 *   prompt: 'Describe what you see in this image',
 *   imageData: imageBuffer,
 *   temperature: 0.7,
 *   maxTokens: 256
 * };
 * ```
 *
 * @example With Image URL
 * ```typescript
 * const params: VLMGenerateParams = {
 *   prompt: 'What is in this picture?',
 *   imageURL: 'https://example.com/photo.jpg',
 *   maxTokens: 128
 * };
 * ```
 */
export interface VLMGenerateParams extends GenerateChatOptions {
  prompt: string;
  imageData?: ArrayBuffer;
  imageURL?: string;
}

/**
 * Result from a vision-language model generation request.
 *
 * @interface VLMGenerateResult
 * @property {boolean} success - Indicates whether generation succeeded
 * @property {string} [text] - Generated text response (present on success)
 * @property {string} [error] - Error message (present on failure)
 *
 * @example Success
 * ```typescript
 * const result: VLMGenerateResult = {
 *   success: true,
 *   text: 'The image shows a golden retriever playing in a park.'
 * };
 * ```
 *
 * @example Failure
 * ```typescript
 * const result: VLMGenerateResult = {
 *   success: false,
 *   error: 'Invalid image format'
 * };
 * ```
 */
export interface VLMGenerateResult {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Parameters for text embedding generation.
 *
 * @interface EmbeddingsParams
 * @property {string[]} texts - Array of text strings to encode into embeddings
 *
 * @example
 * ```typescript
 * const params: EmbeddingsParams = {
 *   texts: [
 *     'The quick brown fox',
 *     'Machine learning is fascinating',
 *     'Natural language processing'
 *   ]
 * };
 * ```
 */
export interface EmbeddingsParams {
  texts: string[];
}

/**
 * Result from an embeddings generation request.
 *
 * @interface EmbeddingsResult
 * @property {boolean} success - Indicates whether embedding generation succeeded
 * @property {number[][]} [embeddings] - Array of embedding vectors (present on success)
 * @property {number[]} [shape] - Shape of the embeddings array [num_texts, embedding_dim]
 * @property {string} [error] - Error message (present on failure)
 *
 * @example Success
 * ```typescript
 * const result: EmbeddingsResult = {
 *   success: true,
 *   embeddings: [
 *     [0.123, -0.456, 0.789, ...],
 *     [-0.234, 0.567, -0.890, ...]
 *   ],
 *   shape: [2, 768]
 * };
 * ```
 *
 * @example Failure
 * ```typescript
 * const result: EmbeddingsResult = {
 *   success: false,
 *   error: 'Model not loaded'
 * };
 * ```
 */
export interface EmbeddingsResult {
  success: boolean;
  embeddings?: number[][];
  shape?: number[];
  error?: string;
}

/**
 * Parameters for text tokenization.
 *
 * @interface TokenizeParams
 * @property {string} text - The text to tokenize
 * @property {boolean} [addSpecialTokens] - Whether to add special tokens (BOS, EOS, etc.). Default: true
 *
 * @example
 * ```typescript
 * const params: TokenizeParams = {
 *   text: 'Hello, world!',
 *   addSpecialTokens: true
 * };
 * ```
 */
export interface TokenizeParams {
  text: string;
  addSpecialTokens?: boolean;
}

/**
 * Result from a token counting or encoding operation.
 *
 * @interface TokenCountResult
 * @property {boolean} success - Indicates whether tokenization succeeded
 * @property {number} [count] - Number of tokens (present when counting)
 * @property {number[]} [tokens] - Array of token IDs (present when encoding)
 * @property {string} [error] - Error message (present on failure)
 *
 * @example Token Count
 * ```typescript
 * const result: TokenCountResult = {
 *   success: true,
 *   count: 5
 * };
 * ```
 *
 * @example Token Encoding
 * ```typescript
 * const result: TokenCountResult = {
 *   success: true,
 *   tokens: [15496, 11, 1917, 0],
 *   count: 4
 * };
 * ```
 *
 * @example Failure
 * ```typescript
 * const result: TokenCountResult = {
 *   success: false,
 *   error: 'Tokenizer not initialized'
 * };
 * ```
 */
export interface TokenCountResult {
  success: boolean;
  count?: number;
  tokens?: number[];
  error?: string;
}

/**
 * Parameters for chat template application.
 *
 * Converts a conversation history into a formatted prompt string
 * according to the model's specific template format.
 *
 * @interface ChatTemplateParams
 * @property {NativeAIMessage[]} messages - Array of chat messages to format
 * @property {ToolSchema[]} [tools] - Optional array of tool definitions for function calling
 *
 * @example Basic Chat
 * ```typescript
 * const params: ChatTemplateParams = {
 *   messages: [
 *     { role: 'system', content: 'You are a helpful assistant' },
 *     { role: 'user', content: 'What is AI?' }
 *   ]
 * };
 * ```
 *
 * @example With Tools
 * ```typescript
 * const params: ChatTemplateParams = {
 *   messages: [{ role: 'user', content: 'What is the weather?' }],
 *   tools: [{
 *     type: 'function',
 *     function: {
 *       name: 'get_weather',
 *       description: 'Get weather for a location',
 *       parameters: { type: 'object', properties: { location: { type: 'string' } } }
 *     }
 *   }]
 * };
 * ```
 */
export interface ChatTemplateParams {
  messages: NativeAIMessage[];
  tools?: ToolSchema[];
}

/**
 * Constructs a JSON request payload for the native generateChat method.
 *
 * Serializes the model name, messages array, and generation options into
 * the format expected by the native bridge.
 *
 * @param {string} model - The model identifier to use for generation
 * @param {NativeAIMessage[]} messages - Array of chat messages
 * @param {GenerateChatOptions} [options={}] - Optional generation parameters
 * @returns {string} JSON-serialized request payload
 *
 * @example
 * ```typescript
 * const request = buildChatRequest(
 *   'gemma3:2b',
 *   [
 *     { role: 'user', content: 'Hello!' }
 *   ],
 *   { temperature: 0.8, maxTokens: 128 }
 * );
 * // Returns: '{"model":"gemma3:2b","messages":[{"role":"user","content":"Hello!"}],"temperature":0.8,"maxTokens":128}'
 * ```
 */
export function buildChatRequest(
  model: string,
  messages: NativeAIMessage[],
  options: GenerateChatOptions = {}
): { model: string; messages: NativeAIMessage[]; temperature?: number; maxTokens?: number } {
  const payload: { model: string; messages: NativeAIMessage[]; temperature?: number; maxTokens?: number } = {
    model,
    messages: messages.map(({ role, content }) => ({ role, content })),
  };

  if (options.temperature !== undefined) {
    payload.temperature = options.temperature;
  }
  if (options.maxTokens !== undefined) {
    payload.maxTokens = options.maxTokens;
  }

  return payload;
}

/**
 * Generates a unique message identifier using timestamp and random characters.
 *
 * Creates IDs in the format: `msg-{timestamp}-{random4chars}`
 *
 * @returns {string} A unique message identifier
 *
 * @example
 * ```typescript
 * const id = createMessageId();
 * // Returns: "msg-1704067200000-x9k2"
 * ```
 */
export function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Safely parses JSON responses from the native bridge with error handling.
 *
 * Handles various response formats including raw arrays, wrapped responses,
 * and error cases. Always returns a normalized NativeResponse structure or null.
 *
 * @template T - The expected type of the response data
 * @param {string | null | undefined} raw - Raw JSON string from native bridge
 * @param {string} context - Operation context for logging (e.g., 'loadModel', 'generateChat')
 * @returns {NativeResponse<T> | null} Parsed response object or null on error
 *
 * @example
 * ```typescript
 * const response = parseNativeResult<NativeAIModelInfo>(
 *   '{"success":true,"data":{"name":"gemma3:2b"}}',
 *   'loadModel'
 * );
 * // Returns: { success: true, data: { name: 'gemma3:2b' } }
 * ```
 *
 * @example Array Response
 * ```typescript
 * const response = parseNativeResult<string[]>(
 *   '["model1", "model2"]',
 *   'listModels'
 * );
 * // Returns: { success: true, data: ['model1', 'model2'] }
 * ```
 */
export function parseNativeResult<T>(
  raw: string | null | undefined,
  context: string
): NativeResponse<T> | null {
  if (!raw) {
    console.warn(`[parseNativeResult] ✗ Empty payload for context: ${context}`);
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as NativeResponse<T> | T;
    console.log(`[parseNativeResult] ${context}:`, JSON.stringify(parsed).substring(0, 150));

    if (Array.isArray(parsed)) {
      return {
        success: true,
        data: (parsed as unknown) as T,
      };
    }

    return parsed as NativeResponse<T>;
  } catch (error) {
    console.error(`[parseNativeResult] ✗ Parse failed for ${context}:`, error);
    console.error(`[parseNativeResult] Raw:`, raw.substring(0, 200));
    return null;
  }
}

/**
 * Extracts an array of model info objects from various response formats.
 *
 * Handles responses where models are directly in the data array or nested
 * within a `models` property. Also normalizes string model names to objects.
 *
 * @param {NativeResponse<{ models?: NativeAIModelInfo[] }> | NativeResponse<NativeAIModelInfo[]> | null} response - Native response containing model data
 * @returns {NativeAIModelInfo[]} Array of model information objects
 *
 * @example Direct Array
 * ```typescript
 * const models = extractModels({
 *   success: true,
 *   data: [{ name: 'gemma3:2b' }, { name: 'llama3:1b' }]
 * });
 * // Returns: [{ name: 'gemma3:2b' }, { name: 'llama3:1b' }]
 * ```
 *
 * @example Nested Models
 * ```typescript
 * const models = extractModels({
 *   success: true,
 *   data: { models: [{ name: 'gemma3:2b' }] }
 * });
 * // Returns: [{ name: 'gemma3:2b' }]
 * ```
 */
export function extractModels(
  response: NativeResponse<{ models?: NativeAIModelInfo[] }> | NativeResponse<NativeAIModelInfo[]> | null
): NativeAIModelInfo[] {
  if (!response?.success) {
    return [];
  }

  const data = response.data;
  if (Array.isArray(data)) {
    return data
      .map((item) =>
        typeof item === 'string'
          ? ({ name: item } satisfies NativeAIModelInfo)
          : (item as NativeAIModelInfo)
      )
      .filter((item): item is NativeAIModelInfo => Boolean(item?.name));
  }

  if (data && Array.isArray((data as { models?: NativeAIModelInfo[] }).models)) {
    return ((data as { models?: Array<NativeAIModelInfo | string> }).models ?? [])
      .map((item) =>
        typeof item === 'string'
          ? ({ name: item } satisfies NativeAIModelInfo)
          : (item as NativeAIModelInfo)
      )
      .filter((item): item is NativeAIModelInfo => Boolean(item?.name));
  }

  return [];
}

/**
 * Extracts model name strings from a native response.
 *
 * Convenience wrapper around extractModels that returns only the name property
 * of each model.
 *
 * @param {NativeResponse<{ models?: NativeAIModelInfo[] }> | NativeResponse<NativeAIModelInfo[]> | null} response - Native response containing model data
 * @returns {string[]} Array of model name strings
 *
 * @example
 * ```typescript
 * const names = extractModelNames({
 *   success: true,
 *   data: { models: [{ name: 'gemma3:2b' }, { name: 'llama3:1b' }] }
 * });
 * // Returns: ['gemma3:2b', 'llama3:1b']
 * ```
 */
export function extractModelNames(
  response: NativeResponse<{ models?: NativeAIModelInfo[] }> | NativeResponse<NativeAIModelInfo[]> | null
): string[] {
  return extractModels(response)
    .map((model) => model.name)
    .filter((name): name is string => typeof name === 'string' && name.length > 0);
}

/**
 * Type guard to check if a value is a valid NativeAIStreamEvent.
 *
 * @param {unknown} value - Value to check
 * @returns {value is NativeAIStreamEvent} True if value is a stream event
 *
 * @example
 * ```typescript
 * const event = { status: 'chunk', streamId: 'abc', model: 'gemma3:2b', delta: 'hello' };
 * if (isNativeAIStreamEvent(event)) {
 *   // TypeScript now knows event is NativeAIStreamEvent
 *   console.log(event.streamId);
 * }
 * ```
 */
export function isNativeAIStreamEvent(value: unknown): value is NativeAIStreamEvent {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as { status?: unknown; streamId?: unknown };
  return typeof candidate.status === 'string' && typeof candidate.streamId === 'string';
}

/**
 * Type guard to check if a value is a valid NativeAIModelEvent.
 *
 * @param {unknown} value - Value to check
 * @returns {value is NativeAIModelEvent} True if value is a model event
 *
 * @example
 * ```typescript
 * const event = { type: 'loaded', model: 'gemma3:2b' };
 * if (isNativeAIModelEvent(event)) {
 *   // TypeScript now knows event is NativeAIModelEvent
 *   console.log(event.type);
 * }
 * ```
 */
export function isNativeAIModelEvent(value: unknown): value is NativeAIModelEvent {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as { type?: unknown };
  return typeof candidate.type === 'string';
}

/**
 * Coerces event payloads from Lynx global events to NativeAIModelEvent format.
 *
 * Handles both single event objects and arrays containing an event at index 0,
 * which is how Lynx sometimes delivers event payloads.
 *
 * @param {unknown} input - Raw event payload from Lynx
 * @returns {NativeAIModelEvent | null} Coerced event or null if invalid
 *
 * @example
 * ```typescript
 * // Handles direct object
 * const event1 = coerceModelEventPayload({ type: 'loaded', model: 'gemma3:2b' });
 *
 * // Handles array wrapper
 * const event2 = coerceModelEventPayload([{ type: 'loaded', model: 'gemma3:2b' }]);
 *
 * // Both return the same NativeAIModelEvent
 * ```
 */
export function coerceModelEventPayload(input: unknown): NativeAIModelEvent | null {
  if (Array.isArray(input)) {
    return isNativeAIModelEvent(input[0]) ? input[0] : null;
  }
  return isNativeAIModelEvent(input) ? (input as NativeAIModelEvent) : null;
}

/**
 * Coerces event payloads from Lynx global events to NativeAIStreamEvent format.
 *
 * Handles both single event objects and arrays containing an event at index 0,
 * which is how Lynx sometimes delivers event payloads.
 *
 * @param {unknown} input - Raw event payload from Lynx
 * @returns {NativeAIStreamEvent | null} Coerced event or null if invalid
 *
 * @example
 * ```typescript
 * // Handles direct object
 * const event1 = coerceStreamEventPayload({
 *   status: 'chunk',
 *   streamId: 'abc',
 *   model: 'gemma3:2b',
 *   delta: 'hello'
 * });
 *
 * // Handles array wrapper
 * const event2 = coerceStreamEventPayload([{
 *   status: 'chunk',
 *   streamId: 'abc',
 *   model: 'gemma3:2b',
 *   delta: 'hello'
 * }]);
 * ```
 */
export function coerceStreamEventPayload(input: unknown): NativeAIStreamEvent | null {
  if (Array.isArray(input)) {
    return isNativeAIStreamEvent(input[0]) ? input[0] : null;
  }
  return isNativeAIStreamEvent(input) ? (input as NativeAIStreamEvent) : null;
}

/**
 * Builder class for constructing model configurations with validation.
 *
 * Provides a fluent API for building ModelConfiguration objects with
 * compile-time type safety and runtime validation. The builder pattern
 * ensures configurations are valid before use.
 *
 * @class ModelConfigurationBuilder
 *
 * @example Basic Usage
 * ```typescript
 * const config = new ModelConfigurationBuilder()
 *   .setId("mlx-community/Llama-3.2-1B-Instruct-4bit")
 *   .setType("llm")
 *   .build();
 * ```
 *
 * @example Full Configuration
 * ```typescript
 * const config = new ModelConfigurationBuilder()
 *   .setId("mlx-community/Qwen-3-0.5B-Instruct-4bit")
 *   .setType("llm")
 *   .setExtraEOSTokens(["</s>", "<|endoftext|>"])
 *   .setDefaultPrompt("You are a helpful AI assistant")
 *   .setRevision("main")
 *   .build();
 * ```
 *
 * @example Vision Model
 * ```typescript
 * const vlmConfig = new ModelConfigurationBuilder()
 *   .setId("mlx-community/llava-1.5-7b-4bit")
 *   .setType("vlm")
 *   .setDefaultPrompt("Describe images in detail")
 *   .build();
 * ```
 *
 * @example Chaining Multiple Calls
 * ```typescript
 * const builder = new ModelConfigurationBuilder();
 * builder
 *   .setId("mlx-community/model-4bit")
 *   .setType("llm");
 *
 * // Add conditional configuration
 * if (needsCustomTokens) {
 *   builder.setExtraEOSTokens(["<|end|>"]);
 * }
 *
 * const config = builder.build();
 * ```
 */
export class ModelConfigurationBuilder {
  private config: Partial<ModelConfiguration> = {};

  /**
   * Sets the HuggingFace model identifier.
   *
   * @param {string} id - Model ID in the format "org/model-name"
   * @returns {this} The builder instance for chaining
   * @throws {Error} If id is empty or invalid
   *
   * @example
   * ```typescript
   * builder.setId("mlx-community/Llama-3.2-1B-Instruct-4bit");
   * ```
   */
  setId(id: string): this {
    if (!id || id.trim().length === 0) {
      throw new Error('Model ID cannot be empty');
    }
    this.config.id = id.trim();
    return this;
  }

  /**
   * Sets the model type.
   *
   * @param {('llm' | 'vlm')} type - Model type (llm or vlm)
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * builder.setType("llm"); // For language models
   * builder.setType("vlm"); // For vision-language models
   * ```
   */
  setType(type: 'llm' | 'vlm'): this {
    this.config.type = type;
    return this;
  }

  /**
   * Sets extra end-of-sequence tokens for this model.
   *
   * @param {string[]} tokens - Array of EOS token strings
   * @returns {this} The builder instance for chaining
   * @throws {Error} If tokens array is empty
   *
   * @example
   * ```typescript
   * builder.setExtraEOSTokens(["</s>", "<|endoftext|>"]);
   * ```
   */
  setExtraEOSTokens(tokens: string[]): this {
    if (!tokens || tokens.length === 0) {
      throw new Error('EOS tokens array cannot be empty');
    }
    this.config.extraEOSTokens = [...tokens];
    return this;
  }

  /**
   * Sets the default system prompt for this model.
   *
   * @param {string} prompt - Default system prompt text
   * @returns {this} The builder instance for chaining
   * @throws {Error} If prompt is empty
   *
   * @example
   * ```typescript
   * builder.setDefaultPrompt("You are a helpful AI assistant");
   * ```
   */
  setDefaultPrompt(prompt: string): this {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Default prompt cannot be empty');
    }
    this.config.defaultPrompt = prompt.trim();
    return this;
  }

  /**
   * Sets the Git revision/branch for the model.
   *
   * @param {string} revision - Git revision or branch name
   * @returns {this} The builder instance for chaining
   * @throws {Error} If revision is empty
   *
   * @example
   * ```typescript
   * builder.setRevision("main");
   * builder.setRevision("v1.0");
   * ```
   */
  setRevision(revision: string): this {
    if (!revision || revision.trim().length === 0) {
      throw new Error('Revision cannot be empty');
    }
    this.config.revision = revision.trim();
    return this;
  }

  /**
   * Builds and validates the final ModelConfiguration.
   *
   * @returns {ModelConfiguration} The validated model configuration
   * @throws {Error} If required fields (id, type) are missing
   *
   * @example
   * ```typescript
   * const config = builder
   *   .setId("mlx-community/model")
   *   .setType("llm")
   *   .build();
   * ```
   */
  build(): ModelConfiguration {
    if (!this.config.id) {
      throw new Error('Model ID is required');
    }
    if (!this.config.type) {
      throw new Error('Model type is required');
    }

    const result: ModelConfiguration = {
      id: this.config.id,
      type: this.config.type,
    };

    // Only add optional properties if they are defined
    if (this.config.extraEOSTokens !== undefined) {
      result.extraEOSTokens = this.config.extraEOSTokens;
    }
    if (this.config.defaultPrompt !== undefined) {
      result.defaultPrompt = this.config.defaultPrompt;
    }
    if (this.config.revision !== undefined) {
      result.revision = this.config.revision;
    }

    return result;
  }

  /**
   * Resets the builder to initial state.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * builder
   *   .setId("model1")
   *   .setType("llm")
   *   .build();
   *
   * // Reuse builder for another config
   * builder
   *   .reset()
   *   .setId("model2")
   *   .setType("vlm")
   *   .build();
   * ```
   */
  reset(): this {
    this.config = {};
    return this;
  }
}

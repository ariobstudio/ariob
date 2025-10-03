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
 *
 * @typedef {('system' | 'user' | 'assistant')} NativeAIRole
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
 * @typedef {Object} NativeAIStreamEvent
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
 * @typedef {Object} NativeAIModelEvent
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
      type: 'loading_started';
      model: string;
    }
  | {
      type: 'download_progress';
      model: string;
      progress: number;
      percentage: number;
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
): string {
  const payload: Record<string, unknown> = {
    model,
    messages: messages.map(({ role, content }) => ({ role, content })),
  };

  if (options.temperature !== undefined) {
    payload.temperature = options.temperature;
  }
  if (options.maxTokens !== undefined) {
    payload.maxTokens = options.maxTokens;
  }

  return JSON.stringify(payload);
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
    console.warn(`[NativeAI] parseNativeResult(${context}) -> empty payload`);
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as NativeResponse<T> | T;
    console.debug(`[NativeAI] parseNativeResult(${context}) ->`, parsed);

    if (Array.isArray(parsed)) {
      return {
        success: true,
        data: (parsed as unknown) as T,
      };
    }

    return parsed as NativeResponse<T>;
  } catch (error) {
    console.error(`[NativeAI] Failed to parse native result (${context})`, error, raw);
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

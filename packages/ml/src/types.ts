/**
 * Type definitions for @ariob/ml
 */

/**
 * Message role in a conversation
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * A single message in a conversation
 */
export interface Message {
  role: MessageRole;
  content: string;
}

/**
 * Configuration options for LLM generation
 */
export interface LLMConfig {
  /** System prompt to set the AI personality */
  systemPrompt?: string;
  /** Maximum tokens to generate (default: 256) */
  maxTokens?: number;
  /** Temperature for randomness (0-2, default: 0.7) */
  temperature?: number;
}

/**
 * Model source configuration
 */
export interface ModelSource {
  /** Path to the .pte model file */
  modelSource: string;
  /** Path to the tokenizer.json file */
  tokenizerSource: string;
  /** Path to the tokenizer_config.json file */
  tokenizerConfigSource?: string;
}

/**
 * Return type for the useLLM hook
 */
export interface UseLLMResult {
  /** The generated response (updates per token during streaming) */
  response: string;
  /** Whether the model is loaded and ready */
  isReady: boolean;
  /** Whether the model is currently generating a response */
  isGenerating: boolean;
  /** Model download progress (0-1) */
  downloadProgress: number;
  /** Error message if something went wrong */
  error: string | null;
  /** Generate a response from messages */
  generate: (messages: Message[]) => Promise<void>;
  /** Send a user message in managed mode */
  sendMessage: (message: string) => Promise<void>;
  /** Stop generation */
  interrupt: () => void;
  /** Conversation history in managed mode */
  messageHistory: Message[];
  /** Configure generation settings */
  configure: (config: LLMConfig) => void;
}

/**
 * Options for the useRippleAI hook
 */
export interface UseRippleAIOptions {
  /** Override the default model */
  model?: ModelSource;
  /** Override the system prompt */
  systemPrompt?: string;
}

/**
 * Return type for the useRippleAI hook
 */
export interface UseRippleAIResult {
  /** The AI's response (streams during generation) */
  response: string;
  /** Whether the model is loaded and ready */
  isReady: boolean;
  /** Whether the model is currently generating */
  isGenerating: boolean;
  /** Model download progress (0-1) */
  downloadProgress: number;
  /** Whether the model is currently downloading */
  isDownloading: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Send a message to Ripple AI */
  sendMessage: (message: string) => Promise<void>;
  /** Stop the current generation */
  interrupt: () => void;
  /** Full conversation history */
  messageHistory: Message[];
}

/**
 * Type definitions for @ariob/ml
 */

/**
 * Message role in a conversation
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * A single message in a conversation
 * Compatible with react-native-executorch Message type
 */
export interface Message {
  role: MessageRole;
  content: string;
}

/**
 * Model source configuration for ExecuTorch
 */
export interface ModelSource {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** RAM requirement string for display */
  ramRequired: string;
  /** URL to the .pte model file */
  modelSource: string;
  /** URL to the tokenizer.json file */
  tokenizerSource: string;
  /** URL to the tokenizer_config.json file (optional for some models) */
  tokenizerConfigSource?: string;
}

/**
 * Options for the useRippleAI hook
 */
export interface UseRippleAIOptions {
  /** Override the default model */
  model?: ModelSource;
  /** Override the system prompt */
  systemPrompt?: string;
  /** Prevent automatic model loading */
  preventLoad?: boolean;
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
  /** Error message if something went wrong */
  error: string | null;
  /** Send a message to Ripple AI */
  sendMessage: (message: string) => Promise<void>;
  /** Stop the current generation */
  interrupt: () => void;
  /** Full conversation history */
  messageHistory: Message[];
}

/**
 * AI Profile settings stored in the settings store
 */
export interface AIProfile {
  /** Display name for the AI */
  name: string;
  /** Selected model ID */
  modelId: string;
  /** Custom system prompt (null = use default) */
  systemPrompt: string | null;
}

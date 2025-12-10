/**
 * AI Store - Model selection and state management
 *
 * Manages on-device AI model configuration with persistence.
 * Uses local storage to remember model selection across sessions.
 *
 * @example
 * ```tsx
 * import { useAIStore } from '@ariob/store/stores';
 *
 * function AIModelSelector() {
 *   const { modelId, setModel, isModelReady, downloadProgress } = useAIStore();
 *
 *   return (
 *     <View>
 *       <Text>Model: {modelId}</Text>
 *       {!isModelReady && <Progress value={downloadProgress} />}
 *       <Button onPress={() => setModel('smollm-360m')}>
 *         Switch Model
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */

import { persisted } from '../create';

/**
 * Available AI models with their specifications
 */
export const AI_MODELS = {
  'smollm-135m': {
    name: 'SmolLM 135M',
    size: '~150MB',
    description: 'Fastest, minimal memory usage',
  },
  'smollm-360m': {
    name: 'SmolLM 360M',
    size: '~400MB',
    description: 'Balanced speed and capability',
  },
  'smollm-1.7b': {
    name: 'SmolLM 1.7B',
    size: '~1.8GB',
    description: 'Most capable, requires more memory',
  },
} as const;

export type AIModelId = keyof typeof AI_MODELS;

/**
 * AI store state and actions
 */
export interface AIState {
  /** Currently selected model ID */
  modelId: AIModelId;
  /** Whether user has explicitly selected a model */
  hasSelectedModel: boolean;
  /** Download progress (0-1) */
  downloadProgress: number;
  /** Whether model is currently downloading */
  isDownloading: boolean;
  /** Whether model is ready for inference */
  isModelReady: boolean;
  /** Custom system prompt (optional) */
  customSystemPrompt?: string;

  // Actions
  /** Select a model (triggers download if needed) */
  setModel: (id: AIModelId) => void;
  /** Update download progress */
  setProgress: (progress: number) => void;
  /** Mark model as ready/not ready */
  setReady: (ready: boolean) => void;
  /** Set custom system prompt */
  setSystemPrompt: (prompt: string | undefined) => void;
  /** Reset to defaults */
  reset: () => void;
}

const initialState = {
  modelId: 'smollm-135m' as AIModelId,
  hasSelectedModel: false,
  downloadProgress: 0,
  isDownloading: false,
  isModelReady: false,
  customSystemPrompt: undefined,
};

/**
 * AI store hook with persistence
 */
export const useAIStore = persisted<AIState>('@ariob/ai', (set) => ({
  ...initialState,

  setModel: (modelId) =>
    set({
      modelId,
      hasSelectedModel: true,
      isDownloading: true,
      downloadProgress: 0,
      isModelReady: false,
    }),

  setProgress: (progress) =>
    set({
      downloadProgress: progress,
      isDownloading: progress < 1,
      isModelReady: progress >= 1,
    }),

  setReady: (ready) =>
    set({
      isModelReady: ready,
      isDownloading: false,
    }),

  setSystemPrompt: (customSystemPrompt) => set({ customSystemPrompt }),

  reset: () => set(initialState),
}));

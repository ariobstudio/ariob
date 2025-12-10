/**
 * @ariob/ml - On-device AI for Ariob
 *
 * Provides React Native hooks for running LLM inference on-device
 * using ExecuTorch (Meta's mobile inference framework).
 *
 * @example
 * ```tsx
 * import { useRippleAI, useAISettings } from '@ariob/ml';
 *
 * function RippleChat() {
 *   const { response, isReady, sendMessage, isGenerating } = useRippleAI();
 *   const { profile, setModel, modelOptions } = useAISettings();
 *
 *   return (
 *     <View>
 *       {!isReady && <Text>Loading {profile.name}...</Text>}
 *       {isGenerating && <Text>Thinking...</Text>}
 *       <Text>{response}</Text>
 *       <Button onPress={() => sendMessage('Hello!')} title="Send" />
 *     </View>
 *   );
 * }
 * ```
 */

// Types
export type {
  Message,
  MessageRole,
  LLMConfig,
  ModelSource,
  UseLLMResult,
  UseRippleAIOptions,
  UseRippleAIResult,
} from './types';

// Model configurations
export {
  LLAMA3_2_1B,
  SMOLLM_135M,
  QWEN_0_5B,
  DEFAULT_RIPPLE_MODEL,
} from './models/config';

// AI Settings Store
export {
  useAISettings,
  aiSettingsStore,
  MODEL_OPTIONS,
} from './store';
export type { RippleAIProfile, ModelOptionId } from './store';

// Hooks
export { useRippleAI } from './hooks/useRippleAI';
export type { UseRippleAIResultWithProfile } from './hooks/useRippleAI';

// Re-export useLLM from executorch if available (for advanced usage)
export function getExecutorchModule() {
  try {
    return require('react-native-executorch');
  } catch {
    return null;
  }
}

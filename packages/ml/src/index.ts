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
  ModelSource,
  UseRippleAIOptions,
  UseRippleAIResult,
  AIProfile,
} from './types';

// Model configurations
export {
  SMOLLM_135M,
  SMOLLM_360M,
  SMOLLM_1_7B,
  DEFAULT_MODEL,
  MODELS,
  MODEL_OPTIONS,
} from './models/config';

// AI Settings Store
export { useAISettings, aiSettingsStore } from './store';

// Hooks
export { useRippleAI, isExecuTorchAvailable } from './hooks/useRippleAI';

// Re-export useLLM from executorch if available (for advanced usage)
export function getExecutorchModule() {
  try {
    return require('react-native-executorch');
  } catch {
    return null;
  }
}

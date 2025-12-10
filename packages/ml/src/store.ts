/**
 * AI Settings Store
 *
 * Manages Ripple AI configuration including model selection,
 * system prompt customization, and generation parameters.
 */

import { useCallback, useSyncExternalStore } from 'react';
import { SMOLLM_135M, LLAMA3_2_1B, QWEN_0_5B, DEFAULT_RIPPLE_MODEL } from './models/config';
import type { ModelSource, LLMConfig } from './types';

/**
 * Available model options for user selection
 */
export const MODEL_OPTIONS = [
  {
    id: 'smollm-135m',
    name: 'SmolLM 135M',
    description: 'Ultra-fast, works on all devices',
    size: '~135MB',
    ramRequired: '~500MB',
    model: SMOLLM_135M,
  },
  {
    id: 'qwen-0.5b',
    name: 'Qwen 0.5B',
    description: 'Balanced quality and speed',
    size: '~500MB',
    ramRequired: '~1.5GB',
    model: QWEN_0_5B,
  },
  {
    id: 'llama-3.2-1b',
    name: 'LLaMA 3.2 1B',
    description: 'Highest quality responses',
    size: '~1GB',
    ramRequired: '~3.2GB',
    model: LLAMA3_2_1B,
  },
] as const;

export type ModelOptionId = typeof MODEL_OPTIONS[number]['id'];

/**
 * Ripple AI profile/settings
 */
export interface RippleAIProfile {
  /** Display name for the AI */
  name: string;
  /** Avatar identifier */
  avatar: string;
  /** Selected model ID */
  modelId: ModelOptionId;
  /** Whether user has explicitly selected a model (for first-run flow) */
  hasSelectedModel: boolean;
  /** Download progress (0-1) */
  downloadProgress: number;
  /** Whether download is in progress */
  isDownloading: boolean;
  /** Whether model is ready for use */
  isModelReady: boolean;
  /** Custom system prompt (optional) */
  customSystemPrompt?: string;
  /** Generation config overrides */
  config?: Partial<LLMConfig>;
}

/**
 * Default Ripple AI profile
 */
const DEFAULT_PROFILE: RippleAIProfile = {
  name: 'Ripple',
  avatar: 'sparkles',
  modelId: 'smollm-135m',
  hasSelectedModel: false,
  downloadProgress: 0,
  isDownloading: false,
  isModelReady: false,
};

// Simple in-memory store with subscription support
let currentProfile: RippleAIProfile = { ...DEFAULT_PROFILE };
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

/**
 * AI Settings Store API
 */
export const aiSettingsStore = {
  /** Get current profile */
  getProfile: (): RippleAIProfile => currentProfile,

  /** Get the model source for current selection */
  getModel: (): ModelSource => {
    const option = MODEL_OPTIONS.find((o) => o.id === currentProfile.modelId);
    return option?.model ?? DEFAULT_RIPPLE_MODEL;
  },

  /** Update profile settings */
  updateProfile: (updates: Partial<RippleAIProfile>) => {
    currentProfile = { ...currentProfile, ...updates };
    emitChange();
    // Persist to storage
    aiSettingsStore.persist();
  },

  /** Set model by ID - starts simulated download */
  setModel: (modelId: ModelOptionId) => {
    if (MODEL_OPTIONS.some((o) => o.id === modelId)) {
      // Start download simulation
      currentProfile = {
        ...currentProfile,
        modelId,
        hasSelectedModel: true,
        isDownloading: true,
        downloadProgress: 0,
        isModelReady: false,
      };
      emitChange();
      aiSettingsStore.persist();

      // Simulate download progress
      aiSettingsStore.simulateDownload();
    }
  },

  /** Simulate download progress (fallback mode) */
  simulateDownload: () => {
    const totalDuration = 2500; // 2.5 seconds total
    const steps = 20;
    const stepDuration = totalDuration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);

      // Add some variance to make it feel more natural
      const variance = Math.random() * 0.02;
      const adjustedProgress = Math.min(progress + variance, 1);

      currentProfile = {
        ...currentProfile,
        downloadProgress: adjustedProgress,
      };
      emitChange();

      if (currentStep >= steps) {
        clearInterval(interval);
        // Mark as complete
        currentProfile = {
          ...currentProfile,
          downloadProgress: 1,
          isDownloading: false,
          isModelReady: true,
        };
        emitChange();
        aiSettingsStore.persist();
      }
    }, stepDuration);
  },

  /** Subscribe to changes */
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Persist to AsyncStorage (called automatically) */
  persist: async () => {
    try {
      // Dynamic import to avoid issues when AsyncStorage isn't available
      const AsyncStorage = await import('@react-native-async-storage/async-storage')
        .then((m) => m.default)
        .catch(() => null);

      if (AsyncStorage) {
        await AsyncStorage.setItem('@ariob/ai-settings', JSON.stringify(currentProfile));
      }
    } catch (e) {
      console.warn('[aiSettingsStore] Failed to persist:', e);
    }
  },

  /** Load from AsyncStorage */
  hydrate: async () => {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage')
        .then((m) => m.default)
        .catch(() => null);

      if (AsyncStorage) {
        const stored = await AsyncStorage.getItem('@ariob/ai-settings');
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<RippleAIProfile>;
          currentProfile = { ...DEFAULT_PROFILE, ...parsed };
          emitChange();
        }
      }
    } catch (e) {
      console.warn('[aiSettingsStore] Failed to hydrate:', e);
    }
  },

  /** Reset to defaults */
  reset: () => {
    currentProfile = { ...DEFAULT_PROFILE };
    emitChange();
    aiSettingsStore.persist();
  },
};

/**
 * Hook to access and update AI settings
 *
 * @example
 * ```tsx
 * function AISettings() {
 *   const { profile, setModel, updateProfile } = useAISettings();
 *
 *   return (
 *     <View>
 *       <Text>Current model: {profile.modelId}</Text>
 *       <Button onPress={() => setModel('llama-3.2-1b')} title="Use LLaMA" />
 *     </View>
 *   );
 * }
 * ```
 */
export function useAISettings() {
  const profile = useSyncExternalStore(
    aiSettingsStore.subscribe,
    aiSettingsStore.getProfile,
    aiSettingsStore.getProfile
  );

  const model = useSyncExternalStore(
    aiSettingsStore.subscribe,
    aiSettingsStore.getModel,
    aiSettingsStore.getModel
  );

  const setModel = useCallback((modelId: ModelOptionId) => {
    aiSettingsStore.setModel(modelId);
  }, []);

  const updateProfile = useCallback((updates: Partial<RippleAIProfile>) => {
    aiSettingsStore.updateProfile(updates);
  }, []);

  const reset = useCallback(() => {
    aiSettingsStore.reset();
  }, []);

  return {
    profile,
    model,
    modelOptions: MODEL_OPTIONS,
    setModel,
    updateProfile,
    reset,
  };
}

/**
 * AI Settings Store
 *
 * Manages Ripple AI configuration including model selection
 * and system prompt customization.
 */

import { useCallback, useSyncExternalStore } from 'react';
import { MODELS, DEFAULT_MODEL, MODEL_OPTIONS } from './models/config';
import type { ModelSource, AIProfile } from './types';

/**
 * Default Ripple AI profile
 */
const DEFAULT_PROFILE: AIProfile = {
  name: 'Ripple',
  modelId: DEFAULT_MODEL.id,
  systemPrompt: null,
};

// Simple in-memory store with subscription support
let currentProfile: AIProfile = { ...DEFAULT_PROFILE };
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

/**
 * AI Settings Store API
 */
export const aiSettingsStore = {
  /** Get current profile */
  getProfile: (): AIProfile => currentProfile,

  /** Get the model source for current selection */
  getModel: (): ModelSource => {
    return MODELS[currentProfile.modelId] ?? DEFAULT_MODEL;
  },

  /** Update profile settings */
  updateProfile: (updates: Partial<AIProfile>) => {
    currentProfile = { ...currentProfile, ...updates };
    emitChange();
    aiSettingsStore.persist();
  },

  /** Set model by ID */
  setModel: (modelId: string) => {
    if (MODELS[modelId]) {
      currentProfile = { ...currentProfile, modelId };
      emitChange();
      aiSettingsStore.persist();
    }
  },

  /** Subscribe to changes */
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Persist to AsyncStorage */
  persist: async () => {
    try {
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
          const parsed = JSON.parse(stored) as Partial<AIProfile>;
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

  const setModel = useCallback((modelId: string) => {
    aiSettingsStore.setModel(modelId);
  }, []);

  const updateProfile = useCallback((updates: Partial<AIProfile>) => {
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

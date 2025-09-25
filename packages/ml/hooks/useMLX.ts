/**
 * useMLX Hook - Main hook for MLX operations in Lynx
 */

import { useEffect, useCallback } from 'react';
import { createMLStore } from '../stores';
import type { MLError, MLModelType, MemoryPressureLevel } from '../types';

export interface UseMLXOptions {
  autoInitialize?: boolean;
  onError?: (error: MLError) => void;
  onInitialized?: () => void;
}

export interface UseMLXResult {
  // State
  isInitialized: boolean;
  isInitializing: boolean;
  error: MLError | null;
  memoryPressure: MemoryPressureLevel;
  supportedModelTypes: MLModelType[];

  // Actions
  initialize: () => Promise<void>;
  clearError: () => void;
  refreshMemoryInfo: () => Promise<void>;
  clearMemory: () => Promise<void>;
  setMemoryLimit: (bytes: number) => Promise<void>;
}

// Create store instance (singleton pattern for Lynx)
const mlStore = createMLStore();

export function useMLX(options: UseMLXOptions = {}): UseMLXResult {
  const {
    autoInitialize = true,
    onError,
    onInitialized
  } = options;

  // Subscribe to store state
  const state = mlStore((state) => ({
    isInitialized: state.isInitialized,
    isInitializing: state.isInitializing,
    error: state.lastError,
    memoryPressure: state.memoryPressure,
    supportedModelTypes: ['llm', 'vlm', 'stableDiffusion', 'embedding'] as MLModelType[]
  }));

  const actions = mlStore((state) => ({
    initialize: state.initialize,
    clearError: state.clearError,
    refreshMemoryInfo: state.refreshMemoryInfo,
    clearMemory: state.clearMemory,
    setMemoryLimit: state.setMemoryLimit
  }));

  // Handle initialization
  useEffect(() => {
    if (autoInitialize && !state.isInitialized && !state.isInitializing) {
      actions.initialize().then(() => {
        if (onInitialized) {
          onInitialized();
        }
      }).catch((error) => {
        if (onError) {
          onError(error);
        }
      });
    }
  }, [autoInitialize, state.isInitialized, state.isInitializing, actions.initialize, onInitialized, onError]);

  // Handle errors
  useEffect(() => {
    if (state.error && onError) {
      onError(state.error);
    }
  }, [state.error, onError]);

  const initialize = useCallback(async () => {
    try {
      await actions.initialize();
      if (onInitialized) {
        onInitialized();
      }
    } catch (error) {
      if (onError) {
        onError(error as MLError);
      }
      throw error;
    }
  }, [actions.initialize, onInitialized, onError]);

  return {
    ...state,
    ...actions,
    initialize
  };
}
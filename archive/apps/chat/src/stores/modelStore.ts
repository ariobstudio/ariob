/**
 * Zustand store for centralized model state management.
 *
 * This store manages:
 * - Selected model state (persists across renders)
 * - Download progress tracking per model
 * - Loaded models state
 * - Prevents duplicate load/download operations
 *
 * @module modelStore
 */

import { create } from 'zustand';
import type { NativeAIModelInfo } from '@ariob/ai';

/**
 * Download state for a specific model
 */
export interface ModelDownloadState {
  /** Model identifier */
  modelName: string;
  /** Download progress percentage (0-100) */
  percentage: number;
  /** Current download status */
  status: 'downloading' | 'paused' | 'complete' | 'error';
  /** Error message if status is 'error' */
  errorMessage?: string;
}

/**
 * Model loading state tracker
 */
interface ModelLoadingState {
  /** Model name being loaded */
  modelName: string;
  /** Whether download is in progress */
  isDownloading: boolean;
  /** Whether load into memory is in progress */
  isLoading: boolean;
  /** Timestamp when loading started */
  startedAt: number;
}

/**
 * Default system prompt used when no custom prompt is provided
 */
export const DEFAULT_SYSTEM_PROMPT = `You are a conversational AI focused on engaging in authentic dialogue. Your responses should feel natural and genuine, avoiding common AI patterns that make interactions feel robotic or scripted.`;

/**
 * Complete model store state
 */
interface ModelStoreState {
  /** Currently selected model name */
  selectedModel: string | null;

  /** All available models from native */
  availableModels: NativeAIModelInfo[];

  /** Models currently loaded in memory */
  loadedModels: Set<string>;

  /** Download progress by model name */
  downloadProgress: Map<string, ModelDownloadState>;

  /** Active loading operations to prevent duplicates */
  loadingOperations: Map<string, ModelLoadingState>;

  /** Global loading state for UI */
  isLoading: boolean;

  /** Error message for UI display */
  error: string | null;

  /** System message for AI conversations */
  systemMessage: string;

  // Actions

  /**
   * Sets the selected model
   */
  selectModel: (modelName: string) => void;

  /**
   * Sets available models from native
   */
  setAvailableModels: (models: NativeAIModelInfo[]) => void;

  /**
   * Sets loaded models from native
   */
  setLoadedModels: (modelNames: string[]) => void;

  /**
   * Marks a model as loaded in memory
   */
  markModelLoaded: (modelName: string) => void;

  /**
   * Marks a model as unloaded from memory
   */
  markModelUnloaded: (modelName: string) => void;

  /**
   * Updates download progress for a model
   */
  setDownloadProgress: (modelName: string, progress: Omit<ModelDownloadState, 'modelName'>) => void;

  /**
   * Clears download progress for a model
   */
  clearDownloadProgress: (modelName: string) => void;

  /**
   * Starts tracking a loading operation (returns true if started, false if already loading)
   */
  startLoadingOperation: (modelName: string, isDownloading: boolean) => boolean;

  /**
   * Completes a loading operation
   */
  completeLoadingOperation: (modelName: string) => void;

  /**
   * Checks if a model is currently being loaded
   */
  isModelLoading: (modelName: string) => boolean;

  /**
   * Sets global loading state
   */
  setIsLoading: (isLoading: boolean) => void;

  /**
   * Sets error message
   */
  setError: (error: string | null) => void;

  /**
   * Clears error message
   */
  clearError: () => void;

  /**
   * Sets system message for AI conversations
   */
  setSystemMessage: (message: string) => void;

  /**
   * Resets store to initial state
   */
  reset: () => void;
}

const initialState = {
  selectedModel: null,
  availableModels: [],
  loadedModels: new Set<string>(),
  downloadProgress: new Map<string, ModelDownloadState>(),
  loadingOperations: new Map<string, ModelLoadingState>(),
  isLoading: false,
  error: null,
  systemMessage: DEFAULT_SYSTEM_PROMPT,
};

/**
 * Zustand store for model state management
 */
export const useModelStore = create<ModelStoreState>((set, get) => ({
  ...initialState,

  selectModel: (modelName: string) => {
    set({ selectedModel: modelName, error: null });
  },

  setAvailableModels: (models: NativeAIModelInfo[]) => {
    set({ availableModels: models });
  },

  setLoadedModels: (modelNames: string[]) => {
    set({ loadedModels: new Set(modelNames) });
  },

  markModelLoaded: (modelName: string) => {
    set((state) => {
      const newLoadedModels = new Set(state.loadedModels);
      newLoadedModels.add(modelName);
      return { loadedModels: newLoadedModels };
    });
  },

  markModelUnloaded: (modelName: string) => {
    set((state) => {
      const newLoadedModels = new Set(state.loadedModels);
      newLoadedModels.delete(modelName);
      return { loadedModels: newLoadedModels };
    });
  },

  setDownloadProgress: (modelName: string, progress: Omit<ModelDownloadState, 'modelName'>) => {
    set((state) => {
      const newProgress = new Map(state.downloadProgress);
      newProgress.set(modelName, { modelName, ...progress });
      return { downloadProgress: newProgress };
    });
  },

  clearDownloadProgress: (modelName: string) => {
    set((state) => {
      const newProgress = new Map(state.downloadProgress);
      newProgress.delete(modelName);
      return { downloadProgress: newProgress };
    });
  },

  startLoadingOperation: (modelName: string, isDownloading: boolean) => {
    const state = get();

    // Atomic check: return false if already loading
    if (state.loadingOperations.has(modelName)) {
      console.log('[modelStore] Operation already in progress:', modelName);
      return false;
    }

    // Set loading operation
    set((state) => {
      const newOperations = new Map(state.loadingOperations);
      newOperations.set(modelName, {
        modelName,
        isDownloading,
        isLoading: !isDownloading,
        startedAt: Date.now(),
      });
      return {
        loadingOperations: newOperations,
        isLoading: true,
      };
    });

    return true;
  },

  completeLoadingOperation: (modelName: string) => {
    set((state) => {
      const newOperations = new Map(state.loadingOperations);
      newOperations.delete(modelName);

      // Only set isLoading to false if no other operations are active
      const isLoading = newOperations.size > 0;

      return {
        loadingOperations: newOperations,
        isLoading,
      };
    });
  },

  isModelLoading: (modelName: string) => {
    return get().loadingOperations.has(modelName);
  },

  setIsLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  setSystemMessage: (message: string) => {
    set({ systemMessage: message });
  },

  reset: () => {
    set(initialState);
  },
}));

/**
 * Selectors for common derived state
 */
export const modelStoreSelectors = {
  /**
   * Gets download state for a specific model
   */
  getDownloadState: (modelName: string) => (state: ModelStoreState): ModelDownloadState | undefined => {
    return state.downloadProgress.get(modelName);
  },

  /**
   * Gets all active downloads
   */
  getActiveDownloads: (state: ModelStoreState): ModelDownloadState[] => {
    return Array.from(state.downloadProgress.values()).filter(
      (d) => d.status === 'downloading' || d.status === 'paused'
    );
  },

  /**
   * Checks if a model is loaded
   */
  isModelLoaded: (modelName: string) => (state: ModelStoreState): boolean => {
    return state.loadedModels.has(modelName);
  },

  /**
   * Checks if selected model is loaded
   */
  isSelectedModelLoaded: (state: ModelStoreState): boolean => {
    return state.selectedModel ? state.loadedModels.has(state.selectedModel) : false;
  },

  /**
   * Gets loading operation for a model
   */
  getLoadingOperation: (modelName: string) => (state: ModelStoreState): ModelLoadingState | undefined => {
    return state.loadingOperations.get(modelName);
  },

  /**
   * Checks if any loading operation is active
   */
  hasActiveOperations: (state: ModelStoreState): boolean => {
    return state.loadingOperations.size > 0;
  },
};

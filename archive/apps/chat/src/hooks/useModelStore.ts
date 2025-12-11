/**
 * Custom hook for model state management and operations.
 *
 * This hook provides a clean API for components to interact with the model store
 * and handles model loading/downloading operations with proper state updates.
 *
 * @module useModelStore
 */

import { useCallback, useEffect, useRef } from '@lynx-js/react';
import {
  fetchAvailableModelsAsync,
  fetchLoadedModelNamesAsync,
  downloadNativeModel,
  loadNativeModel,
  useNativeAIModelStatus,
  type NativeAIModelInfo,
} from '@ariob/ai';
import { useModelStore, modelStoreSelectors } from '../stores/modelStore';

/**
 * Return type for the useModelManagement hook
 */
export interface UseModelManagementReturn {
  // State
  selectedModel: string | null;
  availableModels: NativeAIModelInfo[];
  loadedModels: string[];
  isLoading: boolean;
  error: string | null;

  // Model operations
  selectModel: (modelName: string) => Promise<void>;
  loadModel: (modelName: string) => Promise<boolean>;
  refreshModels: () => Promise<void>;

  // Download operations
  getDownloadProgress: (modelName: string) => { percentage: number; status: string } | null;
  isModelDownloading: (modelName: string) => boolean;
  isModelLoaded: (modelName: string) => boolean;

  // Utility
  clearError: () => void;
}

/**
 * Custom hook for managing models with Zustand store
 *
 * Features:
 * - Centralized state management via Zustand
 * - Automatic initialization of models
 * - Duplicate load/download prevention
 * - Real-time progress tracking
 * - Error handling
 *
 * @param options - Configuration options
 * @param options.autoLoadFirst - Automatically select first available model
 * @returns Model management API
 *
 * @example
 * ```tsx
 * function ModelSelector() {
 *   const {
 *     availableModels,
 *     selectedModel,
 *     selectModel,
 *     isModelLoaded,
 *     getDownloadProgress
 *   } = useModelManagement({ autoLoadFirst: true });
 *
 *   return (
 *     <select value={selectedModel ?? ''} onChange={(e) => selectModel(e.target.value)}>
 *       {availableModels.map(model => (
 *         <option key={model.name} value={model.name}>
 *           {model.name} {isModelLoaded(model.name) && '✓'}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useModelManagement(options: { autoLoadFirst?: boolean } = {}): UseModelManagementReturn {
  const { autoLoadFirst = true } = options;
  const initialized = useRef(false);
  const loadingSet = useRef(new Set<string>());

  // Subscribe to store state
  const selectedModel = useModelStore((state) => state.selectedModel);
  const availableModels = useModelStore((state) => state.availableModels);
  const loadedModelsSet = useModelStore((state) => state.loadedModels);
  const isLoading = useModelStore((state) => state.isLoading);
  const error = useModelStore((state) => state.error);
  const downloadProgress = useModelStore((state) => state.downloadProgress);

  // Store actions
  const setAvailableModels = useModelStore((state) => state.setAvailableModels);
  const setLoadedModels = useModelStore((state) => state.setLoadedModels);
  const selectModelAction = useModelStore((state) => state.selectModel);
  const markModelLoaded = useModelStore((state) => state.markModelLoaded);
  const setDownloadProgress = useModelStore((state) => state.setDownloadProgress);
  const clearDownloadProgress = useModelStore((state) => state.clearDownloadProgress);
  const startLoadingOperation = useModelStore((state) => state.startLoadingOperation);
  const completeLoadingOperation = useModelStore((state) => state.completeLoadingOperation);
  const isModelLoadingInStore = useModelStore((state) => state.isModelLoading);
  const setError = useModelStore((state) => state.setError);
  const clearError = useModelStore((state) => state.clearError);
  const setIsLoading = useModelStore((state) => state.setIsLoading);

  // Listen to native model events for progress updates
  const modelStatus = useNativeAIModelStatus();

  // Convert Set to Array for component use
  const loadedModels = Array.from(loadedModelsSet);

  /**
   * Initialize models on mount
   */
  useEffect(() => {
    if (initialized.current) return;

    const initializeModels = async () => {
      setIsLoading(true);
      clearError();

      try {
        console.log('[useModelManagement] Initializing models...');

        // Fetch available and loaded models in parallel
        const [available, loaded] = await Promise.all([
          fetchAvailableModelsAsync(),
          fetchLoadedModelNamesAsync(),
        ]);

        console.log('[useModelManagement] Available models:', available.length);
        console.log('[useModelManagement] Loaded models:', loaded);

        setAvailableModels(available);
        setLoadedModels(loaded);

        // Auto-select first model if enabled and no model selected
        if (autoLoadFirst && available.length > 0 && !selectedModel) {
          const firstModel = available[0]?.name;
          if (firstModel) {
            console.log('[useModelManagement] Auto-selecting first model:', firstModel);
            selectModelAction(firstModel);
          }
        }

        initialized.current = true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize models';
        console.error('[useModelManagement] Initialization error:', errorMsg);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    initializeModels();
  }, [autoLoadFirst, selectedModel, setAvailableModels, setLoadedModels, selectModelAction, setError, setIsLoading, clearError]);

  /**
   * Handle model status events from native layer
   */
  useEffect(() => {
    if (!modelStatus) return;

    const { model, state, percentage, message } = modelStatus;

    console.log('[useModelManagement] Model status event:', { model, state, percentage });

    switch (state) {
      case 'loading':
        if (percentage !== undefined) {
          // Download in progress
          setDownloadProgress(model, {
            percentage: percentage || 0,
            status: 'downloading',
          });
        }
        break;

      case 'loaded':
        // Model successfully loaded
        markModelLoaded(model);
        // Keep progress at 100% instead of clearing
        setDownloadProgress(model, {
          percentage: 100,
          status: 'complete',
        });
        completeLoadingOperation(model);
        loadingSet.current.delete(model);
        console.log('[useModelManagement] Model loaded successfully:', model);
        break;

      case 'error':
        // Loading/download failed
        setDownloadProgress(model, {
          percentage: 0,
          status: 'error',
          errorMessage: message,
        });
        completeLoadingOperation(model);
        loadingSet.current.delete(model);
        setError(message || `Failed to load model: ${model}`);
        console.error('[useModelManagement] Model error:', model, message);
        break;
    }
  }, [modelStatus, setDownloadProgress, clearDownloadProgress, markModelLoaded, completeLoadingOperation, setError]);

  /**
   * Loads a model (download + load into memory)
   */
  const loadModel = useCallback(async (modelName: string): Promise<boolean> => {
    if (!modelName) {
      console.warn('[useModelManagement] loadModel called with empty modelName');
      return false;
    }

    // Check if already loaded
    if (loadedModelsSet.has(modelName)) {
      console.log('[useModelManagement] Model already loaded:', modelName);
      return true;
    }

    // CRITICAL: Register loading operation FIRST (atomically)
    // This prevents race conditions from multiple hook instances
    const wasStarted = startLoadingOperation(modelName, true);
    if (!wasStarted) {
      console.log('[useModelManagement] Model loading operation already in progress (blocked):', modelName);
      return false;
    }

    loadingSet.current.add(modelName);
    clearError();

    try {
      console.log('[useModelManagement] Starting model load:', modelName);

      // Step 1: Download model (if not already downloaded)
      console.log('[useModelManagement] Step 1: Downloading model:', modelName);

      const downloadResult = await downloadNativeModel(modelName);

      if (!downloadResult?.success) {
        const errorMsg = downloadResult?.message || `Failed to download model: ${modelName}`;
        setError(errorMsg);
        completeLoadingOperation(modelName);
        loadingSet.current.delete(modelName);
        return false;
      }

      // Step 2: Load into memory
      console.log('[useModelManagement] Step 2: Loading model into memory:', modelName);

      // Update loading operation (download -> loading)
      completeLoadingOperation(modelName);
      const loadingStarted = startLoadingOperation(modelName, false);
      if (!loadingStarted) {
        console.log('[useModelManagement] Model already being loaded, skipping');
        loadingSet.current.delete(modelName);
        return false;
      }

      const loadResult = await loadNativeModel(modelName);

      if (loadResult?.success) {
        markModelLoaded(modelName);
        // Keep progress at 100% instead of clearing
        setDownloadProgress(modelName, {
          percentage: 100,
          status: 'complete',
        });
        console.log('[useModelManagement] Model loaded successfully:', modelName);
        completeLoadingOperation(modelName);
        loadingSet.current.delete(modelName);
        return true;
      } else {
        const errorMsg = loadResult?.message || `Failed to load model: ${modelName}`;
        setError(errorMsg);
        completeLoadingOperation(modelName);
        loadingSet.current.delete(modelName);
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Model loading failed';
      console.error('[useModelManagement] Error during model load:', errorMsg);
      setError(errorMsg);
      completeLoadingOperation(modelName);
      loadingSet.current.delete(modelName);
      return false;
    }
  }, [
    loadedModelsSet,
    isModelLoadingInStore,
    startLoadingOperation,
    completeLoadingOperation,
    markModelLoaded,
    clearDownloadProgress,
    setError,
    clearError,
  ]);

  /**
   * Selects a model and auto-loads it if not already loaded
   */
  const selectModel = useCallback(async (modelName: string): Promise<void> => {
    console.log('[useModelManagement] Selecting model:', modelName);

    // Always update selection immediately
    selectModelAction(modelName);
    clearError();

    // Auto-load if not already loaded
    if (!loadedModelsSet.has(modelName)) {
      console.log('[useModelManagement] Model not loaded, auto-loading:', modelName);
      await loadModel(modelName);
    }
  }, [selectModelAction, loadedModelsSet, loadModel, clearError]);

  /**
   * Refreshes the available and loaded models lists
   */
  const refreshModels = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    clearError();

    try {
      console.log('[useModelManagement] Refreshing models...');

      const [available, loaded] = await Promise.all([
        fetchAvailableModelsAsync(),
        fetchLoadedModelNamesAsync(),
      ]);

      setAvailableModels(available);
      setLoadedModels(loaded);

      console.log('[useModelManagement] Models refreshed');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh models';
      console.error('[useModelManagement] Refresh error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [setAvailableModels, setLoadedModels, setError, setIsLoading, clearError]);

  /**
   * Gets download progress for a model
   */
  const getDownloadProgress = useCallback((modelName: string) => {
    const progress = downloadProgress.get(modelName);
    if (!progress) return null;

    return {
      percentage: progress.percentage,
      status: progress.status,
    };
  }, [downloadProgress]);

  /**
   * Checks if a model is currently downloading
   */
  const isModelDownloading = useCallback((modelName: string): boolean => {
    const progress = downloadProgress.get(modelName);
    return progress?.status === 'downloading' || false;
  }, [downloadProgress]);

  /**
   * Checks if a model is loaded
   */
  const isModelLoaded = useCallback((modelName: string): boolean => {
    return loadedModelsSet.has(modelName);
  }, [loadedModelsSet]);

  return {
    // State
    selectedModel,
    availableModels,
    loadedModels,
    isLoading,
    error,

    // Operations
    selectModel,
    loadModel,
    refreshModels,

    // Download helpers
    getDownloadProgress,
    isModelDownloading,
    isModelLoaded,

    // Utility
    clearError,
  };
}

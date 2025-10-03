/**
 * React hooks for managing Native AI streaming, model lifecycle, and state.
 *
 * This module provides React-specific hooks that integrate with the Lynx native
 * bridge event system. Hooks automatically manage subscriptions, state updates,
 * and cleanup for AI operations.
 *
 * @module hooks
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLynxGlobalEventListener,
} from '@lynx-js/react';

import {
  NATIVE_AI_MODEL_EVENT,
  NATIVE_AI_STREAM_EVENT,
  coerceModelEventPayload,
  coerceStreamEventPayload,
  type NativeAIModelEvent,
  type NativeAIModelInfo,
  type NativeAIStatistics,
  type NativeAIStreamEvent,
} from './core';

import {
  fetchAvailableModelsAsync,
  fetchLoadedModelNamesAsync,
  loadNativeModel,
} from './operations';

/**
 * Configuration options for the useNativeAIStream hook.
 *
 * @interface UseNativeAIStreamOptions
 * @property {Function} [onChunk] - Callback invoked for each text chunk
 * @property {Function} [onComplete] - Callback invoked when generation completes
 * @property {Function} [onError] - Callback invoked on generation errors
 * @property {Function} [onInfo] - Callback invoked for performance statistics
 * @property {Function} [onToolCall] - Callback invoked when model calls a tool/function
 * @property {Function} [onStarted] - Callback invoked when generation starts
 *
 * @example
 * ```typescript
 * const streamOptions: UseNativeAIStreamOptions = {
 *   onChunk: (event) => console.log('Chunk:', event.delta),
 *   onComplete: (event) => console.log('Done:', event.content),
 *   onError: (event) => console.error('Error:', event.message)
 * };
 * ```
 */
export interface UseNativeAIStreamOptions {
  onChunk?: (event: Extract<NativeAIStreamEvent, { status: 'chunk' }>) => void;
  onComplete?: (event: Extract<NativeAIStreamEvent, { status: 'complete' }>) => void;
  onError?: (event: Extract<NativeAIStreamEvent, { status: 'error' }>) => void;
  onInfo?: (event: Extract<NativeAIStreamEvent, { status: 'info' }>) => void;
  onToolCall?: (event: Extract<NativeAIStreamEvent, { status: 'tool_call' }>) => void;
  onStarted?: (event: Extract<NativeAIStreamEvent, { status: 'started' }>) => void;
}

/**
 * State object returned by useNativeAIStream hook.
 *
 * @interface NativeAIStreamState
 * @property {string | null} streamId - Unique identifier for the current stream
 * @property {string | null} model - Model name being used for generation
 * @property {string} content - Accumulated generated text
 * @property {NativeAIStatistics | null} statistics - Performance metrics (available after completion)
 * @property {boolean} pending - True while generation is in progress
 *
 * @example
 * ```typescript
 * const streamState: NativeAIStreamState = {
 *   streamId: 'stream-abc123',
 *   model: 'gemma3:2b',
 *   content: 'The capital of France is Paris.',
 *   statistics: { tokensPerSecond: 55.6 },
 *   pending: false
 * };
 * ```
 */
export interface NativeAIStreamState {
  streamId: string | null;
  model: string | null;
  content: string;
  statistics: NativeAIStatistics | null;
  pending: boolean;
}

/**
 * React hook for managing AI streaming state and lifecycle events.
 *
 * Automatically subscribes to the 'native_ai:stream' global event channel and
 * maintains state for the current generation session. Provides callbacks for
 * all stream events (started, chunk, info, complete, error).
 *
 * The hook maintains accumulated content from all chunks and provides real-time
 * updates as text is generated. Callbacks are invoked via refs to avoid
 * unnecessary re-renders when callback functions change.
 *
 * @param {UseNativeAIStreamOptions} [options={}] - Event callbacks
 * @returns {NativeAIStreamState} Current stream state
 *
 * @example Basic Usage
 * ```tsx
 * function ChatComponent() {
 *   const stream = useNativeAIStream({
 *     onChunk: (event) => {
 *       console.log('New chunk:', event.delta);
 *     },
 *     onComplete: (event) => {
 *       console.log('Generation complete:', event.content);
 *       console.log('Stats:', event.metadata?.statistics);
 *     }
 *   });
 *
 *   return (
 *     <div>
 *       <p>Model: {stream.model}</p>
 *       <p>Status: {stream.pending ? 'Generating...' : 'Idle'}</p>
 *       <p>Content: {stream.content}</p>
 *       {stream.statistics && (
 *         <p>Speed: {stream.statistics.tokensPerSecond} tok/s</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Tool Calls
 * ```tsx
 * const stream = useNativeAIStream({
 *   onToolCall: (event) => {
 *     console.log('Tool called:', event.tool.name);
 *     console.log('Arguments:', event.tool.arguments);
 *   }
 * });
 * ```
 *
 * @example Error Handling
 * ```tsx
 * const stream = useNativeAIStream({
 *   onError: (event) => {
 *     alert(`Generation failed: ${event.message}`);
 *   }
 * });
 * ```
 *
 * @performance
 * - Callbacks are stored in refs to prevent re-subscription on callback changes
 * - State updates are batched where possible
 * - Memoized return value prevents unnecessary re-renders
 *
 * @see {@link generateNativeChat} to initiate generation
 * @see {@link NativeAIStreamEvent} for event payload types
 */
export function useNativeAIStream(options: UseNativeAIStreamOptions = {}): NativeAIStreamState {
  const [state, setState] = useState<NativeAIStreamState>({
    streamId: null,
    model: null,
    content: '',
    statistics: null,
    pending: false,
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useLynxGlobalEventListener(NATIVE_AI_STREAM_EVENT, (raw: unknown) => {
    const event = coerceStreamEventPayload(raw);
    if (!event) {
      return;
    }

    switch (event.status) {
      case 'started':
        setState({
          streamId: event.streamId,
          model: event.model,
          content: '',
          statistics: null,
          pending: true,
        });
        optionsRef.current.onStarted?.(event);
        break;
      case 'chunk':
        setState((previous) => ({
          ...previous,
          streamId: previous.streamId ?? event.streamId,
          model: previous.model ?? event.model,
          content: event.content,
          pending: true,
        }));
        optionsRef.current.onChunk?.(event);
        break;
      case 'info':
        setState((previous) => ({
          ...previous,
          statistics: event.statistics,
        }));
        optionsRef.current.onInfo?.(event);
        break;
      case 'tool_call':
        optionsRef.current.onToolCall?.(event);
        break;
      case 'complete':
        setState({
          streamId: event.streamId,
          model: event.model,
          content: event.content,
          statistics: event.metadata?.statistics ?? null,
          pending: false,
        });
        optionsRef.current.onComplete?.(event);
        break;
      case 'error':
        setState({
          streamId: event.streamId,
          model: event.model,
          content: `[Error] ${event.message}`,
          statistics: null,
          pending: false,
        });
        optionsRef.current.onError?.(event);
        break;
    }
  });

  return useMemo(() => state, [state]);
}

/**
 * Status object for model lifecycle tracking.
 *
 * @interface NativeAIModelStatus
 * @property {string} model - Model identifier
 * @property {'idle' | 'loading' | 'loaded' | 'error'} state - Current lifecycle state
 * @property {number} [percentage] - Loading/download progress (0-100)
 * @property {string} [message] - Error message or additional information
 * @property {Record<string, unknown>} [summary] - Model metadata after successful load
 *
 * @example
 * ```typescript
 * const status: NativeAIModelStatus = {
 *   model: 'gemma3:2b',
 *   state: 'loading',
 *   percentage: 65
 * };
 * ```
 */
export interface NativeAIModelStatus {
  model: string;
  state: 'idle' | 'loading' | 'loaded' | 'error';
  percentage?: number;
  message?: string;
  summary?: Record<string, unknown>;
}

/**
 * React hook for tracking model loading progress and state.
 *
 * Subscribes to the 'native_ai:model' global event channel and maintains
 * state for model lifecycle events (loading_started, download_progress,
 * loaded, error).
 *
 * The hook updates state in real-time as models are loaded, providing
 * download progress percentages and final load status. Useful for
 * displaying loading indicators and progress bars in the UI.
 *
 * @param {NativeAIModelStatus} [initial] - Initial status state
 * @returns {NativeAIModelStatus | null} Current model status or null if no events received
 *
 * @example Basic Usage
 * ```tsx
 * function ModelLoader() {
 *   const status = useNativeAIModelStatus();
 *
 *   if (!status) return <p>No model activity</p>;
 *
 *   return (
 *     <div>
 *       <p>Model: {status.model}</p>
 *       <p>State: {status.state}</p>
 *       {status.state === 'loading' && (
 *         <progress value={status.percentage} max={100} />
 *       )}
 *       {status.state === 'error' && (
 *         <p style={{ color: 'red' }}>{status.message}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Initial State
 * ```tsx
 * const status = useNativeAIModelStatus({
 *   model: 'gemma3:2b',
 *   state: 'idle'
 * });
 * ```
 *
 * @example Progress Tracking
 * ```tsx
 * function ModelProgress() {
 *   const status = useNativeAIModelStatus();
 *
 *   useEffect(() => {
 *     if (status?.state === 'loaded') {
 *       console.log('Model ready:', status.summary);
 *     }
 *   }, [status?.state]);
 *
 *   return status?.state === 'loading' ? (
 *     <div>
 *       <p>Downloading {status.model}...</p>
 *       <div className="progress-bar">
 *         <div style={{ width: `${status.percentage}%` }} />
 *       </div>
 *       <p>{status.percentage}%</p>
 *     </div>
 *   ) : null;
 * }
 * ```
 *
 * @performance
 * - Callback function is memoized with useCallback to prevent re-subscription
 * - Percentage is clamped to 0-100 range and rounded to integer
 *
 * @see {@link loadNativeModel} to trigger model loading
 * @see {@link NativeAIModelEvent} for event payload types
 */
export function useNativeAIModelStatus(initial?: NativeAIModelStatus): NativeAIModelStatus | null {
  const [status, setStatus] = useState<NativeAIModelStatus | null>(initial ?? null);

  const handleEvent = useCallback((event: NativeAIModelEvent) => {
    switch (event.type) {
      case 'loading_started':
        setStatus({ model: event.model, state: 'loading', percentage: 0 });
        break;
      case 'download_progress':
        setStatus({
          model: event.model,
          state: 'loading',
          percentage: Math.max(0, Math.min(100, Math.round(event.percentage))),
        });
        break;
      case 'loaded':
        setStatus({
          model: event.model,
          state: 'loaded',
          percentage: 100,
          summary: (event.summary as Record<string, unknown> | undefined) ?? undefined,
        });
        break;
      case 'error':
        setStatus({
          model: event.model ?? status?.model ?? 'unknown',
          state: 'error',
          message: event.message,
        });
        break;
    }
  }, [status?.model]);

  useLynxGlobalEventListener(NATIVE_AI_MODEL_EVENT, (raw: unknown) => {
    const event = coerceModelEventPayload(raw);
    if (event) {
      handleEvent(event);
    }
  });

  return status;
}

/**
 * Options for model management behavior.
 *
 * @interface ModelOptions
 * @property {boolean} [autoLoadFirst=true] - Automatically select first available model
 * @property {boolean} [preloadAll] - Preload all available models (not recommended)
 */
export interface ModelOptions {
  autoLoadFirst?: boolean;
  preloadAll?: boolean;
}

/**
 * State object returned by useModels hook.
 *
 * @interface ModelsState
 * @property {NativeAIModelInfo[]} availableModels - All registered models
 * @property {string[]} loadedModelNames - Models currently in memory
 * @property {string | null} selectedModel - Currently selected model identifier
 * @property {boolean} isLoading - True during model operations
 * @property {string | null} error - Error message if operation failed
 * @property {Function} loadModel - Function to load a specific model
 * @property {Function} selectModel - Function to select and auto-load a model
 * @property {Function} refreshModels - Function to refresh model lists
 */
export interface ModelsState {
  availableModels: NativeAIModelInfo[];
  loadedModelNames: string[];
  selectedModel: string | null;
  isLoading: boolean;
  error: string | null;
  loadModel: (modelName: string) => Promise<void>;
  selectModel: (modelName: string) => Promise<void>;
  refreshModels: () => Promise<void>;
}

/**
 * Comprehensive React hook for model discovery, loading, and selection.
 *
 * Provides a complete solution for managing AI models in React applications.
 * Handles initial discovery, background loading, selection state, and real-time
 * updates from model lifecycle events.
 *
 * Features:
 * - Automatic model discovery on mount
 * - Background loading to prevent UI blocking
 * - Auto-selection of first available model (optional)
 * - Duplicate load prevention
 * - Real-time sync with model events
 * - Concurrent loading support
 * - Comprehensive error handling
 *
 * All async operations run on background threads per Lynx architecture.
 *
 * @param {ModelOptions} [options={}] - Configuration options
 * @returns {ModelsState} Model management state and operations
 *
 * @example Basic Usage
 * ```tsx
 * function ModelSelector() {
 *   const {
 *     availableModels,
 *     loadedModelNames,
 *     selectedModel,
 *     isLoading,
 *     error,
 *     selectModel
 *   } = useModels();
 *
 *   return (
 *     <div>
 *       {error && <p className="error">{error}</p>}
 *       <select
 *         value={selectedModel ?? ''}
 *         onChange={(e) => selectModel(e.target.value)}
 *         disabled={isLoading}
 *       >
 *         {availableModels.map(model => (
 *           <option key={model.name} value={model.name}>
 *             {model.displayName} {loadedModelNames.includes(model.name) && '✓'}
 *           </option>
 *         ))}
 *       </select>
 *       {isLoading && <p>Loading model...</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Manual Loading
 * ```tsx
 * function ModelManager() {
 *   const { availableModels, loadModel, loadedModelNames } = useModels({
 *     autoLoadFirst: false
 *   });
 *
 *   const handleLoad = async (modelName: string) => {
 *     await loadModel(modelName);
 *     console.log('Model loaded and ready!');
 *   };
 *
 *   return (
 *     <ul>
 *       {availableModels.map(model => (
 *         <li key={model.name}>
 *           {model.displayName}
 *           {loadedModelNames.includes(model.name) ? (
 *             <span>✓ Loaded</span>
 *           ) : (
 *             <button onClick={() => handleLoad(model.name)}>
 *               Load
 *             </button>
 *           )}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 *
 * @example With Refresh
 * ```tsx
 * function ModelList() {
 *   const { availableModels, refreshModels, isLoading } = useModels();
 *
 *   return (
 *     <div>
 *       <button onClick={refreshModels} disabled={isLoading}>
 *         Refresh Models
 *       </button>
 *       <ul>
 *         {availableModels.map(model => (
 *           <li key={model.name}>{model.displayName}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 *
 * @performance
 * - Initial load uses Promise.all for concurrent fetching
 * - Background loading prevents UI blocking
 * - Duplicate load requests are prevented per model
 * - Model events automatically sync state without polling
 * - Return value is memoized to prevent unnecessary re-renders
 *
 * @see {@link fetchAvailableModelsAsync} for model discovery
 * @see {@link loadNativeModel} for loading implementation
 * @see {@link useNativeAIModelStatus} for progress tracking
 */
export function useModels(options: ModelOptions = {}): ModelsState {
  const { autoLoadFirst = true } = options;

  const [availableModels, setAvailableModels] = useState<NativeAIModelInfo[]>([]);
  const [loadedModelNames, setLoadedModelNames] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loadingModels, setLoadingModels] = useState<Set<string>>(new Set());

  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize models on mount with background loading
  useEffect(() => {
    if (initialized) return;

    const initializeModels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use Promise.all for concurrent loading
        const [available, loaded] = await Promise.all([
          fetchAvailableModelsAsync(),
          fetchLoadedModelNamesAsync(),
        ]);

        setAvailableModels(available);
        setLoadedModelNames(loaded);

        // Auto-select first available model if none selected
        if (autoLoadFirst && available.length > 0 && !selectedModel) {
          const firstModel = available[0]?.name;
          if (firstModel) {
            setSelectedModel(firstModel);
          }
        }

        setInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize models');
      } finally {
        setIsLoading(false);
      }
    };

    initializeModels();
  }, [autoLoadFirst, selectedModel, initialized]);

  // Handle model loading
  const loadModel = useCallback(async (modelName: string) => {
    if (!modelName) {
      return;
    }

    // Don't load if already loaded, but don't block selection
    if (loadedModelNames.includes(modelName)) {
      return;
    }

    // Don't load if already loading this specific model
    if (loadingModels.has(modelName)) {
      return;
    }

    setLoadingModels(prev => new Set(prev).add(modelName));
    setError(null);

    // Set global loading state only if no models are currently loading
    if (loadingModels.size === 0) {
      setIsLoading(true);
    }

    try {
      const result = await loadNativeModel(modelName);

      if (result?.success) {
        // Update loaded models list
        setLoadedModelNames(prev =>
          prev.includes(modelName) ? prev : [...prev, modelName]
        );
      } else {
        setError(result?.message || `Failed to load model: ${modelName}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Model loading failed');
    } finally {
      setLoadingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelName);
        return newSet;
      });

      // Clear global loading state only if no models are loading
      if (loadingModels.size <= 1) { // Size will be 1 until the state update above takes effect
        setIsLoading(false);
      }
    }
  }, [loadedModelNames, loadingModels]);

  /**
   * Selects a model and auto-loads it if not already loaded.
   *
   * Runs on background thread by default - all React hooks/callbacks are background thread.
   */
  const selectModel = useCallback(async (modelName: string) => {
    // Always allow selection, regardless of loading state
    setSelectedModel(modelName);
    setError(null);

    // Auto-load model if not already loaded
    if (!loadedModelNames.includes(modelName)) {
      await loadModel(modelName);
    }
  }, [loadedModelNames, loadModel]);

  /**
   * Refreshes the available and loaded models lists.
   *
   * Runs on background thread by default - all React hooks/callbacks are background thread.
   */
  const refreshModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [available, loaded] = await Promise.all([
        fetchAvailableModelsAsync(),
        fetchLoadedModelNamesAsync(),
      ]);

      setAvailableModels(available);
      setLoadedModelNames(loaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh models');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to model events for real-time updates
  const modelStatus = useNativeAIModelStatus();

  useEffect(() => {
    if (!modelStatus) return;

    if (modelStatus.state === 'loaded' && modelStatus.model) {
      setLoadedModelNames(prev =>
        prev.includes(modelStatus.model) ? prev : [...prev, modelStatus.model]
      );
      setIsLoading(false);
    } else if (modelStatus.state === 'error') {
      setError(modelStatus.message || 'Model operation failed');
      setIsLoading(false);
    } else if (modelStatus.state === 'loading') {
      setIsLoading(true);
      setError(null);
    }
  }, [modelStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, []);

  return useMemo(() => ({
    availableModels,
    loadedModelNames,
    selectedModel,
    isLoading,
    error,
    loadModel,
    selectModel,
    refreshModels,
  }), [
    availableModels,
    loadedModelNames,
    selectedModel,
    isLoading,
    error,
    loadModel,
    selectModel,
    refreshModels,
  ]);
}

/**
 * ML Store - Central state management for ML operations
 */

import { create } from 'zustand';
import type { MLMemoryInfo, MLMemoryRecommendations, MLModelInfo, MLModelStatus, MLStreamingSession, MemoryPressureLevel, MLError } from '../types';
import type { MLClient as MLClient } from '../client';
import { createMLClient } from '../client';
// import { calculateMemoryPressure } from '../types/memory';

// Model state for tracking loaded models
export interface ModelState {
  modelId: string;
  info: MLModelInfo | null;
  status: MLModelStatus;
  loadingProgress: number;
  loadStartTime?: number;
  error?: MLError;
}

// Streaming session state
export interface StreamingState {
  sessions: Map<string, MLStreamingSession>;
  activeSessionIds: string[];
}

export interface MLStoreState {
  // Client
  client: MLClient;
  isInitialized: boolean;

  // Models
  models: Map<string, ModelState>;
  loadedModelIds: string[];

  // Memory
  memoryInfo: MLMemoryRecommendations | null;
  memoryPressure: MemoryPressureLevel;
  memoryHistory: MLMemoryInfo[];

  // Streaming
  streaming: StreamingState;

  // Global loading states
  isLoadingMemory: boolean;
  isInitializing: boolean;

  // Errors
  lastError: MLError | null;
}

export interface MLStoreActions {
  // Initialization
  initialize: () => Promise<void>;
  reset: () => void;

  // Model management
  loadModel: (modelId: string, config: import('../types').MLModelConfiguration) => Promise<void>;
  unloadModel: (modelId: string) => Promise<void>;
  cancelModelLoading: (modelId: string) => Promise<void>;
  updateModelProgress: (modelId: string, progress: number) => void;
  refreshModels: () => Promise<void>;
  monitorModelLoading: (modelId: string) => Promise<void>;

  // Memory management
  refreshMemoryInfo: () => Promise<void>;
  clearMemory: () => Promise<void>;
  setMemoryLimit: (bytes: number) => Promise<void>;

  // Streaming session management
  addStreamingSession: (session: MLStreamingSession) => void;
  updateStreamingSession: (sessionId: string, updates: Partial<MLStreamingSession>) => void;
  removeStreamingSession: (sessionId: string) => void;
  clearStreamingSessions: () => void;

  // Error handling
  clearError: () => void;
  setError: (error: MLError) => void;
}

export type MLStore = MLStoreState & MLStoreActions;

export const createMLStore = () =>
  create<MLStore>()((set, get) => ({
      // Initial state
      client: createMLClient(),
      isInitialized: false,
      models: new Map(),
      loadedModelIds: [],
      memoryInfo: null,
      memoryPressure: 'normal',
      memoryHistory: [],
      streaming: {
        sessions: new Map(),
        activeSessionIds: []
      },
      isLoadingMemory: false,
      isInitializing: false,
      lastError: null,

      // Actions
      initialize: async () => {
        const { client } = get();
        set({ isInitializing: true, lastError: null });

        try {
          // Initialize ML client and load memory info
          const [memoryResult, modelsResult] = await Promise.all([
            client.getMemoryUsage(),
            client.getLoadedModels()
          ]);

          if (memoryResult.isOk()) {
            const memoryInfo = memoryResult.value;
            set({
              memoryInfo,
              memoryPressure: memoryInfo.pressureLevel
            });
          }

          if (modelsResult.isOk()) {
            const { models: modelIds } = modelsResult.value;
            const modelStates = new Map<string, ModelState>();

            // Initialize model states for loaded models
            for (const modelId of modelIds) {
              const infoResult = await client.getModelInfo(modelId);
              modelStates.set(modelId, {
                modelId,
                info: infoResult.isOk() ? infoResult.value : null,
                status: 'loaded',
                loadingProgress: 100
              });
            }

            set({
              models: modelStates,
              loadedModelIds: modelIds
            });
          }

          set({ isInitialized: true });
        } catch (error) {
          set({ lastError: error as MLError });
        } finally {
          set({ isInitializing: false });
        }
      },

      reset: () => {
        set({
          models: new Map(),
          loadedModelIds: [],
          memoryInfo: null,
          memoryPressure: 'normal',
          memoryHistory: [],
          streaming: {
            sessions: new Map(),
            activeSessionIds: []
          },
          isLoadingMemory: false,
          lastError: null
        });
      },

      loadModel: async (modelId: string, config: import('../types').MLModelConfiguration) => {
        const { client, models } = get();

        // Update model state to loading
        const newModels = new Map(models);
        newModels.set(modelId, {
          modelId,
          info: null,
          status: 'loading_started',
          loadingProgress: 0,
          loadStartTime: Date.now()
        });
        set({ models: newModels, lastError: null });

        try {
          const result = await client.loadModel(config);

          if (result.isOk()) {
            // Start monitoring progress
            get().monitorModelLoading(modelId);
          } else {
            // Update with error state
            const errorModels = new Map(get().models);
            const modelState = errorModels.get(modelId);
            if (modelState) {
              errorModels.set(modelId, {
                ...modelState,
                status: 'error',
                error: result.error
              });
              set({ models: errorModels });
            }
          }
        } catch (error) {
          const errorModels = new Map(get().models);
          const modelState = errorModels.get(modelId);
          if (modelState) {
            errorModels.set(modelId, {
              ...modelState,
              status: 'error',
              error: error as MLError
            });
            set({ models: errorModels });
          }
        }
      },

      unloadModel: async (modelId: string) => {
        const { client, models } = get();
        const modelState = models.get(modelId);

        if (modelState) {
          const newModels = new Map(models);
          newModels.set(modelId, {
            ...modelState,
            status: 'unloading'
          });
          set({ models: newModels, lastError: null });

          try {
            const result = await client.unloadModel(modelId);

            if (result.isOk()) {
              newModels.delete(modelId);
              set({
                models: newModels,
                loadedModelIds: get().loadedModelIds.filter(id => id !== modelId)
              });
            } else {
              set({ lastError: result.error });
            }
          } catch (error) {
            set({ lastError: error as MLError });
          }
        }
      },

      cancelModelLoading: async (modelId: string) => {
        const { client, models } = get();

        try {
          const result = await client.cancelModelLoading(modelId);

          if (result.isOk()) {
            const newModels = new Map(models);
            const modelState = newModels.get(modelId);
            if (modelState) {
              newModels.set(modelId, {
                ...modelState,
                status: 'cancelled'
              });
              set({ models: newModels });
            }
          }
        } catch (error) {
          set({ lastError: error as MLError });
        }
      },

      updateModelProgress: (modelId: string, progress: number) => {
        const { models } = get();
        const modelState = models.get(modelId);

        if (modelState) {
          const newModels = new Map(models);
          newModels.set(modelId, {
            ...modelState,
            loadingProgress: progress
          });
          set({ models: newModels });
        }
      },

      refreshModels: async () => {
        const { client } = get();

        try {
          const result = await client.getLoadedModels();

          if (result.isOk()) {
            const { models: modelIds } = result.value;
            const modelStates = new Map<string, ModelState>();

            for (const modelId of modelIds) {
              const infoResult = await client.getModelInfo(modelId);
              modelStates.set(modelId, {
                modelId,
                info: infoResult.isOk() ? infoResult.value : null,
                status: 'loaded',
                loadingProgress: 100
              });
            }

            set({
              models: modelStates,
              loadedModelIds: modelIds
            });
          }
        } catch (error) {
          set({ lastError: error as MLError });
        }
      },

      refreshMemoryInfo: async () => {
        const { client } = get();
        set({ isLoadingMemory: true, lastError: null });

        try {
          const result = await client.getMemoryUsage();

          if (result.isOk()) {
            const memoryInfo = result.value;
            set({
              memoryInfo,
              memoryPressure: memoryInfo.pressureLevel
            });
          } else {
            set({ lastError: result.error });
          }
        } catch (error) {
          set({ lastError: error as MLError });
        } finally {
          set({ isLoadingMemory: false });
        }
      },

      clearMemory: async () => {
        const { client } = get();
        set({ lastError: null });

        try {
          const result = await client.clearMemory();

          if (result.isOk()) {
            // Refresh memory info after clearing
            await get().refreshMemoryInfo();
            // Refresh models as some may have been unloaded
            await get().refreshModels();
          } else {
            set({ lastError: result.error });
          }
        } catch (error) {
          set({ lastError: error as MLError });
        }
      },

      setMemoryLimit: async (bytes: number) => {
        const { client } = get();
        set({ lastError: null });

        try {
          const result = await client.setMaxMemoryUsage(bytes);

          if (result.isOk()) {
            // Refresh memory info after setting limit
            await get().refreshMemoryInfo();
          } else {
            set({ lastError: result.error });
          }
        } catch (error) {
          set({ lastError: error as MLError });
        }
      },

      addStreamingSession: (session: MLStreamingSession) => {
        const { streaming } = get();
        const newSessions = new Map(streaming.sessions);
        newSessions.set(session.sessionId, session);

        set({
          streaming: {
            sessions: newSessions,
            activeSessionIds: [...streaming.activeSessionIds, session.sessionId]
          }
        });
      },

      updateStreamingSession: (sessionId: string, updates: Partial<MLStreamingSession>) => {
        const { streaming } = get();
        const session = streaming.sessions.get(sessionId);

        if (session) {
          const newSessions = new Map(streaming.sessions);
          newSessions.set(sessionId, { ...session, ...updates });

          set({
            streaming: {
              ...streaming,
              sessions: newSessions
            }
          });
        }
      },

      removeStreamingSession: (sessionId: string) => {
        const { streaming } = get();
        const newSessions = new Map(streaming.sessions);
        newSessions.delete(sessionId);

        set({
          streaming: {
            sessions: newSessions,
            activeSessionIds: streaming.activeSessionIds.filter(id => id !== sessionId)
          }
        });
      },

      clearStreamingSessions: () => {
        set({
          streaming: {
            sessions: new Map(),
            activeSessionIds: []
          }
        });
      },

      clearError: () => {
        set({ lastError: null });
      },

      setError: (error: MLError) => {
        set({ lastError: error });
      },

      // Helper method for monitoring model loading progress
      monitorModelLoading: async (modelId: string) => {
        const { client } = get();
        const maxAttempts = 300; // 5 minutes max with 1s intervals
        let attempts = 0;

        const checkProgress = async (): Promise<void> => {
          try {
            const progressResult = await client.checkModelLoadingProgress(modelId);

            if (progressResult.isOk()) {
              const progress = progressResult.value;
              get().updateModelProgress(modelId, progress.progress);

              if (progress.status === 'loaded') {
                // Model loaded successfully
                const infoResult = await client.getModelInfo(modelId);
                const { models } = get();
                const newModels = new Map(models);
                newModels.set(modelId, {
                  modelId,
                  info: infoResult.isOk() ? infoResult.value : null,
                  status: 'loaded',
                  loadingProgress: 100
                });

                set({
                  models: newModels,
                  loadedModelIds: [...get().loadedModelIds, modelId]
                });
                return;
              } else if (['error', 'cancelled'].includes(progress.status)) {
                // Model loading failed or was cancelled
                const { models } = get();
                const modelState = models.get(modelId);
                if (modelState) {
                  const newModels = new Map(models);
                  newModels.set(modelId, {
                    ...modelState,
                    status: progress.status as MLModelStatus,
                    error: progress.error ? new Error(progress.error) as MLError : undefined
                  });
                  set({ models: newModels });
                }
                return;
              }

              // Continue monitoring if still loading
              if (attempts < maxAttempts && ['loading_started', 'loading'].includes(progress.status)) {
                attempts++;
                setTimeout(checkProgress, 1000);
              }
            }
          } catch (error) {
            // Handle monitoring error
            console.error('Error monitoring model loading:', error);
          }
        };

        checkProgress();
      }
    } as any)); // Cast to avoid complex type inference issues

export const useMLStore = createMLStore();
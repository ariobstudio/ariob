import { useState, useCallback, useEffect } from '@lynx-js/react';
import { useNativeAIModelStatus } from '@ariob/ai';

export interface DownloadStatus {
  modelName: string;
  percentage: number;
  status: 'downloading' | 'paused' | 'complete' | 'error';
  errorMessage?: string;
}

export function useModelDownloads() {
  const [downloads, setDownloads] = useState<Map<string, DownloadStatus>>(new Map());
  const modelStatus = useNativeAIModelStatus();

  // Update downloads based on model status events
  useEffect(() => {
    if (!modelStatus) return;

    const { model, state, percentage, message } = modelStatus;

    if (state === 'loading' && percentage !== undefined) {
      setDownloads(prev => {
        const next = new Map(prev);
        next.set(model, {
          modelName: model,
          percentage: percentage || 0,
          status: 'downloading',
        });
        return next;
      });
    } else if (state === 'loaded') {
      setDownloads(prev => {
        const next = new Map(prev);
        next.set(model, {
          modelName: model,
          percentage: 100,
          status: 'complete',
        });
        // Remove completed downloads after 3 seconds
        setTimeout(() => {
          setDownloads(current => {
            const updated = new Map(current);
            updated.delete(model);
            return updated;
          });
        }, 3000);
        return next;
      });
    } else if (state === 'error') {
      setDownloads(prev => {
        const next = new Map(prev);
        const existing = prev.get(model);
        next.set(model, {
          modelName: model,
          percentage: existing?.percentage || 0,
          status: 'error',
          errorMessage: message,
        });
        return next;
      });
    }
  }, [modelStatus]);

  const pauseDownload = useCallback((modelName: string) => {
    // TODO: Call native pause method when implemented
    console.log('[Downloads] Pause download:', modelName);
    setDownloads(prev => {
      const next = new Map(prev);
      const existing = prev.get(modelName);
      if (existing) {
        next.set(modelName, { ...existing, status: 'paused' });
      }
      return next;
    });
  }, []);

  const resumeDownload = useCallback((modelName: string) => {
    // TODO: Call native resume method when implemented
    console.log('[Downloads] Resume download:', modelName);
    setDownloads(prev => {
      const next = new Map(prev);
      const existing = prev.get(modelName);
      if (existing) {
        next.set(modelName, { ...existing, status: 'downloading' });
      }
      return next;
    });
  }, []);

  const cancelDownload = useCallback((modelName: string) => {
    // TODO: Call native cancel method when implemented
    console.log('[Downloads] Cancel download:', modelName);
    setDownloads(prev => {
      const next = new Map(prev);
      next.delete(modelName);
      return next;
    });
  }, []);

  const clearDownload = useCallback((modelName: string) => {
    setDownloads(prev => {
      const next = new Map(prev);
      next.delete(modelName);
      return next;
    });
  }, []);

  return {
    downloads: Array.from(downloads.values()),
    pauseDownload,
    resumeDownload,
    cancelDownload,
    clearDownload,
  };
}

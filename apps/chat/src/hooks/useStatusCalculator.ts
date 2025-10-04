import { useMemo } from '@lynx-js/react';
import { lucideGlyphs } from '@ariob/ui';

type LucideName = keyof typeof lucideGlyphs;

interface StatusCalculatorInput {
  isGenerating: boolean;
  pending: boolean;
  loadingModelName: boolean;
  listError: string | null;
  selectedModel: string | null;
  selectedModelLoaded: boolean;
}

interface StatusResult {
  label: string;
  icon: LucideName;
  variant: 'default' | 'loading' | 'success' | 'warning' | 'error';
  animated: boolean;
}

export function useStatusCalculator({
  isGenerating,
  pending,
  loadingModelName,
  listError,
  selectedModel,
  selectedModelLoaded,
}: StatusCalculatorInput): StatusResult {
  const isStreamingOrGenerating = isGenerating || pending;

  return useMemo(() => {
    // Error state
    if (listError) {
      return {
        label: 'Error',
        icon: 'triangle-alert',
        variant: 'error',
        animated: false,
      };
    }

    // Generating/streaming
    if (isStreamingOrGenerating) {
      return {
        label: 'Thinking',
        icon: 'loader-circle',
        variant: 'loading',
        animated: true,
      };
    }

    // Loading model
    if (loadingModelName) {
      return {
        label: 'Loading Model',
        icon: 'loader-circle',
        variant: 'loading',
        animated: true,
      };
    }

    // Model loaded and ready
    if (selectedModelLoaded) {
      return {
        label: 'Ready',
        icon: 'check',
        variant: 'success',
        animated: false,
      };
    }

    // Model selected but not loaded
    if (selectedModel) {
      return {
        label: 'Selected',
        icon: 'clock',
        variant: 'warning',
        animated: false,
      };
    }

    // No model selected
    return {
      label: 'Select Model',
      icon: 'circle',
      variant: 'default',
      animated: false,
    };
  }, [isStreamingOrGenerating, loadingModelName, listError, selectedModelLoaded, selectedModel]);
}

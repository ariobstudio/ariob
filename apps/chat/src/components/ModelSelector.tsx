import { useCallback } from '@lynx-js/react';
import { Icon } from '@ariob/ui';
import type { NativeAIModelInfo } from '@ariob/ai';
import { useModelManagement } from '../hooks/useModelStore';

interface ModelSelectorProps {
  onModelSelect?: (modelName: string) => void;
  className?: string;
}

export function ModelSelector({ onModelSelect, className }: ModelSelectorProps) {
  const {
    availableModels,
    loadedModels,
    selectedModel,
    isLoading,
    selectModel,
    getDownloadProgress,
    isModelLoaded,
  } = useModelManagement({ autoLoadFirst: true });

  const handleModelTap = useCallback(
    async (modelName: string) => {
      console.log('[ModelSelector] Tapped model:', modelName);
      try {
        // Select model (this also auto-loads if not loaded)
        await selectModel(modelName);
        console.log('[ModelSelector] Model selected and loaded');

        // Notify parent component
        onModelSelect?.(modelName);
      } catch (error) {
        console.error('[ModelSelector] Failed to select model:', error);
      }
    },
    [selectModel, onModelSelect],
  );

  const getModelSize = (model: NativeAIModelInfo): string => {
    // First check the huggingFaceId if available
    const id = model.huggingFaceId?.toLowerCase() || '';
    const name = model.name.toLowerCase();

    // Check ID first (more reliable) - order matters for proper matching
    if (id.includes('0.5b') || id.includes('500m') || id.includes('-0.5b-')) return '0.5B';
    if (id.includes('0.6b') || id.includes('600m') || id.includes('-0.6b-')) return '0.6B';
    if (id.includes('1.5b') || id.includes('-1.5b-')) return '1.5B';
    if (id.includes('2.5b') || id.includes('-2.5b-')) return '2.5B';
    if (id.includes('3.5b') || id.includes('-3.5b-')) return '3.5B';
    if (id.includes('tiny') || id.includes('0.9b')) return 'Tiny';
    if (id.includes('1b') || id.includes('-1b-')) return '1B';
    if (id.includes('2b') || id.includes('-2b-')) return '2B';
    if (id.includes('3b') || id.includes('-3b-')) return '3B';
    if (id.includes('4b') || id.includes('-4b-')) return '4B';
    if (id.includes('7b') || id.includes('-7b-')) return '7B';
    if (id.includes('9b') || id.includes('-9b-')) return '9B';
    if (id.includes('phi-4')) return '14B';

    // Fallback to name - order matters for proper matching
    if (name.includes('0.5b') || name.includes('0.5 b')) return '0.5B';
    if (name.includes('0.6b') || name.includes('0.6 b')) return '0.6B';
    if (name.includes('1.5b') || name.includes('1.5 b')) return '1.5B';
    if (name.includes('2.5') || name.includes('2.5 b')) return '2.5B';
    if (name.includes('3.5') || name.includes('3.5 b')) return '3.5B';
    if (name.includes('tiny')) return 'Tiny';
    if (name.includes(' 1b') || name.includes('1 b')) return '1B';
    if (name.includes(' 2b') || name.includes('2 b')) return '2B';
    if (name.includes(' 3b') || name.includes('3 b')) return '3B';
    if (name.includes(' 4b') || name.includes('4 b')) return '4B';
    if (name.includes(' 7b') || name.includes('7 b')) return '7B';
    if (name.includes('phi-4')) return '14B';

    return 'LLM';
  };

  if (isLoading && availableModels.length === 0) {
    return (
      <view className={`py-4 ${className || ''}`}>
        <view className="flex items-center justify-center gap-2">
          <Icon name="loader-circle" className="h-4 w-4 animate-spin text-muted-foreground" />
          <text className="text-sm text-muted-foreground">Loading models...</text>
        </view>
      </view>
    );
  }

  if (availableModels.length === 0) {
    return (
      <view className={`py-4 ${className || ''}`}>
        <text className="text-sm text-muted-foreground text-center">No models available</text>
      </view>
    );
  }

  return (
    <scroll-view
      className={`w-full ${className || ''}`}
      scroll-x
      show-scrollbar={false}
    >
      <view className="flex flex-row gap-2 px-4 py-3">
        {availableModels.map((model, index) => {
          const isSelected = selectedModel === model.name;
          const isLoadedFlag = isModelLoaded(model.name);
          const downloadProgress = getDownloadProgress(model.name);
          const isDownloading = downloadProgress?.status === 'downloading';
          const downloadPercentage = downloadProgress?.percentage ?? 0;
          const modelSize = getModelSize(model);

          // Determine border style based on state
          const borderClass = isDownloading
            ? 'border-2 border-primary relative'
            : isSelected
              ? 'border-2 border-primary'
              : 'border border-border';

          // Background and text colors
          const bgClass = isSelected
            ? 'bg-primary text-primary-foreground shadow-[var(--shadow-sm)]'
            : 'bg-card text-card-foreground hover:bg-accent/50';

          const iconColor = isSelected
            ? 'text-primary-foreground'
            : 'text-muted-foreground';

          const titleColor = isSelected
            ? 'text-primary-foreground'
            : 'text-foreground';

          // Icon based on state
          let iconName: 'download' | 'circle-check' | 'circle' = 'circle';
          if (isDownloading) iconName = 'download';
          else if (isLoadedFlag) iconName = 'circle-check';

          return (
            <view
              key={model.name}
              className={`flex-shrink-0 rounded-full overflow-hidden transition-all ${borderClass} ${bgClass}`}
              style={{
                animation: `scale-in 0.3s ease-out ${index * 50}ms`,
                ...(isDownloading ? {
                  background: `linear-gradient(90deg, var(--color-primary) ${downloadPercentage}%, transparent ${downloadPercentage}%)`,
                  backgroundClip: 'border-box',
                  borderImageSource: `linear-gradient(90deg, var(--color-primary) ${downloadPercentage}%, var(--color-border) ${downloadPercentage}%)`,
                  borderImageSlice: 1,
                } : {})
              }}
            >
              <view
                className="inline-flex items-center gap-3 px-4 py-2.5"
                bindtap={() => handleModelTap(model.name)}
              >
                <Icon
                  name={iconName}
                  className={`h-5 w-5 flex-shrink-0 ${iconColor}`}
                  style={isDownloading ? { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' } : undefined}
                />
                <view className="flex flex-col gap-1">
                  <text className={`text-sm font-semibold whitespace-nowrap ${titleColor}`}>
                    {model.name}
                  </text>
                  <view className="flex items-center gap-2">
                    <view className={`px-2 py-0.5 rounded-full ${isSelected ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                      <text className={`text-[11px] font-bold whitespace-nowrap ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                        {isDownloading ? `${modelSize} • ${downloadPercentage.toFixed(0)}%` : modelSize}
                      </text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          );
        })}
      </view>
    </scroll-view>
  );
}
import { useCallback, useState } from '@lynx-js/react';
import { Icon } from '@ariob/ui';
import { useModels, type NativeAIModelInfo } from '@ariob/ai';

interface ModelSelectorProps {
  onModelSelect?: (modelName: string) => void;
  className?: string;
}

export function ModelSelector({ onModelSelect, className }: ModelSelectorProps) {
  const {
    availableModels,
    loadedModelNames,
    selectedModel,
    isLoading,
    selectModel,
    loadModel,
  } = useModels({ autoLoadFirst: true });

  const handleModelTap = useCallback(
    async (modelName: string) => {
      console.log('[ModelSelector] Tapped model:', modelName);
      try {
        console.log('[ModelSelector] Selecting model...');
        await selectModel(modelName);
        console.log('[ModelSelector] Model selected');

        // Load model in background if not already loaded
        if (!loadedModelNames.includes(modelName)) {
          console.log('[ModelSelector] Loading model in background...');
          loadModel(modelName); // Don't await - let it load in background
        }

        console.log('[ModelSelector] Calling onModelSelect callback');
        onModelSelect?.(modelName);
      } catch (error) {
        console.error('[ModelSelector] Failed to select model:', error);
      }
    },
    [selectModel, loadModel, loadedModelNames, onModelSelect],
  );

  const getModelSize = (model: NativeAIModelInfo): string => {
    const name = model.name.toLowerCase();
    if (name.includes('135m')) return '135M';
    if (name.includes('0.6b') || name.includes('600m')) return '0.6B';
    if (name.includes('1b')) return '1B';
    if (name.includes('1.5b')) return '1.5B';
    if (name.includes('3b')) return '3B';
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
        {availableModels.map((model) => {
          const isSelected = selectedModel === model.name;

          // Chip-style classes - only selected/unselected states
          const chipClass = isSelected
            ? 'bg-primary text-primary-foreground border-primary shadow-[var(--shadow-sm)]'
            : 'bg-card text-card-foreground border-border hover:border-primary/50 hover:bg-accent/50';

          const iconColor = isSelected
            ? 'text-primary-foreground'
            : 'text-muted-foreground';

          const titleColor = isSelected
            ? 'text-primary-foreground'
            : 'text-foreground';

          const subtitleColor = isSelected
            ? 'text-primary-foreground'
            : 'text-muted-foreground';

          return (
            <view
              key={model.name}
              className={`flex-shrink-0 inline-flex items-center gap-2.5 rounded-full border px-4 py-2 cursor-pointer transition-all ${chipClass}`}
              bindtap={() => handleModelTap(model.name)}
            >
              <Icon
                name={isSelected ? 'circle-check' : 'circle'}
                className={`h-4 w-4 flex-shrink-0 ${iconColor}`}
              />
              <view className="flex items-center gap-1.5">
                <text className={`text-xs font-medium whitespace-nowrap ${titleColor}`}>
                  {model.name}
                </text>
                <text className={`text-[10px] font-semibold whitespace-nowrap ${subtitleColor}`}>
                  {getModelSize(model)}
                </text>
              </view>
            </view>
          );
        })}
      </view>
    </scroll-view>
  );
}
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

  const [loadingModel, setLoadingModel] = useState<string | null>(null);

  const handleModelTap = useCallback(
    async (modelName: string) => {
      console.log('[ModelSelector] Tapped model:', modelName);
      try {
        setLoadingModel(modelName);
        console.log('[ModelSelector] Selecting model...');
        await selectModel(modelName);
        console.log('[ModelSelector] Model selected');
        
        if (!loadedModelNames.includes(modelName)) {
          console.log('[ModelSelector] Loading model...');
          await loadModel(modelName);
          console.log('[ModelSelector] Model loaded');
        }
        
        console.log('[ModelSelector] Calling onModelSelect callback');
        onModelSelect?.(modelName);
      } catch (error) {
        console.error('[ModelSelector] Failed to select model:', error);
      } finally {
        setLoadingModel(null);
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
      <view className="flex flex-row gap-3 px-4 py-3">
        {availableModels.map((model) => {
          const isSelected = selectedModel === model.name;
          const isLoaded = loadedModelNames.includes(model.name);
          const isLoadingThisModel = loadingModel === model.name;

          const cardClass = isLoadingThisModel
            ? 'border-accent bg-accent'
            : isSelected
              ? 'border-primary bg-primary'
              : 'border-border bg-card hover:bg-accent';

          const iconColor = isLoadingThisModel
            ? 'text-accent-foreground'
            : isSelected
              ? 'text-primary-foreground'
              : 'text-muted-foreground';

          const titleColor = isLoadingThisModel
            ? 'text-accent-foreground'
            : isSelected
              ? 'text-primary-foreground'
              : 'text-foreground';

          const subtitleColor = isLoadingThisModel
            ? 'text-accent-foreground/70'
            : isSelected
              ? 'text-primary-foreground/70'
              : 'text-muted-foreground';

          const dotColor = isSelected ? 'bg-primary-foreground' : 'bg-primary';

          return (
            <view
              key={model.name}
              className={`flex-shrink-0 w-32 rounded-lg border p-3 cursor-pointer transition-colors ${cardClass}`}
              bindtap={() => handleModelTap(model.name)}
            >
              <view className="flex flex-col items-center gap-2 text-center">
                <Icon
                  name={isLoadingThisModel ? 'loader-circle' : isSelected ? 'circle-check' : 'brain'}
                  className={`h-6 w-6 ${iconColor} ${isLoadingThisModel ? 'animate-spin' : ''}`}
                />
                <view className="w-full">
                  <text className={`text-xs font-medium line-clamp-2 ${titleColor}`}>
                    {model.name}
                  </text>
                  <text className={`text-[10px] mt-1 ${subtitleColor}`}>
                    {isLoadingThisModel ? 'Loading...' : getModelSize(model)}
                  </text>
                </view>
                {isLoaded && !isLoadingThisModel && (
                  <view className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                )}
              </view>
            </view>
          );
        })}
      </view>
    </scroll-view>
  );
}
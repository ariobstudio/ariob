import { useCallback, useState } from '@lynx-js/react';
import { Icon, useTheme } from '@ariob/ui';
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

  const { withTheme } = useTheme();
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

          const cardClass = withTheme(
            isLoadingThisModel
              ? 'border-yellow-200 bg-yellow-50'
              : isSelected
                ? 'border-primary bg-primary'
                : 'border-border bg-card hover:bg-accent',
            isLoadingThisModel
              ? 'border-yellow-700 bg-yellow-950'
              : isSelected
                ? 'border-primary bg-primary'
                : 'border-border bg-card hover:bg-accent'
          );

          return (
            <view
              key={model.name}
              className={`flex-shrink-0 w-32 rounded-lg border p-3 cursor-pointer transition-colors ${cardClass}`}
              bindtap={() => handleModelTap(model.name)}
            >
              <view className="flex flex-col items-center gap-2 text-center">
                <Icon
                  name={isLoadingThisModel ? 'loader-circle' : isSelected ? 'circle-check' : 'brain'}
                  className={`h-6 w-6 ${
                    isLoadingThisModel 
                      ? withTheme('text-yellow-600 animate-spin', 'text-yellow-400 animate-spin')
                      : isSelected 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                  }`}
                />
                <view className="w-full">
                  <text className="text-xs font-medium text-foreground line-clamp-2">
                    {model.name}
                  </text>
                  <text className="text-[10px] text-muted-foreground mt-1">
                    {isLoadingThisModel ? 'Loading...' : getModelSize(model)}
                  </text>
                </view>
                {isLoaded && !isLoadingThisModel && (
                  <view className={withTheme(
                    'h-1.5 w-1.5 rounded-full bg-green-500',
                    'h-1.5 w-1.5 rounded-full bg-green-400'
                  )} />
                )}
              </view>
            </view>
          );
        })}
      </view>
    </scroll-view>
  );
}
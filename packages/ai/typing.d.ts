
import type { BaseEvent, InputProps, StandardProps } from '@lynx-js/types';

declare global {
  declare let NativeModules: {
    NativeAIModule: {
      // Model Management
      listAvailableModels(): string;
      listLoadedModels(): string;
      isModelLoaded(modelName: string): string;
      loadModel(requestJSON: string, callback: (result: string) => void): void;
      unloadModel(modelName: string): string;
  
      // Text Generation
      generateChat(requestJSON: string, callback: (result: string) => void): void;
    };
  };
}

// @ts-ignore


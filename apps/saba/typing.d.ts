/**
 * Type declarations for Saba app with NativeMLXModule support
 * Following Lynx native module patterns
 */

/// <reference types="@lynx-js/rspeedy/client" />

import type { BaseEvent, StandardProps } from '@lynx-js/types';

// Extend the Lynx NativeModules interface to include our MLX module
declare module '@lynx-js/types' {
  interface NativeModules {
    NativeMLXModule: {
      // Model Management
      loadModel(config: string): string;
      unloadModel(modelId: string): string;
      listLoadedModels(): string;
      getModelInfo(modelId: string): string;
      checkModelLoadingProgress(modelId: string): string;
      cancelModelLoading(modelId: string): string;

      // Text Generation
      generateText(modelId: string, prompt: string, options?: string): string;
      streamInference(request: string, onChunk: (chunk: string) => void): string;

      // Image Generation
      generateImage(modelId: string, prompt: string, options?: string): string;

      // Vision-Language Models
      analyzeImage(modelId: string, imageData: string, prompt?: string): string;

      // Audio (TTS and Whisper)
      synthesizeSpeech(modelId: string, text: string, options?: string): string;
      transcribeAudio(modelId: string, audioData: string, options?: string): string;

      // Memory Management
      clearModelCache(): string;
      getAvailableMemory(): string;
      setMaxMemoryUsage(bytes: number): string;

      // General Inference
      inference(request: string): string;
    };
  }
}

// Input component props for the chat interface
export interface InputProps extends StandardProps {
  className?: string;
  bindinput?: (e: InputEvent) => void;
  bindblur?: (e: BlurEvent) => void;
  placeholder?: string;
  'text-color'?: string;
  value?: string;
}

export type InputEvent = BaseEvent<'input', { value: string }>;
export type BlurEvent = BaseEvent<'blur', { value: string }>;

// Make this a module
export {};
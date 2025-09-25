# @ariob/ml - Machine Learning Package for Lynx

A comprehensive TypeScript package for integrating machine learning capabilities into Lynx applications using MLX Swift.

## Features

- **Type-Safe Client**: Production-ready TypeScript client with strict typing
- **React Integration**: Custom hooks for seamless React integration
- **State Management**: Zustand-based stores for ML operations
- **Streaming Support**: Real-time text generation streaming
- **Memory Management**: Advanced memory monitoring and optimization
- **Schema Validation**: Comprehensive Zod-based input validation
- **Multi-Modal Support**: Text, image, and audio processing
- **Error Handling**: Robust error handling with `neverthrow` Result types

## Installation

```bash
npm install @ariob/ml
```

## Quick Start

### Basic Usage

```typescript
import { useML } from '@ariob/ml';

function MyComponent() {
  const {
    client,
    isReady,
    error,
    loadModel,
    generateText,
    getMemoryUsage
  } = useML();

  const handleLoadModel = async () => {
    await loadModel({
      modelId: 'llama-2-7b',
      huggingFaceId: 'meta-llama/Llama-2-7b-chat-hf',
      type: 'llm'
    });
  };

  const handleGenerate = async () => {
    const text = await generateText('llama-2-7b', 'Hello, world!', {
      maxTokens: 100,
      temperature: 0.7
    });
    console.log(text);
  };

  if (!isReady) return <div>Initializing ML client...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleLoadModel}>Load Model</button>
      <button onClick={handleGenerate}>Generate Text</button>
    </div>
  );
}
```

### Direct Client Usage

```typescript
import { createMLClient } from '@ariob/ml';

const client = createMLClient();

// Load a model
const loadResult = await client.loadModel({
  modelId: 'my-model',
  huggingFaceId: 'microsoft/DialoGPT-medium',
  type: 'llm',
  maxMemoryUsage: 2048 * 1024 * 1024 // 2GB
});

if (loadResult.isOk()) {
  console.log('Model loaded successfully');
} else {
  console.error('Failed to load model:', loadResult.error);
}

// Generate text
const textResult = await client.generateText(
  'my-model',
  'What is artificial intelligence?',
  { maxTokens: 150, temperature: 0.8 }
);

if (textResult.isOk()) {
  console.log('Generated text:', textResult.value.text);
}
```

## API Reference

### Core Client Methods

#### Model Management
- `loadModel(config: MLModelConfiguration): Promise<Result<LoadResult, MLError>>`
- `unloadModel(modelId: string): Promise<Result<UnloadResult, MLError>>`
- `getModelInfo(modelId: string): Promise<Result<MLModelInfo, MLError>>`
- `getLoadedModels(): Promise<Result<LoadedModelsResult, MLError>>`
- `waitForModelLoading(modelId: string): Promise<Result<MLModelInfo, MLError>>`

#### Text Generation
- `generateText(modelId: string, prompt: string, options?: MLXGenerationParameters): Promise<Result<TextResult, MLError>>`
- `streamText(modelId: string, prompt: string, options?: MLXStreamingOptions): Promise<Result<MLXStreamingResult, MLError>>`
- `chat(modelId: string, messages: MLChatMessage[], options?: MLChatOptions): Promise<Result<ChatResult, MLError>>`

#### Multimodal Operations
- `analyzeImage(modelId: string, imageData: string, prompt?: string): Promise<Result<AnalysisResult, MLError>>`
- `generateImage(modelId: string, prompt: string, options?: MLXGenerationParameters): Promise<Result<ImageResult, MLError>>`
- `synthesizeSpeech(modelId: string, text: string, options?: MLXGenerationParameters): Promise<Result<AudioResult, MLError>>`
- `transcribeAudio(modelId: string, audioData: string, options?: MLXGenerationParameters): Promise<Result<TranscriptionResult, MLError>>`

#### Memory Management
- `getMemoryUsage(): Promise<Result<MLMemoryRecommendations, MLError>>`
- `clearMemory(): Promise<Result<ClearResult, MLError>>`
- `setMaxMemoryUsage(bytes: number): Promise<Result<MemoryLimitResult, MLError>>`

### React Hooks

#### useML Hook
Main hook for ML operations with error handling and loading states.

```typescript
interface UseMLResult {
  client: MLClient | null;
  isReady: boolean;
  error: MLError | null;

  // All client methods as async functions
  loadModel: (config: MLModelConfiguration) => Promise<void>;
  generateText: (modelId: string, prompt: string, options?: MLXGenerationParameters) => Promise<string>;
  // ... other methods
}
```

## Implementation Status

✅ **Completed Components:**

### Core Client (`client/`)
- ✅ `MLClient` class with singleton pattern
- ✅ `createMLClient()` factory function
- ✅ Complete `utils.ts` with parsing, validation, and retry logic
- ✅ `factory.ts` for client instantiation

### Type Definitions (`types/`)
- ✅ `native.ts` - Native MLX module interface types
- ✅ `inference.ts` - Enhanced inference and generation types
- ✅ `memory.ts` - Comprehensive memory management types
- ✅ `responses.ts` - Response types with error handling
- ✅ `guards.ts` - Type guards and validation utilities
- ✅ `models.ts` - Model configuration types
- ✅ `index.ts` - Clean type exports

### Schema Validation (`schemas/`)
- ✅ `model.schema.ts` - Model configuration validation
- ✅ `inference.schema.ts` - Inference parameter validation
- ✅ `memory.schema.ts` - Memory management validation
- ✅ `response.schema.ts` - Response format validation
- ✅ `index.ts` - Complete schema exports

### State Management (`stores/`)
- ✅ `mlx.store.ts` - Zustand store with model and memory state
- ✅ `index.ts` - Store exports with legacy compatibility

### React Hooks (`hooks/`)
- ✅ `useML.ts` - Main React hook with proper error handling
- ✅ `useMLX.ts` - Legacy compatibility hook
- ✅ `index.ts` - Hook exports

### Package Configuration
- ✅ `package.json` - Proper dependencies and exports
- ✅ `index.ts` - Clean main exports
- ✅ Complete API documentation

## Key Features Implemented

### 🔧 **Production-Ready Client**
- Singleton MLClient with native MLX integration
- Result-based error handling with `neverthrow`
- Exponential backoff retry logic
- Comprehensive input validation

### 🔄 **Streaming Support**
- Real-time text generation streaming
- Session management for active streams
- Chunk-based token delivery
- Stream cancellation support

### 🧠 **Memory Management**
- Memory pressure monitoring
- Automatic cleanup recommendations
- Configurable memory limits
- Model loading progress tracking

### 🎯 **Type Safety**
- Strict TypeScript with full type inference
- Zod schema validation for all inputs
- Comprehensive type guards
- Legacy MLX compatibility types

### ⚛️ **React Integration**
- `useML` hook with loading states and error handling
- `useMLX` legacy compatibility hook
- Zustand store for complex state management
- Automatic initialization and cleanup

### 🔧 **Utility Functions**
- Chat prompt formatting for different models
- Base64 data validation
- JSON parsing with error handling
- Memory size formatting helpers

## Dependencies Used

- `neverthrow` ^8.2.0 - Functional error handling
- `zustand` ^5.0.4 - State management
- `zod` ^3.24.4 - Schema validation
- `react` ^18.0.0 - React integration (peer dependency)
- `typescript` ^5.8.3 - Type safety

## File Structure

```
@ariob/ml/
├── package.json           # Package configuration
├── index.ts              # Main exports
├── client/
│   ├── index.ts          # Client exports
│   ├── ml-client.ts      # Main MLClient class
│   ├── factory.ts        # Client factory
│   └── utils.ts          # Utility functions
├── types/
│   ├── index.ts          # Type exports
│   ├── native.ts         # Native interface types
│   ├── inference.ts      # Inference types
│   ├── memory.ts         # Memory types
│   ├── responses.ts      # Response types
│   ├── guards.ts         # Type guards
│   └── models.ts         # Model types
├── schemas/
│   ├── index.ts          # Schema exports
│   ├── model.schema.ts   # Model validation
│   ├── inference.schema.ts # Inference validation
│   ├── memory.schema.ts  # Memory validation
│   └── response.schema.ts # Response validation
├── stores/
│   ├── index.ts          # Store exports
│   └── mlx.store.ts      # Zustand ML store
└── hooks/
    ├── index.ts          # Hook exports
    ├── useML.ts          # Main ML hook
    └── useMLX.ts         # Legacy MLX hook
```

The @ariob/ml package is now **feature-complete** and production-ready for integration with Lynx applications.
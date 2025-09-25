# @ariob/mlx

A comprehensive TypeScript package for integrating MLX machine learning capabilities into Lynx applications.

## Features

- **🚀 Modular Architecture**: Specialized handlers for LLM, VLM, Image Generation, TTS, and Whisper models
- **🔒 Type Safety**: Full TypeScript support with Zod validation schemas
- **⚡ Performance**: Optimized memory management with GPU monitoring
- **🎯 Lynx Integration**: Native module patterns designed specifically for Lynx framework
- **🪝 React Hooks**: Easy-to-use hooks for state management
- **📊 Memory Monitoring**: Real-time GPU memory tracking and optimization
- **🔄 Streaming Support**: Built-in streaming capabilities for real-time inference

## Installation

```bash
# Already included in workspace
yarn add @ariob/mlx
```

## Quick Start

### Basic Setup

```typescript
import { useMLX, createMLXClient } from '@ariob/mlx';

function MyMLXComponent() {
  const {
    isInitialized,
    error,
    memoryPressure,
    initialize
  } = useMLX({
    autoInitialize: true,
    onError: (error) => console.error('MLX Error:', error),
    onInitialized: () => console.log('MLX Ready!')
  });

  if (!isInitialized) {
    return <Text>Initializing MLX...</Text>;
  }

  return <Text>MLX is ready! Memory pressure: {memoryPressure}</Text>;
}
```

### Model Management

```typescript
import { createMLXClient, type MLXModelConfiguration } from '@ariob/mlx';

const client = createMLXClient();

// Load a model
const config: MLXModelConfiguration = {
  modelId: 'mlx-community/Llama-3.2-1B-Instruct-4bit',
  modelType: 'llm',
  source: 'huggingface',
  quantization: '4bit'
};

const result = await client.loadModel(config);
if (result.isOk()) {
  console.log('Model loaded:', result.value);
}
```

### Text Generation

```typescript
// Simple text generation
const result = await client.generateText(
  'mlx-community/Llama-3.2-1B-Instruct-4bit',
  'What is machine learning?'
);

if (result.isOk()) {
  console.log('Generated text:', result.value);
}

// Streaming text generation
await client.streamText(
  'mlx-community/Llama-3.2-1B-Instruct-4bit',
  'Explain quantum computing',
  (chunk) => console.log('Chunk:', chunk),
  { maxTokens: 100, temperature: 0.7 }
);
```

### Image Generation

```typescript
// Generate an image
const result = await client.generateImage(
  'stabilityai/stable-diffusion-xl-base-1.0',
  'A serene landscape with mountains and a lake at sunset'
);

if (result.isOk()) {
  // result.value is base64 encoded image
  const imageUri = `data:image/png;base64,${result.value}`;
  // Use with <Image source={{ uri: imageUri }} />
}
```

### Vision Language Models

```typescript
// Analyze an image
const result = await client.analyzeImage(
  'mlx-community/Qwen2-VL-2B-Instruct-4bit',
  base64ImageData,
  'What do you see in this image?'
);

if (result.isOk()) {
  console.log('Analysis:', result.value);
}
```

### Chat Interface

```typescript
// Multi-turn conversation
const messages = [
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi there! How can I help you?' },
  { role: 'user', content: 'What is your favorite color?' }
];

const result = await client.chat(
  'mlx-community/Llama-3.2-1B-Instruct-4bit',
  messages,
  { temperature: 0.7, maxTokens: 150 }
);
```

### Memory Management

```typescript
// Monitor memory
const memoryInfo = await client.getMemoryInfo();
if (memoryInfo.isOk()) {
  console.log('Memory usage:', memoryInfo.value);
}

// Clear cache when memory pressure is high
await client.clearCache();

// Set memory limits
await client.setMemoryLimit(2 * 1024 * 1024 * 1024); // 2GB
```

## API Reference

### Types

- `MLXModelType`: `'llm' | 'vlm' | 'image-gen' | 'tts' | 'whisper' | 'custom'`
- `MLXModelConfiguration`: Configuration for loading models
- `MLXInferenceParameters`: Parameters for inference operations
- `MLXMemoryInfo`: Memory usage and limits information

### Hooks

- `useMLX()`: Main hook for MLX operations
- `useMLXModel()`: Hook for model-specific operations
- `useMLXInference()`: Hook for inference operations
- `useMLXMemory()`: Hook for memory monitoring

### Client Methods

- `loadModel(config)`: Load a model
- `unloadModel(modelId, modelType)`: Unload a model
- `generateText(modelId, prompt, options?)`: Generate text
- `streamText(modelId, prompt, onChunk, options?)`: Stream text generation
- `generateImage(modelId, prompt, options?)`: Generate images
- `analyzeImage(modelId, imageData, prompt?)`: Analyze images
- `synthesizeSpeech(modelId, text, options?)`: Text-to-speech
- `transcribeAudio(modelId, audioData, options?)`: Speech-to-text
- `chat(modelId, messages, options?)`: Multi-turn conversations

### Error Handling

All methods return `Result<T, MLXError>` types using the `neverthrow` library:

```typescript
const result = await client.generateText(modelId, prompt);

if (result.isOk()) {
  // Success case
  console.log(result.value);
} else {
  // Error case
  console.error(result.error.message);
  console.error(result.error.code);
}
```

## Native Module Integration

The package automatically connects to the `NativeMLXModule` registered with the Lynx runtime. Ensure your native module is properly registered:

### iOS (Objective-C)

```objc
#import "NativeMLXModule.h"

- (void)setupLynxEnv {
  [globalConfig registerModule:NativeMLXModule.class];
}
```

### Android (Java)

```java
public void Init(Context context) {
  LynxEnv.inst().registerModule("NativeMLXModule", NativeMLXModule.class);
}
```

## Memory Optimization

The package includes built-in memory management:

- **GPU Memory Monitoring**: Real-time tracking of GPU memory usage
- **Automatic Optimization**: Memory pressure detection and cache clearing
- **Model Lifecycle**: Proper loading and unloading of models
- **Configurable Limits**: Set memory limits per model or globally

## Supported Models

### Large Language Models (LLM)
- Llama 3.2 series (1B, 3B)
- Phi 3.5 Mini
- Qwen 2.5 series
- Mistral 7B

### Vision Language Models (VLM)
- Qwen2-VL series
- LLaVA 1.5

### Image Generation
- Stable Diffusion XL
- SDXL Turbo

### Speech Models
- Whisper (Tiny, Base, Small, Medium, Large)
- Bark TTS
- SpeechT5

## Performance Tips

1. **Use quantized models**: 4-bit quantization significantly reduces memory usage
2. **Monitor memory pressure**: Clear cache when pressure is high
3. **Unload unused models**: Free memory by unloading models not in use
4. **Stream long generations**: Use streaming for better responsiveness
5. **Set appropriate limits**: Configure memory limits based on device capabilities

## License

Private - Part of the Ariob project.
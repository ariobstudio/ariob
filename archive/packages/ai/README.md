# 🧠 @ariob/ai

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LynxJS](https://img.shields.io/badge/LynxJS-121212?style=for-the-badge&logo=javascript&logoColor=white)](https://lynxjs.org/)
[![MLX Swift](https://img.shields.io/badge/MLX%20Swift-ff6f3c?style=for-the-badge&logo=swift&logoColor=white)](https://swiftpackageindex.com/ml-explore/mlx-swift)

Typed helpers, hooks, and utilities for integrating MLX-powered native modules into Lynx applications.

[Overview](#-overview) • [Architecture](#-architecture) • [Features](#-features) • [Installation](#-installation) • [API Reference](#-api-reference) • [Dynamic Model Loading](#-dynamic-model-loading) • [Usage](#-usage) • [Streaming Events](#-streaming-events) • [Hooks](#-hooks) • [Advanced Usage](#-advanced-usage) • [Troubleshooting](#-troubleshooting) • [FAQ](#faq) • [Examples](#-example-configurations)

</div>

## 📋 Overview

`@ariob/ai` is a lightweight client SDK that pairs with the Swift `NativeAIModule`. It standardises JSON payloads, exposes bridge helpers for invoking native commands, and provides React hooks for subscribing to model lifecycle and streaming responses across any LynxJS app.

### Key Concepts

- **Shared contract** – Types for model metadata, request payloads, and streaming events mirror the Swift bridge to prevent mismatches.
- **Event-driven UX** – Helpers make it easy to consume `native_ai:model` and `native_ai:stream` Lynx global events.
- **Composable hooks** – React hooks wrap `useLynxGlobalEventListener` and handle stateful streaming workflows with minimal boilerplate.
- **Background optimization** – All async operations run on background threads to prevent UI blocking.
- **Type safety** – Full TypeScript support with comprehensive type definitions for all APIs.

## 🏗 Architecture

The package is organized into three main modules:

### Core Module (`core.ts`)
Contains all type definitions, interfaces, and utility functions for working with the native AI bridge:
- Type definitions for messages, models, and responses
- Event type definitions for streaming and model loading
- Utility functions for parsing and validating native responses
- Helper functions for building request payloads
- **Dynamic model configuration interfaces** (`ModelConfiguration`, `ModelRegistration`)
- **Model configuration builder** for type-safe config construction

### Operations Module (`operations.ts`)
Provides the bridge interface to the native AI module:
- Direct access to native module methods
- Async wrappers for non-blocking operations
- Model lifecycle management (load, unload, check status)
- Chat generation with retry logic
- Optimized for background thread execution
- **Dynamic model loading support** (load any HuggingFace model at runtime)

### Hooks Module (`hooks.ts`)
React hooks for integrating AI functionality into Lynx components:
- `useNativeAIStream` - Manages streaming chat responses
- `useNativeAIModelStatus` - Tracks model loading states
- `useModels` - Complete model management with auto-loading

## 🔌 Native Module Architecture

The `@ariob/ai` package bridges TypeScript code to native MLX AI capabilities through the Lynx native module system. This section explains how the JavaScript layer communicates with Swift code.

### Lynx Context Module Pattern

`NativeAIModule` implements the `LynxContextModule` protocol, which provides:

1. **Module Registration** - Automatic registration with the Lynx runtime using module name and method lookup
2. **Context Access** - Direct access to `LynxContext` for global event emission
3. **Thread Safety** - Proper dispatch to main thread for all Lynx callbacks
4. **Lifecycle Management** - Clean initialization with context injection

```swift
@objc
public final class NativeAIModule: NSObject, LynxContextModule {
    public static var name: String { "NativeAIModule" }

    public static var methodLookup: [String: String] {
        return [
            "listAvailableModels": NSStringFromSelector(#selector(listAvailableModels)),
            "loadModel": NSStringFromSelector(#selector(loadModel(_:callback:))),
            "generateChat": NSStringFromSelector(#selector(generateChat(_:callback:))),
            // ... more methods
        ]
    }

    @objc public required init(lynxContext: LynxContext) {
        self.eventEmitter = NativeAIEventEmitter(context: lynxContext)
        // ...
    }
}
```

### JavaScript ↔ Swift Bridge

The bridge now uses **native type mapping** for optimal performance, eliminating JSON serialization overhead for request parameters while maintaining JSON for responses.

#### Type Mapping (Enhanced Performance)

| TypeScript Type | Swift Type | Request Format | Response Format |
|----------------|------------|----------------|-----------------|
| `string` | `NSString` | Direct pass-through | JSON string |
| `number` | `NSNumber` / `Int` / `Double` | Native object | JSON serialized |
| `boolean` | `Bool` | Native object | JSON serialized |
| `object` | `NSDictionary` | **Native object** ✨ | JSON string |
| `array` | `NSArray` | **Native array** ✨ | JSON string |
| `function` | `@escaping (NSString) -> Void` | Callback closure | - |

> **Performance Improvement**: Request objects are now passed directly as native objects via LynxJS's native type mapping, eliminating JSON serialization overhead and improving type safety.

#### Request/Response Pattern (Optimized)

All native methods now accept native objects directly:

```typescript
// TypeScript side - NEW approach with native objects
declare let NativeModules: {
  NativeAIModule: {
    loadModel(request: { model: string }, callback: (result: string) => void): void;
    generateChat(
      model: string,
      messages: Array<{ role: string; content: string }>,
      options: { temperature?: number; maxTokens?: number },
      callback: (result: string) => void
    ): void;
  };
};

// Usage - Direct object passing (no JSON.stringify needed!)
NativeModules.NativeAIModule.loadModel(
  { model: "gemma3:2b" },  // Native object
  (result) => {
    const response = JSON.parse(result); // Response still JSON
    // handle response
  }
);
```

```swift
// Swift side - Receives native NSDictionary
public func loadModel(_ request: NSDictionary, callback: @escaping (NSString) -> Void) {
    // Direct access to native dictionary - no JSON parsing needed!
    guard let modelName = request["model"] as? String else {
        callback("{\"success\": false, \"message\": \"Missing model name\"}" as NSString)
        return
    }

    // Process request...
    callback(responseJSON as NSString)
}
```

#### Performance Benefits

The new native type mapping approach provides significant advantages:

1. **Reduced Overhead**: No JSON serialization for request parameters
2. **Better Type Safety**: TypeScript types map directly to Swift types
3. **Faster Bridge Crossing**: Native objects cross the bridge without conversion
4. **Cleaner Code**: No manual JSON.stringify() calls needed
5. **Backward Compatible**: Response handling remains unchanged

### Event System Integration

The module uses Lynx's global event system for real-time updates:

#### Event Emission (Swift → JavaScript)

```swift
// Swift: Emit event via LynxContext
context.sendGlobalEvent("native_ai:stream", withParams: [[
    "status": "chunk",
    "delta": "hello",
    "streamId": "abc123"
]])
```

```typescript
// TypeScript: Listen for events
import { useLynxGlobalEventListener } from '@lynx-js/react';

useLynxGlobalEventListener('native_ai:stream', (event) => {
  if (event.status === 'chunk') {
    console.log('Received:', event.delta);
  }
});
```

#### Event Types

The module emits two event channels:

1. **`native_ai:model`** - Model lifecycle events
   - `loading_started` - Model loading initiated
   - `download_progress` - Download progress (0-100%)
   - `loaded` - Model successfully loaded
   - `error` - Loading failed

2. **`native_ai:stream`** - Text generation events
   - `started` - Generation initiated
   - `chunk` - Text fragment received
   - `info` - Performance statistics
   - `tool_call` - Function call by model
   - `complete` - Generation finished
   - `error` - Generation failed

### Thread Safety & Concurrency

The native module implements strict thread safety:

```swift
// All callbacks dispatched to main thread
private final class NativeAICallback: @unchecked Sendable {
    func send(json: String) {
        DispatchQueue.main.async { [callback] in
            callback(json as NSString)
        }
    }
}

// Background processing with high priority
Task(priority: .userInitiated) {
    let result = await chatService.generate(...)
    callbackWrapper.send(json: result) // Auto-dispatched to main
}
```

**Key Guarantees:**
- All Lynx callbacks execute on main thread
- Model operations run on background threads (`.userInitiated` priority)
- Global events dispatched on main thread via `DispatchQueue.main.async`
- No blocking of UI thread during model loading or generation

### Registration in Lynx Applications

To use the native module in a Lynx app:

#### 1. Register Module with Lynx Runtime

The module is automatically registered when Lynx initializes native modules. No manual registration needed if properly configured in the iOS project.

#### 2. Access from TypeScript

```typescript
// The module is available globally
declare let NativeModules: {
  NativeAIModule: {
    // Method signatures from typing.d.ts
    listAvailableModels(): string;
    loadModel(requestJSON: string, callback: (result: string) => void): void;
    generateChat(requestJSON: string, callback: (result: string) => void): void;
    // ...
  };
};

// Use via operations wrapper
import { fetchAvailableModels } from '@ariob/ai';
const models = fetchAvailableModels();
```

#### 3. Initialize in App

```typescript
import { useEffect } from 'react';
import { fetchAvailableModels, loadNativeModel } from '@ariob/ai';

function App() {
  useEffect(() => {
    // Check available models on app start
    const models = fetchAvailableModels();
    console.log('Available models:', models);

    // Preload default model
    if (models.length > 0) {
      loadNativeModel(models[0].name);
    }
  }, []);

  return <YourApp />;
}
```

### Method Interface Specification

All native methods exposed to JavaScript are defined in two places:

1. **Swift Side** (`NativeAIModule.swift`):
```swift
public static var methodLookup: [String: String] {
    return [
        "loadModel": NSStringFromSelector(#selector(loadModel(_:callback:))),
        // Maps JS method name → Swift selector
    ]
}
```

2. **TypeScript Side** (`typing.d.ts`):
```typescript
declare global {
  declare let NativeModules: {
    NativeAIModule: {
      loadModel(requestJSON: string, callback: (result: string) => void): void;
      // TypeScript method signature
    };
  };
}
```

The `methodLookup` dictionary creates the bridge between JavaScript method names and Swift selectors, enabling type-safe communication across the bridge.

## 📱 Platform Support

### iOS Implementation

The iOS implementation uses Apple's MLX Swift framework for on-device AI inference with GPU acceleration.

#### Requirements

- iOS 16.0 or later
- Swift 5.9+
- Metal-compatible GPU (for hardware acceleration)
- Xcode 15.0+

#### Native Dependencies

```swift
import Foundation
import MLX              // Apple's MLX framework
import MLXLLM          // Language model support
import MLXLMCommon     // Common LM utilities
import MLXVLM          // Vision-language models
import Hub             // HuggingFace Hub integration
```

#### Configuration

The module is automatically initialized when the Lynx runtime starts. Key configuration:

**GPU/Metal Settings:**
```swift
// Default: GPU acceleration enabled
// To force CPU mode, set environment variable:
// MLX_FORCE_CPU=1
```

**Model Caching:**
- Models downloaded from HuggingFace are cached in the app's Documents directory
- Cached models persist across app launches
- Cache can be cleared via `deleteModelCache` method

#### Integration with Lynx iOS App

1. **Add to Xcode Project:**
   - Include `NativeAIModule.swift` in your Xcode project
   - Configure Lynx bridging header to import `LynxContextModule`

2. **Bridging Header Setup:**
   ```objc
   // Ariob-Bridging-Header.h
   #import <Lynx/LynxContextModule.h>
   #import <Lynx/LynxModule.h>
   ```

3. **Swift Package Dependencies:**
   Add to `Package.swift` or Xcode:
   ```swift
   dependencies: [
       .package(url: "https://github.com/ml-explore/mlx-swift", from: "0.10.0"),
       .package(url: "https://github.com/huggingface/swift-transformers", from: "0.1.0")
   ]
   ```

4. **Module Registration:**
   The module automatically registers with Lynx via the `LynxContextModule` protocol. No manual registration required.

#### Performance Characteristics

| Device | Model Size | Load Time | Inference Speed |
|--------|-----------|-----------|-----------------|
| iPhone 15 Pro | 1B (4-bit) | ~2-5s | 30-50 tok/s |
| iPhone 15 Pro | 3B (4-bit) | ~5-10s | 20-35 tok/s |
| iPhone 14 | 1B (4-bit) | ~3-8s | 20-35 tok/s |
| iPad Pro M2 | 7B (4-bit) | ~10-20s | 25-40 tok/s |

*Note: Times vary based on network speed (first download) and device thermal state*

### Android Implementation

Android support is planned for future releases and will use MLX-compatible frameworks or TensorFlow Lite.

### Web/Desktop Support

Web and desktop platforms are not currently supported as MLX requires native iOS/macOS Metal acceleration. Consider using cloud-based inference for web deployments.

### Dynamic Model Loading Architecture

The system supports loading any compatible HuggingFace model at runtime without hardcoding model definitions:

```
TypeScript Layer (packages/ai)
  ├─ ModelConfiguration interface
  │   └─ Defines: id, type, extraEOSTokens, defaultPrompt, revision
  ├─ ModelConfigurationBuilder
  │   └─ Fluent API for building valid configurations
  └─ Model loading operations
      ├─ fetchAvailableModels() - List all models
      └─ loadNativeModel() - Load any model by name or HF ID
              ↓
    JavaScript Bridge (NativeModules)
              ↓
Swift Native Layer (platforms/ios)
  ├─ NativeAIModule
  │   └─ Bridge between JS and MLX
  ├─ MLXChatService
  │   └─ Model lifecycle management
  ├─ Model Factories
  │   ├─ LLMModelFactory (text-only models)
  │   └─ VLMModelFactory (vision-language models)
  └─ HuggingFace Hub Integration
      └─ Dynamic model download and caching
```

## ✨ Features

- 🚀 **Dynamic Model Loading** – Load any HuggingFace model at runtime without app recompilation
- 🔄 **Model lifecycle helpers** – Parse `listAvailableModels` / `listLoadedModels` responses and track download progress
- 📦 **Bridge utilities** – Call native methods with `fetchAvailableModels`, `loadNativeModel`, `generateNativeChat`, and more
- ⚡ **Streaming utilities** – Build generation payloads, coerce chunk events, and maintain incremental buffers
- 🪝 **Hooks for Lynx apps** – `useNativeAIStream` and `useNativeAIModelStatus` expose ready-to-use state machines
- 🧾 **Typed contracts** – Strong TypeScript types for model summaries, statistics, and tool calls
- 🎨 **Configuration Builder** – Fluent API for building type-safe model configurations
- 🌐 **HuggingFace Integration** – Direct model downloads from HuggingFace Hub with automatic caching

## 🛠 Installation

```bash
pnpm add @ariob/ai
```

### Prerequisites

- `@lynx-js/react` ^0.114.0 (peer dependency)
- iOS app with `NativeAIModule` Swift implementation
- LynxJS runtime environment

### Package Structure

```
@ariob/ai/
├── index.ts        # Main entry point, re-exports all modules
├── core.ts         # Type definitions and core utilities
├── operations.ts   # Native bridge operations
├── hooks.ts        # React hooks for AI features
└── typing.d.ts     # Additional TypeScript definitions
```

## 📚 API Reference

### Core Types

#### `NativeAIMessage`
Represents a single message in a conversation:
```typescript
interface NativeAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

#### `NativeAIModelInfo`
Model metadata returned by the native bridge:
```typescript
interface NativeAIModelInfo {
  name: string;
  displayName?: string;
  type?: string;
  configuration?: NativeAIModelConfiguration;
  status?: string;
  loadedAt?: number;
  huggingFaceId?: string;
  revision?: string;
  cacheDirectory?: string;
}
```

#### `NativeAIStreamEvent`
Discriminated union for streaming events:
```typescript
type NativeAIStreamEvent =
  | { status: 'started'; streamId: string; model: string; ... }
  | { status: 'chunk'; streamId: string; delta: string; ... }
  | { status: 'info'; streamId: string; statistics: NativeAIStatistics; }
  | { status: 'tool_call'; streamId: string; tool: {...} }
  | { status: 'complete'; streamId: string; content: string; ... }
  | { status: 'error'; streamId: string; message: string; }
```

### Operation Functions

#### Model Management
```typescript
// Fetch available models from device
fetchAvailableModels(): NativeAIModelInfo[]
fetchAvailableModelsAsync(): Promise<NativeAIModelInfo[]>

// Get currently loaded models
fetchLoadedModelNames(): string[]
fetchLoadedModelNamesAsync(): Promise<string[]>

// Load/unload models
loadNativeModel(modelName: string): Promise<NativeResponse<...>>
unloadNativeModel(modelName: string): boolean

// Ensure model is ready
ensureModelLoaded(modelName: string, options?: { reload?: boolean }): Promise<boolean>
```

#### Dynamic Model Management

```typescript
// Register a model with a friendly name
registerModel(registration: ModelRegistration): NativeResponse<{model: string, registered: boolean}>

// Load a model with inline configuration (recommended)
loadModelWithConfig(
  name: string,
  configuration: ModelConfiguration
): Promise<NativeResponse<NativeAIModelInfo> | null>

// List all registered models
listRegisteredModels(): NativeAIModelInfo[]

interface ModelConfiguration {
  id: string;                    // HuggingFace model ID
  type: 'llm' | 'vlm';           // Model type
  extraEOSTokens?: string[];     // Extra end-of-sequence tokens
  defaultPrompt?: string;        // Default system prompt
  revision?: string;             // Git revision/branch
}

interface ModelRegistration {
  name: string;                  // Display name
  configuration: ModelConfiguration;
}
```

#### Chat Generation
```typescript
// NEW: Direct parameter passing without JSON serialization
generateNativeChat(
  modelName: string,
  messages: NativeAIMessage[],
  options?: GenerateChatOptions
): Promise<NativeResponse<...> | null>

interface GenerateChatOptions {
  temperature?: number;    // 0.0 to 1.0
  maxTokens?: number;      // Maximum tokens to generate
}

// Under the hood - Native object passing
NativeModules.NativeAIModule.generateChat(
  modelName,           // Direct string
  messages,            // Direct array (no JSON.stringify!)
  options || {},       // Direct object
  (result) => {
    const response = JSON.parse(result);
    // handle response
  }
);
```

## 🌟 Dynamic Model Loading

The system now supports loading any compatible HuggingFace model at runtime without hardcoding model definitions in Swift. This enables:

- Loading models on-demand without app recompilation
- Using the latest model versions from HuggingFace
- Supporting custom fine-tuned models
- Flexible model configuration per use case

### Quick Start: Load Any HuggingFace Model

```typescript
import { loadNativeModel } from '@ariob/ai';

// Load a model directly using its HuggingFace ID
// The system will automatically:
// - Download the model if not cached
// - Detect the model type (LLM or VLM)
// - Configure appropriate settings
await loadNativeModel('mlx-community/Llama-3.2-1B-Instruct-4bit');

// Now use it for generation
const result = await generateNativeChat(
  'mlx-community/Llama-3.2-1B-Instruct-4bit',
  [{ role: 'user', content: 'Hello!' }]
);
```

### Model Configuration API

For advanced use cases, you can configure models explicitly using the `ModelConfiguration` interface:

```typescript
import { ModelConfiguration, ModelConfigurationBuilder } from '@ariob/ai';

// Using the builder pattern (recommended)
const config = new ModelConfigurationBuilder()
  .setId('mlx-community/Qwen-3-0.5B-Instruct-4bit')
  .setType('llm')
  .setExtraEOSTokens(['</s>', '<|endoftext|>'])
  .setDefaultPrompt('You are a helpful AI assistant')
  .setRevision('main')
  .build();

// Or construct directly
const config: ModelConfiguration = {
  id: 'mlx-community/Llama-3.2-1B-Instruct-4bit',
  type: 'llm',
  extraEOSTokens: ['</s>'],
  defaultPrompt: 'You are a helpful assistant',
  revision: 'main'
};
```

### Configuration Options

#### `ModelConfiguration` Interface

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | HuggingFace model identifier (e.g., "mlx-community/Llama-3.2-1B-Instruct-4bit") |
| `type` | `'llm' \| 'vlm'` | Yes | Model type: `llm` for language models, `vlm` for vision-language models |
| `extraEOSTokens` | `string[]` | No | Additional end-of-sequence tokens beyond the default `<\|endoftext\|>` |
| `defaultPrompt` | `string` | No | Default system prompt to use with this model |
| `revision` | `string` | No | Git revision/branch to use (default: "main") |

#### Understanding `extraEOSTokens`

Different models use different tokens to mark the end of generation. Common examples:

- **Llama models**: `</s>`
- **GPT models**: `<|endoftext|>`
- **Gemma models**: `<eos>`
- **Qwen models**: `<|endoftext|>`, `<|im_end|>`

If generation doesn't stop properly, check the model's documentation for its EOS tokens.

### HuggingFace Model ID Format

Models on HuggingFace follow the format: `organization/model-name`

#### Finding Compatible Models

Look for models with these characteristics:

1. **MLX-converted models**: Search for models from `mlx-community` organization
2. **Quantized models**: Models ending in `-4bit` or `-8bit` for better mobile performance
3. **Instruction-tuned models**: Models with "Instruct" or "Chat" in the name

#### Popular Model Examples

```typescript
// Small, fast models (1-3B parameters) - ideal for mobile
'mlx-community/Llama-3.2-1B-Instruct-4bit'
'mlx-community/Qwen-3-0.5B-Instruct-4bit'
'mlx-community/Phi-3.5-mini-instruct-4bit'
'mlx-community/gemma-2b-it-4bit'

// Medium models (7-8B parameters) - good balance
'mlx-community/Llama-3.2-7B-Instruct-4bit'
'mlx-community/Mistral-7B-Instruct-v0.3-4bit'

// Vision-language models
'mlx-community/llava-1.5-7b-4bit'
'mlx-community/llava-phi-3-mini-4bit'
```

### Using the Configuration Builder

The `ModelConfigurationBuilder` provides a fluent API with validation:

```typescript
import { ModelConfigurationBuilder } from '@ariob/ai';

const builder = new ModelConfigurationBuilder();

// Build a basic configuration
const config1 = builder
  .setId('mlx-community/Llama-3.2-1B-Instruct-4bit')
  .setType('llm')
  .build();

// Reuse builder for another model
const config2 = builder
  .reset()
  .setId('mlx-community/llava-1.5-7b-4bit')
  .setType('vlm')
  .setDefaultPrompt('Describe images in detail')
  .build();

// Conditional configuration
if (requiresCustomTokens) {
  builder.setExtraEOSTokens(['<|end|>', '</response>']);
}

const config3 = builder.build();
```

### Model Registration vs Inline Loading

There are two ways to work with models:

#### Option 1: Direct Loading (Simple)

Load models directly using their HuggingFace ID:

```typescript
// The simplest approach - just use the HuggingFace ID
await loadNativeModel('mlx-community/Llama-3.2-1B-Instruct-4bit');

// Use it immediately
await generateNativeChat(
  'mlx-community/Llama-3.2-1B-Instruct-4bit',
  messages
);
```

#### Option 2: Register with Friendly Name (Advanced)

Register models with friendly names for easier reference:

```typescript
import { registerModel, ModelConfigurationBuilder } from '@ariob/ai';

// Register a model with a friendly name
const config = new ModelConfigurationBuilder()
  .setId('mlx-community/Llama-3.2-1B-Instruct-4bit')
  .setType('llm')
  .setExtraEOSTokens(['</s>'])
  .build();

await registerModel({
  name: 'Llama 3.2 1B',
  configuration: config
});

// Now load using the friendly name
await loadNativeModel('Llama 3.2 1B');

// Use the friendly name for generation
await generateNativeChat('Llama 3.2 1B', messages);
```

Benefits of registration:
- Shorter, more readable names in UI
- Centralized configuration management
- Easier to swap models by changing registration

### Migration from Hardcoded Models

If you were using hardcoded model names like `gemma3n:E2B`, the system remains backward compatible. However, new code should use HuggingFace IDs directly:

```typescript
// Old approach (still works)
await loadNativeModel('gemma3n:E2B');

// New approach (recommended)
await loadNativeModel('mlx-community/gemma-2b-it-4bit');
```

### Example: Complete Model Loading Workflow

```typescript
import {
  ModelConfigurationBuilder,
  registerModel,
  loadNativeModel,
  generateNativeChat,
  fetchAvailableModels,
  fetchLoadedModelNames
} from '@ariob/ai';

// 1. Build a model configuration
const config = new ModelConfigurationBuilder()
  .setId('mlx-community/Llama-3.2-1B-Instruct-4bit')
  .setType('llm')
  .setExtraEOSTokens(['</s>'])
  .setDefaultPrompt('You are a helpful, concise assistant')
  .build();

// 2. Register with a friendly name (optional)
await registerModel({
  name: 'Llama 1B Assistant',
  configuration: config
});

// 3. Check what models are available
const available = fetchAvailableModels();
console.log('Available models:', available.map(m => m.name));

// 4. Load the model
console.log('Loading model...');
const loadResult = await loadNativeModel('Llama 1B Assistant');

if (!loadResult?.success) {
  console.error('Failed to load:', loadResult?.message);
  return;
}

// 5. Verify it's loaded
const loaded = fetchLoadedModelNames();
console.log('Loaded models:', loaded);

// 6. Generate a response
const response = await generateNativeChat(
  'Llama 1B Assistant',
  [{ role: 'user', content: 'Explain quantum computing in one sentence' }],
  { temperature: 0.7, maxTokens: 100 }
);

if (response?.success) {
  console.log('Response:', response.data);
}
```

## 🚀 Usage

### Building Requests & Parsing Responses

```ts
import {
  DEFAULT_SYSTEM_PROMPT,
  fetchAvailableModels,
  generateNativeChat,
  loadNativeModel,
  type NativeAIMessage,
} from '@ariob/ai';

const models = fetchAvailableModels();
await loadNativeModel(models[0]?.name ?? 'gemma3n:E2B');

const conversation: NativeAIMessage[] = [
  { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
  { role: 'user', content: 'Hello there!' },
];

const result = await generateNativeChat('gemma3n:E2B', conversation);
console.log(result?.success ? 'Generation complete' : result?.message);
```

### Helpers

```ts
import {
  ensureModelLoaded,
  fetchAvailableModels,
  fetchLoadedModelNames,
  generateNativeChat,
  loadNativeModel,
  unloadNativeModel,
} from '@ariob/ai';

const available = fetchAvailableModels();
const loaded = fetchLoadedModelNames();

if (available.length && !loaded.includes(available[0].name)) {
  await ensureModelLoaded(available[0].name);
}

const response = await generateNativeChat(available[0].name, [
  { role: 'user', content: 'Ping' },
]);

if (!response?.success) {
  console.warn(response?.message);
}

// Free memory when required
unloadNativeModel(available[0].name);
```

## 📡 Streaming Events

All MLX streaming updates are published as Lynx global events:

- `native_ai:model` – emits `{ type: 'loading_started' | 'download_progress' | 'loaded' | 'error' }`.
- `native_ai:stream` – emits `{ status: 'started' | 'chunk' | 'info' | 'tool_call' | 'complete' | 'error' }` with metadata.

Use the high-level hooks to react to these events without wiring listeners by hand:

```ts
import { useNativeAIModelStatus, useNativeAIStream } from '@ariob/ai';

const modelStatus = useNativeAIModelStatus();

useNativeAIStream({
  onChunk: (event) => console.log('delta:', event.delta),
  onComplete: (event) => console.log('final:', event.content),
  onError: (event) => console.error(event.message),
});
```

## 🪝 Hooks

### `useNativeAIStream`
Manages streaming chat responses with real-time updates:

```typescript
const stream = useNativeAIStream({
  onChunk?: (event) => void,      // Called for each text chunk
  onComplete?: (event) => void,    // Called when generation completes
  onError?: (event) => void,       // Called on error
  onInfo?: (event) => void,        // Called with statistics
  onToolCall?: (event) => void,    // Called for tool invocations
  onStarted?: (event) => void,     // Called when stream starts
});

// Returns:
interface NativeAIStreamState {
  streamId: string | null;
  model: string | null;
  content: string;              // Accumulated content
  statistics: NativeAIStatistics | null;
  pending: boolean;              // True while streaming
}
```

### `useNativeAIModelStatus`
Tracks model loading progress and state:

```typescript
const status = useNativeAIModelStatus();

// Returns:
interface NativeAIModelStatus {
  model: string;
  state: 'idle' | 'loading' | 'loaded' | 'error';
  percentage?: number;          // Download progress 0-100
  message?: string;             // Error message if failed
  summary?: Record<string, unknown>;
}
```

### `useModels`
Complete model management with auto-loading:

```typescript
const {
  availableModels,    // All available models
  loadedModelNames,   // Currently loaded models
  selectedModel,      // Selected model name
  isLoading,          // Loading state
  error,              // Error message
  loadModel,          // Load a specific model
  selectModel,        // Select and auto-load model
  refreshModels,      // Refresh model lists
} = useModels({
  autoLoadFirst?: boolean,  // Auto-load first model (default: true)
  preloadAll?: boolean,     // Preload all models (default: false)
});
```

### Example Component

```tsx
import { useNativeAIStream, useNativeAIModelStatus, useModels } from '@ariob/ai';

function AssistantPanel() {
  const stream = useNativeAIStream({
    onComplete: (event) => {
      console.log('Generation complete:', event.content);
      console.log('Tokens per second:', event.metadata?.statistics?.tokensPerSecond);
    },
  });

  const modelStatus = useNativeAIModelStatus();
  const { availableModels, selectedModel, selectModel } = useModels();

  return (
    <view>
      {/* Model selector */}
      <select value={selectedModel} onChange={(e) => selectModel(e.target.value)}>
        {availableModels.map(model => (
          <option key={model.name} value={model.name}>
            {model.displayName || model.name}
          </option>
        ))}
      </select>

      {/* Loading indicator */}
      {modelStatus?.state === 'loading' && (
        <text>Loading model: {modelStatus.percentage}%</text>
      )}

      {/* Stream output */}
      <text>{stream.pending ? 'Generating...' : stream.content}</text>

      {/* Statistics */}
      {stream.statistics && (
        <view>
          <text>Prompt tokens: {stream.statistics.promptTokenCount}</text>
          <text>Generated tokens: {stream.statistics.generationTokenCount}</text>
          <text>Speed: {stream.statistics.tokensPerSecond?.toFixed(1)} tok/s</text>
        </view>
      )}
    </view>
  );
}
```

## 🚀 Advanced Usage

### Conversation Management

```typescript
import { generateNativeChat, type NativeAIMessage } from '@ariob/ai';

class ConversationManager {
  private messages: NativeAIMessage[] = [];

  constructor(systemPrompt: string = 'You are a helpful assistant.') {
    this.messages.push({ role: 'system', content: systemPrompt });
  }

  async sendMessage(userMessage: string, model: string) {
    // Add user message
    this.messages.push({ role: 'user', content: userMessage });

    // Generate response
    const response = await generateNativeChat(model, this.messages, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    if (response?.success && response.data) {
      const content = (response.data as any).content;
      this.messages.push({ role: 'assistant', content });
      return content;
    }

    throw new Error(response?.message || 'Generation failed');
  }

  clearHistory() {
    this.messages = this.messages.slice(0, 1); // Keep system prompt
  }
}
```

### Custom Event Handling

```typescript
import { useLynxGlobalEventListener } from '@lynx-js/react';
import { NATIVE_AI_STREAM_EVENT, coerceStreamEventPayload } from '@ariob/ai';

function CustomStreamHandler() {
  const [tokens, setTokens] = useState<string[]>([]);

  useLynxGlobalEventListener(NATIVE_AI_STREAM_EVENT, (raw: unknown) => {
    const event = coerceStreamEventPayload(raw);
    if (!event) return;

    if (event.status === 'chunk') {
      setTokens(prev => [...prev, event.delta]);
    } else if (event.status === 'complete') {
      console.log('Total tokens:', tokens.length);
    }
  });

  return <view>{tokens.join('')}</view>;
}
```

### Performance Optimization

```typescript
// Use async versions to prevent UI blocking
const models = await fetchAvailableModelsAsync();
const loaded = await fetchLoadedModelNamesAsync();

// Background model preloading
async function preloadModels(modelNames: string[]) {
  const loadPromises = modelNames.map(name =>
    loadNativeModel(name).catch(err =>
      console.error(`Failed to preload ${name}:`, err)
    )
  );

  await Promise.all(loadPromises);
}

// Retry logic for resilient generation
async function generateWithRetry(
  model: string,
  messages: NativeAIMessage[],
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await generateNativeChat(model, messages);
      if (result?.success) return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## 🩹 Troubleshooting

### Common Issues

- **No events received**: Ensure `NativeAIModule` is registered as a `LynxContextModule` so `sendGlobalEvent` is available.
- **Model progress stuck**: Check device logs for `[MLXChatService]` messages; the Swift bridge publishes progress only when MLX reports updates.
- **TypeScript resolution error**: Add a path alias (e.g. `"@ariob/ai": ["../../packages/ai/index.ts"]`) if your bundler lacks workspace awareness.
- **Model loading timeout**: The default timeout is 60 seconds. For large models, consider implementing custom timeout logic.
- **Memory issues**: Use `unloadNativeModel()` to free memory when models are not in use.

### Dynamic Model Loading Issues

#### Model Not Found on HuggingFace

```typescript
// Error: Model 'user/my-model' not found

// Solution 1: Verify the model ID is correct
// Visit https://huggingface.co/user/my-model to confirm it exists

// Solution 2: Use mlx-community models which are pre-converted
await loadNativeModel('mlx-community/Llama-3.2-1B-Instruct-4bit');
```

#### Generation Doesn't Stop

```typescript
// Issue: Model keeps generating past the expected end

// Solution: Add appropriate EOS tokens
const config = new ModelConfigurationBuilder()
  .setId('mlx-community/model-4bit')
  .setType('llm')
  .setExtraEOSTokens(['</s>', '<|endoftext|>', '<eos>']) // Add model-specific tokens
  .build();

await loadModelWithConfig('my-model', config);
```

#### Model Type Detection Fails

```typescript
// Error: Could not determine model type

// Solution: Explicitly specify the type
const config: ModelConfiguration = {
  id: 'mlx-community/my-custom-model',
  type: 'llm', // or 'vlm' for vision-language models
};

await loadModelWithConfig('custom', config);
```

#### Registration vs Loading Confusion

```typescript
// Registration makes models available but doesn't load them
registerModel({
  name: 'My Model',
  configuration: { id: 'mlx-community/model', type: 'llm' }
});

// You still need to load it
await loadNativeModel('My Model');

// OR use loadModelWithConfig for one-step loading
await loadModelWithConfig('My Model', {
  id: 'mlx-community/model',
  type: 'llm'
});
```

### Debug Logging

Enable verbose logging to troubleshoot issues:

```typescript
// Set debug mode
if (__DEV__) {
  console.log('[NativeAI] Debug mode enabled');
}

// Monitor all events
useLynxGlobalEventListener(NATIVE_AI_STREAM_EVENT, (event) => {
  console.log('[Stream Event]', event);
});

useLynxGlobalEventListener(NATIVE_AI_MODEL_EVENT, (event) => {
  console.log('[Model Event]', event);
});
```

### Native Bridge Verification

```typescript
// Check if native module is available
declare const NativeModules: any;
const hasNativeAI = !!NativeModules?.NativeAIModule;
console.log('Native AI available:', hasNativeAI);

// Verify bridge methods
const module = NativeModules?.NativeAIModule;
console.log('Available methods:', Object.keys(module || {}));

// Check for dynamic loading support
console.log('Has registerModel:', !!module?.registerModel);
console.log('Has loadModelWithConfig:', !!module?.loadModelWithConfig);
```

## FAQ

### General Questions

**Q: Can I use any HuggingFace model?**

A: You can use any model that meets these criteria:
- Available in the MLX format (look for `mlx-community` models)
- Compatible with the MLX Swift framework
- Supported architecture (Llama, Qwen, Gemma, Mistral, Phi, etc.)

Most popular instruction-tuned models have MLX versions in the `mlx-community` organization.

**Q: How do I find compatible model IDs?**

A: Search HuggingFace for models from the `mlx-community` organization:
1. Visit https://huggingface.co/mlx-community
2. Look for models ending in `-4bit` or `-8bit` (quantized for mobile)
3. Check for "Instruct" or "Chat" in the name for instruction-tuned models
4. Read the model card to verify MLX compatibility

**Q: What's the difference between `registerModel` and `loadModelWithConfig`?**

A:
- **`registerModel`**: Adds a model configuration to the registry with a friendly name. The model is NOT loaded into memory, just registered. Use `loadNativeModel(name)` to load it later.
- **`loadModelWithConfig`**: Loads a model immediately with inline configuration. One-step operation that both configures and loads.

Choose `registerModel` for centralized config management and `loadModelWithConfig` for one-off dynamic loading.

**Q: Can I still use the hardcoded models?**

A: Yes! Backward compatibility is maintained. If your app has hardcoded models like `gemma3n:E2B`, they will continue to work. However, new code should use HuggingFace IDs for maximum flexibility.

**Q: How do I know what `extraEOSTokens` to use?**

A: Check the model's HuggingFace page:
1. Look for the model's tokenizer configuration
2. Check the model card documentation
3. Common patterns:
   - Llama: `['</s>']`
   - Qwen: `['<|endoftext|>', '<|im_end|>']`
   - Gemma: `['<eos>']`

If generation doesn't stop properly, try adding the default token: `['<|endoftext|>']`

### Dynamic Loading Questions

**Q: Do I need to download models manually?**

A: No! The system automatically downloads models from HuggingFace when you first load them. Downloads are cached locally for future use.

**Q: How much storage do models require?**

A: Quantized models (4-bit) are much smaller:
- 1B parameter model: ~500MB-1GB
- 3B parameter model: ~2GB-3GB
- 7B parameter model: ~4GB-5GB

Use 4-bit quantized models for mobile deployments.

**Q: Can I load multiple models simultaneously?**

A: Yes, but be mindful of memory constraints:

```typescript
// Load multiple models
await loadNativeModel('mlx-community/Llama-3.2-1B-Instruct-4bit');
await loadNativeModel('mlx-community/Qwen-3-0.5B-Instruct-4bit');

// Check what's loaded
const loaded = fetchLoadedModelNames();
console.log('Loaded:', loaded); // ['mlx-community/Llama-3.2-1B-Instruct-4bit', ...]

// Unload when done to free memory
unloadNativeModel('mlx-community/Llama-3.2-1B-Instruct-4bit');
```

**Q: How do I update to a newer model version?**

A: Simply change the HuggingFace ID or revision:

```typescript
// Update to a new revision
const config: ModelConfiguration = {
  id: 'mlx-community/model-name',
  type: 'llm',
  revision: 'v2.0' // Specify version/branch
};

await loadModelWithConfig('my-model', config);
```

**Q: Can I use my own fine-tuned models?**

A: Yes! Upload your MLX-converted model to HuggingFace and use its ID:

```typescript
const config: ModelConfiguration = {
  id: 'your-username/your-finetuned-model',
  type: 'llm'
};

await loadModelWithConfig('my-custom-model', config);
```

### Performance Questions

**Q: How can I improve model loading speed?**

A:
1. Use quantized models (4-bit)
2. Preload models during app initialization
3. Keep frequently-used models loaded in memory
4. Use WiFi for initial downloads (models are cached afterward)

**Q: Why is generation slow on my device?**

A: Several factors affect performance:
- Model size (smaller models = faster)
- Device GPU capabilities
- Quantization level (4-bit = faster than 8-bit)
- Temperature setting (lower = faster, higher = more creative but slower)

Try using smaller models (1B-3B parameters) on mobile devices.

**Q: How do I choose between LLM and VLM models?**

A:
- **LLM (Language Model)**: Text-only input/output. Use for chat, summarization, coding, etc.
- **VLM (Vision-Language Model)**: Accepts both images and text. Use for image description, visual Q&A, OCR, etc.

Choose based on your use case. VLMs are larger and slower but handle multimodal input.

## 📋 Example Configurations

For quick starts, check out our curated model configurations in [`examples/model-configurations.ts`](/Users/aethiop/Documents/Dev/ariob/packages/ai/examples/model-configurations.ts):

```typescript
import {
  MOBILE_LLM_MODELS,
  STANDARD_LLM_MODELS,
  CODE_MODELS,
  VISION_LANGUAGE_MODELS,
  RECOMMENDED_MODELS,
  selectModelForDevice
} from '@ariob/ai/examples/model-configurations';

// Use a pre-configured model
await loadModelWithConfig('llama-1b', MOBILE_LLM_MODELS.llama_1b);

// Use recommended defaults
await loadModelWithConfig('default', RECOMMENDED_MODELS.MOBILE_DEFAULT);

// Auto-select based on device
const config = selectModelForDevice(
  deviceMemoryGB,
  availableStorageGB
);
await loadModelWithConfig('auto', config);
```

### Available Example Categories

- **Mobile Models** (`MOBILE_LLM_MODELS`): 1B-3B parameter models optimized for mobile
  - Llama 1B, Qwen 500M, Phi 3.5 Mini, Gemma 2B

- **Standard Models** (`STANDARD_LLM_MODELS`): 7B-8B parameter models for better quality
  - Llama 7B, Mistral 7B, Qwen 7B

- **Code Models** (`CODE_MODELS`): Specialized for programming tasks
  - Qwen Coder 1.5B, Qwen Coder 7B

- **Vision Models** (`VISION_LANGUAGE_MODELS`): Image understanding capabilities
  - LLaVA 7B, LLaVA Phi Mini

- **Multilingual Models** (`MULTILINGUAL_MODELS`): Strong non-English support
  - Qwen 3B Multilingual

Each configuration includes:
- Optimized `extraEOSTokens` for the model
- Appropriate `defaultPrompt`
- Size and performance characteristics
- Use case recommendations

## 📖 Additional Resources

- Swift Implementation: [`NativeAIModule.swift`](../../platforms/ios/Ariob/Ariob/modules/NativeAIModule.swift)
- Example App: [`apps/chat`](../../apps/chat)
- LynxJS Documentation: [lynxjs.org](https://lynxjs.org)
- MLX Swift: [github.com/ml-explore/mlx-swift](https://github.com/ml-explore/mlx-swift)
- HuggingFace MLX Models: [huggingface.co/mlx-community](https://huggingface.co/mlx-community)

## 📄 License

Private package - See repository root for license information.

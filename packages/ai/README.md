# 🧠 @ariob/ai

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LynxJS](https://img.shields.io/badge/LynxJS-121212?style=for-the-badge&logo=javascript&logoColor=white)](https://lynxjs.org/)
[![MLX Swift](https://img.shields.io/badge/MLX%20Swift-ff6f3c?style=for-the-badge&logo=swift&logoColor=white)](https://swiftpackageindex.com/ml-explore/mlx-swift)

Typed helpers, hooks, and utilities for integrating MLX-powered native modules into Lynx applications.

[Overview](#-overview) • [Architecture](#-architecture) • [Features](#-features) • [Installation](#-installation) • [API Reference](#-api-reference) • [Usage](#-usage) • [Streaming Events](#-streaming-events) • [Hooks](#-hooks) • [Advanced Usage](#-advanced-usage) • [Troubleshooting](#-troubleshooting)

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

### Operations Module (`operations.ts`)
Provides the bridge interface to the native AI module:
- Direct access to native module methods
- Async wrappers for non-blocking operations
- Model lifecycle management (load, unload, check status)
- Chat generation with retry logic
- Optimized for background thread execution

### Hooks Module (`hooks.ts`)
React hooks for integrating AI functionality into Lynx components:
- `useNativeAIStream` - Manages streaming chat responses
- `useNativeAIModelStatus` - Tracks model loading states
- `useModels` - Complete model management with auto-loading

## ✨ Features

- 🔄 **Model lifecycle helpers** – Parse `listAvailableModels` / `listLoadedModels` responses and track download progress.
- 📦 **Bridge utilities** – Call native methods with `fetchAvailableModels`, `loadNativeModel`, `generateNativeChat`, and more.
- ⚡ **Streaming utilities** – Build generation payloads, coerce chunk events, and maintain incremental buffers.
- 🪝 **Hooks for Lynx apps** – `useNativeAIStream` and `useNativeAIModelStatus` expose ready-to-use state machines.
- 🧾 **Typed contracts** – Strong TypeScript types for model summaries, statistics, and tool calls.

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

#### Chat Generation
```typescript
generateNativeChat(
  modelName: string,
  messages: NativeAIMessage[],
  options?: GenerateChatOptions
): Promise<NativeResponse<...> | null>

interface GenerateChatOptions {
  temperature?: number;    // 0.0 to 1.0
  maxTokens?: number;      // Maximum tokens to generate
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
```

## 📖 Additional Resources

- Swift Implementation: [`NativeAIModule.swift`](../../platforms/ios/Ariob/Ariob/modules/NativeAIModule.swift)
- Example App: [`apps/chat`](../../apps/chat)
- LynxJS Documentation: [lynxjs.org](https://lynxjs.org)
- MLX Swift: [github.com/ml-explore/mlx-swift](https://github.com/ml-explore/mlx-swift)

## 📄 License

Private package - See repository root for license information.

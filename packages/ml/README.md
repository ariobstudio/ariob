# @ariob/ml

On-device AI for Ariob using React Native ExecuTorch.

## Features

- **On-device inference** - No cloud API calls, full privacy
- **Multiple model support** - LLaMA 3.2, SmolLM, Qwen
- **Ripple AI companion** - Pre-configured hook with Ripple's personality
- **Streaming responses** - Real-time token-by-token output

## Installation

```bash
pnpm add @ariob/ml react-native-executorch
```

## Quick Start

```tsx
import { useRippleAI } from '@ariob/ml';

function RippleChat() {
  const { response, isReady, sendMessage, isGenerating, downloadProgress } = useRippleAI();

  if (!isReady) {
    return <Text>Loading Ripple... {Math.round(downloadProgress * 100)}%</Text>;
  }

  return (
    <View>
      {isGenerating && <Text>Thinking...</Text>}
      <Text>{response}</Text>
      <Button onPress={() => sendMessage('Hello!')} title="Send" />
    </View>
  );
}
```

## Available Models

| Model | Size | RAM Required | Best For |
|-------|------|--------------|----------|
| `SMOLLM_135M` | ~135MB | ~500MB | Low-end devices, fast responses |
| `QWEN_0_5B` | ~500MB | ~1.5GB | Mid-range devices |
| `LLAMA3_2_1B` | ~1GB | ~3.2GB | High-quality responses |

## API Reference

### `useRippleAI(options?)`

Returns an interface for chatting with the Ripple AI companion.

**Options:**
- `model` - Override the default model (default: `SMOLLM_135M`)
- `systemPrompt` - Override Ripple's personality prompt

**Returns:**
- `response` - Current AI response (streams during generation)
- `isReady` - Whether the model is loaded
- `isGenerating` - Whether AI is currently responding
- `downloadProgress` - Model download progress (0-1)
- `error` - Error message if something went wrong
- `sendMessage(text)` - Send a message to the AI
- `interrupt()` - Stop current generation
- `messageHistory` - Full conversation history

## Requirements

- React Native 0.70+
- iOS 15+ or Android 10+
- Device with sufficient RAM for chosen model

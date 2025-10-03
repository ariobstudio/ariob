# 💬 Chat Application

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LynxJS](https://img.shields.io/badge/LynxJS-121212?style=for-the-badge&logo=javascript&logoColor=white)](https://lynxjs.org/)
[![AI Powered](https://img.shields.io/badge/AI_Powered-MLX-ff6f3c?style=for-the-badge)](https://github.com/ml-explore/mlx-swift)

A sophisticated AI chat application built with Lynx, featuring on-device language models powered by MLX Swift.

[Overview](#-overview) • [Architecture](#-architecture) • [Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Components](#-components) • [Configuration](#-configuration) • [Development](#-development)

</div>

## 📋 Overview

The Chat application is a production-ready, cross-platform conversational AI interface that leverages on-device language models for private, responsive interactions. Built with the Lynx framework, it provides a native experience on iOS while supporting web fallbacks.

### Key Highlights

- 🤖 **On-Device AI** - Runs language models locally using MLX Swift integration
- 🎨 **Beautiful UI** - Modern chat interface with dark/light theme support
- ⚡ **Real-Time Streaming** - Token-by-token response streaming with live statistics
- 📱 **Native Performance** - Optimized for iOS with hardware acceleration
- 🔒 **Privacy-First** - All conversations stay on device, no cloud dependencies
- 🎯 **Model Management** - Dynamic model loading and selection interface

## 🏗 Architecture

### Application Structure

```
apps/chat/
├── src/
│   ├── components/
│   │   └── ModelSelector.tsx   # Model selection UI component
│   ├── styles/
│   │   └── globals.css         # Global styles and Tailwind config
│   ├── App.tsx                 # Main chat application component
│   └── index.tsx               # Application entry point
├── lynx.config.ts              # Lynx framework configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json               # Dependencies and scripts
```

### Core Dependencies

- **@ariob/ai** - Native AI integration for model management and generation
- **@ariob/ui** - UI component library with primitives and styled components
- **@lynx-js/react** - Lynx React bindings for cross-platform development
- **tailwindcss** - Utility-first CSS framework

### Threading Model

The application uses Lynx's sophisticated threading model:

1. **Background Thread (Default)** - State updates and async operations
2. **Main Thread** - UI rendering and user interactions
3. **Bridge Communication** - Efficient message passing between threads

```tsx
// Background thread execution (default)
const handleStateUpdate = useCallback(() => {
  setMessages(prev => [...prev, newMessage]);
}, []);

// Explicit main thread execution
const handleUIInteraction = useCallback(() => {
  'main thread';
  // Immediate visual feedback
  runOnBackground(() => {
    // Heavy computation on background
  })();
}, []);
```

## ✨ Features

### Chat Interface

- **Message Bubbles** - Distinct styling for user, assistant, and system messages
- **Streaming Responses** - Real-time token generation with visual feedback
- **Conversation Management** - Clear conversation and message history
- **Error Handling** - Graceful error states with user-friendly messages
- **Keyboard Integration** - Native keyboard handling with proper insets

### Model Management

- **Dynamic Loading** - Load models on-demand from device storage
- **Model Selection** - Switch between available language models
- **Loading States** - Visual indicators for model loading progress
- **Memory Management** - Automatic model unloading when not in use

### Performance Features

- **Optimized Rendering** - Minimal re-renders with React optimization
- **Background Processing** - Heavy operations off the main thread
- **Native Animations** - Smooth transitions using native capabilities
- **Efficient Scrolling** - Virtualized scroll for long conversations

## 🛠 Installation

### Prerequisites

- Node.js 18+
- pnpm package manager
- iOS development environment (Xcode)
- Lynx CLI tools

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/ariob.git

# Navigate to chat app
cd apps/chat

# Install dependencies
pnpm install

# Build the application
pnpm build

# Start development server
pnpm dev
```

### iOS Deployment

1. Build the Lynx bundle:
   ```bash
   pnpm build
   ```

2. Copy bundle to iOS app:
   ```bash
   cp dist/chat.lynx.bundle ../platforms/ios/Ariob/Resources/
   ```

3. Open Xcode and run on device/simulator

## 🚀 Usage

### Basic Chat Flow

1. **Select a Model** - Choose from available on-device models
2. **Wait for Loading** - Model loads into memory (first time only)
3. **Start Chatting** - Type messages and receive AI responses
4. **Manage Conversation** - Clear history or switch models as needed

### Model Selection

```tsx
// The app handles model selection automatically
const {
  availableModels,    // List of available models
  selectedModel,      // Currently selected model
  loadedModels,       // Models in memory
  selectModel,        // Function to select a model
  loadModel,          // Function to load a model
} = useModels({ autoLoadFirst: true });
```

### Message Handling

```tsx
// Messages are managed through state
const [messages, setMessages] = useState<ChatMessage[]>([
  { role: 'system', content: SYSTEM_PROMPT }
]);

// Send a message
const handleSendMessage = async () => {
  const userMessage = { role: 'user', content: prompt };
  const assistantPlaceholder = { role: 'assistant', content: '', pending: true };

  setMessages([...messages, userMessage, assistantPlaceholder]);

  // Generate response
  const result = await generateNativeChat(selectedModel, messages);
};
```

## 🧩 Components

### App Component

The main application component managing the entire chat interface.

**Key Features:**
- Message state management
- Model selection integration
- Stream event handling
- Keyboard management
- Theme integration

**State Management:**
```tsx
interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  pending?: boolean;
  createdAt?: number;
}

// Core state
const [messages, setMessages] = useState<ChatMessage[]>();
const [prompt, setPrompt] = useState('');
const [isGenerating, setIsGenerating] = useState(false);
const [statistics, setStatistics] = useState<NativeAIStatistics>();
```

### ModelSelector Component

Dropdown component for selecting available language models.

**Props:**
```tsx
interface ModelSelectorProps {
  onModelSelect: (modelName: string) => Promise<void>;
}
```

**Features:**
- Lists available models
- Shows loaded state
- Displays model metadata
- Handles loading states

### Message Bubble

Custom component for rendering chat messages.

**Features:**
- Role-based styling
- Timestamp display
- Avatar icons
- Animation states
- Responsive sizing

```tsx
const MessageBubble = ({ message, palette }) => {
  const alignmentClass = message.role === 'user' ? 'self-end' : 'self-start';
  const bubbleStateClass = message.pending ? 'animate-pulse' : '';

  return (
    <view className={`${palette.bubble} ${alignmentClass} ${bubbleStateClass}`}>
      {/* Message content */}
    </view>
  );
};
```

## ⚙️ Configuration

### Lynx Configuration

```typescript
// lynx.config.ts
export default {
  app: {
    name: 'Chat',
    version: '1.0.0',
  },
  build: {
    entry: './src/index.tsx',
    output: './dist',
  },
  plugins: [
    // Plugin configuration
  ],
};
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  presets: [require('@lynx-js/tailwind-preset')],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
};
```

### System Prompt

Customize the AI's behavior by modifying the system prompt:

```tsx
const CUSTOM_SYSTEM_PROMPT = `You are a conversational AI focused on engaging
in authentic dialogue. Your responses should feel natural and genuine, avoiding
common AI patterns that make interactions feel robotic or scripted.`;
```

## 🔧 Development

### Local Development

```bash
# Start development server with hot reload
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Debugging

1. **Enable Debug Logging**:
   ```tsx
   console.log('[AI Event] Model selected:', modelName);
   console.log('[UI Event] Send message triggered');
   console.log('[Stream Event] Chunk received:', event);
   ```

2. **Chrome DevTools**: Connect to the Lynx debugger for web debugging

3. **Xcode Console**: View native logs when running on iOS

### Performance Profiling

```tsx
// Measure generation time
const startTime = Date.now();
const result = await generateNativeChat(model, messages);
const duration = Date.now() - startTime;
console.log(`Generation took ${duration}ms`);

// Monitor memory usage
if (__DEV__) {
  console.log('Loaded models:', loadedModels.length);
}
```

## 🎨 Styling

### Theme Support

The app supports both light and dark themes:

```tsx
const { withTheme } = useTheme();

// Conditional styling based on theme
const headerClass = withTheme(
  'bg-slate-50 border-slate-200', // Light theme
  'bg-slate-800 border-slate-700'  // Dark theme
);
```

### Custom Styling

Extend or override styles using Tailwind classes:

```tsx
<view className="custom-class bg-primary text-primary-foreground">
  {/* Component content */}
</view>
```

### Responsive Design

The app is responsive and adapts to different screen sizes:

```tsx
<view className="px-4 sm:px-6 md:px-8">
  <view className="max-w-2xl mx-auto">
    {/* Centered content with max width */}
  </view>
</view>
```

## 🔄 State Management

### Message State

Messages are managed through React state with optimized updates:

```tsx
// Deferred updates for performance
const scheduleMessagesUpdate = useCallback(
  (updater: (previous: ChatMessage[]) => ChatMessage[]) => {
    setTimeout(() => {
      setMessages(updater);
    }, 0);
  },
  []
);
```

### Stream State

Real-time streaming managed through custom hooks:

```tsx
const streamSnapshot = useNativeAIStream({
  onChunk: (event) => {
    updateMessageById(targetId, message => ({
      ...message,
      content: event.content,
    }));
  },
  onComplete: (event) => {
    setIsGenerating(false);
    setStatistics(event.metadata?.statistics);
  },
});
```

## 🚨 Error Handling

### User-Friendly Errors

```tsx
if (!selectedModel) {
  setErrorMessage('Please select a model before sending a message.');
  return;
}

if (!ensureModelLoaded(selectedModel)) {
  setErrorMessage(`Model "${selectedModel}" is not ready yet.`);
  return;
}
```

### Recovery Strategies

- Automatic retry for failed generations
- Graceful degradation for missing models
- Clear error messages with actionable steps

## 📊 Performance Metrics

The app displays real-time performance statistics:

- **Prompt Tokens**: Number of input tokens
- **Generation Tokens**: Number of output tokens
- **Tokens per Second**: Generation speed
- **Total Time**: End-to-end generation time

## 🔒 Security & Privacy

- **On-Device Processing**: All AI inference happens locally
- **No Cloud Dependencies**: Works offline after model download
- **Data Privacy**: Conversations never leave the device
- **Secure Storage**: Models cached securely on device

## 📚 Resources

- [Lynx Documentation](https://lynxjs.org)
- [MLX Swift](https://github.com/ml-explore/mlx-swift)
- [@ariob/ai Package](../../packages/ai/README.md)
- [@ariob/ui Package](../../packages/ui/README.md)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

Private application - See repository root for license information.
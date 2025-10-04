# 📦 Ariob Packages

<div align="center">

Shared packages and libraries for the Ariob decentralized application platform.

</div>

## 📋 Overview

This directory contains the core packages that power the Ariob platform. These packages are designed to be modular, reusable, and provide a clean API for building decentralized applications.

## 🎯 Available Packages

### [@ariob/core](./core/) 

The foundational package for Ariob applications, providing:

- 🔐 **Authentication Services** - Multi-method auth (keypair, mnemonic, traditional)
- 📊 **Data Management** - Schema-first approach with Gun.js integration
- ⚡ **Real-time State** - Reactive state management with Zustand
- 🛡️ **Type Safety** - Full TypeScript support with Zod validation
- 🔗 **React Integration** - Optimized hooks for ReactLynx/React

```bash
# Install
npm install @ariob/core
```

### [@ariob/ui](./ui/) 

Reusable component library, layout primitives, and Tailwind tooling shared across Ariob apps.

- 🎨 **Unified styling** - Cards, buttons, inputs, alerts, and layout primitives
- ⚙️ **Shared tooling** - Exported Tailwind & PostCSS config for all apps
- 🎯 **Design tokens** - CSS variable palette for light/dark theming
- 🧾 **Lucide icons** - Central glyph atlas + icon helpers
- 📦 **Tree-shake friendly** - Side-effect free ESM exports

```bash
npm install @ariob/ui
```

### [@ariob/router](./router/)

TanStack Router code generator that converts `/src/pages` into a fully-typed route tree.

- 🗂️ **File-system routing** - Layouts, dynamic segments, and catch-alls supported out of the box
- 🔁 **Live regeneration** - Watches the filesystem and rewrites `_routes.tsx` on change
- 🛠️ **Rsbuild plugin** - Drop-in integration for Rspeedy/Lynx projects
- 📐 **Type-safe output** - Emits router type augmentation for TanStack Router
- 🧭 **Memory history** - Configured for Lynx native runtime by default

```bash
npm install @ariob/router
```

### [@ariob/ai](./ai/)

Native AI integration for on-device language models powered by Apple's MLX framework.

- 🤖 **On-device AI** - Run language models locally with GPU acceleration via MLX
- 🔌 **Native bridge** - TypeScript bindings to Swift native module via Lynx
- 📡 **Streaming generation** - Real-time text generation with progress events
- 🎯 **Dynamic models** - Load any HuggingFace model at runtime without hardcoding
- 🪝 **React hooks** - `useNativeAIStream`, `useNativeAIModelStatus`, `useModels`
- 🔄 **Event system** - Global events for model loading and streaming updates
- ⚡ **Background processing** - Non-blocking operations with `.userInitiated` priority

**Note:** Requires Lynx native runtime and iOS 16.0+ with MLX Swift framework.

```bash
npm install @ariob/ai
```

## 🏗️ Package Structure

```
packages/
└── core/                    # Core functionality package
    ├── gun/                 # Gun.js integration layer
    │   ├── core/           # Core utilities and initialization
    │   ├── hooks/          # React hooks for Gun.js
    │   ├── lib/            # Shared libraries
    │   ├── schema/         # Data schemas (Zod)
    │   ├── services/       # Business logic services
    │   └── state/          # State management (Zustand)
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

## 🔗 Lynx Runtime Integration

Several packages require the Lynx native runtime for full functionality:

### Native Module Dependencies

**@ariob/ai** - Requires Lynx native runtime with `LynxContextModule` support:
- Uses `NativeModules.NativeAIModule` for Swift bridge communication
- Relies on `LynxContext.sendGlobalEvent` for real-time updates
- Must be used within a Lynx application environment

The Lynx runtime provides:
- **Native module registration** - Automatic bridging between JavaScript and native code
- **Global event system** - Cross-boundary event emission for real-time updates
- **Context injection** - `LynxContext` provided to modules at initialization
- **Thread management** - Ensures callbacks execute on main thread for UI updates

See [@ariob/ai documentation](./ai/README.md#-native-module-architecture) for detailed integration guide.

## 🚀 Getting Started

### Using Core Package

```typescript
import { 
  useWho,           // Authentication hook
  make,            // Service factory
  ThingSchema,     // Base schemas
  createThingStore // Store factory
} from '@ariob/core';

// Define your schema
const TodoSchema = ThingSchema.extend({
  title: z.string(),
  completed: z.boolean().default(false)
});

// Create service and store
const todoService = make(TodoSchema, 'todos');
const useTodoStore = createThingStore(todoService, 'TodoStore');

// Use in your app
function TodoApp() {
  const { user } = useWho();
  const { items, create } = useTodoStore();
  
  // Your app logic
}
```

## 💻 Development

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.15.4

### Building Packages

From the project root:

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @ariob/core build

# Watch mode for development
pnpm --filter @ariob/core dev
```

### Testing

```bash
# Test all packages
pnpm test

# Test specific package
pnpm --filter @ariob/core test
```

## 📝 Creating New Packages

When adding a new package:

1. Create directory under `packages/`
2. Initialize with `package.json`:
   ```json
   {
     "name": "@ariob/package-name",
     "version": "0.0.1",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsup",
       "dev": "tsup --watch"
     }
   }
   ```
3. Add TypeScript config extending root
4. Update workspace dependencies if needed

## 🔧 Package Guidelines

### Naming Convention
- Use `@ariob/` scope for all packages
- Use lowercase with hyphens for package names
- Be descriptive but concise

### Dependencies
- Keep packages lightweight
- Declare peer dependencies appropriately
- Avoid circular dependencies

### Exports
- Use named exports over default exports
- Provide TypeScript types
- Export from central index file

### Documentation
- Include comprehensive README
- Add JSDoc comments for public APIs
- Provide usage examples

## 🤝 Contributing

When contributing to packages:

1. Follow the established patterns
2. Add tests for new functionality
3. Update documentation
4. Ensure backward compatibility
5. Use changesets for versioning

## 📚 Resources

- [Core Package Documentation](./core/README.md)
- [UI Package Documentation](./ui/README.md)
- [Router Plugin Documentation](./router/README.md)
- [Main Project README](../README.md)
- [TypeScript Guidelines](../.cursor/rules/)

---

<div align="center">
Part of the <a href="../README.md">Ariob Platform</a>
</div>
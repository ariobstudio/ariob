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
- [Main Project README](../README.md)
- [TypeScript Guidelines](../.cursor/rules/)

---

<div align="center">
Part of the <a href="../README.md">Ariob Platform</a>
</div>
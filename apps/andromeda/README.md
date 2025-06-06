# 🌌 Andromeda - Ariob Frontend Application

<div align="center">

[![ReactLynx](https://img.shields.io/badge/ReactLynx-FF6B6B?style=for-the-badge&logo=react&logoColor=white)](https://lynx-js.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gun.js](https://img.shields.io/badge/Gun.js-2C3E50?style=for-the-badge&logo=javascript&logoColor=white)](https://gun.eco/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

The main frontend application for Ariob - a decentralized, cross-platform application built with ReactLynx.

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Architecture](#-architecture)
- [Scripts](#-scripts)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

Andromeda is the core frontend application of the Ariob platform, bootstrapped with `create-rspeedy` and built on ReactLynx for cross-platform compatibility. It provides a modern, responsive interface for decentralized identity and data management.

## ✨ Features

### Core Functionality
- 🔐 **Multi-Method Authentication**
  - Password-based authentication
  - Passkey support
  - Keypair generation and import
  - Mnemonic phrase support
  
- 🔑 **Key Management**
  - Secure key generation
  - Import/Export functionality
  - Session persistence
  
- 📝 **Content Management**
  - Real-time data synchronization
  - User-scoped private data
  - Public content sharing

### Technical Features
- 🎨 **Modern UI/UX**
  - Custom component library
  - Light/Dark theme support
  - Responsive design
  - Smooth animations
  
- 🏗️ **Architecture**
  - Type-safe with TypeScript
  - Functional error handling
  - Schema-first design
  - Real-time state management

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.15.4
- LynxExplorer App (for mobile testing)

### Installation

```bash
# From the project root
pnpm install

# Or from this directory
cd apps/andromeda
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev

# The terminal will display a QR code
# Scan with LynxExplorer App for mobile testing
```

## 📁 Project Structure

```
andromeda/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── posts/          # Post-related components
│   │   ├── primitives/     # Base UI primitives
│   │   └── ui/             # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Layout components
│   ├── lib/                # Utility libraries
│   ├── pages/              # Page components
│   │   └── auth/           # Authentication pages
│   ├── router/             # Routing configuration
│   ├── schema/             # Data schemas (Zod)
│   ├── services/           # Business logic & API
│   ├── styles/             # Global styles
│   ├── test/               # Test configuration
│   │   └── __tests__/      # Test files
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite configuration
└── vitest.config.ts        # Test configuration
```

## 💻 Development

### Key Technologies

- **Framework**: ReactLynx (React for cross-platform)
- **Build Tool**: Vite with RSpeedy
- **State Management**: Zustand + @ariob/core
- **Routing**: React Router v6
- **Styling**: Lynx React components + Custom UI
- **Testing**: Vitest + Lynx React Testing Library
- **Type Safety**: TypeScript + Zod schemas

### Working with Components

```typescript
// Example component using Lynx React
import { View, Text } from '@lynx-js/react';
import { useAuth } from '@ariob/core';

export const UserProfile = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  
  return (
    <View className="user-profile">
      <Text className="welcome">Welcome, {user?.alias}!</Text>
    </View>
  );
};
```

### Using the Core Package

The app integrates with `@ariob/core` for all backend functionality:

```typescript
import { useWho, useThing, make } from '@ariob/core';

// Authentication
const { signup, login, logout } = useWho();

// Data management
const notesService = make(NoteSchema, 'notes');
const { items, create, update } = useThing(notesService);
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Run tests once (CI mode)
pnpm test:run

# Interactive UI mode
pnpm test:ui

# Coverage report
pnpm test:coverage
```

### Writing Tests

```typescript
// src/components/__tests__/MyComponent.test.tsx
import { expect, test } from 'vitest';
import { render } from '@lynx-js/react/testing-library';
import { MyComponent } from '../MyComponent';

test('renders correctly', async () => {
  const { findByText } = render(<MyComponent />);
  
  const element = await findByText('Expected text');
  expect(element).toBeInTheDocument();
});
```

See [src/test/README.md](src/test/README.md) for comprehensive testing documentation.

## 🏗️ Architecture

### Component Architecture

```
components/
├── primitives/     # Base building blocks (buttons, inputs)
├── ui/             # Composed UI components
├── auth/           # Authentication-specific components
└── posts/          # Feature-specific components
```

### State Management

- **Global State**: Zustand stores from `@ariob/core`
- **Local State**: React hooks (useState, useReducer)
- **Server State**: Real-time Gun.js synchronization

### Data Flow

```
User Action → Component → Hook → Service → Gun.js → State Update → UI Update
```

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:ui` | Run tests with UI |
| `pnpm test:coverage` | Generate coverage report |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript compiler |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the app directory:

```env
# API endpoints (optional)
VITE_GUN_RELAY_URL=http://localhost:8765/gun

# Feature flags
VITE_ENABLE_DEBUG=false
```

### TypeScript Configuration

The app uses a strict TypeScript configuration. Key settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx"
  }
}
```

## ❓ Troubleshooting

### Common Issues

**1. LynxExplorer Connection Issues**
- Ensure your device is on the same network
- Check firewall settings
- Try restarting the dev server

**2. Build Errors**
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear build cache: `pnpm clean`
- Check TypeScript errors: `pnpm typecheck`

**3. Test Failures**
- Update snapshots: `pnpm test -- -u`
- Check test environment setup in `src/test/setup.ts`
- Ensure mocks are properly configured

### Debug Mode

Enable debug logging:

```typescript
// In your component or service
import { enableDebug } from '@/lib/debug';

enableDebug(true);
```

## 📚 Resources

- [ReactLynx Documentation](https://lynx-js.github.io/lynx/docs/react)
- [Ariob Core Package](../../packages/core/README.md)
- [Gun.js Documentation](https://gun.eco/docs/)
- [Vite Documentation](https://vitejs.dev/)

---

<div align="center">
Part of the <a href="../../README.md">Ariob Platform</a>
</div>

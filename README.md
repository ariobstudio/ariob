# 🌟 Ariob - Decentralized Cross-Platform Application

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Gun.js](https://img.shields.io/badge/Gun.js-2C3E50?style=for-the-badge&logo=javascript&logoColor=white)](https://gun.eco/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

A minimal, schema-first functional architecture for building decentralized applications with real-time features.

[Getting Started](#-getting-started) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Available Scripts](#-available-scripts)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

Ariob is a modern decentralized application platform built with React and LynxJS, featuring:

- **Schema-first design** using Zod for runtime validation
- **Multi-auth support** (keypair, mnemonic, traditional)
- **Real-time synchronization** powered by Gun.js
- **Cross-platform** support (Web, iOS, Android)
- **Type-safe** architecture with TypeScript

## ✨ Features

- 🔐 **Secure Authentication** - Multiple authentication methods with session persistence
- 🔑 **Key Management** - Secure key generation, import, and storage
- 📱 **Cross-Platform** - Single codebase for web and mobile platforms
- ⚡ **Real-time Updates** - Automatic data synchronization across devices
- 🎨 **Modern UI** - Beautiful, responsive interface with theme support
- 🛡️ **Type Safety** - Full TypeScript support with runtime validation
- 📦 **Modular Architecture** - Clean separation of concerns with monorepo structure

## 🏗️ Architecture

```
ariob/
├── apps/
│   ├── ripple/           # Main social app (Expo + React Native)
│   └── kitchen/          # Component playground
├── packages/
│   ├── core/             # Gun.js primitives, auth, crypto (@ariob/core)
│   ├── ripple/           # Social UI components & gestures (@ariob/ripple)
│   ├── andromeda/        # Design system & atoms (@ariob/andromeda)
│   ├── store/            # State management utilities
│   └── webcrypto/        # Native WebCrypto bridge
└── docs/                 # Comprehensive documentation
    ├── ripple/           # Ripple package docs
    └── andromeda/        # Andromeda package docs
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **pnpm** >= 8.15.4
- **XCode** or **Android Studio** for Mobile Testing

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ariobstudio/ariob.git
cd ariob
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Gun.js relay server (optional - defaults to local)
GUN_RELAY_URL=http://localhost:8765/gun

# Add other environment variables as needed
```

### 4. Start Development

```bash
# Start all services
pnpm dev

pnpm dev:chat 
```

### 5. Access the Application

- **Web**: Open [http://localhost:5173](http://localhost:5173)
- **Mobile**: Scan the QR code in terminal with LynxExplorer App

## 💻 Development

### Ripple Application

The main social application is located in `apps/ripple/`. Key areas:

- `app/` - Expo Router file-based navigation
- `components/` - App-specific UI components
- `styles/` - Unistyles theme-aware stylesheets
- `theme/` - Design system configuration
- `stores/` - Local state management

### Core Packages

| Package | Purpose |
|---------|---------|
| **@ariob/core** | Gun.js primitives, authentication, cryptography, state management |
| **@ariob/ripple** | Social UI components (Node, Bar, Menu), gestures, hooks |
| **@ariob/andromeda** | Design system atoms, molecules, organisms, themes |

See individual package READMEs for detailed documentation.

## 📁 Project Structure

```
ariob/
├── apps/
│   ├── ripple/              # Main social app (Expo + React Native)
│   │   ├── app/             # File-based routing (Expo Router)
│   │   ├── components/      # App-specific components
│   │   ├── styles/          # Unistyles style definitions
│   │   └── theme/           # Theme configuration
│   └── kitchen/             # Component playground
├── packages/
│   ├── core/                # @ariob/core - Gun.js, auth, crypto
│   ├── ripple/              # @ariob/ripple - Social UI components
│   ├── andromeda/           # @ariob/andromeda - Design system
│   ├── store/               # State management utilities
│   └── webcrypto/           # Native WebCrypto bridge
├── docs/                    # Extended documentation
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── turbo.json
```

## 📚 Documentation

### Core Packages

| Package | Description | Documentation |
|---------|-------------|---------------|
| **@ariob/core** | Gun.js primitives, authentication, cryptography | [README](packages/core/README.md) |
| **@ariob/ripple** | Social UI components, gestures, menu system | [README](packages/ripple/README.md) |
| **@ariob/andromeda** | Atomic design system, themes, atoms/molecules | [README](packages/andromeda/README.md) |

### Applications

| App | Description | Documentation |
|-----|-------------|---------------|
| **Ripple** | Main social application (Expo + React Native) | [README](apps/ripple/README.md) |

### Extended Documentation

- [Ripple Package Docs](docs/ripple/) — Components, gestures, hooks, styles
- [Andromeda Package Docs](docs/andromeda/) — Theme system, atoms, molecules, organisms

## 📜 Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in development mode |
| `pnpm dev:ripple` | Start the Ripple app |
| `pnpm dev:kitchen` | Start the component playground |

### Building

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm build:ripple` | Build Ripple app |

### Testing

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Generate coverage report |

### Code Quality

| Command | Description |
|---------|-------------|
| `pnpm lint` | Lint all code |
| `pnpm format` | Format all code |
| `pnpm typecheck` | Run TypeScript checks |

### Utilities

| Command | Description |
|---------|-------------|
| `pnpm clean` | Clean all build artifacts |
| `pnpm changeset` | Create a changeset |

## 🧪 Testing

We use Vitest for testing. Run tests with:

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @ariob/ripple test
pnpm --filter @ariob/core test

# Run tests in watch mode
pnpm test:watch
```

Tests are located in each package's `src/__tests__/` directory.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the TypeScript style guide
- Write tests for new features
- Update documentation as needed
- Use conventional commits
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Gun.js](https://gun.eco/) for decentralized data sync
- [LynxJS](https://lynxjs.org/) for cross-platform React
- [Zod](https://zod.dev/) for schema validation
- [Zustand](https://zustand-demo.pmnd.rs/) for state management

---

<div align="center">
Built with ❤️ by the Ariob team
</div>

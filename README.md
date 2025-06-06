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
│   └── andromeda/        # Main application (React + LynxJS)
├── packages/
│   └── core/             # Core functionality
│       └── gun/          # Gun.js integration layer
└── platforms/            # Platform-specific implementations
    ├── web/              # Web platform
    ├── android/          # Android platform (coming soon)
    └── ios/              # iOS platform (coming soon)
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **pnpm** >= 8.15.4
- **Git** >= 2.0.0
- **LynxExplorer App** (for mobile development) - [Download here](https://lynx-js.com)

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

# Or start specific services
pnpm dev:andromeda  # Main application only
```

### 5. Access the Application

- **Web**: Open [http://localhost:5173](http://localhost:5173)
- **Mobile**: Scan the QR code in terminal with LynxExplorer App

## 💻 Development

### Core Application

The main application is located in `apps/andromeda/`. Key areas:

- `src/components/` - React components
- `src/services/` - Business logic and API services
- `src/hooks/` - Custom React hooks
- `src/schema/` - Data schemas and types

### Core Package

The `@ariob/core` package provides:

- Authentication services
- Data management with Gun.js
- Real-time state management
- Type-safe APIs

See [packages/core/README.md](packages/core/README.md) for detailed documentation.

## 📁 Project Structure

```
ariob/
├── apps/
│   └── andromeda/           # Main React application
│       ├── src/
│       │   ├── components/  # UI components
│       │   ├── hooks/       # Custom hooks
│       │   ├── services/    # Business logic
│       │   ├── schema/      # Data schemas
│       │   └── styles/      # Global styles
│       └── README.md
├── packages/
│   └── core/                # Shared core functionality
│       ├── gun/             # Gun.js integration
│       └── README.md
├── platforms/               # Platform-specific code
├── .cursor/                 # Cursor AI configuration
│   └── rules/              # Development rules and guidelines
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── turbo.json
```

## 📜 Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in development mode |
| `pnpm dev:andromeda` | Start only the main application |
| `pnpm dev:web` | Start web platform (when available) |

### Building

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all applications |
| `pnpm build:andromeda` | Build main application |

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

We use Vitest with Lynx React Testing Library. Run tests with:

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run specific app tests
pnpm --filter andromeda test
```

See [apps/andromeda/src/test/README.md](apps/andromeda/src/test/README.md) for testing guidelines.

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
- [LynxJS](https://lynx-js.com/) for cross-platform React
- [Zod](https://zod.dev/) for schema validation
- [Zustand](https://zustand-demo.pmnd.rs/) for state management

---

<div align="center">
Built with ❤️ by the Ariob team
</div>

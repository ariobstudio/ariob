# Andromeda - Ariob Frontend App

This is the main frontend application for Ariob, built with ReactLynx and bootstrapped with `create-rspeedy`.

## Features

- 🔐 **Authentication System** - Multi-method authentication (password, passkey)
- 🔑 **Key Management** - Secure key generation and import
- 🎨 **Modern UI** - Built with Lynx React components and custom UI library
- 🌙 **Theme Support** - Light/dark theme switching
- 📱 **Cross-Platform** - Runs on mobile and web via Lynx

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm run dev
```

Scan the QRCode in the terminal with your LynxExplorer App to see the result.

You can start editing the page by modifying `src/App.tsx`. The page auto-updates as you edit the file.

## Testing

The project uses Vitest with Lynx React Testing Library for component testing.

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

See `src/test/README.md` for comprehensive testing documentation and examples.

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── posts/          # Post-related components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── schema/             # Data schemas
├── services/           # API services
├── styles/             # Global styles
└── test/               # Testing utilities and setup
```

## Core Dependencies

- **@lynx-js/react** - Lynx React framework
- **@ariob/core** - Core Ariob functionality (auth, data)
- **react-router** - Client-side routing
- **neverthrow** - Functional error handling

## Development

The app integrates with the `@ariob/core` package for authentication and data management. See the core package documentation for API details.

## Learn More

- [Lynx React Documentation](https://lynx-js.github.io/lynx/docs/react)
- [Ariob Core Package](../../packages/core/README.md)

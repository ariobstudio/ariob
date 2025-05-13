# Ariob - Cross-platform Decentralized Platform

This monorepo contains the Ariob platform, built with React and LynxJS. The project consists of:
- `apps/ariob` - The main application code and business logic
- `platforms/` - Platform-specific implementations:
  - `web/` - Web container for displaying the core bundle
  - `android/` - Android native implementation
  - `ios/` - iOS native implementation
- `server/` - Backend services

## Project Structure

```
ariob/
├── apps/
│   └── ariob/     # Core application code with the main business logic
├── platforms/
│   ├── web/       # Web container for displaying the core bundle
│   ├── android/   # Android native implementation
│   └── ios/       # iOS native implementation
└── server/        # Backend services
```

## Prerequisites

- Node.js >= 18
- pnpm >= 8.15.4
- LynxExplorer App (for mobile development)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/ariobstudio/ariob
cd ariob
```

2. Install dependencies:

```bash
pnpm install
```

3. Start development:

```bash
# Start all services in development mode
pnpm dev

# Or start specific services:
pnpm dev --filter=ariob    # Core application
pnpm dev --filter=web      # Web platform
pnpm dev --filter=android  # Android platform
pnpm dev --filter=ios      # iOS platform
pnpm dev --filter=server   # Backend services
```

## Available Commands

### Development

```bash
pnpm dev          # Start all services in development mode
```

### Building

Build all applications:

```bash
pnpm build
```

Or build specific services:

```bash
pnpm build --filter=ariob    # Build core application
pnpm build --filter=web      # Build web platform
```

### Other Commands

Clean build artifacts:

```bash
pnpm clean        # Clean all services
```

Run tests:

```bash
pnpm test         # Test all services
```

Format code:

```bash
pnpm format       # Format all code
```

Lint code:

```bash
pnpm lint         # Lint all code
```

## Core Application Development

The core application is built with ReactLynx and uses RSpeedy for development. This is where the main application code and business logic reside.

You can start editing the core application by modifying files in `apps/ariob/src/`. When developing for mobile devices, run the appropriate platform-specific development command and scan the QR code with your LynxExplorer App to see the changes in real-time.

# Ariob - Cross-platform Decentralized Platform

This monorepo contains the Ariob platform, built with React and LynxJS. The project consists of:
- `apps/andromeda` - The main application code and business logic
- `platforms/` - Platform-specific implementations:
  - `web/` - Web container for displaying the core bundle
  - `android/` - Android native implementation
  - `ios/` - iOS native implementation

## Project Structure

```
ariob/
├── apps/
│   └── andromeda/ # Core application code with the main business logic
└── platforms/
    ├── web/       # Web container for displaying the core bundle
    ├── android/   # Android native implementation
    └── ios/       # iOS native implementation
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
pnpm dev:andromeda  # Core application
```

## Available Commands

### Development

```bash
pnpm dev           # Start all services in development mode
pnpm dev:andromeda # Start core application development
```

### Building

Build all applications:

```bash
pnpm build
```

Or build specific services:

```bash
pnpm build:andromeda  # Build core application
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

You can start editing the core application by modifying files in `apps/andromeda/src/`. When developing for mobile devices, run the appropriate platform-specific development command (Coming Soon). 

# Ariob - Cross-platform Decentralized Platform

This monorepo contains the Ariob platform, built with React and LynxJS. The project consists of:
- `core` package - The main application code and business logic
- `web` package - A container that displays the core bundle in a web browser

## Project Structure

```
ariob/
├── packages/
│   ├── web/        # Web container for displaying the core bundle
│   └── core/       # Core application code with the main business logic
```

## Prerequisites

- Node.js >= 18
- pnpm >= 10.4.1
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

3. **Important**: The core package must be built first before running the web package:

```bash
# Use our convenience command to build core and run web in one step
pnpm dev:all

# Or do it step by step:
# Build the core bundle first
pnpm build:core

# Then start the web development server
pnpm dev:web
```

## Correct Development Workflow

1. Make changes to the core package
2. For the easiest workflow, use the convenience command:
   ```bash
   pnpm dev:all  # Builds core bundle then starts web server
   ```
3. Or do it step by step:
   - Build the core bundle: `pnpm build:core`
   - Run the web development server: `pnpm dev:web`
4. Or to develop for mobile devices:
   - Run `pnpm dev:core`
   - Scan the QR code with LynxExplorer App

## Available Commands

### Development

**Important**: Always build the core bundle first before running the web server:

```bash
# First, build the core bundle
pnpm build:core

# Then start the web development server
pnpm dev:web
```

For continuous development of the core package on a physical device:

```bash
pnpm dev:core
```

Scan the QR code displayed in the terminal with your LynxExplorer App.

### Building

Build both core and web applications:

```bash
pnpm build
```

Or build them separately:

```bash
pnpm build:core  # Build the core bundle first
pnpm build:web   # Then build the web container
```

### Running Production Builds

Start the web application in production mode:

```bash
pnpm start       # Alias for pnpm start:web
# or specifically
pnpm start:web
```

Start the core application in production mode for mobile devices:

```bash
pnpm start:core
```

### Other Commands

Clean build artifacts:

```bash
pnpm clean       # Clean both web and core
pnpm clean:web   # Clean only web
pnpm clean:core  # Clean only core
```

Run tests:

```bash
pnpm test        # Test both web and core
pnpm test:web    # Test only web
pnpm test:core   # Test only core
```

Format code:

```bash
pnpm --filter web run format    # Format web code
pnpm --filter core run format   # Format core code
```

## Core Application Development

The core application is built with ReactLynx and uses RSpeedy for development. This is where the main application code and business logic reside.

You can start editing the core application by modifying files in `packages/core/src/`. When developing for mobile devices, run `pnpm dev:core` and scan the QR code with your LynxExplorer App to see the changes in real-time.

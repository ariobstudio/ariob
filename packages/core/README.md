# Ariob Core Application

This package contains the core application code for the Ariob platform, built with ReactLynx. It is the main source of truth for the application logic and UI.

## Important Workflow Note

The bundle from this package must be built before running the web package, as the web package is just a container that displays this bundle.

## Getting Started

Build the core bundle first:

```bash
pnpm run build
```

Then you can either:

1. Run the web container to display the bundle in a browser:
   ```bash
   # From the root directory
   pnpm dev:web
   ```

2. Or run the core development server to test on a simulator/physical device:
   ```bash
   pnpm run dev
   ```
   Paste the URL/Scan the QR code displayed in the terminal with your LynxExplorer App. Follow the Guide here for more info: https://lynxjs.org/guide/start/quick-start.html

## Building

To build the core application for production:

```bash
pnpm run build
```

The build artifacts will be available in the `dist` directory and will be automatically accessible to the web container.

## Scripts

- `pnpm start` - Start the production preview on a mobile device
- `pnpm run dev` - Start the development server for mobile devices
- `pnpm run build` - Build the core bundle (must be done before running the web container)
- `pnpm run preview` - Preview the production build on a mobile device
- `pnpm run format` - Format code with Prettier
- `pnpm run clean` - Remove build artifacts
- `pnpm run test` - Run tests

## LynxJS Integration

This core application is built with LynxJS, which allows it to run across multiple platforms including native mobile devices and web browsers (via the web package).

The core code is bundled and made available to the web container at runtime, allowing for a seamless cross-platform experience with shared code and UI.

## Development Workflow

1. Make changes to your core application code in this package
2. Build the bundle: `pnpm run build`
3. To view in web browser: run `pnpm --filter web run dev` from the root directory
4. To view on a mobile device: run `pnpm run dev` and scan the QR code with LynxExplorer

## Building for Production

When you build this package, it creates bundles that are consumed by the web container. Always build this package before building the web package for production:

```bash
# From the root directory
pnpm run build:core  # Build the core bundle first
pnpm run build:web   # Then build the web container
``` 
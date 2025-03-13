# Ariob Web Container

This package serves as a web container for displaying the Ariob core bundle (from the core package) in a web browser.

## Important Workflow Note

**Before running this package, you must first build the core package** to generate the bundle that this container will display:

```bash
# From the root directory
pnpm build:core  # Build the core bundle first
pnpm dev:web     # Then start the web container
```

## Getting Started

First, build the core bundle:

```bash
# From the root directory
pnpm build:core
```

Then run the web development server:

```bash
pnpm run dev
```

The web container will be available at http://localhost:8080 (or another port if 8080 is in use).

## Building

After building the core package, build the web container for production:

```bash
# From the root directory
pnpm build:core  # First build the core bundle
pnpm build:web   # Then build the web container
```

The build artifacts will be available in the `dist` directory.

## Scripts

- `pnpm start` - Start the production build of the web container
- `pnpm run dev` - Start the web container development server with hot reloading
- `pnpm run build` - Build the web container for production
- `pnpm run preview` - Preview the production build locally
- `pnpm run format` - Format code with Prettier
- `pnpm run lint` - Lint code with ESLint
- `pnpm run clean` - Remove build artifacts
- `pnpm run test` - Run tests

## LynxJS Integration

This web container integrates with LynxJS to display the core application bundle in a web browser. It does not contain the main application logic, which resides in the core package.

The main integration point is in `App.tsx` with the `lynx-view` component:

```tsx
<lynx-view style={{ height: "100vh", width: "100vw" }} url="/main.web.bundle">
</lynx-view>
```

This component loads the core bundle at runtime, allowing for a seamless cross-platform experience.

## Development Workflow

1. Make changes to the core application code in the core package
2. Build the core package: `pnpm --filter core run build`
3. Run the web container: `pnpm --filter web run dev`
4. View the application in your web browser
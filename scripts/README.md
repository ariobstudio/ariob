# Ariob Build Scripts

This directory contains build and bundle scripts for the Ariob platform.

## Bundle Scripts

### iOS Bundle Script (`bundle-ios.sh`)

Builds and bundles any Ariob app for iOS deployment.

#### Usage

```bash
# Basic usage
pnpm bundle:ios <app_name>

# With custom bundle name
pnpm bundle:ios <app_name> -b custom.lynx.bundle

# Clean build with fresh dependencies
pnpm bundle:ios <app_name> --clean --force-install

# Skip CocoaPods installation (faster if pods are already installed)
pnpm bundle:ios <app_name> --skip-pods

# Show help
pnpm bundle:ios:help
```

#### Examples

```bash
# Bundle the brana app (outputs as main.lynx.bundle)
pnpm bundle:ios brana

# Bundle andromeda with custom name
pnpm bundle:ios andromeda -b andromeda.lynx.bundle

# Clean build of brana
pnpm bundle:ios brana --clean

# Quick rebuild without pod install
pnpm bundle:ios brana --skip-pods
```

#### Options

- **`-b, --bundle-name`**: Custom bundle name (default: `main.lynx.bundle`)
- **`-s, --skip-pods`**: Skip CocoaPods installation
- **`-f, --force-install`**: Force reinstall all npm dependencies
- **`-c, --clean`**: Clean build artifacts before building
- **`-v, --verbose`**: Enable verbose output
- **`-h, --help`**: Show help message

#### Output

The bundled app will be placed in:
```
platforms/ios/Ariob/Ariob/Resources/<bundle_name>
```

Default bundle name is `main.lynx.bundle` unless specified with `-b` option.

### Android Bundle Script (`bundle-android.sh`)

**⚠️ Not yet implemented** - Placeholder for future Android bundling support.

```bash
# Will be available in the future
pnpm bundle:android <app_name>
```

## Script Features

### Automatic Detection
- Package manager detection (pnpm, npm, yarn)
- App directory verification
- Dependency installation as needed

### Smart Defaults
- Default bundle name: `main.lynx.bundle`
- Automatic resource directory creation
- CocoaPods installation included by default

### Error Handling
- Validates app exists before building
- Checks for required dependencies
- Provides clear error messages

### Performance Options
- Skip pod installation for faster rebuilds
- Clean build option for troubleshooting
- Force dependency reinstall when needed

## Development Workflow

### Typical iOS Development Flow

1. **Initial setup** (first time):
   ```bash
   pnpm bundle:ios brana
   ```

2. **Quick rebuilds** (during development):
   ```bash
   pnpm bundle:ios brana --skip-pods
   ```

3. **Clean build** (when encountering issues):
   ```bash
   pnpm bundle:ios brana --clean --force-install
   ```

### Multiple App Support

The script supports any app in the `apps/` directory:

```bash
pnpm bundle:ios brana        # Main chat app
pnpm bundle:ios andromeda    # Another app
pnpm bundle:ios homepage     # Homepage app
```

## Migration from Old Script

The new `bundle-ios.sh` replaces the old `platforms/ios/Ariob/bundle_install.sh` with:

- **Parameterized app selection**: No longer hardcoded to just `brana`
- **Flexible bundle naming**: Control output bundle name
- **Centralized location**: Lives in `scripts/` for better organization
- **Consistent interface**: Works with pnpm scripts
- **Platform-specific naming**: Clear separation for iOS vs Android

## Troubleshooting

### Build Fails
```bash
# Try a clean build
pnpm bundle:ios <app_name> --clean --force-install --verbose
```

### CocoaPods Issues
```bash
# Skip pods if they're already installed
pnpm bundle:ios <app_name> --skip-pods

# Or force reinstall
cd platforms/ios/Ariob && pod deintegrate && pod install
```

### Bundle Not Found
- Check that the app's `package.json` has a `build` script
- Verify the app builds correctly: `cd apps/<app_name> && pnpm build`
- Use verbose mode to see detailed output: `pnpm bundle:ios <app_name> -v`
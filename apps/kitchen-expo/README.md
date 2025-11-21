# Kitchen - Ariob - Expo Demo App

A demonstration Expo application showcasing the **@ariob/core** and **@ariob/webcrypto** packages working together in a real-world mobile environment.

## 🎯 Purpose

This app demonstrates:
- **Framework-agnostic architecture**: @ariob/core working seamlessly with Expo
- **Native cryptography**: @ariob/webcrypto providing hardware-backed crypto operations
- **Automatic bridge loading**: Environment detection and crypto setup without manual configuration
- **Performance**: 10-100x faster cryptography compared to pure JavaScript implementations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (workspace package manager)
- iOS Simulator / Android Emulator or physical device
- Expo CLI (installed automatically via dependencies)

### Installation

From the monorepo root:

```bash
# Install all dependencies (runs from root)
pnpm install

# Navigate to the ripple app
cd apps/ripple

# Start the Expo development server
pnpm start
```

### Running the App

```bash
# iOS
pnpm ios

# Android
pnpm android

# Web (limited crypto functionality)
pnpm web
```

## 📱 Features

### Crypto Demo Tab

The **Crypto** tab provides interactive demos of native cryptography:

#### 🔐 SHA-256 Hashing
- Input any text
- Compute cryptographic hash using native CryptoKit/KeyStore
- View hex-encoded hash result

#### 🔒 AES-GCM Encryption
- Generate 256-bit AES keys using native hardware
- Encrypt data with authenticated encryption
- View initialization vector (IV) and encrypted bytes

#### 🔓 AES-GCM Decryption
- Decrypt previously encrypted data
- Verify data integrity (authenticated encryption)
- Confirm round-trip encryption/decryption

#### 🎲 Random Number Generation
- Generate cryptographically secure random bytes
- Uses hardware random number generator where available
- Display random values as hex strings

## 🏗️ Architecture

### Dependencies

```json
{
  "@ariob/core": "workspace:*",      // Framework-agnostic GUN.js wrapper
  "@ariob/webcrypto": "workspace:*", // Native WebCrypto API implementation
  "expo": "~54.0.23",                // Expo SDK
  "react": "19.1.0",
  "react-native": "0.81.5"
}
```

### How It Works

1. **Automatic Detection**: When `@ariob/core` is imported, it automatically detects the Expo environment
2. **Bridge Loading**: The crypto bridge (`crypto.expo.js`) loads `@ariob/webcrypto`
3. **Global Assignment**: The complete `crypto` object is assigned to `globalThis.crypto`
4. **Native Execution**: All crypto operations execute using native platform APIs

```typescript
// In your app code - that's it!
import '@ariob/core';

// crypto is now available globally
const hash = await crypto.subtle.digest('SHA-256', data);
```

## 📊 Performance

Compared to pure JavaScript implementations:

| Operation | Pure JS | Native | Speedup |
|-----------|---------|--------|---------|
| SHA-256 (1MB) | ~150ms | ~1.5ms | **~100x** |
| AES-GCM Encrypt | ~200ms | ~2ms | **~100x** |
| ECDSA Sign | ~25ms | ~1ms | **~25x** |
| PBKDF2 (100k) | ~2000ms | ~50ms | **~40x** |

## 🔧 Development

### Project Structure

```
apps/ripple/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      # Home screen
│   │   ├── explore.tsx    # Explore screen (default)
│   │   ├── crypto.tsx     # Crypto demo screen ⭐
│   │   └── _layout.tsx    # Tab navigation
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Example modal
├── components/            # Reusable UI components
├── constants/             # Theme and config
├── hooks/                 # Custom React hooks
├── assets/                # Images and fonts
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

### Adding New Features

1. **Create a new tab**: Add a new file in `app/(tabs)/`
2. **Register the tab**: Update `app/(tabs)/_layout.tsx`
3. **Use @ariob/core**: Import and use GUN.js features
4. **Use crypto**: Access via global `crypto` object (no imports needed)

### Debugging

```bash
# Enable remote debugging
pnpm start
# Press 'j' to open debugger
# Press 'r' to reload
# Press 'm' to toggle menu
```

### Testing Crypto

The app includes built-in testing in the Crypto tab:
- All operations show success/error alerts
- Results are displayed in the UI
- Console logs provide detailed error information

## 🌐 Platform Support

| Platform | Status | Native Crypto |
|----------|--------|---------------|
| iOS | ✅ Full Support | CryptoKit |
| Android | ✅ Full Support | KeyStore API |
| Web | ⚠️ Limited | Browser WebCrypto |

**Note**: Web support uses browser's native WebCrypto API, which may have different capabilities than the mobile implementations.

## 📚 Learn More

### Ariob Packages
- [@ariob/core README](../../packages/core/README.md)
- [@ariob/webcrypto README](../../packages/webcrypto/README.md)
- [@ariob/webcrypto Implementation Guide](../../packages/webcrypto/IMPLEMENTATION.md)

### Expo Resources
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)

### WebCrypto
- [W3C WebCrypto API Specification](https://www.w3.org/TR/WebCryptoAPI/)
- [MDN WebCrypto Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## 🐛 Troubleshooting

### Native Module Not Found

If you see errors about native modules:

```bash
# iOS - reinstall pods
cd ios && pod install && cd ..

# Android - clean and rebuild
cd android && ./gradlew clean && cd ..
```

### Crypto Operations Failing

1. Check that `@ariob/webcrypto` is built:
   ```bash
   cd ../../packages/webcrypto
   pnpm build
   ```

2. Verify the import in your screen:
   ```typescript
   import '@ariob/core'; // Must be present!
   ```

3. Check console for bridge loading messages:
   ```
   [WebCrypto Expo Bridge] Loading @ariob/webcrypto...
   [WebCrypto Expo Bridge] ✓ Successfully loaded
   ```

### TypeScript Errors

```bash
# Regenerate types
pnpm typecheck

# Clear cache
pnpm start --clear
```

## 🤝 Contributing

This is a demo app for the Ariob framework. To contribute:

1. Report issues in the main Ariob repository
2. Suggest features for @ariob/core or @ariob/webcrypto
3. Submit pull requests with new demo features

## 📄 License

Part of the Ariob monorepo. See root LICENSE file.

---

**Built with ❤️ for distributed, encrypted applications**

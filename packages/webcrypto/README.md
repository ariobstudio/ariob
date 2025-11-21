# 🔐 @ariob/webcrypto

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)

Native WebCrypto API polyfill for React Native and Expo using platform-native cryptography (CryptoKit/KeyStore)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Reference](#-api-reference) • [Implementation Coverage](#-implementation-coverage)

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Supported Algorithms](#-supported-algorithms)
- [API Reference](#-api-reference)
- [Implementation Coverage](#-implementation-coverage)
- [Performance](#-performance)
- [Security](#-security)
- [Contributing](#-contributing)

## 🎯 Overview

`@ariob/webcrypto` provides a standards-compliant W3C WebCrypto API implementation for React Native and Expo, leveraging native platform cryptography for maximum security and performance. It's designed to be a drop-in replacement for browser `crypto.subtle` APIs.

**Key Benefits:**
- ⚡ **10-100x faster** than pure JavaScript implementations
- 🛡️ **Hardware-backed security** using CryptoKit (iOS) and KeyStore (Android)
- 📱 **Cross-platform** support (iOS, Android, LynxJS)
- 🔄 **Zero configuration** when used with `@ariob/core`
- 📦 **Lightweight** with minimal dependencies
- 🎯 **Standards-compliant** W3C WebCrypto API

## ✨ Features

- 🔐 **Secure Hashing** - SHA-256, SHA-384, SHA-512
- 🔒 **Symmetric Encryption** - AES-GCM, AES-CBC with 128/192/256-bit keys
- 🔑 **Asymmetric Cryptography** - ECDSA (P-256, P-384, P-521), RSA-PSS, RSA-OAEP
- 🤝 **Key Derivation** - PBKDF2, HKDF, ECDH
- ✍️ **Digital Signatures** - ECDSA, RSA-PSS, HMAC
- 📦 **Key Import/Export** - JWK, PKCS8, SPKI, Raw formats
- 🎲 **Random Generation** - Cryptographically secure random bytes
- 🛡️ **Type Safety** - Full TypeScript support with native type definitions

## 📦 Installation

### Using with @ariob/core (Recommended)

If you're using `@ariob/core`, the crypto bridge is automatically configured:

```bash
pnpm add @ariob/core
```

The crypto module is automatically initialized based on your environment (LynxJS, Expo, or Web).

### Standalone Installation

For standalone usage in Expo or React Native projects:

```bash
# Expo projects
pnpm add @ariob/webcrypto

# Bare React Native projects
pnpm add @ariob/webcrypto
npx pod-install
```

### Prerequisites

- **Expo SDK** >= 50.0.0
- **React Native** >= 0.73.0
- **iOS** >= 13.0
- **Android** >= API 23

## 🚀 Usage

### Automatic Configuration (with @ariob/core)

When using `@ariob/core`, crypto is automatically available:

```typescript
import '@ariob/core';

// Crypto is automatically configured on globalThis.crypto
const hash = await crypto.subtle.digest('SHA-256', data);
```

No need to import `crypto.expo` - the environment detection happens automatically!

### Manual Configuration (Standalone)

For standalone usage without `@ariob/core`:

```typescript
import { crypto } from '@ariob/webcrypto';

// Use the WebCrypto API
const hash = await crypto.subtle.digest('SHA-256', data);
```

### Quick Examples

#### Hashing Data

```typescript
const data = new TextEncoder().encode('Hello, World!');
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
console.log('SHA-256:', hashHex);
```

#### Generating and Using AES Keys

```typescript
// Generate a 256-bit AES-GCM key
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);

// Encrypt data
const iv = crypto.getRandomValues(new Uint8Array(12));
const data = new TextEncoder().encode('Secret message');
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  data
);

// Decrypt data
const decrypted = await crypto.subtle.decrypt(
  { name: 'AES-GCM', iv },
  key,
  encrypted
);
const text = new TextDecoder().decode(decrypted);
```

#### ECDSA Digital Signatures

```typescript
// Generate ECDSA key pair
const keyPair = await crypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify']
);

// Sign data
const data = new TextEncoder().encode('Document to sign');
const signature = await crypto.subtle.sign(
  { name: 'ECDSA', hash: 'SHA-256' },
  keyPair.privateKey,
  data
);

// Verify signature
const isValid = await crypto.subtle.verify(
  { name: 'ECDSA', hash: 'SHA-256' },
  keyPair.publicKey,
  signature,
  data
);
console.log('Signature valid:', isValid);
```

#### Key Derivation with PBKDF2

```typescript
// Import password as key material
const password = new TextEncoder().encode('user-password');
const keyMaterial = await crypto.subtle.importKey(
  'raw',
  password,
  'PBKDF2',
  false,
  ['deriveBits', 'deriveKey']
);

// Derive encryption key
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.deriveKey(
  {
    name: 'PBKDF2',
    salt,
    iterations: 100000,
    hash: 'SHA-256'
  },
  keyMaterial,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
```

## 🔐 Supported Algorithms

### Hashing Algorithms

| Algorithm | Status | Notes |
|-----------|--------|-------|
| `SHA-256` | ✅ | Recommended for general use |
| `SHA-384` | ✅ | Higher security margin |
| `SHA-512` | ✅ | Maximum security |
| `SHA-1` | ❌ | Deprecated, not supported |

### Symmetric Encryption

| Algorithm | Key Sizes | Status | Notes |
|-----------|-----------|--------|-------|
| `AES-GCM` | 128, 192, 256 | ✅ | Authenticated encryption (recommended) |
| `AES-CBC` | 128, 192, 256 | ✅ | Traditional block cipher |
| `AES-CTR` | 128, 192, 256 | ✅ | Counter mode |
| `AES-KW` | 128, 192, 256 | ❌ | Key wrapping not yet supported |

### Asymmetric Cryptography

| Algorithm | Curves/Sizes | Status | Operations |
|-----------|-------------|--------|------------|
| `ECDSA` | P-256, P-384, P-521 | ✅ | Sign, Verify, Generate |
| `ECDH` | P-256, P-384, P-521 | ✅ | Derive Key/Bits |
| `RSA-PSS` | 2048, 3072, 4096 | ✅ | Sign, Verify, Generate |
| `RSA-OAEP` | 2048, 3072, 4096 | ✅ | Encrypt, Decrypt, Generate |
| `Ed25519` | - | ❌ | Not yet supported |

### Key Derivation Functions

| Algorithm | Status | Notes |
|-----------|--------|-------|
| `PBKDF2` | ✅ | Password-based key derivation |
| `HKDF` | ✅ | HMAC-based KDF |
| `ECDH` | ✅ | Elliptic curve Diffie-Hellman |

### Message Authentication

| Algorithm | Status | Notes |
|-----------|--------|-------|
| `HMAC` | ✅ | Supports SHA-256, SHA-384, SHA-512 |

## 📚 API Reference

### crypto.subtle.digest()

Computes a cryptographic hash of the provided data.

```typescript
digest(
  algorithm: AlgorithmIdentifier,
  data: BufferSource
): Promise<ArrayBuffer>
```

**Parameters:**
- `algorithm` - Hash algorithm name (e.g., "SHA-256")
- `data` - Data to hash (ArrayBuffer or TypedArray)

**Returns:** Promise resolving to hash as ArrayBuffer

**Example:**
```typescript
const data = new TextEncoder().encode('Hello');
const hash = await crypto.subtle.digest('SHA-256', data);
```

### crypto.subtle.generateKey()

Generates a new cryptographic key or key pair.

```typescript
generateKey(
  algorithm: AlgorithmIdentifier,
  extractable: boolean,
  keyUsages: KeyUsage[]
): Promise<CryptoKey | CryptoKeyPair>
```

**Parameters:**
- `algorithm` - Algorithm and parameters for key generation
- `extractable` - Whether the key can be exported
- `keyUsages` - Array of allowed operations (e.g., ['encrypt', 'decrypt'])

**Returns:** Promise resolving to CryptoKey or CryptoKeyPair

**Example:**
```typescript
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);
```

### crypto.subtle.encrypt()

Encrypts data using the specified key.

```typescript
encrypt(
  algorithm: AlgorithmIdentifier,
  key: CryptoKey,
  data: BufferSource
): Promise<ArrayBuffer>
```

**Parameters:**
- `algorithm` - Encryption algorithm and parameters (e.g., { name: 'AES-GCM', iv })
- `key` - CryptoKey to use for encryption
- `data` - Data to encrypt

**Returns:** Promise resolving to encrypted data as ArrayBuffer

**Example:**
```typescript
const iv = crypto.getRandomValues(new Uint8Array(12));
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  data
);
```

### crypto.subtle.decrypt()

Decrypts data using the specified key.

```typescript
decrypt(
  algorithm: AlgorithmIdentifier,
  key: CryptoKey,
  data: BufferSource
): Promise<ArrayBuffer>
```

**Parameters:**
- `algorithm` - Decryption algorithm and parameters (must match encryption)
- `key` - CryptoKey to use for decryption
- `data` - Data to decrypt

**Returns:** Promise resolving to decrypted data as ArrayBuffer

### crypto.subtle.sign()

Creates a digital signature.

```typescript
sign(
  algorithm: AlgorithmIdentifier,
  key: CryptoKey,
  data: BufferSource
): Promise<ArrayBuffer>
```

**Parameters:**
- `algorithm` - Signature algorithm and parameters
- `key` - Private CryptoKey for signing
- `data` - Data to sign

**Returns:** Promise resolving to signature as ArrayBuffer

**Example:**
```typescript
const signature = await crypto.subtle.sign(
  { name: 'ECDSA', hash: 'SHA-256' },
  privateKey,
  data
);
```

### crypto.subtle.verify()

Verifies a digital signature.

```typescript
verify(
  algorithm: AlgorithmIdentifier,
  key: CryptoKey,
  signature: BufferSource,
  data: BufferSource
): Promise<boolean>
```

**Parameters:**
- `algorithm` - Signature algorithm (must match signing)
- `key` - Public CryptoKey for verification
- `signature` - Signature to verify
- `data` - Original signed data

**Returns:** Promise resolving to boolean (true if valid)

### crypto.subtle.importKey()

Imports a key from external format.

```typescript
importKey(
  format: KeyFormat,
  keyData: BufferSource | JsonWebKey,
  algorithm: AlgorithmIdentifier,
  extractable: boolean,
  keyUsages: KeyUsage[]
): Promise<CryptoKey>
```

**Parameters:**
- `format` - Key format ('raw', 'pkcs8', 'spki', 'jwk')
- `keyData` - Key data in the specified format
- `algorithm` - Algorithm this key will be used with
- `extractable` - Whether the key can be exported later
- `keyUsages` - Allowed operations for this key

**Returns:** Promise resolving to imported CryptoKey

**Example:**
```typescript
const key = await crypto.subtle.importKey(
  'jwk',
  jwkObject,
  { name: 'AES-GCM' },
  true,
  ['encrypt', 'decrypt']
);
```

### crypto.subtle.exportKey()

Exports a key to external format.

```typescript
exportKey(
  format: KeyFormat,
  key: CryptoKey
): Promise<ArrayBuffer | JsonWebKey>
```

**Parameters:**
- `format` - Desired export format ('raw', 'pkcs8', 'spki', 'jwk')
- `key` - CryptoKey to export (must be extractable)

**Returns:** Promise resolving to key data in requested format

### crypto.subtle.deriveKey()

Derives a new key from existing key material.

```typescript
deriveKey(
  algorithm: AlgorithmIdentifier,
  baseKey: CryptoKey,
  derivedKeyAlgorithm: AlgorithmIdentifier,
  extractable: boolean,
  keyUsages: KeyUsage[]
): Promise<CryptoKey>
```

**Example:**
```typescript
const derivedKey = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
  passwordKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
```

### crypto.subtle.deriveBits()

Derives raw bits from key material.

```typescript
deriveBits(
  algorithm: AlgorithmIdentifier,
  baseKey: CryptoKey,
  length: number
): Promise<ArrayBuffer>
```

### crypto.getRandomValues()

Generates cryptographically secure random values.

```typescript
getRandomValues<T extends TypedArray>(array: T): T
```

**Parameters:**
- `array` - TypedArray to fill with random values (modified in place)

**Returns:** The same array filled with random values

**Example:**
```typescript
const randomBytes = crypto.getRandomValues(new Uint8Array(32));
```

## 📊 Implementation Coverage

### Complete Coverage

The following WebCrypto operations are fully implemented and tested:

#### crypto.subtle.digest()

| Algorithm | Status | Performance vs JS |
|-----------|--------|------------------|
| `SHA-256` | ✅ | ~100x faster |
| `SHA-384` | ✅ | ~100x faster |
| `SHA-512` | ✅ | ~100x faster |

#### crypto.subtle.generateKey()

| Algorithm | Format | Status |
|-----------|--------|--------|
| `AES-GCM` (128/192/256) | - | ✅ |
| `AES-CBC` (128/192/256) | - | ✅ |
| `AES-CTR` (128/192/256) | - | ✅ |
| `HMAC` | - | ✅ |
| `ECDSA` (P-256/384/521) | - | ✅ |
| `ECDH` (P-256/384/521) | - | ✅ |
| `RSA-PSS` (2048/3072/4096) | - | ✅ |
| `RSA-OAEP` (2048/3072/4096) | - | ✅ |

#### crypto.subtle.importKey()

| Algorithm | raw | jwk | pkcs8 | spki |
|-----------|-----|-----|-------|------|
| `AES-GCM` | ✅ | ✅ | - | - |
| `AES-CBC` | ✅ | ✅ | - | - |
| `AES-CTR` | ✅ | ✅ | - | - |
| `HMAC` | ✅ | ✅ | - | - |
| `PBKDF2` | ✅ | - | - | - |
| `HKDF` | ✅ | - | - | - |
| `ECDSA` | ✅ | ✅ | ✅ | ✅ |
| `ECDH` | ✅ | ✅ | ✅ | ✅ |
| `RSA-PSS` | - | ✅ | ✅ | ✅ |
| `RSA-OAEP` | - | ✅ | ✅ | ✅ |

#### crypto.subtle.exportKey()

| Algorithm | raw | jwk | pkcs8 | spki |
|-----------|-----|-----|-------|------|
| `AES-GCM` | ✅ | ✅ | - | - |
| `AES-CBC` | ✅ | ✅ | - | - |
| `AES-CTR` | ✅ | ✅ | - | - |
| `HMAC` | ✅ | ✅ | - | - |
| `ECDSA` | ✅ | ✅ | ✅ | ✅ |
| `ECDH` | ✅ | ✅ | ✅ | ✅ |
| `RSA-PSS` | - | ✅ | ✅ | ✅ |
| `RSA-OAEP` | - | ✅ | ✅ | ✅ |

#### crypto.subtle.encrypt() / decrypt()

| Algorithm | Status | Authentication |
|-----------|--------|----------------|
| `AES-GCM` | ✅ | Built-in (AEAD) |
| `AES-CBC` | ✅ | Requires HMAC |
| `AES-CTR` | ✅ | Requires HMAC |
| `RSA-OAEP` | ✅ | Built-in padding |

#### crypto.subtle.sign() / verify()

| Algorithm | Hash | Status |
|-----------|------|--------|
| `ECDSA` | SHA-256 | ✅ |
| `ECDSA` | SHA-384 | ✅ |
| `ECDSA` | SHA-512 | ✅ |
| `RSA-PSS` | SHA-256 | ✅ |
| `RSA-PSS` | SHA-384 | ✅ |
| `RSA-PSS` | SHA-512 | ✅ |
| `HMAC` | SHA-256 | ✅ |
| `HMAC` | SHA-384 | ✅ |
| `HMAC` | SHA-512 | ✅ |

#### crypto.subtle.deriveBits() / deriveKey()

| Algorithm | Status | Use Cases |
|-----------|--------|-----------|
| `PBKDF2` | ✅ | Password-based keys |
| `HKDF` | ✅ | Key derivation/expansion |
| `ECDH` | ✅ | Shared secret derivation |

#### crypto.getRandomValues()

| Type | Status | Quality |
|------|--------|---------|
| `Uint8Array` | ✅ | CSPRNG |
| `Uint16Array` | ✅ | CSPRNG |
| `Uint32Array` | ✅ | CSPRNG |
| `Int8Array` | ✅ | CSPRNG |
| `Int16Array` | ✅ | CSPRNG |
| `Int32Array` | ✅ | CSPRNG |

**Note:** CSPRNG = Cryptographically Secure Pseudorandom Number Generator (hardware-backed)

### Platform Support

| Platform | iOS Version | Android API | Status |
|----------|-------------|-------------|--------|
| LynxJS | 13.0+ | 23+ | ✅ Fully Supported |
| Expo | 13.0+ | 23+ | ✅ Fully Supported |
| React Native | 13.0+ | 23+ | ✅ Fully Supported |
| Web | - | - | ✅ Native WebCrypto |

### Not Yet Implemented

The following features are planned for future releases:

- ❌ `AES-KW` (Key Wrapping) - Planned for v0.2.0
- ❌ `Ed25519` signatures - Planned for v0.3.0
- ❌ `X25519` key agreement - Planned for v0.3.0
- ❌ `wrapKey()` / `unwrapKey()` - Planned for v0.2.0

## ⚡ Performance

Native cryptography provides significant performance improvements over pure JavaScript:

| Operation | JS Implementation | Native (@ariob/webcrypto) | Speedup |
|-----------|------------------|---------------------------|---------|
| SHA-256 (1MB) | ~150ms | ~1.5ms | ~100x |
| AES-GCM Encrypt (1MB) | ~200ms | ~2ms | ~100x |
| ECDSA Sign (P-256) | ~25ms | ~1ms | ~25x |
| ECDSA Verify (P-256) | ~30ms | ~1.5ms | ~20x |
| PBKDF2 (100k iterations) | ~2000ms | ~50ms | ~40x |
| RSA-PSS Sign (2048-bit) | ~100ms | ~5ms | ~20x |

*Benchmarks performed on iPhone 13 Pro and Pixel 6 Pro*

### Memory Efficiency

- **Zero-copy operations** where possible using native buffers
- **Automatic memory management** through native module lifecycle
- **No large crypto libraries** bundled in JavaScript (saves ~500KB)

## 🛡️ Security

### Hardware-Backed Security

- **iOS**: Uses Apple CryptoKit framework (hardware-accelerated)
- **Android**: Uses Android KeyStore and Security Provider
- **Secure Enclave**: Keys can be stored in device secure enclave (iOS)
- **Hardware RNG**: Random generation uses hardware entropy sources

### Best Practices

1. **Use authenticated encryption** (AES-GCM) instead of AES-CBC
2. **Generate secure random IVs** for each encryption operation
3. **Use PBKDF2 with 100,000+ iterations** for password-based keys
4. **Prefer ECDSA over RSA** for better performance
5. **Mark sensitive keys as non-extractable** when possible
6. **Use SHA-256 or higher** for hashing (never SHA-1)

### Security Considerations

```typescript
// ❌ BAD: Reusing IV
const iv = new Uint8Array(12);
const encrypted1 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data1);
const encrypted2 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data2);

// ✅ GOOD: Generate new IV for each encryption
const iv1 = crypto.getRandomValues(new Uint8Array(12));
const encrypted1 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv1 }, key, data1);
const iv2 = crypto.getRandomValues(new Uint8Array(12));
const encrypted2 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv2 }, key, data2);

// ❌ BAD: Weak password derivation
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 1000, hash: 'SHA-256' },
  passwordKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);

// ✅ GOOD: Strong password derivation
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
  passwordKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
```

## 🔧 Advanced Usage

### Working with Gun.js SEA

The module is designed to work seamlessly with Gun.js SEA (Security, Encryption, Authorization):

```typescript
import Gun from 'gun';
import '@ariob/core'; // Automatically configures crypto

// Gun SEA will use native crypto automatically
const SEA = Gun.SEA;
const pair = await SEA.pair();
const encrypted = await SEA.encrypt('message', pair);
const signed = await SEA.sign('data', pair);
```

### Custom Algorithm Parameters

```typescript
// ECDSA with specific curve and hash
const keyPair = await crypto.subtle.generateKey(
  {
    name: 'ECDSA',
    namedCurve: 'P-384' // Higher security
  },
  true,
  ['sign', 'verify']
);

// RSA with custom exponent and modulus
const rsaKeyPair = await crypto.subtle.generateKey(
  {
    name: 'RSA-PSS',
    modulusLength: 4096,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: 'SHA-512'
  },
  true,
  ['sign', 'verify']
);

// PBKDF2 with custom parameters
const derivedKey = await crypto.subtle.deriveKey(
  {
    name: 'PBKDF2',
    salt: crypto.getRandomValues(new Uint8Array(32)),
    iterations: 210000, // OWASP recommendation
    hash: 'SHA-512'
  },
  baseKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
```

## 🐛 Troubleshooting

### Common Issues

**Issue:** `Cannot find module '@ariob/webcrypto'`
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules
pnpm install
npx pod-install # iOS only
```

**Issue:** Native module not found in Expo
```bash
# Solution: Rebuild development client
npx expo prebuild --clean
npx expo run:ios # or run:android
```

**Issue:** TypeScript errors with crypto types
```typescript
// Solution: Add to tsconfig.json
{
  "compilerOptions": {
    "types": ["@ariob/webcrypto"]
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new features
4. Ensure all tests pass (`pnpm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ariobstudio/ariob.git
cd ariob/packages/webcrypto

# Install dependencies
pnpm install

# Build the module
pnpm build

# Run tests
pnpm test
```

## 📄 License

MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🙏 Acknowledgments

- [W3C WebCrypto API Specification](https://www.w3.org/TR/WebCryptoAPI/)
- [Apple CryptoKit](https://developer.apple.com/documentation/cryptokit)
- [Android Keystore System](https://developer.android.com/training/articles/keystore)
- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [Gun.js](https://gun.eco/) for decentralized data sync

## 🔗 Related Packages

- [@ariob/core](../core/README.md) - Framework-agnostic core with automatic crypto bridge
- [@ariob/ui](../ui/README.md) - Shared UI component library
- [@ariob/ai](../ai/README.md) - Native ML bridge helpers

---

<div align="center">
Built with ❤️ by the Ariob team
</div>

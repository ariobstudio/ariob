# WebCrypto API Implementation Coverage

This document provides detailed coverage information for the W3C WebCrypto API implementation in `@ariob/webcrypto`.

## Status Legend

- ✅ **Fully Implemented** - Feature is complete and tested
- 🚧 **Partial** - Feature is partially implemented
- ❌ **Not Implemented** - Feature not yet available
- 🔮 **Planned** - Feature planned for future release

## Top-Level APIs

### Crypto Interface

| Property/Method | Status | Notes |
|----------------|--------|-------|
| `crypto.subtle` | ✅ | Full SubtleCrypto API |
| `crypto.getRandomValues()` | ✅ | Hardware-backed CSPRNG |
| `crypto.randomUUID()` | ❌ | Not yet implemented |

### SubtleCrypto Interface

| Method | Status | Platforms |
|--------|--------|-----------|
| `digest()` | ✅ | LynxJS, Expo, Web |
| `generateKey()` | ✅ | LynxJS, Expo, Web |
| `importKey()` | ✅ | LynxJS, Expo, Web |
| `exportKey()` | ✅ | LynxJS, Expo, Web |
| `encrypt()` | ✅ | LynxJS, Expo, Web |
| `decrypt()` | ✅ | LynxJS, Expo, Web |
| `sign()` | ✅ | LynxJS, Expo, Web |
| `verify()` | ✅ | LynxJS, Expo, Web |
| `deriveKey()` | ✅ | LynxJS, Expo, Web |
| `deriveBits()` | ✅ | LynxJS, Expo, Web |
| `wrapKey()` | ❌ | Planned for v0.2.0 |
| `unwrapKey()` | ❌ | Planned for v0.2.0 |

## Hashing Algorithms

### crypto.subtle.digest()

| Algorithm | Status | Output Size | Performance | Notes |
|-----------|--------|-------------|-------------|-------|
| `SHA-1` | ❌ | 160 bits | - | Deprecated, not supported |
| `SHA-256` | ✅ | 256 bits | ~100x faster | Recommended |
| `SHA-384` | ✅ | 384 bits | ~100x faster | Higher security |
| `SHA-512` | ✅ | 512 bits | ~100x faster | Maximum security |
| `SHA-3` | ❌ | Variable | - | Not yet supported |

#### Example

```typescript
const data = new TextEncoder().encode('Hello, World!');
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
```

## Symmetric Encryption

### AES-GCM (Authenticated Encryption)

| Operation | Key Sizes | IV Size | Status | Notes |
|-----------|-----------|---------|--------|-------|
| `generateKey()` | 128, 192, 256 | - | ✅ | Recommended |
| `importKey()` (raw) | 128, 192, 256 | - | ✅ | Direct key import |
| `importKey()` (jwk) | 128, 192, 256 | - | ✅ | JSON Web Key |
| `exportKey()` (raw) | 128, 192, 256 | - | ✅ | Direct key export |
| `exportKey()` (jwk) | 128, 192, 256 | - | ✅ | JSON Web Key |
| `encrypt()` | 128, 192, 256 | 96 bits (12 bytes) | ✅ | AEAD, includes authentication |
| `decrypt()` | 128, 192, 256 | 96 bits (12 bytes) | ✅ | Automatic authentication check |

**Additional Parameters:**
- `additionalData` (optional) - Additional authenticated data (AAD)
- `tagLength` (optional) - Authentication tag length (default: 128 bits)

#### Example

```typescript
// Generate 256-bit AES-GCM key
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);

// Encrypt with random IV
const iv = crypto.getRandomValues(new Uint8Array(12));
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  data
);
```

### AES-CBC (Block Cipher Mode)

| Operation | Key Sizes | IV Size | Status | Notes |
|-----------|-----------|---------|--------|-------|
| `generateKey()` | 128, 192, 256 | - | ✅ | |
| `importKey()` (raw) | 128, 192, 256 | - | ✅ | |
| `importKey()` (jwk) | 128, 192, 256 | - | ✅ | |
| `exportKey()` (raw) | 128, 192, 256 | - | ✅ | |
| `exportKey()` (jwk) | 128, 192, 256 | - | ✅ | |
| `encrypt()` | 128, 192, 256 | 128 bits (16 bytes) | ✅ | No authentication, use HMAC |
| `decrypt()` | 128, 192, 256 | 128 bits (16 bytes) | ✅ | |

**Security Note:** AES-CBC does not provide authentication. Always use HMAC for integrity.

### AES-CTR (Counter Mode)

| Operation | Key Sizes | Counter Size | Status | Notes |
|-----------|-----------|--------------|--------|-------|
| `generateKey()` | 128, 192, 256 | - | ✅ | |
| `importKey()` (raw) | 128, 192, 256 | - | ✅ | |
| `importKey()` (jwk) | 128, 192, 256 | - | ✅ | |
| `exportKey()` (raw) | 128, 192, 256 | - | ✅ | |
| `exportKey()` (jwk) | 128, 192, 256 | - | ✅ | |
| `encrypt()` | 128, 192, 256 | 64-128 bits | ✅ | |
| `decrypt()` | 128, 192, 256 | 64-128 bits | ✅ | |

**Additional Parameters:**
- `counter` - Initial counter block
- `length` - Counter length in bits

### AES-KW (Key Wrapping)

| Operation | Status | Notes |
|-----------|--------|-------|
| All operations | ❌ | Planned for v0.2.0 |

## Asymmetric Cryptography

### ECDSA (Elliptic Curve Digital Signatures)

| Operation | P-256 | P-384 | P-521 | Status | Notes |
|-----------|-------|-------|-------|--------|-------|
| `generateKey()` | ✅ | ✅ | ✅ | ✅ | Recommended over RSA |
| `importKey()` (raw) | ✅ | ✅ | ✅ | ✅ | Uncompressed point format |
| `importKey()` (jwk) | ✅ | ✅ | ✅ | ✅ | JSON Web Key |
| `importKey()` (pkcs8) | ✅ | ✅ | ✅ | ✅ | Private key format |
| `importKey()` (spki) | ✅ | ✅ | ✅ | ✅ | Public key format |
| `exportKey()` (raw) | ✅ | ✅ | ✅ | ✅ | Uncompressed point |
| `exportKey()` (jwk) | ✅ | ✅ | ✅ | ✅ | JSON Web Key |
| `exportKey()` (pkcs8) | ✅ | ✅ | ✅ | ✅ | Private key |
| `exportKey()` (spki) | ✅ | ✅ | ✅ | ✅ | Public key |
| `sign()` (SHA-256) | ✅ | ✅ | ✅ | ✅ | |
| `sign()` (SHA-384) | ✅ | ✅ | ✅ | ✅ | |
| `sign()` (SHA-512) | ✅ | ✅ | ✅ | ✅ | |
| `verify()` (SHA-256) | ✅ | ✅ | ✅ | ✅ | |
| `verify()` (SHA-384) | ✅ | ✅ | ✅ | ✅ | |
| `verify()` (SHA-512) | ✅ | ✅ | ✅ | ✅ | |

#### Example

```typescript
// Generate P-256 key pair
const keyPair = await crypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify']
);

// Sign data
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
```

### ECDH (Elliptic Curve Diffie-Hellman)

| Operation | P-256 | P-384 | P-521 | Status | Notes |
|-----------|-------|-------|-------|--------|-------|
| `generateKey()` | ✅ | ✅ | ✅ | ✅ | |
| `importKey()` (raw) | ✅ | ✅ | ✅ | ✅ | |
| `importKey()` (jwk) | ✅ | ✅ | ✅ | ✅ | |
| `importKey()` (pkcs8) | ✅ | ✅ | ✅ | ✅ | Private key |
| `importKey()` (spki) | ✅ | ✅ | ✅ | ✅ | Public key |
| `exportKey()` (raw) | ✅ | ✅ | ✅ | ✅ | |
| `exportKey()` (jwk) | ✅ | ✅ | ✅ | ✅ | |
| `exportKey()` (pkcs8) | ✅ | ✅ | ✅ | ✅ | |
| `exportKey()` (spki) | ✅ | ✅ | ✅ | ✅ | |
| `deriveKey()` | ✅ | ✅ | ✅ | ✅ | Shared secret derivation |
| `deriveBits()` | ✅ | ✅ | ✅ | ✅ | Raw shared secret |

#### Example

```typescript
// Alice generates key pair
const aliceKeyPair = await crypto.subtle.generateKey(
  { name: 'ECDH', namedCurve: 'P-256' },
  false,
  ['deriveKey', 'deriveBits']
);

// Bob generates key pair
const bobKeyPair = await crypto.subtle.generateKey(
  { name: 'ECDH', namedCurve: 'P-256' },
  false,
  ['deriveKey', 'deriveBits']
);

// Alice derives shared AES key using Bob's public key
const aliceSharedKey = await crypto.subtle.deriveKey(
  { name: 'ECDH', public: bobKeyPair.publicKey },
  aliceKeyPair.privateKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
```

### RSA-PSS (RSA Probabilistic Signature Scheme)

| Operation | 2048 | 3072 | 4096 | Status | Notes |
|-----------|------|------|------|--------|-------|
| `generateKey()` | ✅ | ✅ | ✅ | ✅ | Slower than ECDSA |
| `importKey()` (jwk) | ✅ | ✅ | ✅ | ✅ | |
| `importKey()` (pkcs8) | ✅ | ✅ | ✅ | ✅ | Private key |
| `importKey()` (spki) | ✅ | ✅ | ✅ | ✅ | Public key |
| `exportKey()` (jwk) | ✅ | ✅ | ✅ | ✅ | |
| `exportKey()` (pkcs8) | ✅ | ✅ | ✅ | ✅ | |
| `exportKey()` (spki) | ✅ | ✅ | ✅ | ✅ | |
| `sign()` (SHA-256) | ✅ | ✅ | ✅ | ✅ | |
| `sign()` (SHA-384) | ✅ | ✅ | ✅ | ✅ | |
| `sign()` (SHA-512) | ✅ | ✅ | ✅ | ✅ | |
| `verify()` (SHA-256) | ✅ | ✅ | ✅ | ✅ | |
| `verify()` (SHA-384) | ✅ | ✅ | ✅ | ✅ | |
| `verify()` (SHA-512) | ✅ | ✅ | ✅ | ✅ | |

**Additional Parameters:**
- `saltLength` - Salt length in bytes (default: hash output size)

### RSA-OAEP (RSA Optimal Asymmetric Encryption Padding)

| Operation | 2048 | 3072 | 4096 | Status | Notes |
|-----------|------|------|------|--------|-------|
| `generateKey()` | ✅ | ✅ | ✅ | ✅ | |
| `importKey()` (jwk) | ✅ | ✅ | ✅ | ✅ | |
| `importKey()` (pkcs8) | ✅ | ✅ | ✅ | ✅ | |
| `importKey()` (spki) | ✅ | ✅ | ✅ | ✅ | |
| `exportKey()` (jwk) | ✅ | ✅ | ✅ | ✅ | |
| `exportKey()` (pkcs8) | ✅ | ✅ | ✅ | ✅ | |
| `exportKey()` (spki) | ✅ | ✅ | ✅ | ✅ | |
| `encrypt()` (SHA-256) | ✅ | ✅ | ✅ | ✅ | |
| `encrypt()` (SHA-384) | ✅ | ✅ | ✅ | ✅ | |
| `encrypt()` (SHA-512) | ✅ | ✅ | ✅ | ✅ | |
| `decrypt()` (SHA-256) | ✅ | ✅ | ✅ | ✅ | |
| `decrypt()` (SHA-384) | ✅ | ✅ | ✅ | ✅ | |
| `decrypt()` (SHA-512) | ✅ | ✅ | ✅ | ✅ | |

**Additional Parameters:**
- `label` (optional) - Additional label for encryption

### EdDSA (Edwards-curve Digital Signatures)

| Operation | Ed25519 | Ed448 | Status | Notes |
|-----------|---------|-------|--------|-------|
| All operations | ❌ | ❌ | 🔮 | Planned for v0.3.0 |

### X25519/X448 (Curve25519/Curve448 Key Agreement)

| Operation | X25519 | X448 | Status | Notes |
|-----------|--------|------|--------|-------|
| All operations | ❌ | ❌ | 🔮 | Planned for v0.3.0 |

## Key Derivation Functions

### PBKDF2 (Password-Based Key Derivation Function 2)

| Operation | Status | Hash Algorithms | Notes |
|-----------|--------|-----------------|-------|
| `importKey()` (raw) | ✅ | - | Import password |
| `deriveKey()` | ✅ | SHA-256, SHA-384, SHA-512 | Derive encryption key |
| `deriveBits()` | ✅ | SHA-256, SHA-384, SHA-512 | Derive raw bits |

**Parameters:**
- `salt` - Random salt (16+ bytes recommended)
- `iterations` - Iteration count (100,000+ recommended)
- `hash` - Hash algorithm to use

**Security Note:** Use at least 100,000 iterations for production. OWASP recommends 210,000+.

#### Example

```typescript
// Import password
const password = new TextEncoder().encode('user-password');
const keyMaterial = await crypto.subtle.importKey(
  'raw',
  password,
  'PBKDF2',
  false,
  ['deriveKey', 'deriveBits']
);

// Derive AES key
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

### HKDF (HMAC-based Key Derivation Function)

| Operation | Status | Hash Algorithms | Notes |
|-----------|--------|-----------------|-------|
| `importKey()` (raw) | ✅ | - | Import key material |
| `deriveKey()` | ✅ | SHA-256, SHA-384, SHA-512 | Derive encryption key |
| `deriveBits()` | ✅ | SHA-256, SHA-384, SHA-512 | Derive raw bits |

**Parameters:**
- `salt` - Optional salt
- `info` - Application-specific context
- `hash` - Hash algorithm to use

#### Example

```typescript
// Import key material
const keyMaterial = await crypto.subtle.importKey(
  'raw',
  inputKeyMaterial,
  'HKDF',
  false,
  ['deriveKey', 'deriveBits']
);

// Derive AES key
const key = await crypto.subtle.deriveKey(
  {
    name: 'HKDF',
    salt: new Uint8Array(16),
    info: new TextEncoder().encode('my-app-context'),
    hash: 'SHA-256'
  },
  keyMaterial,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
```

## Message Authentication Codes

### HMAC (Hash-based Message Authentication Code)

| Operation | Status | Hash Algorithms | Notes |
|-----------|--------|-----------------|-------|
| `generateKey()` | ✅ | SHA-256, SHA-384, SHA-512 | Variable key length |
| `importKey()` (raw) | ✅ | SHA-256, SHA-384, SHA-512 | |
| `importKey()` (jwk) | ✅ | SHA-256, SHA-384, SHA-512 | |
| `exportKey()` (raw) | ✅ | SHA-256, SHA-384, SHA-512 | |
| `exportKey()` (jwk) | ✅ | SHA-256, SHA-384, SHA-512 | |
| `sign()` | ✅ | SHA-256, SHA-384, SHA-512 | Generate MAC |
| `verify()` | ✅ | SHA-256, SHA-384, SHA-512 | Verify MAC |

#### Example

```typescript
// Generate HMAC key
const key = await crypto.subtle.generateKey(
  { name: 'HMAC', hash: 'SHA-256' },
  true,
  ['sign', 'verify']
);

// Generate MAC
const mac = await crypto.subtle.sign(
  'HMAC',
  key,
  data
);

// Verify MAC
const isValid = await crypto.subtle.verify(
  'HMAC',
  key,
  mac,
  data
);
```

## Random Number Generation

### crypto.getRandomValues()

| Type | Status | Size | Notes |
|------|--------|------|-------|
| `Int8Array` | ✅ | 8-bit | Signed integers |
| `Uint8Array` | ✅ | 8-bit | Unsigned integers (most common) |
| `Uint8ClampedArray` | ✅ | 8-bit | Clamped to 0-255 |
| `Int16Array` | ✅ | 16-bit | Signed integers |
| `Uint16Array` | ✅ | 16-bit | Unsigned integers |
| `Int32Array` | ✅ | 32-bit | Signed integers |
| `Uint32Array` | ✅ | 32-bit | Unsigned integers |
| `BigInt64Array` | ✅ | 64-bit | Signed BigInt |
| `BigUint64Array` | ✅ | 64-bit | Unsigned BigInt |

**Maximum Size:** 65,536 bytes per call

**Quality:** Hardware-backed CSPRNG (Cryptographically Secure Pseudorandom Number Generator)

#### Example

```typescript
// Generate 32 random bytes
const randomBytes = crypto.getRandomValues(new Uint8Array(32));

// Generate random 32-bit integers
const randomInts = crypto.getRandomValues(new Uint32Array(10));
```

## Key Formats

### Import/Export Format Support

| Format | Description | Symmetric | Asymmetric Public | Asymmetric Private | Status |
|--------|-------------|-----------|-------------------|-------------------|--------|
| `raw` | Raw binary data | ✅ | ✅ (EC only) | ❌ | ✅ |
| `pkcs8` | Private Key Info | ❌ | ❌ | ✅ | ✅ |
| `spki` | Subject Public Key Info | ❌ | ✅ | ❌ | ✅ |
| `jwk` | JSON Web Key | ✅ | ✅ | ✅ | ✅ |

### JWK (JSON Web Key) Examples

#### AES Key

```json
{
  "kty": "oct",
  "k": "base64url-encoded-key",
  "alg": "A256GCM",
  "key_ops": ["encrypt", "decrypt"],
  "ext": true
}
```

#### ECDSA Public Key (P-256)

```json
{
  "kty": "EC",
  "crv": "P-256",
  "x": "base64url-encoded-x",
  "y": "base64url-encoded-y",
  "key_ops": ["verify"],
  "ext": true
}
```

#### RSA Public Key

```json
{
  "kty": "RSA",
  "n": "base64url-encoded-modulus",
  "e": "base64url-encoded-exponent",
  "alg": "PS256",
  "key_ops": ["verify"],
  "ext": true
}
```

## Platform-Specific Notes

### iOS (CryptoKit)

- **Minimum Version:** iOS 13.0+
- **Hardware Acceleration:** Yes, via Secure Enclave (A7+ chips)
- **Key Storage:** Can use iOS Keychain
- **Performance:** Excellent, hardware-accelerated operations

### Android (KeyStore + Security Provider)

- **Minimum Version:** API 23 (Android 6.0)+
- **Hardware Acceleration:** Yes, via Hardware Security Module (device-dependent)
- **Key Storage:** Can use Android KeyStore
- **Performance:** Good, varies by device

### LynxJS

- **Platform:** Cross-platform (iOS/Android)
- **Integration:** Uses NativeWebCryptoModule
- **Performance:** Native platform performance

### Expo

- **Platform:** Cross-platform (iOS/Android)
- **Integration:** Uses @ariob/webcrypto native module
- **Performance:** Native platform performance

### Web/Browser

- **Platform:** Modern browsers
- **Integration:** Native browser WebCrypto API
- **Performance:** Browser-dependent

## Known Limitations

### General

1. **Maximum buffer size:** 2GB per operation (platform-dependent)
2. **Key handle lifetime:** Keys are valid until garbage collected
3. **Memory constraints:** Large operations may fail on low-memory devices

### iOS-Specific

1. **Simulator:** Some hardware-accelerated operations may be slower
2. **Key persistence:** Non-extractable keys can't be persisted without Keychain

### Android-Specific

1. **KeyStore variations:** Behavior varies across manufacturers
2. **API 23-28:** Some algorithms may have limited support on older versions

## Future Roadmap

### v0.2.0 (Planned)
- ❌ `AES-KW` (Key Wrapping)
- ❌ `wrapKey()` / `unwrapKey()` operations
- ❌ `crypto.randomUUID()` support

### v0.3.0 (Planned)
- ❌ `Ed25519` / `Ed448` signatures
- ❌ `X25519` / `X448` key agreement
- ❌ Secure Enclave integration (iOS)
- ❌ Hardware KeyStore attestation (Android)

### v0.4.0 (Considering)
- ❌ `SHA-3` family support
- ❌ `BLAKE2` hashing
- ❌ `ChaCha20-Poly1305` AEAD
- ❌ Post-quantum algorithms (experimental)

## Testing Coverage

### Test Suites

- ✅ Unit tests for all implemented algorithms
- ✅ Integration tests with Gun.js SEA
- ✅ Cross-platform consistency tests
- ✅ Performance benchmarks
- ✅ Security audit tests
- 🚧 Fuzzing tests (in progress)

### Test Vectors

All implementations are tested against standard test vectors from:
- NIST CAVP (Cryptographic Algorithm Validation Program)
- IETF RFC test vectors
- W3C WebCrypto API test suite

## Contributing

To contribute algorithm implementations:

1. Follow W3C WebCrypto API specification
2. Implement native modules for both iOS and Android
3. Add comprehensive test coverage
4. Document implementation details
5. Update this coverage document

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

## References

- [W3C WebCrypto API Specification](https://www.w3.org/TR/WebCryptoAPI/)
- [NIST Cryptographic Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)
- [RFC 5869 - HKDF](https://tools.ietf.org/html/rfc5869)
- [RFC 8018 - PBKDF2](https://tools.ietf.org/html/rfc8018)
- [RFC 8032 - EdDSA](https://tools.ietf.org/html/rfc8032)

---

Last Updated: 2025-11-10
Version: 0.1.0

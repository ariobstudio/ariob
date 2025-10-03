import Foundation
import CryptoKit
import CommonCrypto         // PBKDF2
import Security             // SecKey import/export

// MARK: - Internal Errors

/// Internal error types for Web Crypto operations.
///
/// These errors represent various failure conditions during cryptographic
/// operations, key management, and parameter validation.
private enum WCError: Error {
    /// Unsupported algorithm or operation
    case unsupportedAlg(String)
    /// Invalid or expired key handle
    case invalidKeyHandle
    /// Invalid or missing parameter
    case badParam(String)
}

// MARK: - Key Store

/// Thread-safe in-memory key storage for cryptographic keys.
///
/// This store maintains a temporary cache of cryptographic keys referenced by
/// unique handles. Keys are never persisted to disk, ensuring they exist only
/// in memory during the session.
///
/// # Thread Safety
/// - All operations are protected by `NSLock`
/// - Safe for concurrent access from multiple threads
///
/// # Key Lifecycle
/// - Keys are stored with UUID handles
/// - Keys remain until explicitly removed or app termination
/// - No automatic expiration or cleanup
///
/// # Supported Key Types
/// - `SymmetricKey` (AES)
/// - `P256.Signing.PrivateKey` / `PublicKey` (ECDSA)
/// - `P256.KeyAgreement.PrivateKey` / `PublicKey` (ECDH)
///
/// - Important: Keys are stored in memory only - not persisted
/// - Note: Marked `@unchecked Sendable` because NSLock ensures thread safety
private final class KeyStore: @unchecked Sendable {
    static let shared = KeyStore()
    private var map  = [String: Any]()
    private let lock = NSLock()

    /// Stores a key and returns its unique handle.
    ///
    /// - Parameter key: Cryptographic key to store
    /// - Returns: UUID string handle for retrieving the key
    func put(_ key: Any) -> String {
        lock.lock(); defer { lock.unlock() }
        let h = UUID().uuidString
        map[h] = key
        return h
    }

    /// Retrieves a key by handle with type safety.
    ///
    /// - Parameters:
    ///   - h: Key handle string
    ///   - type: Expected key type
    /// - Returns: Key of specified type
    /// - Throws: `WCError.invalidKeyHandle` if not found or wrong type
    func get<T>(_ h: String, as _: T.Type) throws -> T {
        lock.lock(); defer { lock.unlock() }
        guard let k = map[h] as? T else { throw WCError.invalidKeyHandle }
        return k
    }

    /// Removes a key from storage.
    ///
    /// - Parameter h: Key handle to remove
    func remove(_ h: String) {
        lock.lock(); defer { lock.unlock() }
        map.removeValue(forKey: h)
    }
}

// MARK: - Main Module

/// Native bridge module implementing Web Crypto API for Lynx JavaScript runtime.
///
/// This module provides a comprehensive subset of the W3C Web Crypto API,
/// enabling JavaScript code to perform cryptographic operations using native
/// iOS/macOS security frameworks (CryptoKit, CommonCrypto, Security).
///
/// # Supported Operations
/// - **Hashing**: SHA-256, SHA-384, SHA-512
/// - **Symmetric Encryption**: AES-GCM (128/192/256-bit)
/// - **Asymmetric Signing**: ECDSA with P-256 curve
/// - **Key Agreement**: ECDH with P-256 curve
/// - **Key Derivation**: PBKDF2 with SHA-256/SHA-512
///
/// # Key Management
/// - Generate, import, export keys
/// - JWK (JSON Web Key) format support
/// - Raw binary format support
/// - In-memory key storage (no persistence)
///
/// # Security Considerations
/// - All operations use hardware-backed crypto where available
/// - Keys never persisted to disk
/// - Secure random number generation via `SecRandomCopyBytes`
/// - Constant-time operations for sensitive comparisons
///
/// # JavaScript Integration
/// ```javascript
/// // Generate AES key
/// const keyHandle = await NativeWebCryptoModule.generateKey(
///   { name: "AES-GCM", length: 256 },
///   true,
///   ["encrypt", "decrypt"]
/// );
///
/// // Encrypt data
/// const ciphertext = await NativeWebCryptoModule.encrypt(
///   { name: "AES-GCM", iv: ivBase64 },
///   keyHandle.secretKeyHandle,
///   plaintextBase64
/// );
/// ```
///
/// - Note: All data is exchanged as base64-encoded strings for JavaScript compatibility
/// - Important: Key handles are valid only for current session
@objcMembers
public final class NativeWebCryptoModule: NSObject, LynxModule {

    // MARK: - Lynx Registration

    /// Module name exposed to JavaScript runtime.
    @objc public static var name: String { "NativeWebCryptoModule" }

    /// Method name to selector mapping for Lynx registration.
    @objc public static var methodLookup: [String: String] {
        return [
            "digest"           : NSStringFromSelector(#selector(digest(_:data:))),
            "generateKey"      : NSStringFromSelector(#selector(generateKey(_:extractable:keyUsages:))),
            "importKey"        : NSStringFromSelector(#selector(importKey(_:keyData:algorithm:extractable:keyUsages:))),
            "exportKey"        : NSStringFromSelector(#selector(exportKey(_:keyHandle:))),
            "encrypt"          : NSStringFromSelector(#selector(encrypt(_:keyHandle:data:))),
            "decrypt"          : NSStringFromSelector(#selector(decrypt(_:keyHandle:data:))),
            "sign"             : NSStringFromSelector(#selector(sign(_:keyHandle:data:))),
            "verify"           : NSStringFromSelector(#selector(verify(_:keyHandle:signature:data:))),
            "deriveBits"       : NSStringFromSelector(#selector(deriveBits(_:baseKeyHandle:length:))),
            "getRandomValues"  : NSStringFromSelector(#selector(getRandomValues(_:))),
            "textEncode"       : NSStringFromSelector(#selector(textEncode(_:))),
            "textDecode"       : NSStringFromSelector(#selector(textDecode(_:)))
        ]
    }

    // MARK: - Initializers

    /// Creates module with configuration parameter (currently unused).
    @objc public init(param: Any) {
        super.init()
    }

    /// Default initializer.
    @objc public override init() {
        super.init()
    }

    // MARK: - Hashing

    /// Computes cryptographic hash digest of data.
    ///
    /// Supports SHA-2 family hash functions using CryptoKit's optimized implementations.
    ///
    /// - Parameters:
    ///   - algorithm: Dictionary with `name` field ("SHA-256", "SHA-384", or "SHA-512")
    ///   - dataB64: Base64-encoded data to hash
    /// - Returns: Base64-encoded hash digest, or error string
    ///
    /// # Supported Algorithms
    /// - **SHA-256**: 256-bit (32-byte) digest
    /// - **SHA-384**: 384-bit (48-byte) digest
    /// - **SHA-512**: 512-bit (64-byte) digest
    ///
    /// # Example
    /// ```javascript
    /// const digest = NativeWebCryptoModule.digest(
    ///   { name: "SHA-256" },
    ///   btoa("hello world")
    /// );
    /// ```
    ///
    /// - Note: Uses hardware-accelerated hashing when available
    @objc
    public func digest(
        _ algorithm: NSDictionary,
        data dataB64: String
    ) -> String {
        do {
            let name = try Self.algName(from: algorithm)
            let data = try Data(base64Encoded: dataB64).unwrap("Bad base64")
            let hash: Data

            switch name {
                case "SHA-256": hash = Data(SHA256.hash(data: data))
                case "SHA-384": hash = Data(SHA384.hash(data: data))
                case "SHA-512": hash = Data(SHA512.hash(data: data))
                default: throw WCError.unsupportedAlg(name)
            }
            return hash.base64EncodedString()
        } catch {
            return "\(error)"
        }
    }

    // MARK: - Key Generation

    /// Generates a new cryptographic key.
    ///
    /// Creates symmetric or asymmetric key pairs based on algorithm specification.
    /// Keys are stored in memory and referenced by unique handles.
    ///
    /// - Parameters:
    ///   - algorithm: Algorithm specification (name and parameters)
    ///   - extractable: Whether key can be exported (currently informational)
    ///   - keyUsages: Array of intended key usages (currently informational)
    /// - Returns: Dictionary with key handle(s), or error dictionary
    ///
    /// # Supported Algorithms
    ///
    /// ## AES-GCM (Symmetric)
    /// ```javascript
    /// { name: "AES-GCM", length: 256 }  // 128, 192, or 256 bits
    /// // Returns: { secretKeyHandle: "handle" }
    /// ```
    ///
    /// ## ECDSA (Signing)
    /// ```javascript
    /// { name: "ECDSA", namedCurve: "P-256" }
    /// // Returns: { privateKey: "handle", publicKey: "handle" }
    /// ```
    ///
    /// ## ECDH (Key Agreement)
    /// ```javascript
    /// { name: "ECDH", namedCurve: "P-256" }
    /// // Returns: { privateKey: "handle", publicKey: "handle" }
    /// ```
    ///
    /// - Note: All keys use P-256 (secp256r1) elliptic curve
    /// - Important: Key handles are session-scoped (not persisted)
    @objc
    public func generateKey(
        _ algorithm: NSDictionary,
        extractable: Bool,
        keyUsages: [String]
    ) -> NSDictionary {
        do {
            let name = try Self.algName(from: algorithm)
            switch name {
            case "AES-GCM":
                let len = (algorithm["length"] as? Int) ?? 256
                guard [128,192,256].contains(len) else { throw WCError.badParam("length") }
                let keyData = SymmetricKey(size: .init(bitCount: len))
                let h = KeyStore.shared.put(keyData)

                return ["secretKeyHandle": h]

            case "ECDSA":
                let priv = P256.Signing.PrivateKey()
                let pub  = priv.publicKey
                return [
                    "privateKey": KeyStore.shared.put(priv),
                    "publicKey" : KeyStore.shared.put(pub)
                ]

            case "ECDH":
                let priv = P256.KeyAgreement.PrivateKey()
                let pub  = priv.publicKey
                return [
                    "privateKey": KeyStore.shared.put(priv),
                    "publicKey" : KeyStore.shared.put(pub)
                ]

            default: throw WCError.unsupportedAlg(name)
            }
        } catch {
            return ["error": "\(error)"]
        }
    }

    // MARK: - Key Import

    /// Imports a cryptographic key from external format.
    ///
    /// Supports both raw binary and JWK (JSON Web Key) formats for various
    /// key types including symmetric and asymmetric keys.
    ///
    /// - Parameters:
    ///   - format: Key format ("raw" or "jwk")
    ///   - keyData: Key material (base64 string for raw, JWK object for jwk)
    ///   - algorithm: Algorithm specification
    ///   - extractable: Whether key can be exported
    ///   - keyUsages: Array of intended usages
    /// - Returns: Key handle string, or error string
    ///
    /// # Supported Formats
    ///
    /// ## Raw Format (AES)
    /// ```javascript
    /// NativeWebCryptoModule.importKey(
    ///   "raw",
    ///   keyBytesBase64,
    ///   { name: "AES-GCM" },
    ///   true,
    ///   ["encrypt", "decrypt"]
    /// );
    /// ```
    ///
    /// ## JWK Format (AES)
    /// ```javascript
    /// const jwk = {
    ///   kty: "oct",
    ///   k: keyBase64Url,  // base64url-encoded key
    ///   alg: "A256GCM"
    /// };
    /// NativeWebCryptoModule.importKey("jwk", jwk, { name: "AES-GCM" }, ...);
    /// ```
    ///
    /// ## JWK Format (ECDSA/ECDH)
    /// ```javascript
    /// // Public key
    /// const publicJwk = {
    ///   kty: "EC",
    ///   crv: "P-256",
    ///   x: xCoordinateBase64Url,
    ///   y: yCoordinateBase64Url
    /// };
    ///
    /// // Private key (includes 'd' parameter)
    /// const privateJwk = {
    ///   kty: "EC",
    ///   crv: "P-256",
    ///   x: xCoordinateBase64Url,
    ///   y: yCoordinateBase64Url,
    ///   d: privateKeyBase64Url
    /// };
    /// ```
    ///
    /// - Note: P-256 public keys use uncompressed SEC1 format (0x04 || X || Y)
    /// - Important: JWK base64url encoding is automatically converted to base64
    @objc
    public func importKey(
        _ format: String,
        keyData: Any,
        algorithm: NSDictionary,
        extractable: Bool,
        keyUsages: [String]
    ) -> String {
        do {
            let algName = try Self.algName(from: algorithm)
            switch (format, algName) {
                case ("raw", "AES-GCM"):
                    guard let keyB64   = keyData as? String,
                          let keyBytes = Data(base64Encoded: keyB64)
                    else { throw WCError.badParam("keyData") }

                    let key = SymmetricKey(data: keyBytes)
                    let h = KeyStore.shared.put(key)
                    return h

                case ("jwk", "AES-GCM"):
                    guard
                        let jwk = keyData as? [String: Any],
                        jwk["kty"] as? String == "oct",
                        let kB64u = jwk["k"] as? String
                    else { throw WCError.badParam("JWK missing kty:oct or k parameter") }

                    // Decode base64url key material
                    let keyBytes = Data(base64URL: kB64u)
                    let key = SymmetricKey(data: keyBytes)
                    let h = KeyStore.shared.put(key)
                    return h

                case ("jwk", "ECDSA"), ("jwk", "ECDH"):
                    guard
                        let jwk = keyData as? [String:Any],
                        jwk["kty"] as? String == "EC",
                        let xB64u = jwk["x"] as? String,
                        let yB64u = jwk["y"] as? String
                    else { throw WCError.badParam("JWK") }

                    let x = Data(base64URL: xB64u)
                    let y = Data(base64URL: yB64u)

                    let h: String

                    // Check if this is a private key (has 'd' parameter)
                    if let dB64u = jwk["d"] as? String {
                        let d = Data(base64URL: dB64u)

                        if algName == "ECDSA" {
                            let privKey = try P256.Signing.PrivateKey(rawRepresentation: d)
                            h = KeyStore.shared.put(privKey)
                        } else {                // "ECDH"
                            let privKey = try P256.KeyAgreement.PrivateKey(rawRepresentation: d)
                            h = KeyStore.shared.put(privKey)
                        }
                    } else {
                        // Public key only - construct from x,y coordinates
                        // 0x04 || X || Y  (uncompressed SEC1 form)
                        var raw = Data([0x04])
                        raw.append(x); raw.append(y)

                        if algName == "ECDSA" {
                            let pub = try P256.Signing.PublicKey(rawRepresentation: raw)
                            h = KeyStore.shared.put(pub)
                        } else {                // "ECDH"
                            let pub = try P256.KeyAgreement.PublicKey(rawRepresentation: raw)
                            h = KeyStore.shared.put(pub)
                        }
                    }
                    return h

                default: throw WCError.unsupportedAlg("\(format)+\(algName)")
            }
        } catch {
            return "\(error)"
        }
    }

    // MARK: - Key Export

    /// Exports a cryptographic key to external format.
    ///
    /// Converts internal key representations to standard formats (raw binary or JWK)
    /// suitable for storage, transmission, or interoperability.
    ///
    /// - Parameters:
    ///   - format: Export format ("raw" or "jwk")
    ///   - keyHandle: Handle to key to export
    /// - Returns: Dictionary with exported key data, or error dictionary
    ///
    /// # Export Formats
    ///
    /// ## Raw Format (AES only)
    /// ```javascript
    /// // Returns: { raw: keyBytesBase64 }
    /// ```
    ///
    /// ## JWK Format (AES)
    /// ```javascript
    /// // Returns: {
    /// //   kty: "oct",
    /// //   k: keyBase64Url,
    /// //   alg: "A256GCM",  // Based on key size
    /// //   ext: true
    /// // }
    /// ```
    ///
    /// ## JWK Format (ECDSA/ECDH Public Key)
    /// ```javascript
    /// // Returns: {
    /// //   kty: "EC",
    /// //   crv: "P-256",
    /// //   x: xBase64Url,
    /// //   y: yBase64Url,
    /// //   ext: true
    /// // }
    /// ```
    ///
    /// ## JWK Format (ECDSA/ECDH Private Key)
    /// ```javascript
    /// // Returns: {
    /// //   kty: "EC",
    /// //   crv: "P-256",
    /// //   x: xBase64Url,
    /// //   y: yBase64Url,
    /// //   d: dBase64Url,
    /// //   ext: true
    /// // }
    /// ```
    ///
    /// - Note: JWK uses base64url encoding (URL-safe, no padding)
    /// - Important: Exporting private keys should be done securely
    @objc
    public func exportKey(
        _ format: String,
        keyHandle: String
    ) -> NSDictionary {
        do {
            if format == "raw" {
                let key: SymmetricKey = try KeyStore.shared.get(keyHandle, as: SymmetricKey.self)
                return [
                    "raw": key.withUnsafeBytes { Data($0).base64EncodedString() }
                ]
            }
            if format == "jwk" {
                // Try AES symmetric key first
                if let key: SymmetricKey = try? KeyStore.shared.get(keyHandle, as: SymmetricKey.self) {
                    let keyBytes = key.withUnsafeBytes { Data($0) }
                    let keyLength = keyBytes.count * 8 // bits
                    let algName = keyLength == 128 ? "A128GCM" : keyLength == 192 ? "A192GCM" : "A256GCM"

                    return [
                        "kty": "oct",
                        "k": keyBytes.base64URLEncodedString(),
                        "alg": algName,
                        "ext": true
                    ]
                }

                // Try ECDSA private key
                if let priv: P256.Signing.PrivateKey = try? KeyStore.shared.get(keyHandle, as: P256.Signing.PrivateKey.self) {
                    let (x, y) = priv.publicKey.xy
                    let d = priv.rawRepresentation
                    return [
                        "kty": "EC",
                        "crv": "P-256",
                        "x": x.base64URLEncodedString(),
                        "y": y.base64URLEncodedString(),
                        "d": d.base64URLEncodedString(),
                        "ext": true
                    ]
                }

                // Try ECDH private key
                if let priv: P256.KeyAgreement.PrivateKey = try? KeyStore.shared.get(keyHandle, as: P256.KeyAgreement.PrivateKey.self) {
                    let (x, y) = priv.publicKey.xy
                    let d = priv.rawRepresentation
                    return [
                        "kty": "EC",
                        "crv": "P-256",
                        "x": x.base64URLEncodedString(),
                        "y": y.base64URLEncodedString(),
                        "d": d.base64URLEncodedString(),
                        "ext": true
                    ]
                }

                // Try ECDSA public key
                if let pub: P256.Signing.PublicKey = try? KeyStore.shared.get(keyHandle, as: P256.Signing.PublicKey.self) {
                    let (x, y) = pub.xy
                    return [
                        "kty": "EC",
                        "crv": "P-256",
                        "x": x.base64URLEncodedString(),
                        "y": y.base64URLEncodedString(),
                        "ext": true
                    ]
                }

                // Try ECDH public key
                if let pub: P256.KeyAgreement.PublicKey = try? KeyStore.shared.get(keyHandle, as: P256.KeyAgreement.PublicKey.self) {
                    let (x, y) = pub.xy
                    return [
                        "kty": "EC",
                        "crv": "P-256",
                        "x": x.base64URLEncodedString(),
                        "y": y.base64URLEncodedString(),
                        "ext": true
                    ]
                }
            }
            throw WCError.unsupportedAlg(format)
        } catch { return ["error": "\(error)"] }
    }

    // MARK: - Encryption & Decryption

    /// Encrypts data using AES-GCM authenticated encryption.
    ///
    /// Provides authenticated encryption with associated data (AEAD) using
    /// the Galois/Counter Mode. The resulting ciphertext includes authentication
    /// tag for integrity verification.
    ///
    /// - Parameters:
    ///   - algorithm: Dictionary with `name: "AES-GCM"` and `iv` (base64 nonce)
    ///   - keyHandle: Handle to AES symmetric key
    ///   - plainB64: Base64-encoded plaintext data
    /// - Returns: Base64-encoded combined ciphertext (nonce || ciphertext || tag), or error string
    ///
    /// # Algorithm Parameters
    /// ```javascript
    /// {
    ///   name: "AES-GCM",
    ///   iv: nonceBase64  // 12-byte (96-bit) initialization vector
    /// }
    /// ```
    ///
    /// # Output Format
    /// The returned ciphertext is the GCM combined format:
    /// - Nonce (12 bytes)
    /// - Ciphertext (variable length)
    /// - Authentication tag (16 bytes)
    ///
    /// # Example
    /// ```javascript
    /// const iv = getRandomValues(12);  // 96-bit nonce
    /// const ciphertext = NativeWebCryptoModule.encrypt(
    ///   { name: "AES-GCM", iv: btoa(iv) },
    ///   keyHandle,
    ///   btoa(plaintext)
    /// );
    /// ```
    ///
    /// - Important: Never reuse the same IV with the same key
    /// - Note: Uses hardware acceleration when available
    @objc
    public func encrypt(
        _ algorithm: NSDictionary,
        keyHandle: String,
        data plainB64: String
    ) -> String {
        do {
            let iv = try Self.iv(from: algorithm)
            let key: SymmetricKey = try KeyStore.shared.get(keyHandle, as: SymmetricKey.self)
            let plain = try Data(base64Encoded: plainB64).unwrap("Bad base64")
            let sealed = try AES.GCM.seal(plain, using: key, nonce: AES.GCM.Nonce(data: iv))
            return sealed.combined!.base64EncodedString();
        } catch {
            return "\(error)"
        }
    }

    /// Decrypts AES-GCM authenticated ciphertext.
    ///
    /// Verifies authentication tag and decrypts data encrypted with AES-GCM.
    /// Fails if authentication tag is invalid, indicating tampering or corruption.
    ///
    /// - Parameters:
    ///   - algorithm: Dictionary with `name: "AES-GCM"` (IV extracted from ciphertext)
    ///   - keyHandle: Handle to AES symmetric key
    ///   - cipherB64: Base64-encoded combined ciphertext (nonce || ciphertext || tag)
    /// - Returns: Base64-encoded plaintext, or error string
    ///
    /// # Example
    /// ```javascript
    /// const plaintext = NativeWebCryptoModule.decrypt(
    ///   { name: "AES-GCM" },
    ///   keyHandle,
    ///   ciphertext
    /// );
    /// ```
    ///
    /// - Important: Decryption failure indicates data corruption or wrong key
    /// - Note: Authentication tag is verified before decryption
    @objc
    public func decrypt(
        _ algorithm: NSDictionary,
        keyHandle: String,
        data cipherB64: String
    ) -> String {
        do {
            let key: SymmetricKey = try KeyStore.shared.get(keyHandle, as: SymmetricKey.self)
            let combined = try Data(base64Encoded: cipherB64).unwrap("Bad base64")
            let box = try AES.GCM.SealedBox(combined: combined)
            let plain = try AES.GCM.open(box, using: key)
            return plain.base64EncodedString()
        } catch { return "\(error)" }
    }

    // MARK: - Digital Signatures

    /// Creates ECDSA digital signature over data.
    ///
    /// Generates signature using P-256 elliptic curve with SHA-256 hash.
    /// Signature is deterministic (RFC 6979) for security.
    ///
    /// - Parameters:
    ///   - algorithm: Dictionary with `name: "ECDSA"` and optional hash
    ///   - keyHandle: Handle to ECDSA private signing key
    ///   - msgB64: Base64-encoded message to sign
    /// - Returns: Base64-encoded DER signature, or error string
    ///
    /// # Signature Format
    /// Returns ASN.1 DER-encoded signature (standard ECDSA format):
    /// ```
    /// SEQUENCE {
    ///   r INTEGER,
    ///   s INTEGER
    /// }
    /// ```
    ///
    /// # Example
    /// ```javascript
    /// const signature = NativeWebCryptoModule.sign(
    ///   { name: "ECDSA", hash: { name: "SHA-256" } },
    ///   privateKeyHandle,
    ///   btoa(message)
    /// );
    /// ```
    ///
    /// - Note: Uses deterministic ECDSA (RFC 6979) for reproducible signatures
    /// - Important: Private key must be ECDSA P-256 signing key
    @objc
    public func sign(
        _ algorithm: NSDictionary,
        keyHandle: String,
        data msgB64: String
    ) -> String {
        do {
            let priv: P256.Signing.PrivateKey = try KeyStore.shared.get(keyHandle, as: P256.Signing.PrivateKey.self)
            let msg = try Data(base64Encoded: msgB64).unwrap("Bad base64")
            let sig = try priv.signature(for: msg)
            return sig.derRepresentation.base64EncodedString()
        } catch { return "\(error)" }
    }

    /// Verifies ECDSA digital signature.
    ///
    /// Validates signature over data using P-256 elliptic curve public key.
    /// Returns 1 for valid signature, 0 for invalid or error.
    ///
    /// - Parameters:
    ///   - algorithm: Dictionary with `name: "ECDSA"` and optional hash
    ///   - keyHandle: Handle to ECDSA public verification key
    ///   - sigB64: Base64-encoded DER signature
    ///   - msgB64: Base64-encoded message that was signed
    /// - Returns: NSNumber(1) if valid, NSNumber(0) if invalid or error
    ///
    /// # Example
    /// ```javascript
    /// const isValid = NativeWebCryptoModule.verify(
    ///   { name: "ECDSA", hash: { name: "SHA-256" } },
    ///   publicKeyHandle,
    ///   signatureBase64,
    ///   btoa(message)
    /// );
    /// // isValid === 1 if signature is valid
    /// ```
    ///
    /// - Note: Uses constant-time comparison internally
    /// - Important: Public key must match curve of signature
    @objc
    public func verify(
        _ algorithm: NSDictionary,
        keyHandle: String,
        signature sigB64: String,
        data msgB64: String
    ) -> NSNumber {
        do {
            let pub: P256.Signing.PublicKey = try KeyStore.shared.get(keyHandle, as: P256.Signing.PublicKey.self)
            let msg = try Data(base64Encoded: msgB64).unwrap("Bad base64")
            let sig = try P256.Signing.ECDSASignature(derRepresentation: Data(base64Encoded: sigB64)!)
            return NSNumber(value: pub.isValidSignature(sig, for: msg))
        } catch {
            return 0
        }
    }

    // MARK: - Key Derivation

    /// Derives cryptographic bits using PBKDF2 key derivation function.
    ///
    /// Applies Password-Based Key Derivation Function 2 (PBKDF2) using
    /// HMAC-based PRF to derive key material from a base key.
    ///
    /// - Parameters:
    ///   - algorithm: PBKDF2 parameters (salt, iterations, hash)
    ///   - baseKeyHandle: Handle to base symmetric key (password/passphrase)
    ///   - length: Optional output length in bytes (default: 32)
    /// - Returns: Base64-encoded derived key material, or error string
    ///
    /// # Algorithm Parameters
    /// ```javascript
    /// {
    ///   name: "PBKDF2",
    ///   salt: saltBase64,         // Random salt (min 16 bytes recommended)
    ///   iterations: 100000,       // Number of iterations (higher = more secure)
    ///   hash: { name: "SHA-256" } // PRF hash function
    /// }
    /// ```
    ///
    /// # Example
    /// ```javascript
    /// const derivedKey = NativeWebCryptoModule.deriveBits(
    ///   {
    ///     name: "PBKDF2",
    ///     salt: btoa(randomSalt),
    ///     iterations: 100000,
    ///     hash: { name: "SHA-256" }
    ///   },
    ///   passwordKeyHandle,
    ///   32  // 256 bits
    /// );
    /// ```
    ///
    /// # Security Recommendations
    /// - Use minimum 16-byte random salt
    /// - Use iterations ≥ 100,000 for passwords
    /// - Higher iterations increase brute-force resistance
    ///
    /// - Note: Uses CommonCrypto's PBKDF2 implementation
    /// - Important: Iteration count affects performance vs security tradeoff
    @objc
    public func deriveBits(
        _ algorithm: NSDictionary,
        baseKeyHandle: String,
        length: NSNumber?
    ) -> String {
        do {
            guard let saltB64 = algorithm["salt"] as? String,
                  let iter = algorithm["iterations"] as? Int,
                  let hashName = (algorithm["hash"] as? [String:String])?["name"]
            else { throw WCError.badParam("PBKDF2 params") }

            let salt = try Data(base64Encoded: saltB64).unwrap("Bad salt")
            let secret: SymmetricKey = try KeyStore.shared.get(baseKeyHandle, as: SymmetricKey.self)

            let prf: CCPBKDFAlgorithm = (hashName == "SHA-256") ? UInt32(kCCPRFHmacAlgSHA256)
                                                                : UInt32(kCCPRFHmacAlgSHA512)

            let outputLength = length?.intValue ?? 32
            var output = Data(count: outputLength)

            let status = output.withUnsafeMutableBytes { outputBuffer in
                salt.withUnsafeBytes { saltBuffer in
                    secret.withUnsafeBytes { keyBuffer in
                        CCKeyDerivationPBKDF(
                            CCPBKDFAlgorithm(kCCPBKDF2),
                            keyBuffer.bindMemory(to: Int8.self).baseAddress,
                            keyBuffer.count,
                            saltBuffer.bindMemory(to: UInt8.self).baseAddress,
                            saltBuffer.count,
                            prf,
                            UInt32(iter),
                            outputBuffer.bindMemory(to: UInt8.self).baseAddress,
                            outputLength)
                    }
                }
            }
            guard status == kCCSuccess else { throw WCError.badParam("PBKDF2 fail") }
            return output.base64EncodedString()
        } catch {
            return "\(error)"
        }
    }

    // MARK: - Utility Methods

    /// Generates cryptographically secure random bytes.
    ///
    /// Uses system's secure random number generator (`SecRandomCopyBytes`)
    /// which is suitable for cryptographic operations including key generation,
    /// nonce creation, and salt generation.
    ///
    /// - Parameter length: Number of random bytes to generate (max: 65536)
    /// - Returns: Base64-encoded random bytes, or error string
    ///
    /// # Example
    /// ```javascript
    /// // Generate 32 random bytes
    /// const randomBytes = NativeWebCryptoModule.getRandomValues(32);
    ///
    /// // Generate 12-byte nonce for AES-GCM
    /// const nonce = NativeWebCryptoModule.getRandomValues(12);
    /// ```
    ///
    /// # Web Crypto API Compatibility
    /// Similar to `crypto.getRandomValues()` but returns base64 string
    /// instead of TypedArray.
    ///
    /// - Important: Maximum length is 65536 bytes (64 KiB)
    /// - Note: Uses hardware RNG when available
    @objc
    public func getRandomValues(
        _ length: Int
    ) -> String {
        guard length > 0 && length <= 65536 else {
            return "QuotaExceededError: byte length exceeds 65536"
        }

        var randomBytes = Data(count: length)
        let result = randomBytes.withUnsafeMutableBytes { bytes in
            SecRandomCopyBytes(kSecRandomDefault, length, bytes.bindMemory(to: UInt8.self).baseAddress!)
        }

        guard result == errSecSuccess else {
            return "OperationError: Failed to generate random bytes"
        }

        return randomBytes.base64EncodedString()
    }

    /// Encodes text string to UTF-8 bytes.
    ///
    /// Equivalent to `new TextEncoder().encode(text)` in Web APIs,
    /// but returns base64-encoded bytes for JavaScript compatibility.
    ///
    /// - Parameter text: String to encode
    /// - Returns: Base64-encoded UTF-8 bytes
    ///
    /// # Example
    /// ```javascript
    /// const encoded = NativeWebCryptoModule.textEncode("Hello, World!");
    /// // Returns base64 of UTF-8 bytes
    /// ```
    @objc
    public func textEncode(
        _ text: String
    ) -> String {
        let utf8Data = text.data(using: .utf8) ?? Data()
        return utf8Data.base64EncodedString()
    }

    /// Decodes UTF-8 bytes to text string.
    ///
    /// Equivalent to `new TextDecoder().decode(data)` in Web APIs,
    /// but accepts base64-encoded bytes as input.
    ///
    /// - Parameter base64Data: Base64-encoded UTF-8 bytes
    /// - Returns: Decoded string, or error string
    ///
    /// # Example
    /// ```javascript
    /// const decoded = NativeWebCryptoModule.textDecode(encodedBase64);
    /// // Returns: "Hello, World!"
    /// ```
    ///
    /// - Note: Returns error if base64 is invalid or bytes are not valid UTF-8
    @objc
    public func textDecode(
        _ base64Data: String
    ) -> String {
        guard let data = Data(base64Encoded: base64Data),
              let decoded = String(data: data, encoding: .utf8) else {
            return "TypeError: Failed to decode base64 or invalid UTF-8"
        }
        return decoded
    }

    // MARK: - Private Helpers

    /// Extracts algorithm name from parameter dictionary.
    ///
    /// - Parameter dict: Algorithm specification dictionary
    /// - Returns: Uppercased algorithm name
    /// - Throws: `WCError.badParam` if name missing
    private static func algName(from dict: NSDictionary) throws -> String {
        guard let n = dict["name"] as? String else { throw WCError.badParam("name") }
        return n.uppercased()
    }

    /// Extracts and validates initialization vector from algorithm parameters.
    ///
    /// - Parameter dict: Algorithm specification containing `iv` field
    /// - Returns: IV data (must be exactly 12 bytes for GCM)
    /// - Throws: `WCError.badParam` if IV invalid or wrong size
    private static func iv(from dict: NSDictionary) throws -> Data {
        guard let ivB64 = dict["iv"] as? String,
              let iv = Data(base64Encoded: ivB64), iv.count == 12
        else { throw WCError.badParam("iv") }
        return iv
    }
}

// MARK: - Data Extensions

/// Helper extension for optional Data unwrapping.
private extension Optional where Wrapped == Data {
    /// Unwraps optional Data or throws error with custom message.
    func unwrap(_ msg: String) throws -> Data {
        guard let d = self else { throw WCError.badParam(msg) }
        return d
    }
}

/// Base64URL encoding/decoding support for JWK compatibility.
private extension Data {
    /// Creates Data from base64url-encoded string.
    ///
    /// Converts base64url format (URL-safe, no padding) to standard base64
    /// before decoding.
    ///
    /// - Parameter s: Base64url-encoded string
    init(base64URL s: String) {
        self.init(base64Encoded: s.replacingOccurrences(of: "-", with: "+")
                                   .replacingOccurrences(of: "_", with: "/")
                                   .padding(toLength: ((s.count+3)/4)*4, withPad: "=", startingAt: 0))!
    }

    /// Encodes Data to base64url string.
    ///
    /// Converts to URL-safe base64url format (- instead of +, _ instead of /, no padding).
    ///
    /// - Returns: Base64url-encoded string
    func base64URLEncodedString() -> String {
        base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}

// MARK: - P256 Key Extensions

/// Extension to extract X,Y coordinates from P-256 Key Agreement public key.
private extension P256.KeyAgreement.PublicKey {
    /// Extracts X and Y coordinates from uncompressed public key.
    ///
    /// - Returns: Tuple of (X coordinate data, Y coordinate data)
    var xy:(Data,Data) {
        let raw = self.rawRepresentation         // 65 bytes 0x04||X||Y
        return (raw[1..<33], raw[33..<65])
    }
}

/// Extension to extract X,Y coordinates from P-256 Signing public key.
private extension P256.Signing.PublicKey {
    /// Extracts X and Y coordinates from uncompressed public key.
    ///
    /// - Returns: Tuple of (X coordinate data, Y coordinate data)
    var xy:(Data,Data) {
        let raw = self.rawRepresentation         // 65 bytes 0x04||X||Y
        return (raw[1..<33], raw[33..<65])
    }
}

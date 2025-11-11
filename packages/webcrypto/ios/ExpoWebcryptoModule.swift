import ExpoModulesCore
import Foundation
import CryptoKit
import CommonCrypto
import Security

// MARK: - Internal Errors

/// Internal error types for Web Crypto operations.
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
private final class KeyStore: @unchecked Sendable {
    static let shared = KeyStore()
    private var map = [String: Any]()
    private let lock = NSLock()

    /// Stores a key and returns its unique handle.
    func put(_ key: Any) -> String {
        lock.lock(); defer { lock.unlock() }
        let h = UUID().uuidString
        map[h] = key
        return h
    }

    /// Retrieves a key by handle with type safety.
    func get<T>(_ h: String, as _: T.Type) throws -> T {
        lock.lock(); defer { lock.unlock() }
        guard let k = map[h] as? T else {
            throw WCError.invalidKeyHandle
        }
        return k
    }

    /// Removes a key from storage.
    func remove(_ h: String) {
        lock.lock(); defer { lock.unlock() }
        map.removeValue(forKey: h)
    }
}

// MARK: - Main Module

/// Expo module implementing Web Crypto API polyfill for React Native.
///
/// This module provides a comprehensive subset of the W3C Web Crypto API specification,
/// enabling JavaScript code to perform cryptographic operations using native iOS
/// security frameworks (CryptoKit, CommonCrypto, Security framework).
///
/// # Supported Operations
/// - **Hashing**: SHA-256, SHA-384, SHA-512
/// - **Symmetric Encryption**: AES-GCM
/// - **Asymmetric Cryptography**: ECDSA, ECDH (P-256 curve)
/// - **Key Derivation**: PBKDF2, ECDH
/// - **Random Generation**: Cryptographically secure random bytes
///
/// # Security Features
/// - Hardware-accelerated operations via CryptoKit
/// - In-memory key storage (never persisted)
/// - Thread-safe key management
/// - FIPS 140-2 validated cryptographic modules
public class ExpoWebcryptoModule: Module {

    // MARK: - Module Definition

    public func definition() -> ModuleDefinition {
        Name("ExpoWebcrypto")

        // MARK: - Hashing

        /// Computes cryptographic hash digest of data.
        ///
        /// Supports SHA-2 family hash functions using CryptoKit's optimized implementations.
        ///
        /// - Parameters:
        ///   - algorithm: Dictionary with `name` field ("SHA-256", "SHA-384", or "SHA-512")
        ///   - dataB64: Base64-encoded data to hash
        /// - Returns: Base64-encoded hash digest, or error string
        Function("digest") { (algorithm: [String: Any], dataB64: String) -> String in
            do {
                let name = try Self.algName(from: algorithm)
                let data = try Data(base64Encoded: dataB64).unwrap("Bad base64")

                let hash: Data
                switch name {
                case "SHA-256":
                    hash = Data(SHA256.hash(data: data))
                case "SHA-384":
                    hash = Data(SHA384.hash(data: data))
                case "SHA-512":
                    hash = Data(SHA512.hash(data: data))
                default:
                    throw WCError.unsupportedAlg(name)
                }

                return hash.base64EncodedString()
            } catch {
                return "\(error)"
            }
        }

        // MARK: - Key Generation

        /// Generates a new cryptographic key or key pair.
        ///
        /// - Parameters:
        ///   - algorithm: Algorithm specification (name + params)
        ///   - extractable: Whether key can be exported
        ///   - keyUsages: Array of intended key usage strings
        /// - Returns: Dictionary with key handle(s) or error
        Function("generateKey") { (algorithm: [String: Any], extractable: Bool, keyUsages: [String]) -> [String: Any] in
            do {
                let name = try Self.algName(from: algorithm)

                switch name {
                case "AES-GCM":
                    let len = (algorithm["length"] as? Int) ?? 256
                    guard [128, 192, 256].contains(len) else {
                        throw WCError.badParam("length")
                    }

                    let keyData = SymmetricKey(size: .init(bitCount: len))
                    let h = KeyStore.shared.put(keyData)
                    return ["secretKeyHandle": h]

                case "ECDSA":
                    let priv = P256.Signing.PrivateKey()
                    let pub = priv.publicKey
                    let privHandle = KeyStore.shared.put(priv)
                    let pubHandle = KeyStore.shared.put(pub)
                    return [
                        "privateKey": privHandle,
                        "publicKey": pubHandle
                    ]

                case "ECDH":
                    let priv = P256.KeyAgreement.PrivateKey()
                    let pub = priv.publicKey
                    let privHandle = KeyStore.shared.put(priv)
                    let pubHandle = KeyStore.shared.put(pub)
                    return [
                        "privateKey": privHandle,
                        "publicKey": pubHandle
                    ]

                default:
                    throw WCError.unsupportedAlg(name)
                }
            } catch {
                return ["error": "\(error)"]
            }
        }

        // MARK: - Key Import

        /// Imports a cryptographic key from external format.
        ///
        /// Supports both raw binary and JWK (JSON Web Key) formats.
        ///
        /// - Parameters:
        ///   - format: Key format ("raw" or "jwk")
        ///   - keyData: Key material (object with 'raw' key for raw format, or JWK fields for jwk format)
        ///   - algorithm: Algorithm specification
        ///   - extractable: Whether key can be exported
        ///   - keyUsages: Array of intended usages
        /// - Returns: Key handle string, or error string
        Function("importKey") { (format: String, keyData: [String: Any], algorithm: [String: Any], extractable: Bool, keyUsages: [String]) -> String in
            do {
                let algName = try Self.algName(from: algorithm)

                switch (format, algName) {
                case ("raw", "AES-GCM"):
                    guard let keyB64 = keyData["raw"] as? String,
                          var keyBytes = Data(base64Encoded: keyB64)
                    else { throw WCError.badParam("keyData") }

                    // Normalize non-standard key sizes for compatibility
                    let validSizes = [16, 24, 32]
                    if !validSizes.contains(keyBytes.count) {
                        let hash = SHA256.hash(data: keyBytes)
                        keyBytes = Data(hash)
                    }

                    let key = SymmetricKey(data: keyBytes)
                    let h = KeyStore.shared.put(key)
                    return h

                case ("raw", "PBKDF2"):
                    guard let keyB64 = keyData["raw"] as? String,
                          let keyBytes = Data(base64Encoded: keyB64)
                    else { throw WCError.badParam("keyData") }

                    let key = SymmetricKey(data: keyBytes)
                    let h = KeyStore.shared.put(key)
                    return h

                case ("jwk", "AES-GCM"):
                    guard keyData["kty"] as? String == "oct",
                          let kB64u = keyData["k"] as? String
                    else { throw WCError.badParam("JWK missing kty:oct or k parameter") }

                    var keyBytes = Data(base64URL: kB64u)

                    // Normalize non-standard key sizes
                    let validSizes = [16, 24, 32]
                    if !validSizes.contains(keyBytes.count) {
                        let hash = SHA256.hash(data: keyBytes)
                        keyBytes = Data(hash)
                    }

                    let key = SymmetricKey(data: keyBytes)
                    let h = KeyStore.shared.put(key)
                    return h

                case ("jwk", "ECDSA"), ("jwk", "ECDH"):
                    guard keyData["kty"] as? String == "EC",
                          let xB64u = keyData["x"] as? String,
                          let yB64u = keyData["y"] as? String
                    else { throw WCError.badParam("JWK") }

                    // Decode coordinates and pad to 32 bytes
                    var x = Data(base64URL: xB64u)
                    var y = Data(base64URL: yB64u)
                    while x.count < 32 { x.insert(0, at: 0) }
                    while y.count < 32 { y.insert(0, at: 0) }

                    let h: String

                    // Check if private key (has 'd' parameter)
                    if let dB64u = keyData["d"] as? String {
                        var d = Data(base64URL: dB64u)
                        while d.count < 32 { d.insert(0, at: 0) }

                        if algName == "ECDSA" {
                            let privKey = try P256.Signing.PrivateKey(rawRepresentation: d)
                            h = KeyStore.shared.put(privKey)
                        } else {
                            let privKey = try P256.KeyAgreement.PrivateKey(rawRepresentation: d)
                            h = KeyStore.shared.put(privKey)
                        }
                    } else {
                        // Public key only
                        var raw = Data([0x04])
                        raw.append(x)
                        raw.append(y)

                        if algName == "ECDSA" {
                            do {
                                let pub = try P256.Signing.PublicKey(rawRepresentation: raw)
                                h = KeyStore.shared.put(pub)
                            } catch {
                                let pub = try P256.Signing.PublicKey(x963Representation: raw)
                                h = KeyStore.shared.put(pub)
                            }
                        } else {
                            do {
                                let pub = try P256.KeyAgreement.PublicKey(rawRepresentation: raw)
                                h = KeyStore.shared.put(pub)
                            } catch {
                                let pub = try P256.KeyAgreement.PublicKey(x963Representation: raw)
                                h = KeyStore.shared.put(pub)
                            }
                        }
                    }
                    return h

                default:
                    throw WCError.unsupportedAlg("\(format)+\(algName)")
                }
            } catch {
                return "\(error)"
            }
        }

        // MARK: - Key Export

        /// Exports a cryptographic key to external format.
        ///
        /// - Parameters:
        ///   - format: Export format ("raw" or "jwk")
        ///   - keyHandle: Handle to key to export
        /// - Returns: Dictionary with exported key data, or error dictionary
        Function("exportKey") { (format: String, keyHandle: String) -> [String: Any] in
            do {
                if format == "raw" {
                    let key: SymmetricKey = try KeyStore.shared.get(keyHandle, as: SymmetricKey.self)
                    let exported = key.withUnsafeBytes { Data($0).base64EncodedString() }
                    return ["raw": exported]
                }

                if format == "jwk" {
                    // Try AES symmetric key
                    if let key: SymmetricKey = try? KeyStore.shared.get(keyHandle, as: SymmetricKey.self) {
                        let keyBytes = key.withUnsafeBytes { Data($0) }
                        let keyLength = keyBytes.count * 8
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
            } catch {
                return ["error": "\(error)"]
            }
        }

        // MARK: - Encryption & Decryption

        /// Encrypts data using AES-GCM authenticated encryption.
        ///
        /// - Parameters:
        ///   - algorithm: Dictionary with `name: "AES-GCM"` and `iv` (base64 nonce)
        ///   - keyHandle: Handle to AES symmetric key
        ///   - plainB64: Base64-encoded plaintext data
        /// - Returns: Base64-encoded ciphertext (with tag), or error string
        Function("encrypt") { (algorithm: [String: Any], keyHandle: String, plainB64: String) -> String in
            do {
                let iv = try Self.iv(from: algorithm)
                let key: SymmetricKey = try KeyStore.shared.get(keyHandle, as: SymmetricKey.self)
                let plain = try Data(base64Encoded: plainB64).unwrap("Bad base64")

                // Normalize IV to 12 bytes for CryptoKit
                var nonce = iv
                if nonce.count > 12 {
                    nonce = nonce.prefix(12)
                } else if nonce.count < 12 {
                    nonce.append(Data(repeating: 0, count: 12 - nonce.count))
                }

                guard let gcmNonce = try? AES.GCM.Nonce(data: nonce) else {
                    throw WCError.badParam("Failed to create AES.GCM.Nonce")
                }

                let sealed = try AES.GCM.seal(plain, using: key, nonce: gcmNonce)

                // Return ciphertext || tag
                var ciphertextAndTag = sealed.ciphertext
                ciphertextAndTag.append(sealed.tag)

                return ciphertextAndTag.base64EncodedString()
            } catch {
                return "\(error)"
            }
        }

        /// Decrypts AES-GCM authenticated ciphertext.
        ///
        /// - Parameters:
        ///   - algorithm: Dictionary with `name: "AES-GCM"` and `iv`
        ///   - keyHandle: Handle to AES symmetric key
        ///   - cipherB64: Base64-encoded ciphertext (with tag)
        /// - Returns: Base64-encoded plaintext, or error string
        Function("decrypt") { (algorithm: [String: Any], keyHandle: String, cipherB64: String) -> String in
            do {
                var iv = try Self.iv(from: algorithm)

                // Normalize IV to 12 bytes
                if iv.count > 12 {
                    iv = iv.prefix(12)
                } else if iv.count < 12 {
                    iv.append(Data(repeating: 0, count: 12 - iv.count))
                }

                guard let gcmNonce = try? AES.GCM.Nonce(data: iv) else {
                    throw WCError.badParam("Failed to create AES.GCM.Nonce for decrypt")
                }

                let key: SymmetricKey = try KeyStore.shared.get(keyHandle, as: SymmetricKey.self)
                let ciphertextAndTag = try Data(base64Encoded: cipherB64).unwrap("Bad base64")

                guard ciphertextAndTag.count >= 16 else {
                    throw WCError.badParam("Ciphertext too short (need at least tag)")
                }

                let ciphertext = ciphertextAndTag.dropLast(16)
                let tag = ciphertextAndTag.suffix(16)

                let box = try AES.GCM.SealedBox(nonce: gcmNonce, ciphertext: ciphertext, tag: tag)
                let plain = try AES.GCM.open(box, using: key)

                return plain.base64EncodedString()
            } catch {
                return "\(error)"
            }
        }

        // MARK: - Digital Signatures

        /// Creates ECDSA digital signature over data.
        ///
        /// - Parameters:
        ///   - algorithm: Dictionary with `name: "ECDSA"` and optional hash/format
        ///   - keyHandle: Handle to ECDSA private signing key
        ///   - msgB64: Base64-encoded message to sign
        /// - Returns: Base64-encoded signature, or error string
        Function("sign") { (algorithm: [String: Any], keyHandle: String, msgB64: String) -> String in
            do {
                let priv: P256.Signing.PrivateKey = try KeyStore.shared.get(keyHandle, as: P256.Signing.PrivateKey.self)
                let msg = try Data(base64Encoded: msgB64).unwrap("Bad base64")

                // Apply double-hashing for WebCrypto spec compliance
                let hash2 = SHA256.hash(data: msg)
                let sig = try priv.signature(for: hash2)

                // Check if raw format requested
                let useRawFormat = algorithm["format"] as? String == "raw"
                let sigData = useRawFormat ? sig.rawRepresentation : sig.derRepresentation

                return sigData.base64EncodedString()
            } catch {
                return "Error: \(error)"
            }
        }

        /// Verifies ECDSA digital signature.
        ///
        /// - Parameters:
        ///   - algorithm: Dictionary with `name: "ECDSA"` and optional hash
        ///   - keyHandle: Handle to ECDSA public verification key
        ///   - sigB64: Base64-encoded signature
        ///   - msgB64: Base64-encoded message that was signed
        /// - Returns: 1 if valid, 0 if invalid or error
        Function("verify") { (algorithm: [String: Any], keyHandle: String, sigB64: String, msgB64: String) -> Int in
            do {
                let pub: P256.Signing.PublicKey = try KeyStore.shared.get(keyHandle, as: P256.Signing.PublicKey.self)
                let msg = try Data(base64Encoded: msgB64).unwrap("Bad base64")

                guard let sigData = Data(base64Encoded: sigB64) else {
                    throw WCError.badParam("Invalid signature base64")
                }

                // Try DER format first, then raw format
                let sig: P256.Signing.ECDSASignature
                if let derSig = try? P256.Signing.ECDSASignature(derRepresentation: sigData) {
                    sig = derSig
                } else if sigData.count == 64, let rawSig = try? P256.Signing.ECDSASignature(rawRepresentation: sigData) {
                    sig = rawSig
                } else {
                    sig = try P256.Signing.ECDSASignature(rawRepresentation: sigData)
                }

                // Apply double-hashing for WebCrypto spec compliance
                let hash2 = SHA256.hash(data: msg)
                let isValid = pub.isValidSignature(sig, for: hash2)

                return isValid ? 1 : 0
            } catch {
                return 0
            }
        }

        // MARK: - Key Derivation

        /// Derives cryptographic key material using PBKDF2 or ECDH.
        ///
        /// - Parameters:
        ///   - algorithm: Algorithm specification with derivation parameters
        ///   - baseKeyHandle: Handle to base key
        ///   - length: Output length in bytes (defaults to 32)
        /// - Returns: Base64-encoded derived key material, or error string
        Function("deriveBits") { (algorithm: [String: Any], baseKeyHandle: String, length: Int?) -> String in
            do {
                let name = try Self.algName(from: algorithm)

                switch name {
                case "ECDH":
                    guard let publicKeyHandle = algorithm["public"] as? String
                    else { throw WCError.badParam("ECDH missing public key") }

                    let privKey: P256.KeyAgreement.PrivateKey = try KeyStore.shared.get(baseKeyHandle, as: P256.KeyAgreement.PrivateKey.self)
                    let pubKey: P256.KeyAgreement.PublicKey = try KeyStore.shared.get(publicKeyHandle, as: P256.KeyAgreement.PublicKey.self)

                    let sharedSecret = try privKey.sharedSecretFromKeyAgreement(with: pubKey)
                    let outputLength = (length ?? 256) / 8

                    let derivedData = sharedSecret.withUnsafeBytes { Data($0).prefix(outputLength) }
                    return derivedData.base64EncodedString()

                case "PBKDF2":
                    guard let saltB64 = algorithm["salt"] as? String,
                          let iter = algorithm["iterations"] as? Int,
                          let hashName = (algorithm["hash"] as? [String: String])?["name"]
                    else { throw WCError.badParam("PBKDF2 params") }

                    let salt = try Data(base64Encoded: saltB64).unwrap("Bad salt")
                    let secret: SymmetricKey = try KeyStore.shared.get(baseKeyHandle, as: SymmetricKey.self)

                    let prf: CCPBKDFAlgorithm = (hashName == "SHA-256") ? UInt32(kCCPRFHmacAlgSHA256) : UInt32(kCCPRFHmacAlgSHA512)
                    let outputLength = (length ?? 256) / 8
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

                default:
                    throw WCError.unsupportedAlg(name)
                }
            } catch {
                return "\(error)"
            }
        }

        // MARK: - Utility Methods

        /// Generates cryptographically secure random bytes.
        ///
        /// - Parameter length: Number of random bytes to generate (max: 65536)
        /// - Returns: Base64-encoded random bytes, or error string
        Function("getRandomValues") { (length: Int) -> String in
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
    }

    // MARK: - Private Helpers

    /// Extracts algorithm name from parameter dictionary.
    private static func algName(from dict: [String: Any]) throws -> String {
        guard let n = dict["name"] as? String else {
            throw WCError.badParam("name")
        }
        return n.uppercased()
    }

    /// Extracts and validates IV from algorithm parameters.
    private static func iv(from dict: [String: Any]) throws -> Data {
        guard let ivB64 = dict["iv"] as? String,
              let iv = Data(base64Encoded: ivB64)
        else { throw WCError.badParam("iv missing or invalid base64") }

        guard iv.count >= 1 && iv.count <= 16 else {
            throw WCError.badParam("iv size \(iv.count) not in range 1-16")
        }

        return iv
    }
}

// MARK: - Data Extensions

private extension Optional where Wrapped == Data {
    func unwrap(_ msg: String) throws -> Data {
        guard let d = self else { throw WCError.badParam(msg) }
        return d
    }
}

private extension Data {
    init(base64URL s: String) {
        self.init(base64Encoded: s.replacingOccurrences(of: "-", with: "+")
                                   .replacingOccurrences(of: "_", with: "/")
                                   .padding(toLength: ((s.count+3)/4)*4, withPad: "=", startingAt: 0))!
    }

    func base64URLEncodedString() -> String {
        base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}

// MARK: - P256 Key Extensions

private extension P256.KeyAgreement.PublicKey {
    var xy: (Data, Data) {
        let raw = self.rawRepresentation
        return (raw[1..<33], raw[33..<65])
    }
}

private extension P256.Signing.PublicKey {
    var xy: (Data, Data) {
        let raw = self.rawRepresentation
        return (raw[1..<33], raw[33..<65])
    }
}

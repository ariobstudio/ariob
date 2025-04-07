import UIKit
import Foundation
import CryptoKit
import CommonCrypto // For PBKDF2

// Define LynxModule protocol if it's not globally available
@objc public protocol LynxModule {}

/**
 Native implementation of Web Cryptography API for iOS platforms.
 
 This module provides cryptographic operations compatible with the JavaScript
 Web Cryptography API (https://www.w3.org/TR/WebCryptoAPI/), allowing secure
 cryptographic operations to be performed natively on iOS devices while
 maintaining API compatibility with browser-based implementations.
 
 The module implements common cryptographic operations including:
 - Message digests (SHA-256, SHA-384, SHA-512)
 - Key generation (ECDSA, ECDH, AES-GCM)
 - Digital signatures (ECDSA with P-256)
 - Encryption/decryption (AES-GCM)
 - Key derivation (PBKDF2, ECDH+HKDF)
 
 All methods use standard Base64 encoding for binary data transfer between JavaScript
 and native code, and Base64URL encoding for JWK (JSON Web Key) components.
 */
@objcMembers
public final class NativeWebCryptoModule: NSObject, LynxModule {

    // MARK: - Module Registration for Lynx
    
    /// The module name for registration with the Lynx bridge
    @objc public static var name: String { return "NativeWebCryptoModule" }
    
    /// Method mapping dictionary for the Lynx bridge
    @objc public static var methodLookup: [String: String] {
        return [
            // Core Web Crypto API methods
            "digest": NSStringFromSelector(#selector(digest(options:data:))),
            "generateKey": NSStringFromSelector(#selector(generateKey(algorithm:extractable:keyUsages:))),
            "exportKey": NSStringFromSelector(#selector(exportKey(format:key:))),
            "importKey": NSStringFromSelector(#selector(importKey(format:keyData:algorithm:extractable:keyUsages:))),
            "sign": NSStringFromSelector(#selector(sign(algorithm:key:data:))),
            "verify": NSStringFromSelector(#selector(verify(algorithm:key:signature:data:))),
            "encrypt": NSStringFromSelector(#selector(encrypt(algorithm:key:data:))),
            "decrypt": NSStringFromSelector(#selector(decrypt(algorithm:key:data:))),
            "deriveBits": NSStringFromSelector(#selector(deriveBits(algorithm:baseKey:length:))),
            "deriveKey": NSStringFromSelector(#selector(deriveKey(algorithm:baseKey:derivedKeyType:extractable:keyUsages:))),
            // Utility methods
            "textEncode": NSStringFromSelector(#selector(textEncode(text:))),
            "textDecode": NSStringFromSelector(#selector(textDecode(data:))),
            "getRandomValues": NSStringFromSelector(#selector(getRandomValues(length:)))
        ]
    }

    // MARK: - Initializers
    
    /**
     Initializes the module with a parameter.
     
     - Parameter param: Any object that might be needed for initialization
     */
    @objc public init(param: Any) {
        super.init()
    }
    
    /**
     Default initializer.
     */
    @objc public override init() {
        super.init()
    }

    // MARK: - JSON & Base64 Helpers
    
    /**
     Parses a JSON string into a dictionary.
     
     - Parameter jsonString: The JSON string to parse
     - Returns: The parsed dictionary or nil if parsing failed
     */
    private func parseJSONDictionary(_ jsonString: String) -> [String: Any]? {
        guard let data = jsonString.data(using: .utf8),
              let result = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] else {
            print("NativeWebCryptoModule: Failed to parse JSON dictionary: \(jsonString)")
            return nil
        }
        return result
    }
    
    /**
     Parses a JSON string into a string array.
     
     - Parameter jsonString: The JSON string to parse
     - Returns: The parsed string array or nil if parsing failed
     */
    private func parseJSONArray(_ jsonString: String) -> [String]? {
        guard let data = jsonString.data(using: .utf8),
              let result = try? JSONSerialization.jsonObject(with: data, options: []) as? [String] else {
            print("NativeWebCryptoModule: Failed to parse JSON array: \(jsonString)")
            return nil
        }
        return result
    }
    
    /**
     Encodes binary data using Base64URL format (RFC 4648 Section 5).
     Used for JWK components.
     
     - Parameter data: The binary data to encode
     - Returns: Base64URL encoded string
     */
    private func base64urlEncode(_ data: Data) -> String {
        var base64 = data.base64EncodedString()
        base64 = base64.replacingOccurrences(of: "+", with: "-")
        base64 = base64.replacingOccurrences(of: "/", with: "_")
        base64 = base64.replacingOccurrences(of: "=", with: "")
        return base64
    }
    
    /**
     Decodes a Base64URL encoded string (RFC 4648 Section 5).
     Used for JWK components.
     
     - Parameter string: The Base64URL encoded string
     - Returns: The decoded binary data or nil if decoding failed
     */
    private func base64urlDecode(_ string: String) -> Data? {
        return try? {
            var base64 = string
            base64 = base64.replacingOccurrences(of: "-", with: "+")
                .replacingOccurrences(of: "_", with: "/")
            // Add padding if needed
            let padding = base64.count % 4
            if padding > 0 { base64 += String(repeating: "=", count: 4 - padding) }
            return Data(base64Encoded: base64)
        }()
    }
    
    /**
     Encodes binary data using standard Base64 format.
     
     - Parameter data: The binary data to encode
     - Returns: Base64 encoded string
     */
    private func base64Encode(_ data: Data) -> String {
        return data.base64EncodedString()
    }
    
    /**
     Decodes a standard Base64 encoded string.
     
     - Parameter string: The Base64 encoded string
     - Returns: The decoded binary data or nil if decoding failed
     */
    private func base64Decode(_ string: String) -> Data? {
        return Data(base64Encoded: string)
    }

    // MARK: - Error JSON Conversion
    
    /**
     Creates a JSON error response.
     
     - Parameter message: The error message
     - Returns: JSON string containing the error details
     */
    private func errorToJSON(_ message: String) -> String {
        let errorDict: [String: Any] = ["error": true, "message": message]
        print("NativeWebCryptoModule Error: \(message)") // Log natively
        do {
            let data = try JSONSerialization.data(withJSONObject: errorDict)
            return String(data: data, encoding: .utf8) ?? "{\"error\": true, \"message\": \"Unknown serialization error\"}"
        } catch {
            return "{\"error\": true, \"message\": \"Failed to serialize error object\"}"
        }
    }

    // MARK: - EC Key JWK Creation Helpers
    
    /**
     Creates a JWK representation of an EC private key.
     
     - Parameters:
        - privateKey: The EC private key
        - keyOps: Allowed key operations
        - extractable: Whether the key can be exported
     - Returns: JWK as a dictionary or nil if creation failed
     */
    private func createECJWK(privateKey: P256.Signing.PrivateKey, keyOps: [String], extractable: Bool) -> [String: Any]? {
        let privData = privateKey.rawRepresentation
        let pubData = privateKey.publicKey.x963Representation
        guard pubData.count == 65, pubData[0] == 0x04 else { return nil }
        return [
            "kty": "EC", "crv": "P-256", "alg": "ES256",
            "d": base64urlEncode(privData),
            "x": base64urlEncode(pubData.subdata(in: 1..<33)),
            "y": base64urlEncode(pubData.subdata(in: 33..<65)),
            "key_ops": keyOps, "ext": extractable
        ]
    }
    
    /**
     Creates a JWK representation of an EC public key.
     
     - Parameters:
        - publicKey: The EC public key
        - keyOps: Allowed key operations
        - extractable: Whether the key can be exported
     - Returns: JWK as a dictionary or nil if creation failed
     */
    private func createECJWK(publicKey: P256.Signing.PublicKey, keyOps: [String], extractable: Bool) -> [String: Any]? {
        let pubData = publicKey.x963Representation
        guard pubData.count == 65, pubData[0] == 0x04 else { return nil }
        return [
            "kty": "EC", "crv": "P-256", "alg": "ES256",
            "x": base64urlEncode(pubData.subdata(in: 1..<33)),
            "y": base64urlEncode(pubData.subdata(in: 33..<65)),
            "key_ops": keyOps, "ext": extractable
        ]
    }
    
    /**
     Creates a JWK representation of an ECDH private key.
     
     - Parameters:
        - privateKey: The ECDH private key
        - keyOps: Allowed key operations
        - extractable: Whether the key can be exported
     - Returns: JWK as a dictionary or nil if creation failed
     */
    private func createECDHJWK(privateKey: P256.KeyAgreement.PrivateKey, keyOps: [String], extractable: Bool) -> [String: Any]? {
        let privData = privateKey.rawRepresentation
        let pubData = privateKey.publicKey.x963Representation
        guard pubData.count == 65, pubData[0] == 0x04 else { return nil }
        return [
            "kty": "EC", "crv": "P-256", "alg": "ECDH-ES",
            "d": base64urlEncode(privData),
            "x": base64urlEncode(pubData.subdata(in: 1..<33)),
            "y": base64urlEncode(pubData.subdata(in: 33..<65)),
            "key_ops": keyOps, "ext": extractable
        ]
    }
    
    /**
     Creates a JWK representation of an ECDH public key.
     
     - Parameters:
        - publicKey: The ECDH public key
        - keyOps: Allowed key operations
        - extractable: Whether the key can be exported
     - Returns: JWK as a dictionary or nil if creation failed
     */
    private func createECDHJWK(publicKey: P256.KeyAgreement.PublicKey, keyOps: [String], extractable: Bool) -> [String: Any]? {
        let pubData = publicKey.x963Representation
        guard pubData.count == 65, pubData[0] == 0x04 else { return nil }
        return [
            "kty": "EC", "crv": "P-256", "alg": "ECDH-ES",
            "x": base64urlEncode(pubData.subdata(in: 1..<33)),
            "y": base64urlEncode(pubData.subdata(in: 33..<65)),
            "key_ops": keyOps, "ext": extractable
        ]
    }

    // MARK: - AES Key Helper
    
    /**
     Normalizes an AES key to a valid length.
     Ensures the key is 128, 192, or 256 bits by hashing if necessary.
     
     - Parameter keyData: The input key data
     - Returns: Normalized key data
     */
    private func normalizeAESKey(keyData: Data) -> Data {
        let keyBitSize = keyData.count * 8
        if [128, 192, 256].contains(keyBitSize) { return keyData }
        return Data(SHA256.hash(data: keyData)) // Hash to 256 bits if not standard size
    }
    
    /**
     Creates a symmetric key from a JWK.
     
     - Parameter jwk: The JWK containing the key data
     - Returns: SymmetricKey or nil if creation failed
     */
    private func createSymmetricKeyFromJWK(jwk: [String: Any]) -> SymmetricKey? {
        guard let kty = jwk["kty"] as? String, kty == "oct",
              let kBase64url = jwk["k"] as? String,
              let keyData = base64urlDecode(kBase64url) else { return nil }
        return SymmetricKey(data: normalizeAESKey(keyData: keyData))
    }

    // MARK: - Web Crypto API Methods Implementation

    /**
     TextEncoder implementation - converts text to UTF-8 and returns base64.
     
     - Parameter text: The text to encode
     - Returns: Base64 encoded UTF-8 bytes or error JSON if encoding fails
     */
    @objc func textEncode(text: String) -> String {
        guard let data = text.data(using: .utf8) else {
            return errorToJSON("UTF-8 encoding failed")
        }
        return base64Encode(data)
    }
    
    /**
     TextDecoder implementation - converts base64 to UTF-8 text.
     
     - Parameter data: Base64 encoded UTF-8 bytes
     - Returns: Decoded UTF-8 text or error JSON if decoding fails
     */
    @objc func textDecode(data: String) -> String {
        guard let decodedData = base64Decode(data),
              let text = String(data: decodedData, encoding: .utf8) else {
            return errorToJSON("Base64 or UTF-8 decoding failed")
        }
        return text // Return decoded text, not JSON
    }

    /**
     Generates cryptographically secure random values.
     
     - Parameter length: The number of random bytes to generate
     - Returns: Base64 encoded random bytes or error JSON if generation fails
     */
    @objc func getRandomValues(length: Int) -> String {
        guard length > 0 else { return errorToJSON("Length must be positive") }
        var data = Data(count: length)
        let result = data.withUnsafeMutableBytes { SecRandomCopyBytes(kSecRandomDefault, length, $0.baseAddress!) }
        guard result == errSecSuccess else { return errorToJSON("Failed to generate random bytes") }
        return base64Encode(data) // Standard Base64
    }

    /**
     Computes a digest (hash) of the provided data.
     Supports SHA-256, SHA-384, and SHA-512 algorithms.
     
     - Parameters:
        - options: JSON string containing algorithm name
        - data: Base64 encoded data to hash
     - Returns: Base64 encoded hash or error JSON if operation fails
     */
    @objc func digest(options: String, data: String) -> String {
        guard let optionsDict = parseJSONDictionary(options),
              let algorithmName = optionsDict["name"] as? String,
              let inputData = base64Decode(data) else {
            return errorToJSON("Invalid parameters for digest")
        }
        let hash: Data
        switch algorithmName.uppercased() {
            case "SHA-256": hash = Data(SHA256.hash(data: inputData))
            case "SHA-384": hash = Data(SHA384.hash(data: inputData))
            case "SHA-512": hash = Data(SHA512.hash(data: inputData))
            default: return errorToJSON("Unsupported digest algorithm: \(algorithmName)")
        }
        return base64Encode(hash) // Standard base64 hash
    }

    /**
     Generates a new cryptographic key or key pair.
     Supports ECDSA, ECDH, and AES-GCM algorithms.
     
     - Parameters:
        - algorithm: JSON string with algorithm parameters
        - extractable: Whether the key can be exported
        - keyUsages: JSON array of allowed key operations
     - Returns: JSON string containing the generated key(s) or error JSON if generation fails
     */
    @objc func generateKey(algorithm: String, extractable: Bool, keyUsages: String) -> String {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyUsagesArray = parseJSONArray(keyUsages) else {
            return errorToJSON("Invalid parameters for key generation")
        }
        let resultDict: Any
        do {
            switch algorithmName.uppercased() {
            case "ECDSA":
                guard let namedCurve = algorithmDict["namedCurve"] as? String, namedCurve.uppercased() == "P-256" else {
                    return errorToJSON("Only P-256 curve is supported for ECDSA")
                }
                let privateKey = P256.Signing.PrivateKey()
                guard let privateJWK = createECJWK(privateKey: privateKey, keyOps: keyUsagesArray.filter { $0 == "sign" }, extractable: extractable),
                      let publicJWK = createECJWK(publicKey: privateKey.publicKey, keyOps: keyUsagesArray.filter { $0 == "verify" }, extractable: true) else {
                    return errorToJSON("Failed to create ECDSA JWKs")
                }
                resultDict = ["privateKey": privateJWK, "publicKey": publicJWK]
            case "ECDH":
                guard let namedCurve = algorithmDict["namedCurve"] as? String, namedCurve.uppercased() == "P-256" else {
                    return errorToJSON("Only P-256 curve is supported for ECDH")
                }
                let privateKey = P256.KeyAgreement.PrivateKey()
                let allowedOps = keyUsagesArray.filter { $0 == "deriveKey" || $0 == "deriveBits" }
                guard let privateJWK = createECDHJWK(privateKey: privateKey, keyOps: allowedOps, extractable: extractable),
                      let publicJWK = createECDHJWK(publicKey: privateKey.publicKey, keyOps: [], extractable: true) else {
                     return errorToJSON("Failed to create ECDH JWKs")
                }
                resultDict = ["privateKey": privateJWK, "publicKey": publicJWK]
            case "AES-GCM":
                let keySize = (algorithmDict["length"] as? Int) ?? 256
                guard [128, 192, 256].contains(keySize) else { return errorToJSON("AES key size must be 128, 192, or 256 bits") }
                let keyBytes = keySize / 8
                var keyData = Data(count: keyBytes)
                let status = keyData.withUnsafeMutableBytes { SecRandomCopyBytes(kSecRandomDefault, keyBytes, $0.baseAddress!) }
                guard status == errSecSuccess else { return errorToJSON("Failed to generate secure random key for AES") }
                resultDict = [ // Return the JWK itself for symmetric keys
                    "kty": "oct", "k": base64urlEncode(keyData), "alg": "A\(keySize)GCM",
                    "ext": extractable, "key_ops": keyUsagesArray
                ]
            default:
                return errorToJSON("Unsupported algorithm for generateKey: \(algorithmName)")
            }
            // Serialize result and return
            let resultData = try JSONSerialization.data(withJSONObject: resultDict)
            return String(data: resultData, encoding: .utf8) ?? errorToJSON("Failed to serialize result")
        } catch {
            return errorToJSON("Error during key generation: \(error.localizedDescription)")
        }
    }

    /**
     Exports a key in the requested format.
     Supports JWK and raw formats.
     
     - Parameters:
        - format: Export format ("jwk" or "raw")
        - key: JSON string containing the key to export
     - Returns: Exported key in the requested format or error JSON if export fails
     */
    @objc func exportKey(format: String, key: String) -> String {
        guard let keyDict = parseJSONDictionary(key), let kty = keyDict["kty"] as? String else {
            return errorToJSON("Invalid key format for export (not valid JWK)")
        }
        let isPublicKey = keyDict["d"] == nil
        if !isPublicKey, let extractable = keyDict["ext"] as? Bool, !extractable {
             return errorToJSON("Key is not extractable")
        }
        switch format.lowercased() {
        case "jwk":
             guard let data = try? JSONSerialization.data(withJSONObject: keyDict), let str = String(data: data, encoding: .utf8) else {
                 return errorToJSON("Failed to re-serialize JWK for export")
             }
             return str
        case "raw":
             if kty == "oct" {
                guard let kBase64url = keyDict["k"] as? String, let keyData = base64urlDecode(kBase64url) else {
                    return errorToJSON("Invalid 'oct' key material for raw export")
                }
                return base64Encode(keyData) // Standard Base64 for raw symmetric key bytes
             } else {
                return errorToJSON("Raw export format only supported for 'oct' keys")
             }
        default:
            return errorToJSON("Unsupported export format: \(format)")
        }
    }

    /**
     Imports a key from external format.
     Supports JWK and raw formats for various algorithms.
     
     - Parameters:
        - format: Import format ("jwk" or "raw")
        - keyDataString: Key data to import
        - algorithm: JSON string with algorithm parameters
        - extractable: Whether the imported key can be exported
        - keyUsages: JSON array of allowed key operations
     - Returns: JSON string containing the imported key or error JSON if import fails
     */
    @objc func importKey(format: String, keyData keyDataString: String, algorithm: String, extractable: Bool, keyUsages: String) -> String {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyUsagesArray = parseJSONArray(keyUsages) else {
            return errorToJSON("Invalid parameters for key import")
        }
        var importedJWK: [String: Any]? = nil
        do {
            switch format.lowercased() {
            case "jwk":
                guard var jwk = parseJSONDictionary(keyDataString), let kty = jwk["kty"] as? String else {
                    return errorToJSON("Invalid JWK data for import")
                }
                // Basic validation and setting 'alg' based on expected type
                switch algorithmName.uppercased() {
                    case "ECDSA":
                        guard kty == "EC", let crv = jwk["crv"] as? String, crv == "P-256", jwk["x"] != nil, jwk["y"] != nil else {
                            return errorToJSON("JWK is not a valid P-256 EC key for ECDSA")
                        }
                        jwk["alg"] = "ES256"
                    case "ECDH":
                        guard kty == "EC", let crv = jwk["crv"] as? String, crv == "P-256", jwk["x"] != nil, jwk["y"] != nil else {
                            return errorToJSON("JWK is not a valid P-256 EC key for ECDH")
                        }
                        jwk["alg"] = "ECDH-ES"
                    case "AES-GCM":
                        guard kty == "oct", let kBase64url = jwk["k"] as? String, let kData = base64urlDecode(kBase64url) else {
                            return errorToJSON("JWK is not a valid octet key for AES-GCM")
                        }
                        let keySize = normalizeAESKey(keyData: kData).count * 8
                        guard [128, 192, 256].contains(keySize) else { return errorToJSON("Imported AES key material has invalid size") }
                        jwk["alg"] = "A\(keySize)GCM"
                    case "PBKDF2": return errorToJSON("JWK import not supported for PBKDF2 base key (use 'raw')")
                    default: return errorToJSON("Unsupported algorithm for JWK import: \(algorithmName)")
                }
                jwk["ext"] = extractable
                jwk["key_ops"] = keyUsagesArray
                importedJWK = jwk
            case "raw":
                guard let rawData = base64Decode(keyDataString) else { // Standard Base64 raw data
                    return errorToJSON("Invalid raw key data (not Base64)")
                }
                switch algorithmName.uppercased() {
                    case "AES-GCM":
                        let normalizedKey = normalizeAESKey(keyData: rawData)
                        let keyBitSize = normalizedKey.count * 8
                        guard [128, 192, 256].contains(keyBitSize) else { return errorToJSON("Raw AES key data has invalid size") }
                        importedJWK = [
                           "kty": "oct", "k": base64urlEncode(normalizedKey), "alg": "A\(keyBitSize)GCM",
                           "ext": extractable, "key_ops": keyUsagesArray
                        ]
                    case "PBKDF2":
                         // Return placeholder indicating raw data for PBKDF2 password
                         importedJWK = [
                             "kty": "PBKDF2-RAW", // Custom identifier
                             "rawData": base64Encode(rawData), // Store raw data encoded
                             "ext": false, "key_ops": keyUsagesArray // Must contain "deriveBits"/"deriveKey"
                         ]
                    default: return errorToJSON("Raw import not supported for algorithm: \(algorithmName)")
                }
            default:
                return errorToJSON("Unsupported import format: \(format)")
            }

            guard let finalJWK = importedJWK else { return errorToJSON("Internal error during key import") }
            let resultData = try JSONSerialization.data(withJSONObject: finalJWK)
            return String(data: resultData, encoding: .utf8) ?? errorToJSON("Failed to serialize imported key")
        } catch {
             return errorToJSON("Error during key import: \(error.localizedDescription)")
        }
    }

    /**
     Signs data using the specified key.
     Currently supports ECDSA with P-256 curve.
     
     - Parameters:
        - algorithm: JSON string with algorithm parameters
        - key: JSON string containing the private key
        - data: Base64 encoded data to sign
     - Returns: Base64 encoded signature or error JSON if signing fails
     */
    @objc func sign(algorithm: String, key: String, data: String) -> String {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String, algorithmName.uppercased() == "ECDSA",
              let keyJWK = parseJSONDictionary(key),
              let inputData = base64Decode(data),
              let dBase64url = keyJWK["d"] as? String, let dData = base64urlDecode(dBase64url)
        else { return errorToJSON("Invalid parameters for sign") }
        do {
            let privateKey = try P256.Signing.PrivateKey(rawRepresentation: dData)
            let signature = try privateKey.signature(for: inputData) // CryptoKit handles digest
            return base64Encode(signature.derRepresentation) // Standard Base64 DER signature
        } catch { return errorToJSON("Signing failed: \(error.localizedDescription)") }
    }

    /**
     Verifies a signature against the provided data.
     Currently supports ECDSA with P-256 curve.
     
     - Parameters:
        - algorithm: JSON string with algorithm parameters
        - key: JSON string containing the public key
        - signature: Base64 encoded signature to verify
        - data: Base64 encoded signed data
     - Returns: String "true" or "false" indicating verification result
     */
    @objc func verify(algorithm: String, key: String, signature: String, data: String) -> String {
         guard let algorithmDict = parseJSONDictionary(algorithm),
               let algoName = algorithmDict["name"] as? String, algoName.uppercased() == "ECDSA",
               let keyJWK = parseJSONDictionary(key),
               let inputData = base64Decode(data),
               let sigData = base64Decode(signature),
               let xBase64url = keyJWK["x"] as? String, let yBase64url = keyJWK["y"] as? String,
               let xData = base64urlDecode(xBase64url), let yData = base64urlDecode(yBase64url)
         else { return errorToJSON("Invalid parameters for verify") }
         do {
             var publicKeyRaw = Data([0x04]); publicKeyRaw.append(xData); publicKeyRaw.append(yData)
             let publicKey = try P256.Signing.PublicKey(x963Representation: publicKeyRaw)
             let ecdsaSignature = try P256.Signing.ECDSASignature(derRepresentation: sigData)
             let isValid = publicKey.isValidSignature(ecdsaSignature, for: inputData)
             return isValid ? "true" : "false" // Return "true" or "false" string
         } catch {
              // Errors during crypto validation (bad sig format, etc.) should also result in "false"
              print("NativeWebCryptoModule Verify Error: \(error)")
              return "false"
         }
     }

    /**
     Encrypts data using the specified algorithm and key.
     Currently supports AES-GCM.
     
     This is an optimized version that reduces memory operations and
     avoids unnecessary validation to improve performance.
     
     - Parameters:
        - algorithm: JSON string with algorithm parameters
        - key: JSON string containing the key
        - data: Base64 encoded data to encrypt
     - Returns: Base64 encoded encrypted data or error JSON if encryption fails
     */
    @objc func encrypt(algorithm: String, key: String, data: String) -> String {
        // Fast path validation with early returns
        guard let algorithmDict = parseJSONDictionary(algorithm),
              algorithmDict["name"] as? String == "AES-GCM",
              let keyJWK = parseJSONDictionary(key),
              let inputData = base64Decode(data),
              let ivBase64 = algorithmDict["iv"] as? String,
              let iv = base64Decode(ivBase64),
              let symmetricKey = createSymmetricKeyFromJWK(jwk: keyJWK)
        else { return errorToJSON("Invalid parameters for encrypt") }
        
        // Only process AAD if present - avoid unnecessary operations
        let aad = (algorithmDict["additionalData"] as? String).flatMap { base64Decode($0) }
        
        do {
            // Create nonce once
            let nonce = try AES.GCM.Nonce(data: iv)
            
            // Encrypt in a single operation - more efficient
            let sealedBox = try AES.GCM.seal(inputData, using: symmetricKey, nonce: nonce,
                                             authenticating: aad ?? Data())
            
            // Combine ciphertext and tag in one operation to avoid extra allocations
            return base64Encode(sealedBox.ciphertext + sealedBox.tag)
        } catch {
            return errorToJSON("Encryption failed: \(error.localizedDescription)")
        }
    }

    /**
     Decrypts data using the specified algorithm and key.
     Currently supports AES-GCM.
     
     This is an optimized version that reduces memory operations,
     minimizes error handling, and returns empty string on any failure.
     
     - Parameters:
        - algorithm: JSON string with algorithm parameters
        - key: JSON string containing the key
        - data: Base64 encoded encrypted data
     - Returns: Base64 encoded decrypted data or empty string on failure
     */
    @objc func decrypt(algorithm: String, key: String, data: String) -> String {
        // Skip detailed validation for performance - we'll catch errors in the try block
        guard let algorithmDict = parseJSONDictionary(algorithm),
              algorithmDict["name"] as? String == "AES-GCM",
              let keyJWK = parseJSONDictionary(key),
              let encryptedDataWithTag = base64Decode(data),
              let ivBase64 = algorithmDict["iv"] as? String,
              let iv = base64Decode(ivBase64),
              let symmetricKey = createSymmetricKeyFromJWK(jwk: keyJWK),
              encryptedDataWithTag.count >= 16 // Minimum size for AES-GCM tag
        else { return "" } // Fast fail with empty string for any validation issues
        
        // Only process AAD if present
        let aad = (algorithmDict["additionalData"] as? String).flatMap { base64Decode($0) }
        
        do {
            // Split ciphertext and tag efficiently
            let tagLength = 16 // AES-GCM standard
            let ciphertext = encryptedDataWithTag.dropLast(tagLength)
            let tag = encryptedDataWithTag.suffix(tagLength)
            
            // Create nonce once
            let nonce = try AES.GCM.Nonce(data: iv)
            
            // Create sealedBox and decrypt in minimal steps
            let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
            let decryptedData = try AES.GCM.open(sealedBox, using: symmetricKey, authenticating: aad ?? Data())
            
            return base64Encode(decryptedData)
        } catch {
            // Minimal error handling - just return empty string
            return ""
        }
    }

    /**
     Derives cryptographic key material from a base key.
     Supports PBKDF2 and ECDH algorithms.
     
     - Parameters:
        - algorithm: JSON string with algorithm parameters
        - baseKey: JSON string containing the base key
        - length: Length of the derived material in bits
     - Returns: Base64 encoded derived key material or error JSON if derivation fails
     */
    @objc func deriveBits(algorithm: String, baseKey: String, length: Int) -> String {
        guard let algoDict = parseJSONDictionary(algorithm),
              let algoName = algoDict["name"] as? String else {
            return errorToJSON("Invalid algorithm parameters for deriveBits")
        }
        guard length > 0, length % 8 == 0 else { return errorToJSON("deriveBits length must be positive multiple of 8") }
        let derivedKeyLengthBytes = length / 8

        switch algoName.uppercased() {
        case "PBKDF2":
            // Base key is password/secret - expect raw base64 string or imported placeholder
            var passwordData: Data? = nil
            if let baseKeyJWK = parseJSONDictionary(baseKey),
               baseKeyJWK["kty"] as? String == "PBKDF2-RAW",
               let pwdB64 = baseKeyJWK["rawData"] as? String {
                passwordData = base64Decode(pwdB64)
            } else if let directPwdData = base64Decode(baseKey) { // Fallback: treat baseKey as raw b64 password
                 passwordData = directPwdData
            }
            guard let finalPasswordData = passwordData else { return errorToJSON("Invalid base key for PBKDF2") }
            return deriveBitsPBKDF2(passwordData: finalPasswordData, algoDict: algoDict, derivedKeyLengthBytes: derivedKeyLengthBytes)

        case "ECDH":
            // Base key = local private key JWK; algoDict["public"] = peer public key JWK
            guard let privateKeyJWK = parseJSONDictionary(baseKey),
                  let dBase64url = privateKeyJWK["d"] as? String, let privateKeyData = base64urlDecode(dBase64url),
                  let peerPublicKeyJWK = algoDict["public"] as? [String: Any],
                  let xBase64url = peerPublicKeyJWK["x"] as? String, let yBase64url = peerPublicKeyJWK["y"] as? String,
                  let xData = base64urlDecode(xBase64url), let yData = base64urlDecode(yBase64url) else {
                return errorToJSON("Invalid private or public key JWK for ECDH deriveBits")
            }
            do {
                var peerPublicKeyRaw = Data([0x04]); peerPublicKeyRaw.append(xData); peerPublicKeyRaw.append(yData)
                let localPrivateKey = try P256.KeyAgreement.PrivateKey(rawRepresentation: privateKeyData)
                let peerPublicKey = try P256.KeyAgreement.PublicKey(x963Representation: peerPublicKeyRaw)
                let sharedSecret = try localPrivateKey.sharedSecretFromKeyAgreement(with: peerPublicKey)

                // Derive the requested number of bytes using HKDF-SHA256
                let derivedKey = sharedSecret.hkdfDerivedSymmetricKey(
                    using: SHA256.self, salt: Data(), sharedInfo: Data(), outputByteCount: derivedKeyLengthBytes
                )
                // Return derived bytes as BASE64URL to match SEA.js expectations
                return derivedKey.withUnsafeBytes { base64urlEncode(Data($0)) }
            } catch {
                return errorToJSON("ECDH key agreement/derivation failed: \(error.localizedDescription)")
            }

        default:
            return errorToJSON("Unsupported derivation algorithm: \(algoName)")
        }
    }

    /**
     Helper function for PBKDF2 key derivation.
     Uses CommonCrypto for efficient password-based key derivation.
     
     - Parameters:
        - passwordData: Password bytes
        - algoDict: Algorithm parameters
        - derivedKeyLengthBytes: Desired output length in bytes
     - Returns: Base64 encoded derived key or error JSON if derivation fails
     */
    private func deriveBitsPBKDF2(passwordData: Data, algoDict: [String: Any], derivedKeyLengthBytes: Int) -> String {
        guard let saltBase64 = algoDict["salt"] as? String, let saltData = base64Decode(saltBase64) else {
              return errorToJSON("Missing or invalid salt for PBKDF2")
        }
        let iterations = algoDict["iterations"] as? Int ?? 100000 // Default from sea.js
        guard iterations > 0 else { return errorToJSON("PBKDF2 iterations must be positive") }
        let hashAlgoName = ((algoDict["hash"] as? [String: Any])?["name"] as? String)?.uppercased() ?? "SHA-256"
        let prf: CCPseudoRandomAlgorithm
        switch hashAlgoName {
            case "SHA-256": prf = CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256)
            case "SHA-384": prf = CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA384)
            case "SHA-512": prf = CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA512)
            default: return errorToJSON("Unsupported hash for PBKDF2: \(hashAlgoName)")
        }
        var derivedKey = Data(count: derivedKeyLengthBytes)
        let derivationStatus = derivedKey.withUnsafeMutableBytes { derivedKeyBytes in
            passwordData.withUnsafeBytes { passwordBytes in
                saltData.withUnsafeBytes { saltBytes in
                    CCKeyDerivationPBKDF(
                       CCPBKDFAlgorithm(kCCPBKDF2),
                       passwordBytes.baseAddress?.assumingMemoryBound(to: Int8.self), passwordData.count,
                       saltBytes.baseAddress?.assumingMemoryBound(to: UInt8.self), saltData.count,
                       prf, UInt32(iterations),
                       derivedKeyBytes.baseAddress?.assumingMemoryBound(to: UInt8.self), derivedKeyLengthBytes
                    )
                }
            }
        }
        if derivationStatus == kCCSuccess {
            return base64Encode(derivedKey) // Standard Base64 output for derived key bytes
        } else {
            return errorToJSON("PBKDF2 derivation failed (status \(derivationStatus))")
        }
    }
    
    /**
     Derives a cryptographic key from a base key.
     Supports ECDH and PBKDF2 algorithms.
     
     - Parameters:
        - algorithm: JSON string with algorithm parameters
        - baseKey: JSON string containing the base key
        - derivedKeyType: JSON string with derived key parameters
        - extractable: Whether the derived key can be exported
        - keyUsages: JSON array of allowed key operations
     - Returns: JSON string containing the derived key or error JSON if derivation fails
     */
    @objc func deriveKey(algorithm: String, baseKey: String, derivedKeyType: String, extractable: Bool, keyUsages: String) -> String {
        // 1. Parse Input Parameters
        guard let algoDict = parseJSONDictionary(algorithm),
              let algoName = algoDict["name"] as? String,
              let baseKeyJWK = parseJSONDictionary(baseKey),
              let derivedKeyAlgoDict = parseJSONDictionary(derivedKeyType),
              let derivedKeyAlgoName = derivedKeyAlgoDict["name"] as? String,
              let targetKeyUsages = parseJSONArray(keyUsages)
        else {
            return errorToJSON("Invalid parameters for deriveKey")
        }

        // 2. Select Derivation Algorithm
        switch algoName.uppercased() {
        case "ECDH":
            // a. Extract local private key from baseKeyJWK
            guard baseKeyJWK["kty"] as? String == "EC",
                  let dBase64url = baseKeyJWK["d"] as? String,
                  let privateKeyData = base64urlDecode(dBase64url) else {
                return errorToJSON("Invalid baseKey (private key) format for ECDH deriveKey")
            }

            // b. Extract peer's public key from algoDict["public"]
            guard let peerPublicKeyJWK = algoDict["public"] as? [String: Any],
                  peerPublicKeyJWK["kty"] as? String == "EC",
                  let xBase64url = peerPublicKeyJWK["x"] as? String, let xData = base64urlDecode(xBase64url),
                  let yBase64url = peerPublicKeyJWK["y"] as? String, let yData = base64urlDecode(yBase64url) else {
                return errorToJSON("Invalid peer public key format in algorithm parameters for ECDH deriveKey")
            }

            // c. Determine target key length and algorithm
            let targetKeyLengthBits: Int
            let targetKeyAlg: String // JWK 'alg' value for the derived key
            switch derivedKeyAlgoName.uppercased() {
            case "AES-GCM":
                guard let length = derivedKeyAlgoDict["length"] as? Int, [128, 192, 256].contains(length) else {
                    return errorToJSON("Invalid or missing 'length' for AES-GCM derivedKeyType")
                }
                targetKeyLengthBits = length
                targetKeyAlg = "A\(length)GCM"
            default:
                return errorToJSON("Unsupported derivedKeyType algorithm: \(derivedKeyAlgoName)")
            }
            let targetKeyLengthBytes = targetKeyLengthBits / 8

            // d. Perform ECDH and KDF (HKDF)
            do {
                var peerPublicKeyRaw = Data([0x04]); peerPublicKeyRaw.append(xData); peerPublicKeyRaw.append(yData)
                let localPrivateKey = try P256.KeyAgreement.PrivateKey(rawRepresentation: privateKeyData)
                let peerPublicKey = try P256.KeyAgreement.PublicKey(x963Representation: peerPublicKeyRaw)
                let sharedSecret = try localPrivateKey.sharedSecretFromKeyAgreement(with: peerPublicKey)

                // Use HKDF-SHA256 to derive the symmetric key from the shared secret
                let derivedSymmetricKey = sharedSecret.hkdfDerivedSymmetricKey(
                    using: SHA256.self,
                    salt: Data(), // Standard deriveKey typically doesn't use salt unless specified
                    sharedInfo: Data(), // Or could include context like algorithm IDs
                    outputByteCount: targetKeyLengthBytes
                )

                // e. Construct the JWK for the derived symmetric key
                let derivedKeyJWK: [String: Any] = derivedSymmetricKey.withUnsafeBytes { keyBytesPtr in
                    let keyData = Data(keyBytesPtr)
                    return [
                        "kty": "oct",
                        "k": base64urlEncode(keyData), // Base64URL encode the raw key bytes
                        "alg": targetKeyAlg,
                        "ext": extractable,
                        "key_ops": targetKeyUsages
                    ]
                }

                // f. Serialize and return the derived key's JWK
                let resultData = try JSONSerialization.data(withJSONObject: derivedKeyJWK)
                return String(data: resultData, encoding: .utf8) ?? errorToJSON("Failed to serialize derived key JWK")

            } catch {
                return errorToJSON("ECDH key derivation failed: \(error.localizedDescription)")
            }

        case "PBKDF2":
             // --- PBKDF2 Specific Logic ---
             // a. Base key is password - expect raw base64 string or imported placeholder
             var passwordData: Data? = nil
             if baseKeyJWK["kty"] as? String == "PBKDF2-RAW", let pwdB64 = baseKeyJWK["rawData"] as? String {
                 passwordData = base64Decode(pwdB64)
             } else if let directPwdData = base64Decode(baseKey) { // baseKey might be the raw b64 password string itself
                 passwordData = directPwdData
             }
             guard let finalPasswordData = passwordData else { return errorToJSON("Invalid base key for PBKDF2 deriveKey") }

             // b. Extract PBKDF2 params (salt, iterations, hash) from algoDict
             guard let saltBase64 = algoDict["salt"] as? String, let saltData = base64Decode(saltBase64) else {
                 return errorToJSON("Missing or invalid salt for PBKDF2 deriveKey")
             }
             let iterations = algoDict["iterations"] as? Int ?? 100000
             guard iterations > 0 else { return errorToJSON("PBKDF2 iterations must be positive") }
             let hashAlgoName = ((algoDict["hash"] as? [String: Any])?["name"] as? String)?.uppercased() ?? "SHA-256"
             let prf: CCPseudoRandomAlgorithm
             switch hashAlgoName {
                 case "SHA-256": prf = CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256)
                 case "SHA-384": prf = CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA384)
                 case "SHA-512": prf = CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA512)
                 default: return errorToJSON("Unsupported hash for PBKDF2: \(hashAlgoName)")
             }

             // c. Determine target key length and algorithm
             let targetKeyLengthBits: Int
             let targetKeyAlg: String
             switch derivedKeyAlgoName.uppercased() {
             case "AES-GCM":
                 guard let length = derivedKeyAlgoDict["length"] as? Int, [128, 192, 256].contains(length) else {
                     return errorToJSON("Invalid or missing 'length' for AES-GCM derivedKeyType in PBKDF2")
                 }
                 targetKeyLengthBits = length
                 targetKeyAlg = "A\(length)GCM"
             default:
                 return errorToJSON("Unsupported derivedKeyType algorithm for PBKDF2: \(derivedKeyAlgoName)")
             }
             let targetKeyLengthBytes = targetKeyLengthBits / 8

             // d. Perform PBKDF2 derivation using CommonCrypto
             var derivedKeyData = Data(count: targetKeyLengthBytes)
             let derivationStatus = derivedKeyData.withUnsafeMutableBytes { derivedKeyBytes in
                 finalPasswordData.withUnsafeBytes { passwordBytes in
                     saltData.withUnsafeBytes { saltBytes in
                         CCKeyDerivationPBKDF(
                             CCPBKDFAlgorithm(kCCPBKDF2),
                             passwordBytes.baseAddress?.assumingMemoryBound(to: Int8.self), finalPasswordData.count,
                             saltBytes.baseAddress?.assumingMemoryBound(to: UInt8.self), saltData.count,
                             prf, UInt32(iterations),
                             derivedKeyBytes.baseAddress?.assumingMemoryBound(to: UInt8.self), targetKeyLengthBytes
                         )
                     }
                 }
             }

             guard derivationStatus == kCCSuccess else {
                 return errorToJSON("PBKDF2 derivation failed (status \(derivationStatus))")
             }

             // e. Construct the JWK for the derived symmetric key
             let derivedKeyJWK: [String: Any] = [
                 "kty": "oct",
                 "k": base64urlEncode(derivedKeyData), // Base64URL encode the raw key bytes
                 "alg": targetKeyAlg, // Algorithm for the derived key itself
                 "ext": extractable,
                 "key_ops": targetKeyUsages
             ]

             // f. Serialize and return the derived key's JWK
             do {
                 let resultData = try JSONSerialization.data(withJSONObject: derivedKeyJWK)
                 return String(data: resultData, encoding: .utf8) ?? errorToJSON("Failed to serialize derived key JWK")
             } catch {
                  return errorToJSON("Error serializing derived key JWK: \(error.localizedDescription)")
             }

        default:
            return errorToJSON("Unsupported derivation algorithm: \(algoName)")
        }
    }
}

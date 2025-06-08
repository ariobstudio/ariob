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
            "digest": NSStringFromSelector(#selector(digest(algorithm:data:))),
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
        var base64 = string
        base64 = base64.replacingOccurrences(of: "-", with: "+")
                       .replacingOccurrences(of: "_", with: "/")
        // Add padding if needed
        let padding = base64.count % 4
        if padding > 0 {
            base64 += String(repeating: "=", count: 4 - padding)
        }
        return Data(base64Encoded: base64)
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

    // MARK: - Error Handling
    
    /**
     Web Crypto API error types mapped from DOMException
     */
    enum WebCryptoError: Error {
        case syntaxError(String)
        case invalidAccessError(String)
        case notSupportedError(String)
        case operationError(String)
        case dataError(String)
        
        var message: String {
            switch self {
            case .syntaxError(let msg): return msg
            case .invalidAccessError(let msg): return msg
            case .notSupportedError(let msg): return msg
            case .operationError(let msg): return msg
            case .dataError(let msg): return msg
            }
        }
        
        var name: String {
            switch self {
            case .syntaxError: return "SyntaxError"
            case .invalidAccessError: return "InvalidAccessError"
            case .notSupportedError: return "NotSupportedError"
            case .operationError: return "OperationError"
            case .dataError: return "DataError"
            }
        }
    }
    
    /**
     Creates a JSON error response matching Web Crypto API error format.
     
     - Parameter error: The WebCryptoError to convert
     - Returns: JSON string containing the error details
     */
    private func errorToJSON(_ error: WebCryptoError) -> String {
        let errorDict: [String: Any] = [
            "error": true,
            "name": error.name,
            "message": error.message
        ]
        print("NativeWebCryptoModule Error: \(error.name) - \(error.message)")
        do {
            let data = try JSONSerialization.data(withJSONObject: errorDict)
            return String(data: data, encoding: .utf8) ?? "{\"error\": true, \"name\": \"Error\", \"message\": \"Unknown serialization error\"}"
        } catch {
            return "{\"error\": true, \"name\": \"Error\", \"message\": \"Failed to serialize error object\"}"
        }
    }
    
    /**
     Legacy error helper for backward compatibility
     */
    private func errorToJSON(_ message: String) -> String {
        return errorToJSON(.operationError(message))
    }

    // MARK: - Key Usage Validation
    
    /**
     Validates key usage according to Web Crypto API specifications.
     
     - Parameters:
        - keyUsages: Array of requested key usages
        - algorithm: Algorithm name
        - keyType: "public", "private", or "secret"
     - Throws: WebCryptoError if validation fails
     */
    private func validateKeyUsages(_ keyUsages: [String], algorithm: String, keyType: String) throws {
        let validUsages: Set<String>
        
        switch algorithm.uppercased() {
        case "ECDSA":
            validUsages = keyType == "private" ? ["sign"] : ["verify"]
        case "ECDH":
            validUsages = keyType == "private" ? ["deriveKey", "deriveBits"] : []
        case "AES-GCM":
            validUsages = ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
        case "PBKDF2":
            validUsages = ["deriveKey", "deriveBits"]
        default:
            throw WebCryptoError.notSupportedError("Unsupported algorithm: \(algorithm)")
        }
        
        // For secret keys, empty keyUsages is a SyntaxError
        if keyType == "secret" && keyUsages.isEmpty {
            throw WebCryptoError.syntaxError("Secret keys must specify at least one usage")
        }
        
        // Check all requested usages are valid
        for usage in keyUsages {
            if !validUsages.contains(usage) {
                throw WebCryptoError.syntaxError("Invalid key usage '\(usage)' for \(algorithm) \(keyType) key")
            }
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
            "kty": "EC",
            "crv": "P-256",
            "alg": "ES256",
            "use": "sig",
            "d": base64urlEncode(privData),
            "x": base64urlEncode(pubData.subdata(in: 1..<33)),
            "y": base64urlEncode(pubData.subdata(in: 33..<65)),
            "key_ops": keyOps,
            "ext": extractable
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
            "kty": "EC",
            "crv": "P-256",
            "alg": "ES256",
            "use": "sig",
            "x": base64urlEncode(pubData.subdata(in: 1..<33)),
            "y": base64urlEncode(pubData.subdata(in: 33..<65)),
            "key_ops": keyOps,
            "ext": extractable
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
            "kty": "EC",
            "crv": "P-256",
            "alg": "ECDH-ES",
            "use": "enc",
            "d": base64urlEncode(privData),
            "x": base64urlEncode(pubData.subdata(in: 1..<33)),
            "y": base64urlEncode(pubData.subdata(in: 33..<65)),
            "key_ops": keyOps,
            "ext": extractable
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
            "kty": "EC",
            "crv": "P-256",
            "alg": "ECDH-ES",
            "use": "enc",
            "x": base64urlEncode(pubData.subdata(in: 1..<33)),
            "y": base64urlEncode(pubData.subdata(in: 33..<65)),
            "key_ops": keyOps,
            "ext": extractable
        ]
    }

    // MARK: - AES Key Helper
    
    /**
     Creates a symmetric key from a JWK.
     
     - Parameter jwk: The JWK containing the key data
     - Returns: SymmetricKey or nil if creation failed
     */
    private func createSymmetricKeyFromJWK(jwk: [String: Any]) -> SymmetricKey? {
        guard let kty = jwk["kty"] as? String, kty == "oct",
              let kBase64url = jwk["k"] as? String,
              let keyData = base64urlDecode(kBase64url) else { return nil }
        
        // Validate key length for AES
        let keyBitSize = keyData.count * 8
        guard [128, 192, 256].contains(keyBitSize) else { return nil }
        
        return SymmetricKey(data: keyData)
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
        guard length > 0 else {
            return errorToJSON(.dataError("Length must be positive"))
        }
        
        // Web Crypto API has a limit of 65536 bytes
        guard length <= 65536 else {
            return errorToJSON(.dataError("Length must not exceed 65536 bytes"))
        }
        
        var data = Data(count: length)
        let result = data.withUnsafeMutableBytes {
            SecRandomCopyBytes(kSecRandomDefault, length, $0.baseAddress!)
        }
        
        guard result == errSecSuccess else {
            return errorToJSON(.operationError("Failed to generate random bytes"))
        }
        
        return base64Encode(data)
    }

    /**
     Computes a digest (hash) of the provided data.
     Supports SHA-256, SHA-384, and SHA-512 algorithms.
     
     - Parameters:
        - algorithm: JSON string containing algorithm name or object
        - data: Base64 encoded data to hash
     - Returns: Base64 encoded hash or error JSON if operation fails
     */
    @objc func digest(algorithm: String, data: String) -> String {
        // Handle both string algorithm names and algorithm objects
        let algorithmName: String
        if let algoDict = parseJSONDictionary(algorithm),
           let name = algoDict["name"] as? String {
            algorithmName = name
        } else {
            // Assume it's a plain algorithm name string
            algorithmName = algorithm
        }
        
        guard let inputData = base64Decode(data) else {
            return errorToJSON(.dataError("Invalid base64 data"))
        }
        
        let hash: Data
        switch algorithmName.uppercased() {
        case "SHA-256":
            hash = Data(SHA256.hash(data: inputData))
        case "SHA-384":
            hash = Data(SHA384.hash(data: inputData))
        case "SHA-512":
            hash = Data(SHA512.hash(data: inputData))
        default:
            return errorToJSON(.notSupportedError("Unsupported digest algorithm: \(algorithmName)"))
        }
        
        return base64Encode(hash)
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
            return errorToJSON(.dataError("Invalid parameters for key generation"))
        }
        
        let resultDict: Any
        do {
            switch algorithmName.uppercased() {
            case "ECDSA":
                guard let namedCurve = algorithmDict["namedCurve"] as? String,
                      namedCurve.uppercased() == "P-256" else {
                    return errorToJSON(.notSupportedError("Only P-256 curve is supported for ECDSA"))
                }
                
                // Validate key usages
                let privateUsages = keyUsagesArray.filter { $0 == "sign" }
                let publicUsages = keyUsagesArray.filter { $0 == "verify" }
                
                try validateKeyUsages(privateUsages, algorithm: "ECDSA", keyType: "private")
                try validateKeyUsages(publicUsages, algorithm: "ECDSA", keyType: "public")
                
                let privateKey = P256.Signing.PrivateKey()
                guard let privateJWK = createECJWK(privateKey: privateKey, keyOps: privateUsages, extractable: extractable),
                      let publicJWK = createECJWK(publicKey: privateKey.publicKey, keyOps: publicUsages, extractable: true) else {
                    return errorToJSON(.operationError("Failed to create ECDSA JWKs"))
                }
                resultDict = ["privateKey": privateJWK, "publicKey": publicJWK]
                
            case "ECDH":
                guard let namedCurve = algorithmDict["namedCurve"] as? String,
                      namedCurve.uppercased() == "P-256" else {
                    return errorToJSON(.notSupportedError("Only P-256 curve is supported for ECDH"))
                }
                
                // Validate key usages
                let allowedOps = keyUsagesArray.filter { $0 == "deriveKey" || $0 == "deriveBits" }
                try validateKeyUsages(allowedOps, algorithm: "ECDH", keyType: "private")
                
                let privateKey = P256.KeyAgreement.PrivateKey()
                guard let privateJWK = createECDHJWK(privateKey: privateKey, keyOps: allowedOps, extractable: extractable),
                      let publicJWK = createECDHJWK(publicKey: privateKey.publicKey, keyOps: [], extractable: true) else {
                    return errorToJSON(.operationError("Failed to create ECDH JWKs"))
                }
                resultDict = ["privateKey": privateJWK, "publicKey": publicJWK]
                
            case "AES-GCM":
                let keySize = (algorithmDict["length"] as? Int) ?? 256
                guard [128, 192, 256].contains(keySize) else {
                    return errorToJSON(.dataError("AES key size must be 128, 192, or 256 bits"))
                }
                
                // Validate key usages
                try validateKeyUsages(keyUsagesArray, algorithm: "AES-GCM", keyType: "secret")
                
                let keyBytes = keySize / 8
                var keyData = Data(count: keyBytes)
                let status = keyData.withUnsafeMutableBytes {
                    SecRandomCopyBytes(kSecRandomDefault, keyBytes, $0.baseAddress!)
                }
                guard status == errSecSuccess else {
                    return errorToJSON(.operationError("Failed to generate secure random key for AES"))
                }
                
                resultDict = [
                    "kty": "oct",
                    "k": base64urlEncode(keyData),
                    "alg": "A\(keySize)GCM",
                    "ext": extractable,
                    "key_ops": keyUsagesArray
                ]
                
            default:
                return errorToJSON(.notSupportedError("Unsupported algorithm for generateKey: \(algorithmName)"))
            }
            
            // Serialize result and return
            let resultData = try JSONSerialization.data(withJSONObject: resultDict)
            return String(data: resultData, encoding: .utf8) ?? errorToJSON(.operationError("Failed to serialize result"))
        } catch let error as WebCryptoError {
            return errorToJSON(error)
        } catch {
            return errorToJSON(.operationError("Error during key generation: \(error.localizedDescription)"))
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
        guard let keyDict = parseJSONDictionary(key),
              let kty = keyDict["kty"] as? String else {
            return errorToJSON(.dataError("Invalid key format for export"))
        }
        
        // Check if key is extractable
        let isPrivateKey = keyDict["d"] != nil
        if let extractable = keyDict["ext"] as? Bool, !extractable {
            return errorToJSON(.invalidAccessError("Key is not extractable"))
        }
        
        switch format.lowercased() {
        case "jwk":
            guard let data = try? JSONSerialization.data(withJSONObject: keyDict),
                  let str = String(data: data, encoding: .utf8) else {
                return errorToJSON(.operationError("Failed to serialize JWK for export"))
            }
            return str
            
        case "raw":
            if kty == "oct" {
                // Symmetric key raw export
                guard let kBase64url = keyDict["k"] as? String,
                      let keyData = base64urlDecode(kBase64url) else {
                    return errorToJSON(.dataError("Invalid symmetric key data"))
                }
                return base64Encode(keyData)
            } else if kty == "EC" {
                // EC public key raw export (only public keys can be exported as raw)
                guard !isPrivateKey,
                      let xBase64url = keyDict["x"] as? String,
                      let yBase64url = keyDict["y"] as? String,
                      let xData = base64urlDecode(xBase64url),
                      let yData = base64urlDecode(yBase64url) else {
                    return errorToJSON(.notSupportedError("Raw format only supported for public EC keys"))
                }
                // Return uncompressed point format (0x04 || x || y)
                var rawData = Data([0x04])
                rawData.append(xData)
                rawData.append(yData)
                return base64Encode(rawData)
            } else {
                return errorToJSON(.notSupportedError("Raw export not supported for this key type"))
            }
            
        case "spki":
            // SubjectPublicKeyInfo format for public keys
            return errorToJSON(.notSupportedError("SPKI export format not yet implemented"))
            
        case "pkcs8":
            // PKCS#8 format for private keys
            return errorToJSON(.notSupportedError("PKCS8 export format not yet implemented"))
            
        default:
            return errorToJSON(.notSupportedError("Unsupported export format: \(format)"))
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
            return errorToJSON(.dataError("Invalid parameters for key import"))
        }
        
        var importedJWK: [String: Any]? = nil
        
        do {
            switch format.lowercased() {
            case "jwk":
                guard var jwk = parseJSONDictionary(keyDataString),
                      let kty = jwk["kty"] as? String else {
                    return errorToJSON(.dataError("Invalid JWK data"))
                }
                
                // Validate and set algorithm-specific properties
                switch algorithmName.uppercased() {
                case "ECDSA":
                    guard kty == "EC",
                          let crv = jwk["crv"] as? String, crv == "P-256",
                          jwk["x"] != nil, jwk["y"] != nil else {
                        return errorToJSON(.dataError("Invalid EC key for ECDSA"))
                    }
                    
                    let keyType = jwk["d"] != nil ? "private" : "public"
                    try validateKeyUsages(keyUsagesArray, algorithm: "ECDSA", keyType: keyType)
                    
                    jwk["alg"] = "ES256"
                    jwk["use"] = "sig"
                    
                case "ECDH":
                    guard kty == "EC",
                          let crv = jwk["crv"] as? String, crv == "P-256",
                          jwk["x"] != nil, jwk["y"] != nil else {
                        return errorToJSON(.dataError("Invalid EC key for ECDH"))
                    }
                    
                    let keyType = jwk["d"] != nil ? "private" : "public"
                    try validateKeyUsages(keyUsagesArray, algorithm: "ECDH", keyType: keyType)
                    
                    jwk["alg"] = "ECDH-ES"
                    jwk["use"] = "enc"
                    
                case "AES-GCM":
                    guard kty == "oct",
                          let kBase64url = jwk["k"] as? String,
                          let kData = base64urlDecode(kBase64url) else {
                        return errorToJSON(.dataError("Invalid symmetric key for AES-GCM"))
                    }
                    
                    let keySize = kData.count * 8
                    guard [128, 192, 256].contains(keySize) else {
                        return errorToJSON(.dataError("Invalid AES key size: \(keySize) bits"))
                    }
                    
                    try validateKeyUsages(keyUsagesArray, algorithm: "AES-GCM", keyType: "secret")
                    
                    jwk["alg"] = "A\(keySize)GCM"
                    
                case "PBKDF2":
                    return errorToJSON(.notSupportedError("JWK import not supported for PBKDF2"))
                    
                default:
                    return errorToJSON(.notSupportedError("Unsupported algorithm: \(algorithmName)"))
                }
                
                jwk["ext"] = extractable
                jwk["key_ops"] = keyUsagesArray
                importedJWK = jwk
                
            case "raw":
                guard let rawData = base64Decode(keyDataString) else {
                    return errorToJSON(.dataError("Invalid base64 data"))
                }
                
                switch algorithmName.uppercased() {
                case "AES-GCM":
                    let keyBitSize = rawData.count * 8
                    guard [128, 192, 256].contains(keyBitSize) else {
                        return errorToJSON(.dataError("Invalid AES key size: \(keyBitSize) bits"))
                    }
                    
                    try validateKeyUsages(keyUsagesArray, algorithm: "AES-GCM", keyType: "secret")
                    
                    importedJWK = [
                        "kty": "oct",
                        "k": base64urlEncode(rawData),
                        "alg": "A\(keyBitSize)GCM",
                        "ext": extractable,
                        "key_ops": keyUsagesArray
                    ]
                    
                case "PBKDF2":
                    // Store raw password data for PBKDF2
                    importedJWK = [
                        "kty": "PBKDF2-RAW",
                        "rawData": base64Encode(rawData),
                        "ext": false,
                        "key_ops": keyUsagesArray
                    ]
                    
                case "ECDSA", "ECDH":
                    // Raw import for EC public keys (uncompressed point format)
                    guard rawData.count == 65, rawData[0] == 0x04 else {
                        return errorToJSON(.dataError("Invalid raw EC public key format"))
                    }
                    
                    let x = rawData.subdata(in: 1..<33)
                    let y = rawData.subdata(in: 33..<65)
                    
                    try validateKeyUsages(keyUsagesArray, algorithm: algorithmName, keyType: "public")
                    
                    importedJWK = [
                        "kty": "EC",
                        "crv": "P-256",
                        "x": base64urlEncode(x),
                        "y": base64urlEncode(y),
                        "alg": algorithmName == "ECDSA" ? "ES256" : "ECDH-ES",
                        "use": algorithmName == "ECDSA" ? "sig" : "enc",
                        "ext": extractable,
                        "key_ops": keyUsagesArray
                    ]
                    
                default:
                    return errorToJSON(.notSupportedError("Raw import not supported for: \(algorithmName)"))
                }
                
            case "spki", "pkcs8":
                return errorToJSON(.notSupportedError("\(format) import format not yet implemented"))
                
            default:
                return errorToJSON(.notSupportedError("Unsupported import format: \(format)"))
            }
            
            guard let finalJWK = importedJWK else {
                return errorToJSON(.operationError("Failed to import key"))
            }
            
            let resultData = try JSONSerialization.data(withJSONObject: finalJWK)
            return String(data: resultData, encoding: .utf8) ?? errorToJSON(.operationError("Failed to serialize imported key"))
            
        } catch let error as WebCryptoError {
            return errorToJSON(error)
        } catch {
            return errorToJSON(.operationError("Import error: \(error.localizedDescription)"))
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
              let algorithmName = algorithmDict["name"] as? String,
              algorithmName.uppercased() == "ECDSA" else {
            return errorToJSON(.notSupportedError("Only ECDSA signing is supported"))
        }
        
        guard let keyJWK = parseJSONDictionary(key),
              let keyOps = keyJWK["key_ops"] as? [String],
              keyOps.contains("sign") else {
            return errorToJSON(.invalidAccessError("Key does not have 'sign' usage"))
        }
        
        guard let inputData = base64Decode(data),
              let dBase64url = keyJWK["d"] as? String,
              let dData = base64urlDecode(dBase64url) else {
            return errorToJSON(.dataError("Invalid signing parameters"))
        }
        
        // Verify hash algorithm
        if let hashDict = algorithmDict["hash"] as? [String: Any],
           let hashName = hashDict["name"] as? String,
           hashName.uppercased() != "SHA-256" {
            return errorToJSON(.notSupportedError("Only SHA-256 hash is supported with ECDSA"))
        }
        
        do {
            let privateKey = try P256.Signing.PrivateKey(rawRepresentation: dData)
            let signature = try privateKey.signature(for: inputData)
            return base64Encode(signature.derRepresentation)
        } catch {
            return errorToJSON(.operationError("Signing failed: \(error.localizedDescription)"))
        }
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
              let algorithmName = algorithmDict["name"] as? String,
              algorithmName.uppercased() == "ECDSA" else {
            return errorToJSON(.notSupportedError("Only ECDSA verification is supported"))
        }
        
        guard let keyJWK = parseJSONDictionary(key) else {
            return errorToJSON(.dataError("Invalid key format"))
        }
        
        // Check key usage if present
        if let keyOps = keyJWK["key_ops"] as? [String], !keyOps.isEmpty && !keyOps.contains("verify") {
            return errorToJSON(.invalidAccessError("Key does not have 'verify' usage"))
        }
        
        guard let inputData = base64Decode(data),
              let sigData = base64Decode(signature),
              let xBase64url = keyJWK["x"] as? String,
              let yBase64url = keyJWK["y"] as? String,
              let xData = base64urlDecode(xBase64url),
              let yData = base64urlDecode(yBase64url) else {
            return "false" // Invalid parameters result in failed verification
        }
        
        do {
            var publicKeyRaw = Data([0x04])
            publicKeyRaw.append(xData)
            publicKeyRaw.append(yData)
            
            let publicKey = try P256.Signing.PublicKey(x963Representation: publicKeyRaw)
            let ecdsaSignature = try P256.Signing.ECDSASignature(derRepresentation: sigData)
            let isValid = publicKey.isValidSignature(ecdsaSignature, for: inputData)
            
            return isValid ? "true" : "false"
        } catch {
            // Any error in verification process results in false
            return "false"
        }
    }

    /**
     Encrypts data using the specified algorithm and key.
     Currently supports AES-GCM.
     
     - Parameters:
        - algorithm: JSON string with algorithm parameters
        - key: JSON string containing the key
        - data: Base64 encoded data to encrypt
     - Returns: Base64 encoded encrypted data or error JSON if encryption fails
     */
    @objc func encrypt(algorithm: String, key: String, data: String) -> String {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              algorithmName.uppercased() == "AES-GCM" else {
            return errorToJSON(.notSupportedError("Only AES-GCM encryption is supported"))
        }
        
        guard let keyJWK = parseJSONDictionary(key),
              let keyOps = keyJWK["key_ops"] as? [String],
              keyOps.contains("encrypt") else {
            return errorToJSON(.invalidAccessError("Key does not have 'encrypt' usage"))
        }
        
        guard let inputData = base64Decode(data),
              let ivBase64 = algorithmDict["iv"] as? String,
              let iv = base64Decode(ivBase64),
              let symmetricKey = createSymmetricKeyFromJWK(jwk: keyJWK) else {
            return errorToJSON(.dataError("Invalid encryption parameters"))
        }
        
        // Validate IV length (must be exactly 12 bytes for SEA.js compatibility)
        guard iv.count == 12 else {
            return errorToJSON(.dataError("IV must be exactly 12 bytes for AES-GCM"))
        }
        
        // Process additional authenticated data if present
        let aad = (algorithmDict["additionalData"] as? String).flatMap { base64Decode($0) }
        
        // Validate tag length if specified
        if let tagLength = algorithmDict["tagLength"] as? Int,
           tagLength != 128 {
            return errorToJSON(.notSupportedError("Only 128-bit authentication tags are supported"))
        }
        
        do {
            let nonce = try AES.GCM.Nonce(data: iv)
            let sealedBox = try AES.GCM.seal(inputData, using: symmetricKey, nonce: nonce,
                                             authenticating: aad ?? Data())
            
            // Combine ciphertext and tag as expected by SEA.js
            var combined = Data()
            combined.append(sealedBox.ciphertext)
            combined.append(sealedBox.tag)
            
            return base64Encode(combined)
        } catch {
            return errorToJSON(.operationError("Encryption failed: \(error.localizedDescription)"))
        }
    }

    /**
     Decrypts data using the specified algorithm and key.
     Currently supports AES-GCM.
     
     - Parameters:
        - algorithm: JSON string with algorithm parameters
        - key: JSON string containing the key
        - data: Base64 encoded encrypted data
     - Returns: Base64 encoded decrypted data or error JSON if decryption fails
     */
    @objc func decrypt(algorithm: String, key: String, data: String) -> String {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              algorithmName.uppercased() == "AES-GCM" else {
            return errorToJSON(.notSupportedError("Only AES-GCM decryption is supported"))
        }
        
        guard let keyJWK = parseJSONDictionary(key),
              let keyOps = keyJWK["key_ops"] as? [String],
              keyOps.contains("decrypt") else {
            return errorToJSON(.invalidAccessError("Key does not have 'decrypt' usage"))
        }
        
        guard let encryptedDataWithTag = base64Decode(data),
              let ivBase64 = algorithmDict["iv"] as? String,
              let iv = base64Decode(ivBase64),
              let symmetricKey = createSymmetricKeyFromJWK(jwk: keyJWK),
              encryptedDataWithTag.count >= 16 else {
            return errorToJSON(.dataError("Invalid decryption parameters"))
        }
        
        // Validate IV length
        guard iv.count == 12 else {
            return errorToJSON(.dataError("IV must be exactly 12 bytes for AES-GCM"))
        }
        
        // Process additional authenticated data if present
        let aad = (algorithmDict["additionalData"] as? String).flatMap { base64Decode($0) }
        
        do {
            // Split ciphertext and tag (tag is always last 16 bytes)
            let tagLength = 16
            let ciphertext = encryptedDataWithTag.dropLast(tagLength)
            let tag = encryptedDataWithTag.suffix(tagLength)
            
            let nonce = try AES.GCM.Nonce(data: iv)
            let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
            let decryptedData = try AES.GCM.open(sealedBox, using: symmetricKey,
                                                authenticating: aad ?? Data())
            
            return base64Encode(decryptedData)
        } catch {
            return errorToJSON(.operationError("Decryption failed"))
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
            return errorToJSON(.dataError("Invalid algorithm parameters"))
        }
        
        guard length > 0, length % 8 == 0 else {
            return errorToJSON(.dataError("Length must be positive multiple of 8"))
        }
        
        let derivedKeyLengthBytes = length / 8
        
        switch algoName.uppercased() {
        case "PBKDF2":
            return deriveBitsPBKDF2(baseKey: baseKey, algoDict: algoDict,
                                   derivedKeyLengthBytes: derivedKeyLengthBytes)
            
        case "ECDH":
            return deriveBitsECDH(baseKey: baseKey, algoDict: algoDict,
                                 derivedKeyLengthBytes: derivedKeyLengthBytes)
            
        case "HKDF":
            return errorToJSON(.notSupportedError("HKDF not yet implemented"))
            
        default:
            return errorToJSON(.notSupportedError("Unsupported derivation algorithm: \(algoName)"))
        }
    }

    /**
     Helper function for PBKDF2 key derivation.
     
     - Parameters:
        - baseKey: Base key string (password)
        - algoDict: Algorithm parameters
        - derivedKeyLengthBytes: Desired output length in bytes
     - Returns: Base64 encoded derived key or error JSON if derivation fails
     */
    private func deriveBitsPBKDF2(baseKey: String, algoDict: [String: Any],
                                 derivedKeyLengthBytes: Int) -> String {
        // Extract password data
        var passwordData: Data? = nil
        if let baseKeyJWK = parseJSONDictionary(baseKey),
           baseKeyJWK["kty"] as? String == "PBKDF2-RAW",
           let pwdB64 = baseKeyJWK["rawData"] as? String {
            passwordData = base64Decode(pwdB64)
        } else if let directPwdData = base64Decode(baseKey) {
            passwordData = directPwdData
        }
        
        guard let finalPasswordData = passwordData else {
            return errorToJSON(.dataError("Invalid base key for PBKDF2"))
        }
        
        // Extract salt
        guard let saltBase64 = algoDict["salt"] as? String,
              let saltData = base64Decode(saltBase64) else {
            return errorToJSON(.dataError("Missing or invalid salt for PBKDF2"))
        }
        
        // SEA.js requires 64-byte salts
        guard saltData.count == 64 else {
            return errorToJSON(.dataError("Salt must be exactly 64 bytes for SEA.js compatibility"))
        }
        
        // Extract iterations (default 100000 for SEA.js)
        let iterations = algoDict["iterations"] as? Int ?? 100000
        guard iterations > 0 else {
            return errorToJSON(.dataError("Iterations must be positive"))
        }
        
        // Extract hash algorithm
        let hashAlgoName = ((algoDict["hash"] as? [String: Any])?["name"] as? String)?.uppercased() ?? "SHA-256"
        let prf: CCPseudoRandomAlgorithm
        
        switch hashAlgoName {
        case "SHA-256":
            prf = CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256)
        case "SHA-384":
            prf = CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA384)
        case "SHA-512":
            prf = CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA512)
        default:
            return errorToJSON(.notSupportedError("Unsupported hash for PBKDF2: \(hashAlgoName)"))
        }
        
        var derivedKey = Data(count: derivedKeyLengthBytes)
        let derivationStatus = derivedKey.withUnsafeMutableBytes { derivedKeyBytes in
            finalPasswordData.withUnsafeBytes { passwordBytes in
                saltData.withUnsafeBytes { saltBytes in
                    CCKeyDerivationPBKDF(
                        CCPBKDFAlgorithm(kCCPBKDF2),
                        passwordBytes.baseAddress?.assumingMemoryBound(to: Int8.self),
                        finalPasswordData.count,
                        saltBytes.baseAddress?.assumingMemoryBound(to: UInt8.self),
                        saltData.count,
                        prf,
                        UInt32(iterations),
                        derivedKeyBytes.baseAddress?.assumingMemoryBound(to: UInt8.self),
                        derivedKeyLengthBytes
                    )
                }
            }
        }
        
        guard derivationStatus == kCCSuccess else {
            return errorToJSON(.operationError("PBKDF2 derivation failed"))
        }
        
        return base64Encode(derivedKey)
    }
    
    /**
     Helper function for ECDH key derivation.
     
     - Parameters:
        - baseKey: Base key string (local private key)
        - algoDict: Algorithm parameters including peer public key
        - derivedKeyLengthBytes: Desired output length in bytes
     - Returns: Base64URL encoded derived key or error JSON if derivation fails
     */
    private func deriveBitsECDH(baseKey: String, algoDict: [String: Any],
                               derivedKeyLengthBytes: Int) -> String {
        // Extract local private key
        guard let privateKeyJWK = parseJSONDictionary(baseKey),
              let keyOps = privateKeyJWK["key_ops"] as? [String],
              (keyOps.contains("deriveBits") || keyOps.contains("deriveKey")),
              let dBase64url = privateKeyJWK["d"] as? String,
              let privateKeyData = base64urlDecode(dBase64url) else {
            return errorToJSON(.invalidAccessError("Invalid private key for ECDH"))
        }
        
        // Extract peer's public key
        guard let peerPublicKeyJWK = algoDict["public"] as? [String: Any],
              let xBase64url = peerPublicKeyJWK["x"] as? String,
              let yBase64url = peerPublicKeyJWK["y"] as? String,
              let xData = base64urlDecode(xBase64url),
              let yData = base64urlDecode(yBase64url) else {
            return errorToJSON(.dataError("Invalid public key in algorithm parameters"))
        }
        
        do {
            // Reconstruct public key in uncompressed format
            var peerPublicKeyRaw = Data([0x04])
            peerPublicKeyRaw.append(xData)
            peerPublicKeyRaw.append(yData)
            
            let localPrivateKey = try P256.KeyAgreement.PrivateKey(rawRepresentation: privateKeyData)
            let peerPublicKey = try P256.KeyAgreement.PublicKey(x963Representation: peerPublicKeyRaw)
            let sharedSecret = try localPrivateKey.sharedSecretFromKeyAgreement(with: peerPublicKey)
            
            // Derive key material using HKDF-SHA256
            let derivedKey = sharedSecret.hkdfDerivedSymmetricKey(
                using: SHA256.self,
                salt: Data(),
                sharedInfo: Data(),
                outputByteCount: derivedKeyLengthBytes
            )
            
            // Return as Base64URL to match SEA.js expectations
            return derivedKey.withUnsafeBytes { base64urlEncode(Data($0)) }
        } catch {
            return errorToJSON(.operationError("ECDH key agreement failed: \(error.localizedDescription)"))
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
    @objc func deriveKey(algorithm: String, baseKey: String, derivedKeyType: String,
                        extractable: Bool, keyUsages: String) -> String {
        guard let algoDict = parseJSONDictionary(algorithm),
              let algoName = algoDict["name"] as? String,
              let derivedKeyAlgoDict = parseJSONDictionary(derivedKeyType),
              let derivedKeyAlgoName = derivedKeyAlgoDict["name"] as? String,
              let targetKeyUsages = parseJSONArray(keyUsages) else {
            return errorToJSON(.dataError("Invalid parameters for deriveKey"))
        }
        
        // Determine target key parameters
        let targetKeyLengthBits: Int
        let targetKeyAlg: String
        
        switch derivedKeyAlgoName.uppercased() {
        case "AES-GCM":
            guard let length = derivedKeyAlgoDict["length"] as? Int,
                  [128, 192, 256].contains(length) else {
                return errorToJSON(.dataError("Invalid or missing 'length' for AES-GCM"))
            }
            targetKeyLengthBits = length
            targetKeyAlg = "A\(length)GCM"
            
            // Validate key usages for AES
            do {
                try validateKeyUsages(targetKeyUsages, algorithm: "AES-GCM", keyType: "secret")
            } catch let error as WebCryptoError {
                return errorToJSON(error)
            } catch {
                return errorToJSON(.operationError("Key usage validation failed"))
            }
            
        default:
            return errorToJSON(.notSupportedError("Unsupported derived key type: \(derivedKeyAlgoName)"))
        }
        
        let targetKeyLengthBytes = targetKeyLengthBits / 8
        
        // Derive the raw key material
        let derivedBitsResult = deriveBits(algorithm: algorithm, baseKey: baseKey,
                                          length: targetKeyLengthBits)
        
        // Check if deriveBits succeeded
        if let errorDict = parseJSONDictionary(derivedBitsResult),
           errorDict["error"] as? Bool == true {
            return derivedBitsResult // Pass through the error
        }
        
        guard let derivedKeyData = base64Decode(derivedBitsResult) else {
            // For ECDH, the result might be Base64URL encoded
            guard let derivedKeyData = base64urlDecode(derivedBitsResult) else {
                return errorToJSON(.operationError("Failed to decode derived key material"))
            }
            
            // Re-encode as standard Base64 for consistency
            return constructDerivedKey(keyData: derivedKeyData, algorithm: targetKeyAlg,
                                     extractable: extractable, keyUsages: targetKeyUsages)
        }
        
        return constructDerivedKey(keyData: derivedKeyData, algorithm: targetKeyAlg,
                                 extractable: extractable, keyUsages: targetKeyUsages)
    }
    
    /**
     Helper to construct a JWK for a derived key.
     
     - Parameters:
        - keyData: Raw key data
        - algorithm: JWK algorithm identifier
        - extractable: Whether the key is extractable
        - keyUsages: Array of key usages
     - Returns: JSON string containing the JWK or error JSON
     */
    private func constructDerivedKey(keyData: Data, algorithm: String,
                                   extractable: Bool, keyUsages: [String]) -> String {
        let derivedKeyJWK: [String: Any] = [
            "kty": "oct",
            "k": base64urlEncode(keyData),
            "alg": algorithm,
            "ext": extractable,
            "key_ops": keyUsages
        ]
        
        do {
            let resultData = try JSONSerialization.data(withJSONObject: derivedKeyJWK)
            return String(data: resultData, encoding: .utf8) ??
                   errorToJSON(.operationError("Failed to serialize derived key"))
        } catch {
            return errorToJSON(.operationError("Error serializing derived key: \(error.localizedDescription)"))
        }
    }
}

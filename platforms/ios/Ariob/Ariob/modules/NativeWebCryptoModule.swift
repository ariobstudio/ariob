import Foundation
import CryptoKit
import CommonCrypto
import Security
// CryptoSwift only for AES-GCM fallback (non-12-byte IV or non-128-bit tag)
//import CryptoSwift


private enum WCError: Error {
  case badParam(String)
  case unsupported(String)
  case invalidKey
  case notExtractable
  case quotaExceeded
}

private final class KeyStore: @unchecked Sendable {
  static let shared = KeyStore()
  private var map: [String: Any] = [:]
  private let lock = NSLock()

  func put(_ key: Any) -> String {
    lock.lock()
    defer { lock.unlock() }
    let h = UUID().uuidString
    map[h] = key
    return h
  }

  func get<T>(_ handle: String, as _: T.Type) throws -> T {
    lock.lock()
    defer { lock.unlock() }
    guard let v = map[handle] as? T else { throw WCError.invalidKey }
    return v
  }

  func remove(_ handle: String) {
    lock.lock()
    defer { lock.unlock() }
    map.removeValue(forKey: handle)
  }
}

private extension Data {
  // Base64url without padding (RFC 7515)
  func base64url() -> String {
    return self.base64EncodedString()
      .replacingOccurrences(of: "+", with: "-")
      .replacingOccurrences(of: "/", with: "_")
      .replacingOccurrences(of: "=", with: "")
  }

  init?(base64url s: String) {
    let padLen = (4 - (s.count % 4)) % 4
    let padded = s + String(repeating: "=", count: padLen)
    let b64 = padded.replacingOccurrences(of: "-", with: "+")
      .replacingOccurrences(of: "_", with: "/")
    guard let d = Data(base64Encoded: b64) else { return nil }
    self = d
  }
}

private extension SymmetricKey {
  var rawData: Data {
    withUnsafeBytes { Data($0) }
  }
}

private extension P256.Signing.PublicKey {
  var uncompressedPoint: Data {
    let raw = self.rawRepresentation // 65 bytes: 0x04||X||Y
    return raw
  }
  var xy: (Data, Data) {
    let raw = self.uncompressedPoint
    return (raw[1..<33], raw[33..<65])
  }
}

private extension P256.KeyAgreement.PublicKey {
  var uncompressedPoint: Data {
    let raw = self.rawRepresentation // 65 bytes: 0x04||X||Y
    return raw
  }
  var xy: (Data, Data) {
    let raw = self.uncompressedPoint
    return (raw[1..<33], raw[33..<65])
  }
}

private struct Alg {
  static func name(_ dict: NSDictionary) throws -> String {
    guard let s = dict["name"] as? String else {
      throw WCError.badParam("algorithm.name")
    }
    return s.uppercased()
  }
}

@objcMembers
public final class NativeWebCryptoModule: NSObject, LynxModule {
  @objc public static var name: String { "NativeWebCryptoModule" }

  @objc public static var methodLookup: [String: String] {
    return [
        "digest": NSStringFromSelector(#selector(digest(options:data:))),
        "generateKey": NSStringFromSelector(#selector(generateKey(algorithm:extractable:keyUsages:))),
        "exportKey": NSStringFromSelector(#selector(exportKey(format:key:))),
        "importKey": NSStringFromSelector(#selector(importKey(format:keyData:algorithm:extractable:keyUsages:))),
        "sign": NSStringFromSelector(#selector(sign(algorithm:key:data:))),
        "verify": NSStringFromSelector(#selector(verify(algorithm:key:signature:data:))),
        "encrypt": NSStringFromSelector(#selector(encrypt(algorithm:key:data:))),
        "decrypt": NSStringFromSelector(#selector(decrypt(algorithm:key:data:))),
        "deriveBits": NSStringFromSelector(#selector(deriveBits(algorithm:baseKey:length:))),
        "textEncode": NSStringFromSelector(#selector(textEncode(text:))),
        "textDecode": NSStringFromSelector(#selector(textDecode(data:))),
        "getRandomValues": NSStringFromSelector(#selector(getRandomValues(length:))),
        "btoa": NSStringFromSelector(#selector(btoa(str:))),
        "atob": NSStringFromSelector(#selector(atob(str:)))
    ]
  }

    @objc public init(param: Any) { super.init() }
    @objc public override init() { super.init() }
    
    private func parseJSONDictionary(_ jsonString: String) -> [String: Any]? {
        guard let data = jsonString.data(using: .utf8),
              let result = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
        return result
    }
    
    private func parseJSONArray(_ jsonString: String) -> [String]? {
        guard let data = jsonString.data(using: .utf8),
              let result = try? JSONSerialization.jsonObject(with: data) as? [String] else { return nil }
        return result
    }
    
    // RFC 4648 Section 5 - Base64URL encoding (for JWK components)
    private func base64urlEncode(_ data: Data) -> String {
        data.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
    
    private func base64urlDecode(_ string: String) -> Data? {
        var base64 = string
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        let padding = base64.count % 4
        if padding > 0 { base64 += String(repeating: "=", count: 4 - padding) }
        return Data(base64Encoded: base64)
    }
    
    private func errorToJSON(_ message: String) -> String {
        let errorDict: [String: Any] = ["error": true, "message": message]
        guard let data = try? JSONSerialization.data(withJSONObject: errorDict),
              let json = String(data: data, encoding: .utf8) else {
            return "{\"error\": true, \"message\": \"Serialization error\"}"
        }
        return json
    }
    
    // MARK: - WebCrypto Spec-compliant Implementations
    
    @objc func getRandomValues(length: Int) -> String {
        guard length > 0 else { return errorToJSON("Length must be positive") }
        var data = Data(count: length)
        let result = data.withUnsafeMutableBytes {
            SecRandomCopyBytes(kSecRandomDefault, length, $0.baseAddress!)
        }
        guard result == errSecSuccess else { return errorToJSON("Random generation failed") }
        return data.base64EncodedString() // Standard Base64 for binary data transfer
    }
    
    @objc func textEncode(text: String) -> String {
        guard let data = text.data(using: .utf8) else {
            return errorToJSON("UTF-8 encoding failed")
        }
        return data.base64EncodedString()
    }
    
    @objc func textDecode(data: String) -> String {
        guard let decodedData = Data(base64Encoded: data),
              let text = String(data: decodedData, encoding: .utf8) else {
            return errorToJSON("Base64 or UTF-8 decoding failed")
        }
        return text
    }
    
    // SubtleCrypto.digest() - WebCrypto spec compliant
    @objc func digest(options: String, data: String) -> String {
        guard let optionsDict = parseJSONDictionary(options),
              let algorithmName = optionsDict["name"] as? String,
              let inputData = Data(base64Encoded: data) else {
            return errorToJSON("Invalid parameters for digest")
        }
        
        let hash: Data
        switch algorithmName.uppercased() {
        case "SHA-256": hash = Data(SHA256.hash(data: inputData))
        case "SHA-384": hash = Data(SHA384.hash(data: inputData))
        case "SHA-512": hash = Data(SHA512.hash(data: inputData))
        default: return errorToJSON("Unsupported digest algorithm: \(algorithmName)")
        }
        return hash.base64EncodedString()
    }
    
    // SubtleCrypto.generateKey() - WebCrypto spec compliant with proper JWK format
    @objc func generateKey(algorithm: String, extractable: Bool, keyUsages: String) -> String {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyUsagesArray = parseJSONArray(keyUsages) else {
            return errorToJSON("Invalid parameters for generateKey")
        }
        
        do {
            let resultDict: Any
            
            switch algorithmName.uppercased() {
            case "ECDSA":
                guard let namedCurve = algorithmDict["namedCurve"] as? String,
                      namedCurve.uppercased() == "P-256" else {
                    return errorToJSON("Only P-256 curve is supported for ECDSA")
                }
                
                let privateKey = P256.Signing.PrivateKey()
                let pubData = privateKey.publicKey.x963Representation
                guard pubData.count == 65, pubData[0] == 0x04 else {
                    return errorToJSON("Invalid public key format")
                }
                
                // WebCrypto spec: private keys include both private and public components
                let privateJWK: [String: Any] = [
                    "kty": "EC",
                    "crv": "P-256",
                    "alg": "ES256", // WebCrypto spec algorithm identifier
                    "d": base64urlEncode(privateKey.rawRepresentation),
                    "x": base64urlEncode(pubData.subdata(in: 1..<33)),
                    "y": base64urlEncode(pubData.subdata(in: 33..<65)),
                    "key_ops": keyUsagesArray.filter { $0 == "sign" },
                    "ext": extractable
                ]
                
                let publicJWK: [String: Any] = [
                    "kty": "EC",
                    "crv": "P-256",
                    "alg": "ES256",
                    "x": base64urlEncode(pubData.subdata(in: 1..<33)),
                    "y": base64urlEncode(pubData.subdata(in: 33..<65)),
                    "key_ops": keyUsagesArray.filter { $0 == "verify" },
                    "ext": true // Public keys are always extractable per WebCrypto spec
                ]
                
                resultDict = ["privateKey": privateJWK, "publicKey": publicJWK]
                
            case "ECDH":
                guard let namedCurve = algorithmDict["namedCurve"] as? String,
                      namedCurve.uppercased() == "P-256" else {
                    return errorToJSON("Only P-256 curve is supported for ECDH")
                }
                
                let privateKey = P256.KeyAgreement.PrivateKey()
                let pubData = privateKey.publicKey.x963Representation
                guard pubData.count == 65, pubData[0] == 0x04 else {
                    return errorToJSON("Invalid ECDH public key format")
                }
                
                let allowedOps = keyUsagesArray.filter { $0 == "deriveKey" || $0 == "deriveBits" }
                
                let privateJWK: [String: Any] = [
                    "kty": "EC",
                    "crv": "P-256",
                    "alg": "ECDH-ES", // WebCrypto spec identifier for ECDH
                    "d": base64urlEncode(privateKey.rawRepresentation),
                    "x": base64urlEncode(pubData.subdata(in: 1..<33)),
                    "y": base64urlEncode(pubData.subdata(in: 33..<65)),
                    "key_ops": allowedOps,
                    "ext": extractable
                ]
                
                let publicJWK: [String: Any] = [
                    "kty": "EC",
                    "crv": "P-256",
                    "alg": "ECDH-ES",
                    "x": base64urlEncode(pubData.subdata(in: 1..<33)),
                    "y": base64urlEncode(pubData.subdata(in: 33..<65)),
                    "key_ops": [], // Public ECDH keys have no operations per spec
                    "ext": true
                ]
                
                resultDict = ["privateKey": privateJWK, "publicKey": publicJWK]
                
            case "AES-GCM":
                let keySize = (algorithmDict["length"] as? Int) ?? 256
                guard [128, 192, 256].contains(keySize) else {
                    return errorToJSON("AES key size must be 128, 192, or 256 bits")
                }
                let keyBytes = keySize / 8
                var keyData = Data(count: keyBytes)
                let status = keyData.withUnsafeMutableBytes {
                    SecRandomCopyBytes(kSecRandomDefault, keyBytes, $0.baseAddress!)
                }
                guard status == errSecSuccess else {
                    return errorToJSON("Failed to generate secure random key for AES")
                }
                
                // WebCrypto spec: symmetric keys return the JWK directly, not wrapped
                resultDict = [
                    "kty": "oct",
                    "k": base64urlEncode(keyData),
                    "alg": "A\(keySize)GCM", // Standard JWK algorithm identifier
                    "ext": extractable,
                    "key_ops": keyUsagesArray
                ]
                
            default:
                return errorToJSON("Unsupported algorithm for generateKey: \(algorithmName)")
            }
            
            let resultData = try JSONSerialization.data(withJSONObject: resultDict)
            return String(data: resultData, encoding: .utf8) ?? errorToJSON("Serialization failed")
            
        } catch {
            return errorToJSON("Key generation failed: \(error.localizedDescription)")
        }
    }
    
    @objc func exportKey(format: String, key: String) -> String {
        guard let keyDict = parseJSONDictionary(key) else {
            return errorToJSON("Invalid key format")
        }
        
        // WebCrypto spec: check extractability for non-public keys
        let isPublicKey = keyDict["d"] == nil
        if !isPublicKey, let extractable = keyDict["ext"] as? Bool, !extractable {
            return errorToJSON("Key is not extractable")
        }
        
        switch format.lowercased() {
        case "jwk":
            // Return JWK as-is per WebCrypto spec
            guard let data = try? JSONSerialization.data(withJSONObject: keyDict),
                  let str = String(data: data, encoding: .utf8) else {
                return errorToJSON("JWK serialization failed")
            }
            return str
        case "raw":
            // Only supported for symmetric keys per WebCrypto spec
            guard let kty = keyDict["kty"] as? String, kty == "oct",
                  let kBase64url = keyDict["k"] as? String,
                  let keyData = base64urlDecode(kBase64url) else {
                return errorToJSON("Raw export format only supported for symmetric keys")
            }
            return keyData.base64EncodedString()
        default:
            return errorToJSON("Unsupported export format: \(format)")
        }
    }
    
    @objc func importKey(format: String, keyData keyDataString: String, algorithm: String, extractable: Bool, keyUsages: String) -> String {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyUsagesArray = parseJSONArray(keyUsages) else {
            return errorToJSON("Invalid parameters for importKey")
        }
        
        switch format.lowercased() {
        case "jwk":
            guard var jwk = parseJSONDictionary(keyDataString),
                  let kty = jwk["kty"] as? String else {
                return errorToJSON("Invalid JWK data")
            }
            
            // WebCrypto spec: validate and set algorithm-specific properties
            switch algorithmName.uppercased() {
            case "ECDSA":
                guard kty == "EC",
                      let crv = jwk["crv"] as? String, crv == "P-256",
                      jwk["x"] != nil, jwk["y"] != nil else {
                    return errorToJSON("Invalid EC key for ECDSA")
                }
                jwk["alg"] = "ES256"
            case "ECDH":
                guard kty == "EC",
                      let crv = jwk["crv"] as? String, crv == "P-256",
                      jwk["x"] != nil, jwk["y"] != nil else {
                    return errorToJSON("Invalid EC key for ECDH")
                }
                jwk["alg"] = "ECDH-ES"
            case "AES-GCM":
                guard kty == "oct",
                      let kBase64url = jwk["k"] as? String,
                      let kData = base64urlDecode(kBase64url) else {
                    return errorToJSON("Invalid AES key")
                }
                let keySize = kData.count * 8
                guard [128, 192, 256].contains(keySize) else {
                    return errorToJSON("Invalid AES key size")
                }
                jwk["alg"] = "A\(keySize)GCM"
            case "PBKDF2":
                return errorToJSON("JWK import not supported for PBKDF2 base keys")
            default:
                return errorToJSON("Unsupported algorithm for JWK import: \(algorithmName)")
            }
            
            jwk["ext"] = extractable
            jwk["key_ops"] = keyUsagesArray
            
            do {
                let resultData = try JSONSerialization.data(withJSONObject: jwk)
                return String(data: resultData, encoding: .utf8) ?? errorToJSON("Serialization failed")
            } catch {
                return errorToJSON("Import failed: \(error.localizedDescription)")
            }
            
        case "raw":
            guard let rawData = Data(base64Encoded: keyDataString) else {
                return errorToJSON("Invalid raw key data")
            }
            
            switch algorithmName.uppercased() {
            case "AES-GCM":
                // WebCrypto spec: raw AES keys should be valid key sizes
                let keyBitSize = rawData.count * 8
                guard [128, 192, 256].contains(keyBitSize) else {
                    return errorToJSON("Invalid AES key size")
                }
                
                let jwk: [String: Any] = [
                    "kty": "oct",
                    "k": base64urlEncode(rawData),
                    "alg": "A\(keyBitSize)GCM",
                    "ext": extractable,
                    "key_ops": keyUsagesArray
                ]
                
                do {
                    let resultData = try JSONSerialization.data(withJSONObject: jwk)
                    return String(data: resultData, encoding: .utf8) ?? errorToJSON("Serialization failed")
                } catch {
                    return errorToJSON("Raw AES import failed: \(error.localizedDescription)")
                }
                
            case "PBKDF2":
                // Special handling for PBKDF2 password material
                let jwk: [String: Any] = [
                    "kty": "PBKDF2-RAW", // Custom identifier for SEA.js compatibility
                    "rawData": rawData.base64EncodedString(),
                    "ext": false, // PBKDF2 base keys are not extractable
                    "key_ops": keyUsagesArray
                ]
                
                do {
                    let resultData = try JSONSerialization.data(withJSONObject: jwk)
                    return String(data: resultData, encoding: .utf8) ?? errorToJSON("Serialization failed")
                } catch {
                    return errorToJSON("PBKDF2 import failed: \(error.localizedDescription)")
                }
                
            default:
                return errorToJSON("Unsupported algorithm for raw import: \(algorithmName)")
            }
            
        default:
            return errorToJSON("Unsupported import format: \(format)")
        }
    }
    
    // WebCrypto spec compliant ECDSA signing with P-256 + SHA-256
    @objc func sign(algorithm: String, key: String, data: String) -> String {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              algorithmName.uppercased() == "ECDSA",
              let keyJWK = parseJSONDictionary(key),
              let inputData = Data(base64Encoded: data),
              let dBase64url = keyJWK["d"] as? String,
              let dData = base64urlDecode(dBase64url) else {
            return errorToJSON("Invalid parameters for sign")
        }
        
        // WebCrypto spec: check hash algorithm (should be SHA-256 for P-256)
        if let hashDict = algorithmDict["hash"] as? [String: Any],
           let hashName = hashDict["name"] as? String,
           hashName.uppercased() != "SHA-256" {
            return errorToJSON("Only SHA-256 hash is supported for P-256 ECDSA")
        }
        
        do {
            let privateKey = try P256.Signing.PrivateKey(rawRepresentation: dData)
            // CryptoKit automatically uses SHA-256 with P-256, matching WebCrypto spec
            let signature = try privateKey.signature(for: inputData)
            let base64Signature = signature.derRepresentation.base64EncodedString()
            print("[Swift] Sign: DER signature bytes: \(signature.derRepresentation.count)")
            print("[Swift] Sign: Base64 signature length: \(base64Signature.count)")
            // Return DER-encoded signature per WebCrypto spec
            return base64Signature
        } catch {
            return errorToJSON("Signing failed: \(error.localizedDescription)")
        }
    }
    
    // WebCrypto spec compliant ECDSA verification
    @objc func verify(algorithm: String, key: String, signature: String, data: String) -> String {
        print("[Swift] Verify called")
        print("[Swift] Algorithm: \(algorithm)")
        print("[Swift] Key (first 100 chars): \(String(key.prefix(100)))")
        print("[Swift] Signature length: \(signature.count)")
        print("[Swift] Data length: \(data.count)")
        
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algoName = algorithmDict["name"] as? String,
              algoName.uppercased() == "ECDSA",
              let keyJWK = parseJSONDictionary(key),
              let inputData = Data(base64Encoded: data),
              let sigData = Data(base64Encoded: signature),
              let xBase64url = keyJWK["x"] as? String,
              let yBase64url = keyJWK["y"] as? String,
              let xData = base64urlDecode(xBase64url),
              let yData = base64urlDecode(yBase64url) else {
            print("[Swift] Verify failed - invalid parameters")
            return "false" // WebCrypto spec: return false for invalid parameters
        }
        
        do {
            // Reconstruct uncompressed public key from JWK x,y coordinates
            var publicKeyRaw = Data([0x04]) // Uncompressed point indicator
            publicKeyRaw.append(xData)
            publicKeyRaw.append(yData)
            
            print("[Swift] Reconstructed public key length: \(publicKeyRaw.count)")
            
            let publicKey = try P256.Signing.PublicKey(x963Representation: publicKeyRaw)
            let ecdsaSignature = try P256.Signing.ECDSASignature(derRepresentation: sigData)
            let isValid = publicKey.isValidSignature(ecdsaSignature, for: inputData)
            
            print("[Swift] Signature verification result: \(isValid)")
            return isValid ? "true" : "false"
        } catch {
            // WebCrypto spec: validation failures should return false, not throw
            print("[Swift] Verify exception: \(error.localizedDescription)")
            return "false"
        }
    }
    
    // AES-GCM encryption matching WebCrypto spec
    @objc func encrypt(algorithm: String, key: String, data: String) -> String {
        
        guard let algorithmDict = parseJSONDictionary(algorithm) else {
            return errorToJSON("Failed to parse algorithm JSON")
        }
        
        guard algorithmDict["name"] as? String == "AES-GCM" else {
            return errorToJSON("Algorithm must be AES-GCM, got: \(algorithmDict["name"] ?? "nil")")
        }
        
        guard let keyJWK = parseJSONDictionary(key) else {
            return errorToJSON("Failed to parse key JSON")
        }
        
        guard let inputData = Data(base64Encoded: data) else {
            return errorToJSON("Failed to decode base64 data")
        }
        
        guard let ivBase64 = algorithmDict["iv"] as? String else {
            return errorToJSON("Missing 'iv' in algorithm")
        }
        
        guard let iv = Data(base64Encoded: ivBase64) else {
            return errorToJSON("Failed to decode base64 IV")
        }
        
        guard let kBase64url = keyJWK["k"] as? String else {
            return errorToJSON("Missing 'k' in key JWK")
        }
        
        guard let keyData = base64urlDecode(kBase64url) else {
            return errorToJSON("Failed to decode base64url key")
        }
        
        // Process AAD if present
        let aad = (algorithmDict["additionalData"] as? String).flatMap { Data(base64Encoded: $0) }
        
        do {
            let symmetricKey = SymmetricKey(data: keyData)
            let nonce = try AES.GCM.Nonce(data: iv)
            let sealedBox = try AES.GCM.seal(inputData, using: symmetricKey, nonce: nonce,
                                           authenticating: aad ?? Data())
            return (sealedBox.ciphertext + sealedBox.tag).base64EncodedString()
        } catch {
            return errorToJSON("Encryption failed: \(error.localizedDescription)")
        }
    }
    
    // AES-GCM decryption matching WebCrypto spec
    @objc func decrypt(algorithm: String, key: String, data: String) -> String {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              algorithmDict["name"] as? String == "AES-GCM",
              let keyJWK = parseJSONDictionary(key),
              let encryptedDataWithTag = Data(base64Encoded: data),
              let ivBase64 = algorithmDict["iv"] as? String,
              let iv = Data(base64Encoded: ivBase64),
              let kBase64url = keyJWK["k"] as? String,
              let keyData = base64urlDecode(kBase64url),
              encryptedDataWithTag.count >= 16 else {
            return "" // WebCrypto spec: return empty on failure
        }
        
        let aad = (algorithmDict["additionalData"] as? String).flatMap { Data(base64Encoded: $0) }
        
        do {
            let symmetricKey = SymmetricKey(data: keyData)
            let tagLength = 16 // AES-GCM standard tag length
            let ciphertext = encryptedDataWithTag.dropLast(tagLength)
            let tag = encryptedDataWithTag.suffix(tagLength)
            
            let nonce = try AES.GCM.Nonce(data: iv)
            let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
            let decryptedData = try AES.GCM.open(sealedBox, using: symmetricKey,
                                               authenticating: aad ?? Data())
            
            return decryptedData.base64EncodedString()
        } catch {
            return "" // WebCrypto spec: authentication/decryption failures return empty
        }
    }
    
    // WebCrypto spec compliant deriveBits for PBKDF2 and ECDH
    @objc func deriveBits(algorithm: String, baseKey: String, length: Int) -> String {
        guard let algoDict = parseJSONDictionary(algorithm),
              let algoName = algoDict["name"] as? String,
              length > 0, length % 8 == 0 else {
            return errorToJSON("Invalid parameters for deriveBits")
        }
        
        let derivedKeyLengthBytes = length / 8
        
        switch algoName.uppercased() {
        case "PBKDF2":
            return deriveBitsPBKDF2(baseKey: baseKey, algoDict: algoDict,
                                  derivedKeyLengthBytes: derivedKeyLengthBytes)
            
        case "ECDH":
            return deriveBitsECDH(baseKey: baseKey, algoDict: algoDict,
                                derivedKeyLengthBytes: derivedKeyLengthBytes)
            
        default:
            return errorToJSON("Unsupported derivation algorithm: \(algoName)")
        }
    }
    
    // PBKDF2 derivation per WebCrypto spec
    private func deriveBitsPBKDF2(baseKey: String, algoDict: [String: Any],
                                 derivedKeyLengthBytes: Int) -> String {
        // Handle password data (base key)
        var passwordData: Data? = nil
        if let baseKeyJWK = parseJSONDictionary(baseKey),
           baseKeyJWK["kty"] as? String == "PBKDF2-RAW",
           let pwdB64 = baseKeyJWK["rawData"] as? String {
            passwordData = Data(base64Encoded: pwdB64)
        } else if let directPwdData = Data(base64Encoded: baseKey) {
            passwordData = directPwdData
        }
        
        guard let finalPasswordData = passwordData,
              let saltBase64 = algoDict["salt"] as? String,
              let saltData = Data(base64Encoded: saltBase64) else {
            return errorToJSON("Invalid PBKDF2 parameters")
        }
        
        let iterations = algoDict["iterations"] as? Int ?? 100000
        guard iterations > 0 else { return errorToJSON("PBKDF2 iterations must be positive") }
        
        // WebCrypto spec: support multiple hash algorithms
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
            finalPasswordData.withUnsafeBytes { passwordBytes in
                saltData.withUnsafeBytes { saltBytes in
                    CCKeyDerivationPBKDF(
                        CCPBKDFAlgorithm(kCCPBKDF2),
                        passwordBytes.baseAddress?.assumingMemoryBound(to: Int8.self),
                        finalPasswordData.count,
                        saltBytes.baseAddress?.assumingMemoryBound(to: UInt8.self),
                        saltData.count,
                        prf, UInt32(iterations),
                        derivedKeyBytes.baseAddress?.assumingMemoryBound(to: UInt8.self),
                        derivedKeyLengthBytes
                    )
                }
            }
        }
        
        if derivationStatus == kCCSuccess {
            return derivedKey.base64EncodedString()
        } else {
            return errorToJSON("PBKDF2 derivation failed")
        }
    }
    
    // ECDH key agreement per WebCrypto spec
    private func deriveBitsECDH(baseKey: String, algoDict: [String: Any],
                              derivedKeyLengthBytes: Int) -> String {
        guard let privateKeyJWK = parseJSONDictionary(baseKey),
              let dBase64url = privateKeyJWK["d"] as? String,
              let privateKeyData = base64urlDecode(dBase64url),
              let peerPublicKeyJWK = algoDict["public"] as? [String: Any],
              let xBase64url = peerPublicKeyJWK["x"] as? String,
              let yBase64url = peerPublicKeyJWK["y"] as? String,
              let xData = base64urlDecode(xBase64url),
              let yData = base64urlDecode(yBase64url) else {
            return errorToJSON("Invalid ECDH parameters")
        }
        
        do {
            // Reconstruct peer's public key from JWK coordinates
            var peerPublicKeyRaw = Data([0x04])
            peerPublicKeyRaw.append(xData)
            peerPublicKeyRaw.append(yData)
            
            let localPrivateKey = try P256.KeyAgreement.PrivateKey(rawRepresentation: privateKeyData)
            let peerPublicKey = try P256.KeyAgreement.PublicKey(x963Representation: peerPublicKeyRaw)
            let sharedSecret = try localPrivateKey.sharedSecretFromKeyAgreement(with: peerPublicKey)
            
            // WebCrypto spec ECDH: For raw shared secret, use HKDF-SHA256 for bit derivation
            let derivedKey = sharedSecret.hkdfDerivedSymmetricKey(
                using: SHA256.self,
                salt: Data(),
                sharedInfo: Data(),
                outputByteCount: derivedKeyLengthBytes
            )
            
            // Return as Base64URL per SEA.js expectations (matches SEA.js secret.js output format)
            return derivedKey.withUnsafeBytes { base64urlEncode(Data($0)) }
        } catch {
            return errorToJSON("ECDH key agreement failed: \(error.localizedDescription)")
        }
    }

  @objc public func btoa(str: NSString) -> NSString? {
    // Input is a Latin-1 / binary string. Encode bytes 0..255 as-is.
    let s = str as String
    var bytes = [UInt8]()
    bytes.reserveCapacity(s.utf8.count)
    for ch in s.unicodeScalars {
      let v = UInt8(truncatingIfNeeded: ch.value)
      bytes.append(v)
    }
    return Data(bytes).base64EncodedString() as NSString
  }

  @objc public func atob(str: NSString) -> NSString? {
    let s = str as String
    guard let data = Data(base64Encoded: s) else {
      return nil
    }
    // Use ISO Latin-1 (ISO 8859-1) encoding which maps bytes 0-255 directly to Unicode code points 0-255
    // This is the standard way to represent binary data as a string for JavaScript interop
    guard let binaryString = String(data: data, encoding: .isoLatin1) else {
        print("[Swift] atob: Failed to encode as ISO Latin-1, data length: \(data.count)")
        return nil
    }
    
    // Verify we didn't lose any data
    if binaryString.count != data.count {
        print("[Swift] atob: Data length mismatch! data: \(data.count), string: \(binaryString.count)")
        return nil
    }
    
    print("[Swift] atob: input length: \(s.count), decoded bytes: \(data.count), output length: \(binaryString.count)")
    return binaryString as NSString
  }
}

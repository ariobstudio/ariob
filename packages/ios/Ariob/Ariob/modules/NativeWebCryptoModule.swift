//
//  NativeSEAModule.swift
//  Ariob
//
//  Created by Natnael Teferi on 3/17/25.
//

import UIKit
import Foundation
import CryptoKit
import CommonCrypto // Ensure your project is set up to use CommonCrypto

@objcMembers
public final class NativeWebCryptoModule: NSObject, LynxModule {
    
    public init(param: Any) {
        // INIT
    }
    
    // MARK: - Module Registration for Lynx
    
    @objc public static var name: String {
        return "NativeWebCryptoModule"
    }
    
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
            "wrapKey": NSStringFromSelector(#selector(wrapKey(format:key:wrappingKey:algorithm:))),
            "unwrapKey": NSStringFromSelector(#selector(unwrapKey(format:wrappedKey:unwrappingKey:unwrapAlgorithm:unwrappedKeyAlgorithm:extractable:keyUsages:))),
            "deriveBits": NSStringFromSelector(#selector(deriveBits(algorithm:key:length:))),
            "deriveKey": NSStringFromSelector(#selector(deriveKey(algorithm:baseKey:derivedKeyAlgorithm:extractable:keyUsages:))),
            
            // TextEncoder/TextDecoder equivalents
            "textEncode": NSStringFromSelector(#selector(textEncode(text:))),
            "textDecode": NSStringFromSelector(#selector(textDecode(data:))),
            
            // Random values generator
            "getRandomValues": NSStringFromSelector(#selector(getRandomValues(length:)))
        ]
    }
    
    @objc public override init() {
      super.init()
    }
    
    // MARK: - Helper Methods
    
    private func parseJSONDictionary(_ jsonString: String) -> [String: Any]? {
        guard let data = jsonString.data(using: .utf8),
              let result = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] else {
            return nil
        }
        return result
    }
    
    private func parseJSONArray(_ jsonString: String) -> [String]? {
        guard let data = jsonString.data(using: .utf8),
              let result = try? JSONSerialization.jsonObject(with: data, options: []) as? [String] else {
            return nil
        }
        return result
    }
    
    private func base64urlEncode(_ data: Data) -> String {
        return data.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
    
    private func base64urlDecode(_ string: String) -> Data? {
        var base64 = string
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        
        while base64.count % 4 != 0 {
            base64 += "="
        }
        
        return Data(base64Encoded: base64)
    }
    
    // MARK: - TextEncoder/TextDecoder Emulation
    
    @objc func textEncode(text: String) -> String {
        guard let data = text.data(using: .utf8) else {
            return ""
        }
        return data.base64EncodedString()
    }
    
    @objc func textDecode(data: String) -> String {
        guard let decodedData = Data(base64Encoded: data),
              let text = String(data: decodedData, encoding: .utf8) else {
            return ""
        }
        return text
    }
    
    // MARK: - Random Values Generator
    
    @objc func getRandomValues(length: Int) -> String {
        var data = Data(count: length)
        _ = data.withUnsafeMutableBytes {
            SecRandomCopyBytes(kSecRandomDefault, length, $0.baseAddress!)
        }
        return data.base64EncodedString()
    }
    
    // MARK: - Additional Utility Methods
    
    private func normalizeAESKey(keyData: Data) -> Data {
        let keyBitSize = keyData.count * 8
        if keyBitSize == 128 || keyBitSize == 192 || keyBitSize == 256 {
            return keyData
        }
        let hashedKey = SHA256.hash(data: keyData)
        return Data(hashedKey)
    }
    
    private func createSymmetricKeyFromJWK(jwk: [String: Any]) -> SymmetricKey? {
        guard let kty = jwk["kty"] as? String, kty == "oct",
              let k = jwk["k"] as? String,
              let keyData = base64urlDecode(k) else {
            return nil
        }
        let normalizedKey = normalizeAESKey(keyData: keyData)
        return SymmetricKey(data: normalizedKey)
    }
    
    // MARK: - Error JSON Conversion
    
    private func errorToJSON(_ message: String) -> String {
        let error: [String: Any] = ["error": true, "message": message]
        guard let data = try? JSONSerialization.data(withJSONObject: error),
              let result = String(data: data, encoding: .utf8) else {
            return "{\"error\": true, \"message\": \"Unknown error\"}"
        }
        return result
    }
    
    // MARK: - EC Key Conversion Helpers
    
    private func createECJWK(privateKey: P256.Signing.PrivateKey, keyOps: [String], extractable: Bool) -> [String: Any] {
        let privateKeyData = privateKey.rawRepresentation
        let publicKeyData = privateKey.publicKey.rawRepresentation
        let publicKeyX = publicKeyData.prefix(32)
        let publicKeyY = publicKeyData.suffix(32)
        let dBase64 = base64urlEncode(privateKeyData)
        let xBase64 = base64urlEncode(publicKeyX)
        let yBase64 = base64urlEncode(publicKeyY)
        
        return [
            "kty": "EC",
            "crv": "P-256",
            "d": dBase64,
            "x": xBase64,
            "y": yBase64,
            "key_ops": keyOps,
            "ext": extractable
        ]
    }
    
    private func createECJWK(publicKey: P256.Signing.PublicKey, keyOps: [String], extractable: Bool) -> [String: Any] {
        let publicKeyData = publicKey.rawRepresentation
        let publicKeyX = publicKeyData.prefix(32)
        let publicKeyY = publicKeyData.suffix(32)
        let xBase64 = base64urlEncode(publicKeyX)
        let yBase64 = base64urlEncode(publicKeyY)
        
        return [
            "kty": "EC",
            "crv": "P-256",
            "x": xBase64,
            "y": yBase64,
            "key_ops": keyOps,
            "ext": extractable
        ]
    }
    
    private func createECDHJWK(privateKey: P256.KeyAgreement.PrivateKey, keyOps: [String], extractable: Bool) -> [String: Any] {
        let privateKeyData = privateKey.rawRepresentation
        let publicKeyData = privateKey.publicKey.rawRepresentation
        let publicKeyX = publicKeyData.prefix(32)
        let publicKeyY = publicKeyData.suffix(32)
        let dBase64 = base64urlEncode(privateKeyData)
        let xBase64 = base64urlEncode(publicKeyX)
        let yBase64 = base64urlEncode(publicKeyY)
        
        return [
            "kty": "EC",
            "crv": "P-256",
            "d": dBase64,
            "x": xBase64,
            "y": yBase64,
            "key_ops": keyOps,
            "ext": extractable
        ]
    }
    
    private func createECDHJWK(publicKey: P256.KeyAgreement.PublicKey, keyOps: [String], extractable: Bool) -> [String: Any] {
        let publicKeyData = publicKey.rawRepresentation
        let publicKeyX = publicKeyData.prefix(32)
        let publicKeyY = publicKeyData.suffix(32)
        let xBase64 = base64urlEncode(publicKeyX)
        let yBase64 = base64urlEncode(publicKeyY)
        
        return [
            "kty": "EC",
            "crv": "P-256",
            "x": xBase64,
            "y": yBase64,
            "key_ops": keyOps,
            "ext": extractable
        ]
    }
    
    /// Constructs a DER-encoded SPKI representation for a public EC key given in JWK format.
   private func spkiFromJWK(_ keyJWK: [String: Any]) -> Data? {
       guard let xStr = keyJWK["x"] as? String,
             let yStr = keyJWK["y"] as? String,
             let xData = base64urlDecode(xStr),
             let yData = base64urlDecode(yStr) else {
           return nil
       }
       // Build the uncompressed public key: 0x04 || x || y
       var publicKeyRaw = Data([0x04])
       publicKeyRaw.append(xData)
       publicKeyRaw.append(yData)
       // Fixed DER header for P-256 public keys:
       let header: [UInt8] = [
           0x30, 0x59,
           0x30, 0x13,
           0x06, 0x07, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x02, 0x01,
           0x06, 0x08, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x03, 0x01, 0x07,
           0x03, 0x42, 0x00
       ]
       var spki = Data(header)
       spki.append(publicKeyRaw)
       return spki
   }
   
    
    // MARK: - WrapKey and UnwrapKey Implementation
    
    @objc func wrapKey(format: String, key: String, wrappingKey: String, algorithm: String) -> String? {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyJWK = parseJSONDictionary(key),
              let wrappingKeyJWK = parseJSONDictionary(wrappingKey) else {
            return errorToJSON("Invalid parameters for key wrapping")
        }
        guard format == "jwk" else {
            return errorToJSON("Only JWK format is supported for key wrapping")
        }
        
        switch algorithmName.uppercased() {
        case "AES-GCM":
            guard let keyData = try? JSONSerialization.data(withJSONObject: keyJWK),
                  let keyString = String(data: keyData, encoding: .utf8),
                  let dataToWrap = keyString.data(using: .utf8) else {
                return errorToJSON("Failed to serialize key for wrapping")
            }
            guard let wrappingKeyData = createSymmetricKeyFromJWK(jwk: wrappingKeyJWK) else {
                return errorToJSON("Invalid wrapping key")
            }
            
            let iv: Data
            if let ivBase64 = algorithmDict["iv"] as? String,
               let ivData = Data(base64Encoded: ivBase64) {
                iv = ivData
            } else {
                var ivData = Data(count: 12)
                let status = ivData.withUnsafeMutableBytes {
                    SecRandomCopyBytes(kSecRandomDefault, 12, $0.baseAddress!)
                }
                guard status == errSecSuccess else {
                    return errorToJSON("Failed to generate secure IV")
                }
                iv = ivData
            }
            
            do {
                let nonce = try AES.GCM.Nonce(data: iv)
                let sealedBox = try AES.GCM.seal(dataToWrap, using: wrappingKeyData, nonce: nonce)
                let wrappedData = NSMutableData()
                wrappedData.append(iv)
                wrappedData.append(sealedBox.ciphertext)
                wrappedData.append(sealedBox.tag)
                let resultDict: [String: Any] = [
                    "wrappedKey": wrappedData.base64EncodedString(),
                    "iv": iv.base64EncodedString()
                ]
                guard let resultData = try? JSONSerialization.data(withJSONObject: resultDict),
                      let resultString = String(data: resultData, encoding: .utf8) else {
                    return errorToJSON("Failed to serialize wrapped key result")
                }
                return resultString
            } catch {
                return errorToJSON("Key wrapping failed: \(error.localizedDescription)")
            }
            
        default:
            return errorToJSON("Unsupported key wrapping algorithm: \(algorithmName)")
        }
    }
    
    @objc func unwrapKey(format: String, wrappedKey: String, unwrappingKey: String, unwrapAlgorithm: String,
                         unwrappedKeyAlgorithm: String, extractable: Bool, keyUsages: String) -> String? {
        guard let unwrapAlgoDict = parseJSONDictionary(unwrapAlgorithm),
              let unwrapAlgoName = unwrapAlgoDict["name"] as? String,
              let unwrappedAlgoDict = parseJSONDictionary(unwrappedKeyAlgorithm),
              let unwrappedAlgoName = unwrappedAlgoDict["name"] as? String,
              let unwrappingKeyJWK = parseJSONDictionary(unwrappingKey),
              let wrappedKeyDict = parseJSONDictionary(wrappedKey),
              let wrappedKeyBase64 = wrappedKeyDict["wrappedKey"] as? String,
              let wrappedKeyData = Data(base64Encoded: wrappedKeyBase64),
              let keyUsagesArray = parseJSONArray(keyUsages) else {
            return errorToJSON("Invalid parameters for key unwrapping")
        }
        guard format == "jwk" else {
            return errorToJSON("Only JWK format is supported for key unwrapping")
        }
        
        switch unwrapAlgoName.uppercased() {
        case "AES-GCM":
            guard let unwrappingKeyData = createSymmetricKeyFromJWK(jwk: unwrappingKeyJWK) else {
                return errorToJSON("Invalid unwrapping key")
            }
            
            let iv: Data
            if let ivBase64 = unwrapAlgoDict["iv"] as? String,
               let ivData = Data(base64Encoded: ivBase64) {
                iv = ivData
            } else if let ivBase64 = wrappedKeyDict["iv"] as? String,
                      let ivData = Data(base64Encoded: ivBase64) {
                iv = ivData
            } else {
                guard wrappedKeyData.count > 12 else {
                    return errorToJSON("Wrapped key data too short")
                }
                iv = wrappedKeyData.prefix(12)
            }
            
            let tagLength = 16
            guard wrappedKeyData.count >= iv.count + tagLength else {
                return errorToJSON("Wrapped key data too short")
            }
            
            let ciphertext: Data
            let tag: Data
            if unwrapAlgoDict["iv"] != nil || wrappedKeyDict["iv"] != nil {
                ciphertext = wrappedKeyData.dropLast(tagLength)
                tag = wrappedKeyData.suffix(tagLength)
            } else {
                ciphertext = wrappedKeyData.dropFirst(iv.count).dropLast(tagLength)
                tag = wrappedKeyData.suffix(tagLength)
            }
            
            do {
                let nonce = try AES.GCM.Nonce(data: iv)
                let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
                let unwrappedData = try AES.GCM.open(sealedBox, using: unwrappingKeyData)
                guard let unwrappedKeyString = String(data: unwrappedData, encoding: .utf8),
                      let unwrappedKeyDict = parseJSONDictionary(unwrappedKeyString) else {
                    return errorToJSON("Failed to parse unwrapped key data")
                }
                var resultKey = unwrappedKeyDict
                resultKey["ext"] = extractable
                resultKey["key_ops"] = keyUsagesArray
                if resultKey["alg"] == nil {
                    switch unwrappedAlgoName.uppercased() {
                    case "ECDSA":
                        resultKey["alg"] = "ES256"
                    case "ECDH":
                        resultKey["alg"] = "ECDH-ES"
                    case "AES-GCM":
                        if let keyData = createSymmetricKeyFromJWK(jwk: resultKey) {
                            let keyLength = keyData.bitCount
                            resultKey["alg"] = "A\(keyLength)GCM"
                        }
                    default:
                        break
                    }
                }
                guard let resultData = try? JSONSerialization.data(withJSONObject: resultKey),
                      let resultString = String(data: resultData, encoding: .utf8) else {
                    return errorToJSON("Failed to serialize unwrapped key")
                }
                return resultString
            } catch {
                return errorToJSON("Key unwrapping failed: \(error.localizedDescription)")
            }
            
        default:
            return errorToJSON("Unsupported key unwrapping algorithm: \(unwrappedAlgoName)")
        }
    }
    
    // MARK: - Web Crypto API Methods
    
    @objc func digest(options: String, data: String) -> String? {
        guard let optionsDict = parseJSONDictionary(options),
              let algorithmName = optionsDict["name"] as? String,
              let inputData = Data(base64Encoded: data) else {
            return nil
        }
        
        switch algorithmName.uppercased() {
        case "SHA-256":
            let hash = SHA256.hash(data: inputData)
            return Data(hash).base64EncodedString()
        case "SHA-384":
            let hash = SHA384.hash(data: inputData)
            return Data(hash).base64EncodedString()
        case "SHA-512":
            let hash = SHA512.hash(data: inputData)
            return Data(hash).base64EncodedString()
        default:
            return nil
        }
    }
    
    @objc func generateKey(algorithm: String, extractable: Bool, keyUsages: String) -> String? {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyUsagesArray = parseJSONArray(keyUsages) else {
            return errorToJSON("Invalid parameters for key generation")
        }
        
        switch algorithmName.uppercased() {
        case "ECDSA":
            guard let namedCurve = algorithmDict["namedCurve"] as? String,
                  namedCurve.uppercased() == "P-256" else {
                return errorToJSON("Only P-256 curve is supported for ECDSA")
            }
            let privateKey = P256.Signing.PrivateKey()
            let publicKey = privateKey.publicKey
            let privateJWK = createECJWK(privateKey: privateKey, keyOps: keyUsagesArray.contains("sign") ? ["sign"] : [], extractable: extractable)
            let publicJWK = createECJWK(publicKey: publicKey, keyOps: keyUsagesArray.contains("verify") ? ["verify"] : [], extractable: true)
            let result: [String: Any] = [
                "privateKey": privateJWK,
                "publicKey": publicJWK
            ]
            guard let resultData = try? JSONSerialization.data(withJSONObject: result),
                  let resultString = String(data: resultData, encoding: .utf8) else {
                return errorToJSON("Failed to serialize key pair")
            }
            return resultString
            
        case "ECDH":
            guard let namedCurve = algorithmDict["namedCurve"] as? String,
                  namedCurve.uppercased() == "P-256" else {
                return errorToJSON("Only P-256 curve is supported for ECDH")
            }
            let privateKey = P256.KeyAgreement.PrivateKey()
            let publicKey = privateKey.publicKey
            let privateJWK = createECDHJWK(privateKey: privateKey, keyOps: keyUsagesArray.contains("deriveKey") ? ["deriveKey", "deriveBits"] : [], extractable: extractable)
            let publicJWK = createECDHJWK(publicKey: publicKey, keyOps: [], extractable: true)
            let result: [String: Any] = [
                "privateKey": privateJWK,
                "publicKey": publicJWK
            ]
            guard let resultData = try? JSONSerialization.data(withJSONObject: result),
                  let resultString = String(data: resultData, encoding: .utf8) else {
                return errorToJSON("Failed to serialize key pair")
            }
            return resultString
            
        case "AES-GCM":
            let keySize = (algorithmDict["length"] as? Int) ?? 256
            guard keySize == 128 || keySize == 192 || keySize == 256 else {
                return errorToJSON("AES key size must be 128, 192, or 256 bits")
            }
            let keyBytes = keySize / 8
            var keyData = Data(count: keyBytes)
            let status = keyData.withUnsafeMutableBytes {
                SecRandomCopyBytes(kSecRandomDefault, keyBytes, $0.baseAddress!)
            }
            guard status == errSecSuccess else {
                return errorToJSON("Failed to generate secure random key")
            }
            let aesJWK: [String: Any] = [
                "kty": "oct",
                "k": base64urlEncode(keyData),
                "alg": "A\(keySize)GCM",
                "ext": extractable,
                "key_ops": keyUsagesArray
            ]
            guard let resultData = try? JSONSerialization.data(withJSONObject: aesJWK),
                  let resultString = String(data: resultData, encoding: .utf8) else {
                return errorToJSON("Failed to serialize AES key")
            }
            return resultString
            
        default:
            return errorToJSON("Unsupported algorithm: \(algorithmName)")
        }
    }
    
    @objc func exportKey(format: String, key: String) -> String? {
        guard let keyDict = parseJSONDictionary(key) else {
            return errorToJSON("Invalid key format")
        }
        
        switch format.lowercased() {
        case "jwk":
            guard let resultData = try? JSONSerialization.data(withJSONObject: keyDict),
                  let resultString = String(data: resultData, encoding: .utf8) else {
                return errorToJSON("Failed to serialize key for export")
            }
            return resultString
            
        case "raw":
            guard let kty = keyDict["kty"] as? String, kty == "oct",
                  let k = keyDict["k"] as? String,
                  let keyData = base64urlDecode(k) else {
                return errorToJSON("Raw export only supported for symmetric keys")
            }
            return keyData.base64EncodedString()
            
        case "spki":
            // Only public EC keys (without a "d" parameter) can be exported in SPKI format.
            guard let kty = keyDict["kty"] as? String, kty == "EC", keyDict["d"] == nil,
                  let spkiData = spkiFromJWK(keyDict) else {
                return errorToJSON("Invalid key material for SPKI export")
            }
            return spkiData.base64EncodedString()
            
        default:
            return errorToJSON("Unsupported export format: \(format)")
        }
    }
    
    @objc func importKey(format: String, keyData: String, algorithm: String, extractable: Bool, keyUsages: String) -> String? {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyUsagesArray = parseJSONArray(keyUsages) else {
            return errorToJSON("Invalid parameters for key import")
        }
        
        switch format.lowercased() {
        case "jwk":
            guard let keyJWK = parseJSONDictionary(keyData) else {
                return errorToJSON("Invalid JWK format")
            }
            switch algorithmName.uppercased() {
            case "ECDSA":
                guard let kty = keyJWK["kty"] as? String, kty == "EC",
                      let crv = keyJWK["crv"] as? String, crv == "P-256" else {
                    return errorToJSON("Invalid key material for ECDSA")
                }
                var updatedJWK = keyJWK
                updatedJWK["ext"] = extractable
                updatedJWK["key_ops"] = keyUsagesArray
                updatedJWK["alg"] = "ES256"
                guard let resultData = try? JSONSerialization.data(withJSONObject: updatedJWK),
                      let resultString = String(data: resultData, encoding: .utf8) else {
                    return errorToJSON("Failed to serialize ECDSA key")
                }
                return resultString
                
            case "AES-GCM":
                guard let kty = keyJWK["kty"] as? String, kty == "oct",
                      let k = keyJWK["k"] as? String,
                      let keyMaterial = base64urlDecode(k) else {
                    return errorToJSON("Invalid key material for AES-GCM")
                }
                let keyBitSize = keyMaterial.count * 8
                let aesJWK: [String: Any] = [
                    "kty": "oct",
                    "k": k,
                    "alg": "A\(keyBitSize)GCM",
                    "ext": extractable,
                    "key_ops": keyUsagesArray
                ]
                guard let resultData = try? JSONSerialization.data(withJSONObject: aesJWK),
                      let resultString = String(data: resultData, encoding: .utf8) else {
                    return errorToJSON("Failed to serialize AES key")
                }
                return resultString
                
            default:
                return errorToJSON("Unsupported algorithm: \(algorithmName)")
            }
            
        case "spki":
            // Import an SPKI-encoded public key.
            guard let derData = Data(base64Encoded: keyData) else {
                return errorToJSON("Invalid SPKI data")
            }
            // Our SPKI header is 26 bytes long.
            guard derData.count > 26 else {
                return errorToJSON("SPKI data too short")
            }
            let publicKeyRaw = derData.suffix(from: 26)
            // Ensure the public key is uncompressed (starts with 0x04) and is 65 bytes in total.
            guard publicKeyRaw.first == 0x04, publicKeyRaw.count == 65 else {
                return errorToJSON("Invalid SPKI public key format")
            }
            // Remove the leading 0x04 and split into X and Y coordinates.
            let xData = publicKeyRaw[publicKeyRaw.index(publicKeyRaw.startIndex, offsetBy: 1)..<publicKeyRaw.index(publicKeyRaw.startIndex, offsetBy: 33)]
            let yData = publicKeyRaw[publicKeyRaw.index(publicKeyRaw.startIndex, offsetBy: 33)..<publicKeyRaw.endIndex]
            let xBase64 = base64urlEncode(xData)
            let yBase64 = base64urlEncode(yData)
            let jwk: [String: Any] = [
                "kty": "EC",
                "crv": "P-256",
                "x": xBase64,
                "y": yBase64,
                "ext": extractable,
                "key_ops": keyUsagesArray,
                "alg": "ES256"
            ]
            guard let resultData = try? JSONSerialization.data(withJSONObject: jwk),
                  let resultString = String(data: resultData, encoding: .utf8) else {
                return errorToJSON("Failed to serialize imported SPKI key")
            }
            return resultString
            
        default:
            return errorToJSON("Unsupported import format: \(format)")
        }
    }
    
    @objc func sign(algorithm: String, key: String, data: String) -> String? {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyJWK = parseJSONDictionary(key),
              let inputData = Data(base64Encoded: data) else {
            return nil
        }
        
        guard algorithmName.uppercased() == "ECDSA",
              let d = keyJWK["d"] as? String,
              let dData = base64urlDecode(d) else {
            return nil
        }
        
        do {
            let privateKey = try P256.Signing.PrivateKey(rawRepresentation: dData)
            let signature = try privateKey.signature(for: inputData)
            // Return the DER-encoded signature.
            return signature.derRepresentation.base64EncodedString()
        } catch {
            return nil
        }
    }
    
    @objc func verify(algorithm: String, key: String, signature: String, data: String) -> Bool {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algoName = algorithmDict["name"] as? String,
              algoName.uppercased() == "ECDSA",
              let keyJWK = parseJSONDictionary(key),
              let inputData = Data(base64Encoded: data),
              let xStr = keyJWK["x"] as? String,
              let yStr = keyJWK["y"] as? String,
              let xDataRaw = base64urlDecode(xStr),
              let yDataRaw = base64urlDecode(yStr)
        else {
            return false
        }
        
        let normalizedX = normalizeToLength(xDataRaw, length: 32)
        let normalizedY = normalizeToLength(yDataRaw, length: 32)
        
        var publicKeyRaw = Data([0x04])
        publicKeyRaw.append(normalizedX)
        publicKeyRaw.append(normalizedY)
        
        do {
            let publicKey = try P256.Signing.PublicKey(rawRepresentation: publicKeyRaw)
            guard let sigData = Data(base64Encoded: signature) else { return false }
            // Directly use the DER-encoded signature.
            let ecdsaSignature = try P256.Signing.ECDSASignature(derRepresentation: sigData)
            return publicKey.isValidSignature(ecdsaSignature, for: inputData)
        } catch {
            print("Verification error: \(error)")
            return false
        }
    }

    /// Pads or trims the given data to exactly `length` bytes.
    /// If the data is shorter than `length`, it pads with leading zeros.
    /// If the data is longer (e.g. 33 bytes with a leading zero), it removes the extra byte.
    private func normalizeToLength(_ data: Data, length: Int) -> Data {
        var normalized = data
        while normalized.count < length {
            normalized.insert(0, at: 0)
        }
        if normalized.count > length {
            normalized = normalized.suffix(length)
        }
        return normalized
    }

    /// Converts a raw 64-byte ECDSA signature (r || s) into DER encoding.
    private func rawToDerSignature(_ raw: Data) -> Data? {
        guard raw.count == 64 else { return nil }
        let r = raw.subdata(in: 0..<32)
        let s = raw.subdata(in: 32..<64)
        let rDer = encodeInteger(r)
        let sDer = encodeInteger(s)
        let totalLength = rDer.count + sDer.count
        var der = Data([0x30, UInt8(totalLength)])
        der.append(rDer)
        der.append(sDer)
        return der
    }

    /// Encodes an integer in DER format by trimming leading zeros and adding a 0x00 if necessary.
    private func encodeInteger(_ data: Data) -> Data {
        var bytes = [UInt8](data)
        while bytes.first == 0 && bytes.count > 1 {
            bytes.removeFirst()
        }
        if let first = bytes.first, first & 0x80 != 0 {
            bytes.insert(0, at: 0)
        }
        var result = Data([0x02, UInt8(bytes.count)])
        result.append(contentsOf: bytes)
        return result
    }
    
    @objc func encrypt(algorithm: String, key: String, data: String) -> String? {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyJWK = parseJSONDictionary(key),
              let inputData = Data(base64Encoded: data) else {
            return nil
        }
        
        guard algorithmName.uppercased() == "AES-GCM",
              let k = keyJWK["k"] as? String,
              let keyData = base64urlDecode(k) else {
            return nil
        }
        
        let iv: Data
        if let ivArray = algorithmDict["iv"] as? [Int] {
            iv = Data(ivArray.map { UInt8($0) })
        } else if let ivParam = algorithmDict["iv"] as? String,
                  let ivData = Data(base64Encoded: ivParam) {
            iv = ivData
        } else {
            var ivData = Data(count: 12)
            _ = ivData.withUnsafeMutableBytes {
                SecRandomCopyBytes(kSecRandomDefault, 12, $0.baseAddress!)
            }
            iv = ivData
        }
        
        do {
            let normalizedKey = normalizeAESKey(keyData: keyData)
            let key = SymmetricKey(data: normalizedKey)
            let nonce = try AES.GCM.Nonce(data: iv)
            let sealedBox = try AES.GCM.seal(inputData, using: key, nonce: nonce)
            let encryptedData = iv + sealedBox.ciphertext + sealedBox.tag
            return encryptedData.base64EncodedString()
        } catch {
            return nil
        }
    }
    
    @objc func decrypt(algorithm: String, key: String, data: String) -> String? {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyJWK = parseJSONDictionary(key),
              let encryptedData = Data(base64Encoded: data) else {
            return nil
        }
        
        guard algorithmName.uppercased() == "AES-GCM",
              let k = keyJWK["k"] as? String,
              let keyData = base64urlDecode(k) else {
            return nil
        }
        
        let iv: Data
        if let ivBase64 = algorithmDict["iv"] as? String,
           let ivData = Data(base64Encoded: ivBase64) {
            iv = ivData
        } else if encryptedData.count > 12 {
            iv = encryptedData.prefix(12)
        } else {
            return errorToJSON("IV not provided and encrypted data too short")
        }
        
        let tagLength = (algorithmDict["tagLength"] as? Int ?? 128) / 8
        guard encryptedData.count >= iv.count + tagLength else {
            return nil
        }
        
        let ciphertext = encryptedData.dropFirst(iv.count).dropLast(tagLength)
        let tag = encryptedData.suffix(tagLength)
        
        do {
            let normalizedKey = normalizeAESKey(keyData: keyData)
            let key = SymmetricKey(data: normalizedKey)
            let nonce = try AES.GCM.Nonce(data: iv)
            let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
            let decryptedData = try AES.GCM.open(sealedBox, using: key)
            return decryptedData.base64EncodedString()
        } catch {
            return nil
        }
    }
    
    // MARK: - New Methods for SubtleCrypto Compliance
    
    // 1. deriveBits: Derives raw bits from a base key. Supports PBKDF2 and ECDH.
    @objc func deriveBits(algorithm: String, key: String, length: Int) -> String? {
        guard let algoDict = parseJSONDictionary(algorithm),
              let algoName = algoDict["name"] as? String else {
            return errorToJSON("Invalid algorithm parameters for deriveBits")
        }
        
        switch algoName.uppercased() {
        case "PBKDF2":
            // For PBKDF2 the base key is expected to be a raw password (base64-encoded)
            guard let passwordData = Data(base64Encoded: key) else {
                return errorToJSON("Invalid base key for PBKDF2")
            }
            guard let saltBase64 = algoDict["salt"] as? String,
                  let saltData = Data(base64Encoded: saltBase64) else {
                return errorToJSON("Missing or invalid salt for PBKDF2")
            }
            let iterations = algoDict["iterations"] as? Int ?? 10000
            let derivedKeyLength = length / 8
            
            var derivedKey = Data(count: derivedKeyLength)
            let derivationStatus = derivedKey.withUnsafeMutableBytes { derivedKeyBytes in
                passwordData.withUnsafeBytes { passwordBytes in
                    saltData.withUnsafeBytes { saltBytes in
                        CCKeyDerivationPBKDF(
                            CCPBKDFAlgorithm(kCCPBKDF2),
                            passwordBytes.bindMemory(to: Int8.self).baseAddress,
                            passwordData.count,
                            saltBytes.bindMemory(to: UInt8.self).baseAddress,
                            saltData.count,
                            CCPBKDFAlgorithm(kCCPRFHmacAlgSHA256),
                            UInt32(iterations),
                            derivedKeyBytes.bindMemory(to: UInt8.self).baseAddress,
                            derivedKeyLength)
                    }
                }
            }
            if derivationStatus == kCCSuccess {
                return derivedKey.base64EncodedString()
            } else {
                return errorToJSON("PBKDF2 derivation failed with status \(derivationStatus)")
            }
            
        case "ECDH":
            // For ECDH the key is expected to be a JWK for the private key.
            // The algorithm parameters must include "publicKey" as a JSON string representing the peer’s public key.
            guard let keyDict = parseJSONDictionary(key),
                  let privateD = keyDict["d"] as? String,
                  let privateData = base64urlDecode(privateD) else {
                return errorToJSON("Invalid private key for ECDH")
            }
            guard let publicKeyJWK = algoDict["publicKey"] as? String,
                  let publicKeyDict = parseJSONDictionary(publicKeyJWK),
                  let x = publicKeyDict["x"] as? String,
                  let y = publicKeyDict["y"] as? String,
                  let xData = base64urlDecode(x),
                  let yData = base64urlDecode(y) else {
                return errorToJSON("Invalid public key for ECDH")
            }
            do {
                let privateKey = try P256.KeyAgreement.PrivateKey(rawRepresentation: privateData)
                var publicKeyRaw = Data([0x04])
                publicKeyRaw.append(xData)
                publicKeyRaw.append(yData)
                let publicKey = try P256.KeyAgreement.PublicKey(rawRepresentation: publicKeyRaw)
                let sharedSecret = try privateKey.sharedSecretFromKeyAgreement(with: publicKey)
                let saltData = Data() // Optionally, provide salt from algoDict if needed
                let sharedInfo = Data()
                let symmetricKey = sharedSecret.hkdfDerivedSymmetricKey(
                    using: SHA256.self,
                    salt: saltData,
                    sharedInfo: sharedInfo,
                    outputByteCount: length / 8)
                let derivedBits = symmetricKey.withUnsafeBytes { Data(Array($0)) }
                return derivedBits.base64EncodedString()
            } catch {
                return errorToJSON("ECDH deriveBits failed: \(error.localizedDescription)")
            }
            
        default:
            return errorToJSON("Unsupported deriveBits algorithm: \(algoName)")
        }
    }
    
    // 2. deriveKey: Derives a key and returns it in JWK format.
    // This method expects:
    // - algorithm: derivation algorithm parameters (e.g., for PBKDF2 or ECDH)
    // - baseKey: the base key (either raw or a JWK, depending on the algorithm)
    // - derivedKeyAlgorithm: parameters for the key to derive (e.g., {name: 'AES-GCM', length: 256})
    // - extractable: whether the derived key is extractable
    // - keyUsages: a JSON array of key usages
    @objc func deriveKey(algorithm: String, baseKey: String, derivedKeyAlgorithm: String, extractable: Bool, keyUsages: String) -> String? {
        guard let algoDict = parseJSONDictionary(algorithm),
              let algoName = algoDict["name"] as? String,
              let keyUsagesArray = parseJSONArray(keyUsages),
              let derivedAlgoDict = parseJSONDictionary(derivedKeyAlgorithm),
              let derivedAlgoName = derivedAlgoDict["name"] as? String else {
            return errorToJSON("Invalid parameters for deriveKey")
        }
        
        switch algoName.uppercased() {
        case "PBKDF2":
            // For PBKDF2, the base key is expected to be a raw password (base64-encoded).
            guard let passwordData = Data(base64Encoded: baseKey) else {
                return errorToJSON("Invalid base key for PBKDF2")
            }
            guard let saltBase64 = algoDict["salt"] as? String,
                  let saltData = Data(base64Encoded: saltBase64) else {
                return errorToJSON("Missing or invalid salt for PBKDF2")
            }
            let iterations = algoDict["iterations"] as? Int ?? 10000
            // For derived key algorithm, assume AES-GCM with provided length (default 256)
            if derivedAlgoName.uppercased() == "AES-GCM" {
                let keyLength = derivedAlgoDict["length"] as? Int ?? 256
                let derivedKeyLength = keyLength / 8
                var derivedKey = Data(count: derivedKeyLength)
                let derivationStatus = derivedKey.withUnsafeMutableBytes { derivedKeyBytes in
                    passwordData.withUnsafeBytes { passwordBytes in
                        saltData.withUnsafeBytes { saltBytes in
                            CCKeyDerivationPBKDF(
                                CCPBKDFAlgorithm(kCCPBKDF2),
                                passwordBytes.bindMemory(to: Int8.self).baseAddress,
                                passwordData.count,
                                saltBytes.bindMemory(to: UInt8.self).baseAddress,
                                saltData.count,
                                CCPBKDFAlgorithm(kCCPRFHmacAlgSHA256),
                                UInt32(iterations),
                                derivedKeyBytes.bindMemory(to: UInt8.self).baseAddress,
                                derivedKeyLength)
                        }
                    }
                }
                if derivationStatus == kCCSuccess {
                    let jwk: [String: Any] = [
                        "kty": "oct",
                        "k": base64urlEncode(derivedKey),
                        "alg": "A\(keyLength)GCM",
                        "ext": extractable,
                        "key_ops": keyUsagesArray
                    ]
                    guard let resultData = try? JSONSerialization.data(withJSONObject: jwk),
                          let resultString = String(data: resultData, encoding: .utf8) else {
                        return errorToJSON("Failed to serialize derived key")
                    }
                    return resultString
                } else {
                    return errorToJSON("PBKDF2 key derivation failed with status \(derivationStatus)")
                }
            } else {
                return errorToJSON("Unsupported derived key algorithm: \(derivedAlgoName)")
            }
            
        case "ECDH":
            // For ECDH, the baseKey is expected to be a JWK for the private key.
            guard let keyDict = parseJSONDictionary(baseKey),
                  let privateD = keyDict["d"] as? String,
                  let privateData = base64urlDecode(privateD) else {
                return errorToJSON("Invalid private key for ECDH")
            }
            guard let publicKeyJWK = algoDict["publicKey"] as? String,
                  let publicKeyDict = parseJSONDictionary(publicKeyJWK),
                  let x = publicKeyDict["x"] as? String,
                  let y = publicKeyDict["y"] as? String,
                  let xData = base64urlDecode(x),
                  let yData = base64urlDecode(y) else {
                return errorToJSON("Invalid public key for ECDH")
            }
            do {
                let privateKey = try P256.KeyAgreement.PrivateKey(rawRepresentation: privateData)
                var publicKeyRaw = Data([0x04])
                publicKeyRaw.append(xData)
                publicKeyRaw.append(yData)
                let publicKey = try P256.KeyAgreement.PublicKey(rawRepresentation: publicKeyRaw)
                let sharedSecret = try privateKey.sharedSecretFromKeyAgreement(with: publicKey)
                let saltData = Data() // Optionally, supply salt/info from derivedAlgoDict if needed
                let sharedInfo = Data()
                // Determine derived key length from derivedAlgoDict (default to 256 bits for AES-GCM)
                let keyLength = derivedAlgoDict["length"] as? Int ?? 256
                let symmetricKey = sharedSecret.hkdfDerivedSymmetricKey(
                    using: SHA256.self,
                    salt: saltData,
                    sharedInfo: sharedInfo,
                    outputByteCount: keyLength / 8)
                let derivedKeyData = symmetricKey.withUnsafeBytes { Data(Array($0)) }
                let jwk: [String: Any] = [
                    "kty": "oct",
                    "k": base64urlEncode(derivedKeyData),
                    "alg": "A\(keyLength)GCM",
                    "ext": extractable,
                    "key_ops": keyUsagesArray
                ]
                guard let resultData = try? JSONSerialization.data(withJSONObject: jwk),
                      let resultString = String(data: resultData, encoding: .utf8) else {
                    return errorToJSON("Failed to serialize derived key")
                }
                return resultString
            } catch {
                return errorToJSON("ECDH deriveKey failed: \(error.localizedDescription)")
            }
            
        default:
            return errorToJSON("Unsupported deriveKey algorithm: \(algoName)")
        }
    }
}

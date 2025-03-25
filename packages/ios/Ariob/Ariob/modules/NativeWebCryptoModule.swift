//
//  NativeSEAModule.swift
//  Ariob
//
//  Created by Natnael Teferi on 3/17/25.
//

import UIKit
import Foundation
import CryptoKit

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
        
        // Add padding if needed
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
        // Return base64 encoded data to be used across the JS bridge
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
    
    // Helper method to convert EC keys between formats (JWK <-> CryptoKit)
    private func convertECKeyToJWK(publicKey: P256.Signing.PublicKey) -> [String: Any] {
        let publicKeyData = publicKey.x963Representation
        
        // Extract x and y coordinates (standard EC uncompressed format)
        guard publicKeyData.count == 65, publicKeyData[0] == 0x04 else {
            return [:]
        }
        
        let xCoord = publicKeyData.subdata(in: 1..<33)
        let yCoord = publicKeyData.subdata(in: 33..<65)
        
        return [
            "kty": "EC",
            "crv": "P-256",
            "x": base64urlEncode(xCoord),
            "y": base64urlEncode(yCoord),
            "key_ops": ["verify"],
            "ext": true,
            "alg": "ES256"
        ]
    }
    
    // Helper to convert raw JWK data to CryptoKit EC keys
    private func createECPublicKeyFromJWK(jwk: [String: Any]) -> P256.Signing.PublicKey? {
        guard let kty = jwk["kty"] as? String, kty == "EC",
              let crv = jwk["crv"] as? String, crv == "P-256",
              let x = jwk["x"] as? String,
              let y = jwk["y"] as? String,
              let xData = base64urlDecode(x),
              let yData = base64urlDecode(y) else {
            return nil
        }
        
        do {
            // Create EC point format (uncompressed)
            var publicKeyData = Data([0x04]) // Uncompressed point prefix
            publicKeyData.append(xData)
            publicKeyData.append(yData)
            
            return try P256.Signing.PublicKey(x963Representation: publicKeyData)
        } catch {
            return nil
        }
    }
    
    private func normalizeAESKey(keyData: Data) -> Data {
        let keyBitSize = keyData.count * 8
        
        // If we have a standard AES key size, use it directly
        if keyBitSize == 128 || keyBitSize == 192 || keyBitSize == 256 {
            return keyData
        }
        
        // For non-standard key sizes, use SHA-256 to get a 256-bit key
        let hashedKey = SHA256.hash(data: keyData)
        return Data(hashedKey)
    }
    
    // Helper to create a symmetric key from JWK
    private func createSymmetricKeyFromJWK(jwk: [String: Any]) -> SymmetricKey? {
        guard let kty = jwk["kty"] as? String, kty == "oct",
              let k = jwk["k"] as? String,
              let keyData = base64urlDecode(k) else {
            return nil
        }
        
        // Apply normalization to ensure valid key size
        let normalizedKey = normalizeAESKey(keyData: keyData)
        return SymmetricKey(data: normalizedKey)
    }

    
    // MARK: - Convert Error to JSON result
    
    private func errorToJSON(_ message: String) -> String {
        let error: [String: Any] = ["error": true, "message": message]
        guard let data = try? JSONSerialization.data(withJSONObject: error),
              let result = String(data: data, encoding: .utf8) else {
            return "{\"error\": true, \"message\": \"Unknown error\"}"
        }
        return result
    }
    
    // MARK: - Wrapkey and Unwrapkey Implementation
    
    @objc func wrapKey(format: String, key: String, wrappingKey: String, algorithm: String) -> String? {
        // Parse inputs
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyJWK = parseJSONDictionary(key),
              let wrappingKeyJWK = parseJSONDictionary(wrappingKey) else {
            return errorToJSON("Invalid parameters for key wrapping")
        }
        
        // Only support JWK format for the target key
        guard format == "jwk" else {
            return errorToJSON("Only JWK format is supported for key wrapping")
        }
        
        switch algorithmName.uppercased() {
        case "AES-GCM":
            // Convert key to JSON string
            guard let keyData = try? JSONSerialization.data(withJSONObject: keyJWK),
                  let keyString = String(data: keyData, encoding: .utf8) else {
                return errorToJSON("Failed to serialize key for wrapping")
            }
            
            // Convert key string to Data
            guard let dataToWrap = keyString.data(using: .utf8) else {
                return errorToJSON("Failed to encode key for wrapping")
            }
            
            // Get AES key from wrapping key JWK
            guard let wrappingKeyData = createSymmetricKeyFromJWK(jwk: wrappingKeyJWK) else {
                return errorToJSON("Invalid wrapping key")
            }
            
            // Get IV from algorithm params or generate one
            let iv: Data
            if let ivBase64 = algorithmDict["iv"] as? String,
               let ivData = Data(base64Encoded: ivBase64) {
                iv = ivData
            } else {
                // Generate random 12-byte IV for AES-GCM
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
                // Create nonce from IV
                let nonce = try AES.GCM.Nonce(data: iv)
                
                // Encrypt (wrap) the key
                let sealedBox = try AES.GCM.seal(dataToWrap, using: wrappingKeyData, nonce: nonce)
                
                // Combine IV, ciphertext, and tag
                let wrappedData = NSMutableData()
                wrappedData.append(iv)
                wrappedData.append(sealedBox.ciphertext)
                wrappedData.append(sealedBox.tag)
                
                // Create result object
                let resultDict: [String: Any] = [
                    "wrappedKey": wrappedData.base64EncodedString(),
                    "iv": iv.base64EncodedString()
                ]
                
                // Convert to JSON
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
        // Parse inputs
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
        
        // Only support JWK format for the unwrapped key
        guard format == "jwk" else {
            return errorToJSON("Only JWK format is supported for key unwrapping")
        }
        
        switch unwrapAlgoName.uppercased() {
        case "AES-GCM":
            // Get AES key from unwrapping key JWK
            guard let unwrappingKeyData = createSymmetricKeyFromJWK(jwk: unwrappingKeyJWK) else {
                return errorToJSON("Invalid unwrapping key")
            }
            
            // Get IV from algorithm params or from wrapped key
            let iv: Data
            if let ivBase64 = unwrapAlgoDict["iv"] as? String {
                guard let ivData = Data(base64Encoded: ivBase64) else {
                    return errorToJSON("Invalid IV format")
                }
                iv = ivData
            } else if let ivBase64 = wrappedKeyDict["iv"] as? String {
                guard let ivData = Data(base64Encoded: ivBase64) else {
                    return errorToJSON("Invalid IV format")
                }
                iv = ivData
            } else {
                // Extract IV from beginning of wrapped key (12 bytes for AES-GCM)
                guard wrappedKeyData.count > 12 else {
                    return errorToJSON("Wrapped key data too short")
                }
                iv = wrappedKeyData.prefix(12)
            }
            
            // Extract ciphertext and tag from wrapped key
            let tagLength = 16 // GCM tag is 16 bytes
            guard wrappedKeyData.count >= iv.count + tagLength else {
                return errorToJSON("Wrapped key data too short")
            }
            
            let ciphertext: Data
            let tag: Data
            
            // If IV was provided separately (not part of wrapped key data)
            if unwrapAlgoDict["iv"] != nil || wrappedKeyDict["iv"] != nil {
                ciphertext = wrappedKeyData.dropLast(tagLength)
                tag = wrappedKeyData.suffix(tagLength)
            } else {
                // IV is part of the wrapped key data
                ciphertext = wrappedKeyData.dropFirst(iv.count).dropLast(tagLength)
                tag = wrappedKeyData.suffix(tagLength)
            }
            
            do {
                // Create nonce from IV
                let nonce = try AES.GCM.Nonce(data: iv)
                
                // Create sealed box
                let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
                
                // Decrypt (unwrap) the key
                let unwrappedData = try AES.GCM.open(sealedBox, using: unwrappingKeyData)
                
                // Parse the unwrapped key JWK
                guard let unwrappedKeyString = String(data: unwrappedData, encoding: .utf8),
                      let unwrappedKeyDict = parseJSONDictionary(unwrappedKeyString) else {
                    return errorToJSON("Failed to parse unwrapped key data")
                }
                
                // Update key attributes based on parameters
                var resultKey = unwrappedKeyDict
                resultKey["ext"] = extractable
                resultKey["key_ops"] = keyUsagesArray
                
                // Add algorithm information if missing
                if resultKey["alg"] == nil {
                    switch unwrappedAlgoName.uppercased() {
                    case "ECDSA":
                        resultKey["alg"] = "ES256" // Assuming P-256
                    case "ECDH":
                        resultKey["alg"] = "ECDH-ES" // Assuming P-256
                    case "AES-GCM":
                        if let keyData = createSymmetricKeyFromJWK(jwk: resultKey as! [String: Any]) {
                            let keyLength = keyData.bitCount
                            resultKey["alg"] = "A\(keyLength)GCM"
                        }
                    default:
                        break
                    }
                }
                
                // Convert to JSON
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
        // Parse algorithm options
        guard let optionsDict = parseJSONDictionary(options),
              let algorithmName = optionsDict["name"] as? String,
              let inputData = Data(base64Encoded: data) else {
            return nil
        }
        
        // Perform digest based on algorithm
        switch algorithmName.uppercased() {
        case "SHA-256":
            let hash = SHA256.hash(data: inputData)
            // Ensure we return exactly 32 bytes (256 bits)
            let hashData = Data(hash)
            return hashData.base64EncodedString()
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
        // Parse algorithm options
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyUsagesArray = parseJSONArray(keyUsages) else {
            return errorToJSON("Invalid parameters for key generation")
        }
        
        // Generate key based on algorithm
        switch algorithmName.uppercased() {
        case "ECDSA":
            guard let namedCurve = algorithmDict["namedCurve"] as? String,
                  namedCurve.uppercased() == "P-256" else {
                return errorToJSON("Only P-256 curve is supported for ECDSA")
            }
            
            // Generate ECDSA key pair
            let privateKey = P256.Signing.PrivateKey()
            let publicKey = privateKey.publicKey
            
            // Create JWK for private key
            let privateJWK = createECJWK(
                privateKey: privateKey,
                keyOps: keyUsagesArray.contains("sign") ? ["sign"] : [],
                extractable: extractable
            )
            
            // Create JWK for public key
            let publicJWK = createECJWK(
                publicKey: publicKey,
                keyOps: keyUsagesArray.contains("verify") ? ["verify"] : [],
                extractable: true // Public keys should be extractable
            )
            
            // Create key pair result
            let result: [String: Any] = [
                "privateKey": privateJWK,
                "publicKey": publicJWK
            ]
            
            // Convert to JSON
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
            
            // Generate ECDH key pair
            let privateKey = P256.KeyAgreement.PrivateKey()
            let publicKey = privateKey.publicKey
            
            // Create JWK for private key
            let privateJWK = createECDHJWK(
                privateKey: privateKey,
                keyOps: keyUsagesArray.contains("deriveKey") ? ["deriveKey", "deriveBits"] : [],
                extractable: extractable
            )
            
            // Create JWK for public key
            let publicJWK = createECDHJWK(
                publicKey: publicKey,
                keyOps: [],  // Public keys for ECDH don't have operations
                extractable: true // Public keys should be extractable
            )
            
            // Create key pair result
            let result: [String: Any] = [
                "privateKey": privateJWK,
                "publicKey": publicJWK
            ]
            
            // Convert to JSON
            guard let resultData = try? JSONSerialization.data(withJSONObject: result),
                  let resultString = String(data: resultData, encoding: .utf8) else {
                return errorToJSON("Failed to serialize key pair")
            }
            
            return resultString
            
        case "AES-GCM":
            // Generate AES key
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
            
            // Create JWK for AES key
            let aesJWK: [String: Any] = [
                "kty": "oct",
                "k": base64urlEncode(keyData),
                "alg": "A\(keySize)GCM",
                "ext": extractable,
                "key_ops": keyUsagesArray
            ]
            
            // Convert to JSON
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
            // The key is already in JWK format in our implementation
            guard let resultData = try? JSONSerialization.data(withJSONObject: keyDict),
                  let resultString = String(data: resultData, encoding: .utf8) else {
                return errorToJSON("Failed to serialize key for export")
            }
            
            return resultString
            
        case "raw":
            // Only support raw export for symmetric keys
            guard let kty = keyDict["kty"] as? String, kty == "oct",
                  let k = keyDict["k"] as? String,
                  let keyData = base64urlDecode(k) else {
                return errorToJSON("Raw export only supported for symmetric keys")
            }
            
            return keyData.base64EncodedString()
            
        default:
            return errorToJSON("Unsupported export format: \(format)")
        }
    }
    
    @objc func importKey(format: String, keyData: String, algorithm: String, extractable: Bool, keyUsages: String) -> String? {
        // Parse inputs
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyUsagesArray = parseJSONArray(keyUsages) else {
            return errorToJSON("Invalid import parameters")
        }
        
        // Different handling based on format and algorithm
        switch format.lowercased() {
        case "jwk":
            guard let keyJWK = parseJSONDictionary(keyData) else {
                return errorToJSON("Invalid JWK format")
            }
            
            // Different handling based on algorithm
            switch algorithmName.uppercased() {
            case "AES-GCM":
                // Ensure key is of type 'oct' and has a 'k' parameter
                guard let kty = keyJWK["kty"] as? String, kty == "oct",
                      let k = keyJWK["k"] as? String,
                      let keyMaterial = base64urlDecode(k) else {
                    return errorToJSON("Invalid key material for AES-GCM")
                }
                
                // Calculate actual key length
                let keyBitSize = keyMaterial.count * 8
                
                // Create AES JWK
                // We store the original key and its size in the alg property
                let aesJWK: [String: Any] = [
                    "kty": "oct",
                    "k": k,  // Keep original key
                    "alg": "A\(keyBitSize)GCM",  // Store original size
                    "ext": extractable,
                    "key_ops": keyUsagesArray
                ]
                
                // Convert to JSON
                guard let resultData = try? JSONSerialization.data(withJSONObject: aesJWK),
                      let resultString = String(data: resultData, encoding: .utf8) else {
                    return errorToJSON("Failed to serialize AES key")
                }
                
                return resultString
                
            // Other algorithm cases unchanged
            default:
                return errorToJSON("Unsupported algorithm: \(algorithmName)")
            }
            
        default:
            return errorToJSON("Unsupported import format: \(format)")
        }
    }
    
    @objc func sign(algorithm: String, key: String, data: String) -> String? {
        // Parse inputs
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyJWK = parseJSONDictionary(key),
              let inputData = Data(base64Encoded: data) else {
            return nil
        }
        
        // Only support ECDSA for now
        guard algorithmName.uppercased() == "ECDSA",
              let d = keyJWK["d"] as? String,
              let dData = base64urlDecode(d) else {
            return nil
        }
        
        do {
            // Create private key
            let privateKey = try P256.Signing.PrivateKey(rawRepresentation: dData)
            
            // Sign data
            let signature = try privateKey.signature(for: inputData)
            
            // Return signature
            return signature.rawRepresentation.base64EncodedString()
        } catch {
            return nil
        }
    }
    
    @objc func verify(algorithm: String, key: String, signature: String, data: String) -> Bool {
        // Parse inputs
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyJWK = parseJSONDictionary(key),
              let signatureData = Data(base64Encoded: signature),
              let inputData = Data(base64Encoded: data) else {
            return false
        }
        
        // Only support ECDSA for now
        guard algorithmName.uppercased() == "ECDSA",
              let x = keyJWK["x"] as? String,
              let y = keyJWK["y"] as? String,
              let xData = base64urlDecode(x),
              let yData = base64urlDecode(y) else {
            return false
        }
        
        do {
            // Construct raw representation (uncompressed format)
            var publicKeyRaw = Data([0x04]) // Uncompressed point prefix
            publicKeyRaw.append(xData)
            publicKeyRaw.append(yData)
            
            // Create public key
            let publicKey = try P256.Signing.PublicKey(rawRepresentation: publicKeyRaw)
            
            // Create signature
            let ecdsaSignature = try P256.Signing.ECDSASignature(rawRepresentation: signatureData)
            
            // Verify signature
            return publicKey.isValidSignature(ecdsaSignature, for: inputData)
        } catch {
            return false
        }
    }
    
    @objc func encrypt(algorithm: String, key: String, data: String) -> String? {
        // Parse inputs
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyJWK = parseJSONDictionary(key),
              let inputData = Data(base64Encoded: data) else {
            return nil
        }
        
        // Only support AES-GCM for now
        guard algorithmName.uppercased() == "AES-GCM",
              let k = keyJWK["k"] as? String,
              let keyData = base64urlDecode(k) else {
            return nil
        }
        
        print("Encrypt - Key size in bits: \(keyData.count * 8)")
        
        // Get IV from algorithm params or generate one
        let iv: Data
        if let ivArray = algorithmDict["iv"] as? [Int] {
            // Convert array of integers to Data
            iv = Data(ivArray.map { UInt8($0) })
            print("Encrypt - Using provided IV, length: \(iv.count)")
            print("Encrypt - IV from JS (first 10 values): \(ivArray.prefix(10))")
        } else if let ivParam = algorithmDict["iv"] as? String,
                  let ivData = Data(base64Encoded: ivParam) {
            iv = ivData
            print("Encrypt - Using base64 encoded IV, length: \(iv.count)")
        } else {
            // Generate random 12-byte IV for AES-GCM
            var ivData = Data(count: 12)
            _ = ivData.withUnsafeMutableBytes {
                SecRandomCopyBytes(kSecRandomDefault, 12, $0.baseAddress!)
            }
            iv = ivData
            print("Encrypt - Generated new IV, length: \(iv.count)")
        }
        
        print("Encrypt - Input data length: \(inputData.count)")
        
        do {
            // Create symmetric key with normalization
            let normalizedKey = normalizeAESKey(keyData: keyData)
            let key = SymmetricKey(data: normalizedKey)
            print("Encrypt - Using normalized key with bit count: \(key.bitCount)")
            
            // Create nonce from IV
            let nonce = try AES.GCM.Nonce(data: iv)
            
            // Encrypt data
            let sealedBox = try AES.GCM.seal(inputData, using: key, nonce: nonce)
            
            // Combine IV, ciphertext, and tag as in your original implementation
            let encryptedData = iv + sealedBox.ciphertext + sealedBox.tag
            
            // Return encrypted data
            return encryptedData.base64EncodedString()
        } catch {
            print("❌ Encryption failed with error: \(error)")
            return nil
        }
    }

    @objc func decrypt(algorithm: String, key: String, data: String) -> String? {
        // Parse inputs
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyJWK = parseJSONDictionary(key),
              let encryptedData = Data(base64Encoded: data) else {
            return nil
        }
        
        // Only support AES-GCM for now
        guard algorithmName.uppercased() == "AES-GCM",
              let k = keyJWK["k"] as? String,
              let keyData = base64urlDecode(k) else {
            return nil
        }
        
        print("Decrypt - Key size in bits: \(keyData.count * 8)")
        
        // Extract IV and determine length
        let ivLength: Int
        if let ivArray = algorithmDict["iv"] as? [Int] {
            // If IV is provided in the algorithm, use its length
            ivLength = ivArray.count
            print("Decrypt - Using IV from algorithm params, length: \(ivLength)")
        } else {
            // Default to 12 bytes for AES-GCM
            ivLength = 12
            print("Decrypt - Using default IV length: \(ivLength)")
        }
        
        let tagLength = 16 // AES-GCM uses 16-byte tag
        
        guard encryptedData.count >= ivLength + tagLength else {
            return nil
        }
        
        let iv: Data
        if let ivArray = algorithmDict["iv"] as? [Int] {
            // Convert array of integers to Data
            iv = Data(ivArray.map { UInt8($0) })
            print("Decrypt - Using provided IV array: \(ivArray)")
        } else if let ivParam = algorithmDict["iv"] as? String,
                  let ivData = Data(base64Encoded: ivParam) {
            iv = ivData
            print("Decrypt - Using base64 encoded IV: \(ivParam)")
        } else {
            // Extract IV from encrypted data
            iv = encryptedData.prefix(ivLength)
        }
        
        let ciphertext = encryptedData.dropFirst(ivLength).dropLast(tagLength)
        let tag = encryptedData.suffix(tagLength)
        
        print("Decrypt - IV length: \(iv.count), Ciphertext length: \(ciphertext.count), Tag length: \(tag.count)")
        
        do {
            // Create symmetric key with normalization (same as encrypt)
            let normalizedKey = normalizeAESKey(keyData: keyData)
            let key = SymmetricKey(data: normalizedKey)
            print("Decrypt - Using normalized key with bit count: \(key.bitCount)")
            
            // Create nonce from IV
            let nonce = try AES.GCM.Nonce(data: iv)
            
            // Create sealed box
            let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
            
            // Decrypt data
            let decryptedData = try AES.GCM.open(sealedBox, using: key)
            print("Decrypt - Decryption successful, plaintext length: \(decryptedData.count)")
            
            // Return decrypted data
            return decryptedData.base64EncodedString()
        } catch {
            print("❌ Decryption failed with error: \(error)")
            return nil
        }
    }
    
    // MARK: - Private Helper Methods
    
    private func createECJWK(privateKey: P256.Signing.PrivateKey, keyOps: [String], extractable: Bool) -> [String: Any] {
        let privateKeyData = privateKey.rawRepresentation
        
        // Extract x and y components from public key
        let publicKeyData = privateKey.publicKey.rawRepresentation
        let publicKeyX = publicKeyData.prefix(32)
        let publicKeyY = publicKeyData.suffix(32)
        
        // Base64url encode components
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
        // Extract x and y components
        let publicKeyData = publicKey.rawRepresentation
        let publicKeyX = publicKeyData.prefix(32)
        let publicKeyY = publicKeyData.suffix(32)
        
        // Base64url encode components
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
        
        // Extract x and y components from public key
        let publicKeyData = privateKey.publicKey.rawRepresentation
        let publicKeyX = publicKeyData.prefix(32)
        let publicKeyY = publicKeyData.suffix(32)
        
        // Base64url encode components
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
        // Extract x and y components
        let publicKeyData = publicKey.rawRepresentation
        let publicKeyX = publicKeyData.prefix(32)
        let publicKeyY = publicKeyData.suffix(32)
        
        // Base64url encode components
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
}

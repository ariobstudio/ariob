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
        // Parse algorithm options
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyUsagesArray = parseJSONArray(keyUsages) else {
            return nil
        }
        
        // Generate key based on algorithm
        switch algorithmName.uppercased() {
        case "ECDSA":
            guard let namedCurve = algorithmDict["namedCurve"] as? String,
                  namedCurve.uppercased() == "P-256" else {
                return nil
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
                extractable: extractable
            )
            
            // Create key pair result matching original format
            let result: [String: Any] = [
                "privateKey": ["d": privateJWK["d"] as! String],
                "publicKey": ["x": publicJWK["x"] as! String, "y": publicJWK["y"] as! String]
            ]
            
            // Convert to JSON
            guard let resultData = try? JSONSerialization.data(withJSONObject: result),
                  let resultString = String(data: resultData, encoding: .utf8) else {
                return nil
            }
            
            return resultString
            
        case "ECDH":
            guard let namedCurve = algorithmDict["namedCurve"] as? String,
                  namedCurve.uppercased() == "P-256" else {
                return nil
            }
            
            // Generate ECDH key pair
            let privateKey = P256.KeyAgreement.PrivateKey()
            let publicKey = privateKey.publicKey
            
            // Create JWK for private key
            let privateJWK = createECDHJWK(
                privateKey: privateKey,
                keyOps: keyUsagesArray.contains("deriveKey") ? ["deriveKey"] : [],
                extractable: extractable
            )
            
            // Create JWK for public key
            let publicJWK = createECDHJWK(
                publicKey: publicKey,
                keyOps: keyUsagesArray.contains("deriveKey") ? ["deriveKey"] : [],
                extractable: extractable
            )
            
            // Create key pair result matching original format
            let result: [String: Any] = [
                "privateKey": ["d": privateJWK["d"] as! String],
                "publicKey": ["x": publicJWK["x"] as! String, "y": publicJWK["y"] as! String]
            ]
            
            // Convert to JSON
            guard let resultData = try? JSONSerialization.data(withJSONObject: result),
                  let resultString = String(data: resultData, encoding: .utf8) else {
                return nil
            }
            
            return resultString
            
        case "AES-GCM":
            // Generate AES key
            let keySize = (algorithmDict["length"] as? Int) ?? 256
            let keyData = Data((0..<(keySize/8)).map { _ in UInt8.random(in: 0...255) })
            
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
                return nil
            }
            
            return resultString
            
        default:
            return nil
        }
    }
    
    @objc func exportKey(format: String, key: String) -> String? {
        // Only support 'jwk' format for now
        guard format == "jwk",
              let keyDict = parseJSONDictionary(key) else {
            return nil
        }
        
        // The key is already in JWK format in our implementation
        guard let resultData = try? JSONSerialization.data(withJSONObject: keyDict),
              let resultString = String(data: resultData, encoding: .utf8) else {
            return nil
        }
        
        return resultString
    }
    
    @objc func importKey(format: String, keyData: String, algorithm: String, extractable: Bool, keyUsages: String) -> String? {
        // Parse inputs
        guard format == "jwk",
              let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String,
              let keyUsagesArray = parseJSONArray(keyUsages),
              let keyJWK = parseJSONDictionary(keyData) else {
            return nil
        }
        
        // Different handling based on algorithm
        switch algorithmName.uppercased() {
        case "AES-GCM":
            // Ensure key is of type 'oct' and has a 'k' parameter
            guard let kty = keyJWK["kty"] as? String, kty == "oct",
                  let k = keyJWK["k"] as? String,
                  let keyMaterial = base64urlDecode(k) else {
                return nil
            }
            
            // Create AES JWK
            let aesJWK: [String: Any] = [
                "kty": "oct",
                "k": k,
                "alg": "A\(keyMaterial.count * 8)GCM",
                "ext": extractable,
                "key_ops": keyUsagesArray
            ]
            
            // Convert to JSON
            guard let resultData = try? JSONSerialization.data(withJSONObject: aesJWK),
                  let resultString = String(data: resultData, encoding: .utf8) else {
                return nil
            }
            
            return resultString
            
        case "ECDSA":
            // Handle importing ECDSA keys
            if let d = keyJWK["d"] as? String {
                // This is a private key
                guard let x = keyJWK["x"] as? String,
                      let y = keyJWK["y"] as? String,
                      let dData = base64urlDecode(d) else {
                    return nil
                }
                
                do {
                    // Create private key
                    let privateKey = try P256.Signing.PrivateKey(rawRepresentation: dData)
                    
                    // Create updated JWK
                    let updatedJWK: [String: Any] = [
                        "kty": "EC",
                        "crv": "P-256",
                        "x": x,
                        "y": y,
                        "d": d,
                        "ext": extractable,
                        "key_ops": keyUsagesArray
                    ]
                    
                    // Convert to JSON
                    guard let resultData = try? JSONSerialization.data(withJSONObject: updatedJWK),
                          let resultString = String(data: resultData, encoding: .utf8) else {
                        return nil
                    }
                    
                    return resultString
                } catch {
                    return nil
                }
            } else {
                // This is a public key
                guard let x = keyJWK["x"] as? String,
                      let y = keyJWK["y"] as? String,
                      let xData = base64urlDecode(x),
                      let yData = base64urlDecode(y) else {
                    return nil
                }
                
                do {
                    // Construct raw representation (uncompressed format)
                    var publicKeyRaw = Data([0x04]) // Uncompressed point prefix
                    publicKeyRaw.append(xData)
                    publicKeyRaw.append(yData)
                    
                    // Create public key
                    let _ = try P256.Signing.PublicKey(rawRepresentation: publicKeyRaw)
                    
                    // Create updated JWK
                    let updatedJWK: [String: Any] = [
                        "kty": "EC",
                        "crv": "P-256",
                        "x": x,
                        "y": y,
                        "ext": extractable,
                        "key_ops": keyUsagesArray
                    ]
                    
                    // Convert to JSON
                    guard let resultData = try? JSONSerialization.data(withJSONObject: updatedJWK),
                          let resultString = String(data: resultData, encoding: .utf8) else {
                        return nil
                    }
                    
                    return resultString
                } catch {
                    return nil
                }
            }
            
        case "ECDH":
            // Similar to ECDSA but for ECDH keys
            if let d = keyJWK["d"] as? String {
                // This is a private key
                guard let x = keyJWK["x"] as? String,
                      let y = keyJWK["y"] as? String,
                      let dData = base64urlDecode(d) else {
                    return nil
                }
                
                do {
                    // Create private key
                    let privateKey = try P256.KeyAgreement.PrivateKey(rawRepresentation: dData)
                    
                    // Create updated JWK
                    let updatedJWK: [String: Any] = [
                        "kty": "EC",
                        "crv": "P-256",
                        "x": x,
                        "y": y,
                        "d": d,
                        "ext": extractable,
                        "key_ops": keyUsagesArray
                    ]
                    
                    // Convert to JSON
                    guard let resultData = try? JSONSerialization.data(withJSONObject: updatedJWK),
                          let resultString = String(data: resultData, encoding: .utf8) else {
                        return nil
                    }
                    
                    return resultString
                } catch {
                    return nil
                }
            } else {
                // This is a public key
                guard let x = keyJWK["x"] as? String,
                      let y = keyJWK["y"] as? String,
                      let xData = base64urlDecode(x),
                      let yData = base64urlDecode(y) else {
                    return nil
                }
                
                do {
                    // Construct raw representation (uncompressed format)
                    var publicKeyRaw = Data([0x04]) // Uncompressed point prefix
                    publicKeyRaw.append(xData)
                    publicKeyRaw.append(yData)
                    
                    // Create public key
                    let _ = try P256.KeyAgreement.PublicKey(rawRepresentation: publicKeyRaw)
                    
                    // Create updated JWK
                    let updatedJWK: [String: Any] = [
                        "kty": "EC",
                        "crv": "P-256",
                        "x": x,
                        "y": y,
                        "ext": extractable,
                        "key_ops": keyUsagesArray
                    ]
                    
                    // Convert to JSON
                    guard let resultData = try? JSONSerialization.data(withJSONObject: updatedJWK),
                          let resultString = String(data: resultData, encoding: .utf8) else {
                        return nil
                    }
                    
                    return resultString
                } catch {
                    return nil
                }
            }
            
        default:
            return nil
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
        
        // Get IV (initialization vector) from algorithm params or generate one
        let iv: Data
        if let ivParam = algorithmDict["iv"] as? String,
           let ivData = Data(base64Encoded: ivParam) {
            iv = ivData
        } else {
            // Generate random 12-byte IV for AES-GCM
            var ivData = Data(count: 12)
            _ = ivData.withUnsafeMutableBytes {
                SecRandomCopyBytes(kSecRandomDefault, 12, $0.baseAddress!)
            }
            iv = ivData
        }
        
        do {
            // Create symmetric key
            let key = SymmetricKey(data: keyData)
            
            // Create nonce from IV
            let nonce = try AES.GCM.Nonce(data: iv)
            
            // Encrypt data
            let sealedBox = try AES.GCM.seal(inputData, using: key, nonce: nonce)
            
            // Combine IV, ciphertext, and tag
            let encryptedData = iv + sealedBox.ciphertext + sealedBox.tag
            
            // Return encrypted data
            return encryptedData.base64EncodedString()
        } catch {
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
        
        // Extract IV, ciphertext, and tag
        let ivLength = 12 // AES-GCM uses 12-byte IV
        let tagLength = 16 // AES-GCM uses 16-byte tag
        
        guard encryptedData.count >= ivLength + tagLength else {
            return nil
        }
        
        let iv = encryptedData.prefix(ivLength)
        let ciphertext = encryptedData.dropFirst(ivLength).dropLast(tagLength)
        let tag = encryptedData.suffix(tagLength)
        
        do {
            // Create symmetric key
            let key = SymmetricKey(data: keyData)
            
            // Create nonce from IV
            let nonce = try AES.GCM.Nonce(data: iv)
            
            // Create sealed box
            let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
            
            // Decrypt data
            let decryptedData = try AES.GCM.open(sealedBox, using: key)
            
            // Return decrypted data
            return decryptedData.base64EncodedString()
        } catch {
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

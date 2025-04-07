import UIKit
import Foundation
import CryptoKit
import CommonCrypto // For PBKDF2

// Define LynxModule protocol if it's not globally available
@objc public protocol LynxModule {}

@objcMembers
public final class NativeWebCryptoModule: NSObject, LynxModule {

    // MARK: - Module Registration for Lynx
    @objc public static var name: String { return "NativeWebCryptoModule" }
    @objc public static var methodLookup: [String: String] {
        return [
            // Core SEA.js methods
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
            // Helpers
            "textEncode": NSStringFromSelector(#selector(textEncode(text:))),
            "textDecode": NSStringFromSelector(#selector(textDecode(data:))),
            "getRandomValues": NSStringFromSelector(#selector(getRandomValues(length:)))
        ]
    }

    // MARK: - Initializers
    @objc public init(param: Any) { super.init() }
    @objc public override init() { super.init() }

    // MARK: - JSON & Base64 Helpers
    private func parseJSONDictionary(_ jsonString: String) -> [String: Any]? {
        guard let data = jsonString.data(using: .utf8),
              let result = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] else {
            print("NativeWebCryptoModule: Failed to parse JSON dictionary: \(jsonString)")
            return nil
        }
        return result
    }
    private func parseJSONArray(_ jsonString: String) -> [String]? {
        guard let data = jsonString.data(using: .utf8),
              let result = try? JSONSerialization.jsonObject(with: data, options: []) as? [String] else {
            print("NativeWebCryptoModule: Failed to parse JSON array: \(jsonString)")
            return nil
        }
        return result
    }
    // Base64URL encoding (RFC 4648 Section 5) - For JWK components
    private func base64urlEncode(_ data: Data) -> String {
        var base64 = data.base64EncodedString()
        base64 = base64.replacingOccurrences(of: "+", with: "-")
        base64 = base64.replacingOccurrences(of: "/", with: "_")
        base64 = base64.replacingOccurrences(of: "=", with: "")
        return base64
    }
    // Base64URL decoding (RFC 4648 Section 5) - For JWK components
    private func base64urlDecode(_ string: String) -> Data? {
        var base64 = string
        base64 = base64.replacingOccurrences(of: "-", with: "+")
        base64 = base64.replacingOccurrences(of: "_", with: "/")
        let padding = base64.count % 4
        if padding != 0 { base64 += String(repeating: "=", count: 4 - padding) }
        return Data(base64Encoded: base64)
    }
    // Standard Base64 encode/decode for data transfer
    private func base64Encode(_ data: Data) -> String { return data.base64EncodedString() }
    private func base64Decode(_ string: String) -> Data? { return Data(base64Encoded: string) }

    // MARK: - TextEncoder/TextDecoder Emulation (Using Standard Base64)
    @objc func textEncode(text: String) -> String {
        guard let data = text.data(using: .utf8) else {
            print("NativeWebCryptoModule: Failed to encode text to UTF8")
            return errorToJSON("UTF-8 encoding failed")
        }
        return base64Encode(data)
    }
    @objc func textDecode(data: String) -> String {
        guard let decodedData = base64Decode(data),
              let text = String(data: decodedData, encoding: .utf8) else {
            print("NativeWebCryptoModule: Failed to decode Base64 data or convert to UTF8 string")
            return errorToJSON("Base64 or UTF-8 decoding failed")
        }
        return text // Return decoded text, not JSON
    }

    // MARK: - Random Values Generator
    @objc func getRandomValues(length: Int) -> String {
        guard length > 0 else { return errorToJSON("Length must be positive") }
        var data = Data(count: length)
        let result = data.withUnsafeMutableBytes { SecRandomCopyBytes(kSecRandomDefault, length, $0.baseAddress!) }
        guard result == errSecSuccess else { return errorToJSON("Failed to generate random bytes") }
        return base64Encode(data) // Standard Base64
    }

    // MARK: - Error JSON Conversion
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

    // MARK: - EC Key (P-256) JWK Creation Helpers (Using Base64URL)
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

    // MARK: - AES Key Helper (Normalize for SEA.js compatibility)
    private func normalizeAESKey(keyData: Data) -> Data {
        let keyBitSize = keyData.count * 8
        if [128, 192, 256].contains(keyBitSize) { return keyData }
        return Data(SHA256.hash(data: keyData)) // Hash to 256 bits if not standard size
    }
    private func createSymmetricKeyFromJWK(jwk: [String: Any]) -> SymmetricKey? {
        guard let kty = jwk["kty"] as? String, kty == "oct",
              let kBase64url = jwk["k"] as? String,
              let keyData = base64urlDecode(kBase64url) else { return nil }
        return SymmetricKey(data: normalizeAESKey(keyData: keyData))
    }

    // MARK: - Web Crypto API Methods Implementation

    @objc func digest(options: String, data: String) -> String {
        guard let optionsDict = parseJSONDictionary(options),
              let algorithmName = optionsDict["name"] as? String,
              let inputData = base64Decode(data) else { // Standard base64 data
            return errorToJSON("Invalid parameters for digest")
        }
        let hash: Data
        switch algorithmName.uppercased() {
            case "SHA-256": hash = Data(SHA256.hash(data: inputData))
            case "SHA-384": hash = Data(SHA384.hash(data: inputData))
            case "SHA-512": hash = Data(SHA512.hash(data: inputData))
            // Add SHA-1 via CommonCrypto if absolutely required, but avoid if possible
            // case "SHA-1": ... use CC_SHA1 ...
            default: return errorToJSON("Unsupported digest algorithm: \(algorithmName)")
        }
        return base64Encode(hash) // Standard base64 hash
    }

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

    @objc func sign(algorithm: String, key: String, data: String) -> String {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String, algorithmName.uppercased() == "ECDSA",
              let keyJWK = parseJSONDictionary(key),
              let inputData = base64Decode(data), // Standard base64 data
              let dBase64url = keyJWK["d"] as? String, let dData = base64urlDecode(dBase64url)
        else { return errorToJSON("Invalid parameters for sign") }
        do {
            let privateKey = try P256.Signing.PrivateKey(rawRepresentation: dData)
            let signature = try privateKey.signature(for: inputData) // CryptoKit handles digest
            return base64Encode(signature.derRepresentation) // Standard Base64 DER signature
        } catch { return errorToJSON("Signing failed: \(error.localizedDescription)") }
    }

    // Returns "true" or "false" as a String, or error JSON
    @objc func verify(algorithm: String, key: String, signature: String, data: String) -> String {
         guard let algorithmDict = parseJSONDictionary(algorithm),
               let algoName = algorithmDict["name"] as? String, algoName.uppercased() == "ECDSA",
               let keyJWK = parseJSONDictionary(key),
               let inputData = base64Decode(data), // Standard base64 data
               let sigData = base64Decode(signature), // Standard base64 DER signature
               let xBase64url = keyJWK["x"] as? String, let yBase64url = keyJWK["y"] as? String,
               let xData = base64urlDecode(xBase64url), let yData = base64urlDecode(yBase64url)
         else { return errorToJSON("Invalid parameters for verify") } // Return error JSON for setup issues
         do {
             var publicKeyRaw = Data([0x04]); publicKeyRaw.append(xData); publicKeyRaw.append(yData)
             let publicKey = try P256.Signing.PublicKey(x963Representation: publicKeyRaw)
             let ecdsaSignature = try P256.Signing.ECDSASignature(derRepresentation: sigData)
             let isValid = publicKey.isValidSignature(ecdsaSignature, for: inputData) // CryptoKit handles digest
             return isValid ? "true" : "false" // Return "true" or "false" string
         } catch {
              // Errors during crypto validation (bad sig format, etc.) should also result in "false"
              print("NativeWebCryptoModule Verify Error: \(error)")
              return "false"
         }
     }

    @objc func encrypt(algorithm: String, key: String, data: String) -> String {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String, algorithmName.uppercased() == "AES-GCM",
              let keyJWK = parseJSONDictionary(key),
              let inputData = base64Decode(data), // Standard base64 data
              let ivBase64 = algorithmDict["iv"] as? String, let iv = base64Decode(ivBase64), // Standard base64 IV
              let symmetricKey = createSymmetricKeyFromJWK(jwk: keyJWK)
        else { return errorToJSON("Invalid parameters for encrypt") }
        let aad = (algorithmDict["additionalData"] as? String).flatMap { base64Decode($0) }
        do {
            let nonce = try AES.GCM.Nonce(data: iv)
            let sealedBox = try AES.GCM.seal(inputData, using: symmetricKey, nonce: nonce)
            return base64Encode(sealedBox.ciphertext + sealedBox.tag) // Standard Base64 output
        } catch { return errorToJSON("Encryption failed: \(error.localizedDescription)") }
    }

    // Returns base64 encoded data OR empty string on failure (common for decrypt)
    @objc func decrypt(algorithm: String, key: String, data: String) -> String {
        guard let algorithmDict = parseJSONDictionary(algorithm),
              let algorithmName = algorithmDict["name"] as? String, algorithmName.uppercased() == "AES-GCM",
              let keyJWK = parseJSONDictionary(key),
              let encryptedDataWithTag = base64Decode(data), // Standard base64 input
              let ivBase64 = algorithmDict["iv"] as? String, let iv = base64Decode(ivBase64), // Standard base64 IV
              let symmetricKey = createSymmetricKeyFromJWK(jwk: keyJWK)
        else { print("Decrypt: Invalid params"); return "" } // Return empty string on setup failure

        let aad = (algorithmDict["additionalData"] as? String).flatMap { base64Decode($0) }
        let tagLength = 16 // AES-GCM standard
        guard encryptedDataWithTag.count >= tagLength else { print("Decrypt: Data too short"); return "" }
        let ciphertext = encryptedDataWithTag.dropLast(tagLength)
        let tag = encryptedDataWithTag.suffix(tagLength)
        do {
            let nonce = try AES.GCM.Nonce(data: iv)
            let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
            let decryptedData = try AES.GCM.open(sealedBox, using: symmetricKey)
            return base64Encode(decryptedData) // Standard Base64 output
        } catch {
            print("Decrypt: Failed (\(error))"); return "" // Return empty string on crypto failure (auth fail, bad key etc)
        }
    }

    // Length is in BITS
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

                // Derive the requested number of bytes using HKDF-SHA256 (common practice for ECDH -> symmetric key)
                let derivedKey = sharedSecret.hkdfDerivedSymmetricKey(
                    using: SHA256.self, salt: Data(), sharedInfo: Data(), outputByteCount: derivedKeyLengthBytes
                )
                // Return derived bytes as BASE64URL to match SEA.secret implicit expectation
                return derivedKey.withUnsafeBytes { base64urlEncode(Data($0)) }
            } catch { return errorToJSON("ECDH key agreement/derivation failed: \(error.localizedDescription)") }

        default:
            return errorToJSON("Unsupported derivation algorithm: \(algoName)")
        }
    }

    // --- Helper for PBKDF2 derivation ---
    private func deriveBitsPBKDF2(passwordData: Data, algoDict: [String: Any], derivedKeyLengthBytes: Int) -> String {
        guard let saltBase64 = algoDict["salt"] as? String, let saltData = base64Decode(saltBase64) else { // Standard Base64 salt
              return errorToJSON("Missing or invalid salt for PBKDF2")
        }
        let iterations = algoDict["iterations"] as? Int ?? 100000 // Default from sea.js settings
        guard iterations > 0 else { return errorToJSON("PBKDF2 iterations must be positive") }
        let hashAlgoName = ((algoDict["hash"] as? [String: Any])?["name"] as? String)?.uppercased() ?? "SHA-256" // Default from sea.js settings
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
    
    
    @objc func deriveKey(algorithm: String, baseKey: String, derivedKeyType: String, extractable: Bool, keyUsages: String) -> String {
        // 1. Parse Input Parameters
        guard let algoDict = parseJSONDictionary(algorithm), // Contains derivation algo params (e.g., peer public key for ECDH)
              let algoName = algoDict["name"] as? String,
              let baseKeyJWK = parseJSONDictionary(baseKey), // The initial key (e.g., ECDH private key)
              let derivedKeyAlgoDict = parseJSONDictionary(derivedKeyType), // Target key type (e.g., AES-GCM)
              let derivedKeyAlgoName = derivedKeyAlgoDict["name"] as? String,
              let targetKeyUsages = parseJSONArray(keyUsages) // Usages for the *derived* key
        else {
            return errorToJSON("Invalid parameters for deriveKey")
        }

        // 2. Select Derivation Algorithm
        switch algoName.uppercased() {
        case "ECDH":
            // --- ECDH Specific Logic ---
            // a. Extract local private key from baseKeyJWK
            guard baseKeyJWK["kty"] as? String == "EC", // Should be an EC key
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
            // Add cases for AES-CBC, HMAC etc. if needed
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
             // Add cases for AES-CBC, HMAC etc. if needed
             // case "HMAC": ... check hash, length etc.
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

        // Add cases for HKDF, etc. if needed
        default:
            return errorToJSON("Unsupported derivation algorithm: \(algoName)")
        }
    }

} // End of NativeWebCryptoModule class

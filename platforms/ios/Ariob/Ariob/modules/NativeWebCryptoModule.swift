import Foundation
import CryptoKit
import CryptoSwift
import CommonCrypto

// MARK: - Native Web Crypto module for LynxJS
//
// This implementation exposes a subset of the WebCrypto API to JavaScript.  It
// uses Apple’s built‑in CryptoKit and CommonCrypto frameworks to perform
// cryptographic operations.  CryptoKit provides modern high‑level APIs for
// algorithms like AES‑GCM, ECDSA and ECDH and ensures keys and intermediate
// data are handled securely【831133097932833†L38-L50】.  CommonCrypto is used for
// primitives not present in CryptoKit, such as PBKDF2 with HMAC‑SHA256.
//
// The exposed methods mirror the WebCrypto API: digest, generateKey,
// importKey, exportKey, sign, verify, encrypt, decrypt, deriveBits, deriveKey,
// textEncode, textDecode and getRandomValues.  Parameters and return values
// are passed as Foundation collections (NSDictionary/NSArray/NSData) to make
// bridging with JavaScript straightforward.
@objcMembers
public final class NativeWebCryptoModule: NSObject, LynxModule {

    // MARK: - Lynx module registration
    @objc public static var name: String { "NativeWebCryptoModule" }
    @objc public static var methodLookup: [String: String] {
        return [
            "digest": #selector(digest(_:data:)).description,
            "generateKey": #selector(generateKey(_:extractable:keyUsages:)).description,
            "exportKey": #selector(exportKey(_:key:)).description,
            "importKey": #selector(importKey(_:keyData:algorithm:extractable:keyUsages:)).description,
            "sign": #selector(sign(_:key:data:)).description,
            "verify": #selector(verify(_:key:signature:data:)).description,
            "encrypt": #selector(encrypt(_:key:data:)).description,
            "decrypt": #selector(decrypt(_:key:data:)).description,
            "deriveBits": #selector(deriveBits(_:baseKey:length:)).description,
            "deriveKey": #selector(deriveKey(_:baseKey:derivedKeyType:extractable:keyUsages:)).description,
            "textEncode": #selector(textEncode(_:)).description,
            "textDecode": #selector(textDecode(_:)).description,
            "getRandomValues": #selector(getRandomValues(_:)).description,
            "btoa": #selector(btoa(_:)).description,
            "atob": #selector(atob(_:)).description
        ]
    }

    @objc public override init() { super.init() }
    @objc public init(param: Any) { super.init() }

    // MARK: – Digest --------------------------------------------------------
    /// Compute a cryptographic digest.  The algorithm dictionary must contain a
    /// `name` key corresponding to one of the supported hash functions.  Data
    /// may be passed as NSData or as an object representing a Uint8Array from
    /// JavaScript.  The return value is an NSData containing the digest or nil
    /// on error.
    @objc(digest:data:)
    func digest(_ algorithm: NSDictionary, data: Any) -> NSData? {
        guard let name = (algorithm["name"] as? String)?.uppercased() else { return nil }
        guard let d = convertToData(data) else { return nil }

        let out: Data
        switch name {
        case "SHA-256":
            out = Data(SHA256.hash(data: d))
        default:
            // Only SHA‑256 is supported to align with SEA.js
            return nil
        }
        return out as NSData
    }

    // MARK: – Key generation ------------------------------------------------
    /// Generate a new cryptographic key.  Supported algorithms include
    /// AES‑GCM (secret key), ECDSA (P‑256) and ECDH (P‑256).  For AES the
    /// `algorithm` dictionary must contain a `length` property specifying the
    /// desired key length in bits (128, 192 or 256).  For ECDSA/ECDH the
    /// `namedCurve` field must be "P‑256".  Returns a dictionary describing
    /// the key in JWK form or a pair of JWK dictionaries for EC key pairs.
    @objc(generateKey:extractable:keyUsages:)
    func generateKey(_ algorithm: NSDictionary,
                     extractable: NSNumber,
                     keyUsages: NSArray) -> NSDictionary? {
        guard let name = (algorithm["name"] as? String)?.uppercased() else { return nil }
        let usages = keyUsages as? [String] ?? []

        switch name {
        case "AES-GCM":
            // Generate a random symmetric key of the requested length (default 256 bits).
            let bits = (algorithm["length"] as? NSNumber)?.intValue ?? 256
            guard [128, 192, 256].contains(bits) else { return nil }
            let keyLength = bits / 8
            var keyBytes = [UInt8](repeating: 0, count: keyLength)
            let status = SecRandomCopyBytes(kSecRandomDefault, keyLength, &keyBytes)
            guard status == errSecSuccess else { return nil }
            let keyData = Data(keyBytes)
            return [
                "kty": "oct",
                "k": base64urlEncode(keyData),
                "alg": "A\(bits)GCM",
                "ext": extractable.boolValue,
                "key_ops": usages
            ]

        case "ECDSA":
            // Generate an ECDSA key pair on the P‑256 curve using CryptoKit.
            guard (algorithm["namedCurve"] as? String)?.uppercased() == "P-256" else { return nil }
            let priv = P256.Signing.PrivateKey()
            return [
                "privateKey": jwk(from: priv, ops: ["sign"], ext: extractable.boolValue),
                "publicKey": jwk(from: priv.publicKey, ops: ["verify"], ext: true)
            ]

        case "ECDH":
            // Generate an ECDH key pair on the P‑256 curve using CryptoKit.
            guard (algorithm["namedCurve"] as? String)?.uppercased() == "P-256" else { return nil }
            let priv = P256.KeyAgreement.PrivateKey()
            // Only allow deriveBits/deriveKey usages on the private key.
            let allowedOps = usages.filter { $0 == "deriveBits" || $0 == "deriveKey" }
            return [
                "privateKey": jwk(fromAgreement: priv, ops: allowedOps, ext: extractable.boolValue),
                "publicKey": jwk(fromAgreement: priv.publicKey, ops: [], ext: true)
            ]

        default:
            return nil
        }
    }

    // MARK: – Key export / import ------------------------------------------
    /// Export a key in JWK or raw form.  For symmetric keys, "raw" returns the
    /// raw bytes.  For EC public keys, "raw" returns the uncompressed point
    /// (0x04 || x || y).  Private EC keys cannot be exported in raw form.
    @objc(exportKey:key:)
    func exportKey(_ format: NSString, key: NSDictionary) -> Any? {
        switch format.lowercased {
        case "jwk":
            return key
        case "raw":
            let kty = key["kty"] as? String
            if kty == "oct" {
                // AES key export
                guard let k = key["k"] as? String, let d = base64urlDecode(k) else { return nil }
                return d as NSData
            } else if kty == "EC" {
                // Export only the public part
                guard let x = key["x"] as? String,
                      let y = key["y"] as? String,
                      let xData = base64urlDecode(x),
                      let yData = base64urlDecode(y) else { return nil }
                var raw = Data([0x04])
                raw.append(xData)
                raw.append(yData)
                return raw as NSData
            }
            return nil
        default:
            return nil
        }
    }

    /// Import a key from JWK or raw form.  For AES‑GCM, raw input must be a
    /// NSData containing the key bytes.  For JWK, any provided values are
    /// preserved and the `ext` and `key_ops` attributes are overwritten.
    @objc(importKey:keyData:algorithm:extractable:keyUsages:)
    func importKey(_ format: NSString,
                   keyData: Any,
                   algorithm: NSDictionary,
                   extractable: NSNumber,
                   keyUsages: NSArray) -> NSDictionary? {
        guard let name = (algorithm["name"] as? String)?.uppercased() else { return nil }
        let usages = keyUsages as? [String] ?? []
        switch (format.lowercased, name) {
        case ("raw", "AES-GCM"):
            // Raw AES key import.  Normalize to 128/192/256 bits by hashing when
            // necessary【841229793092621†L164-L168】.
            guard let raw = convertToData(keyData) else { return nil }
            let norm = normalizeAESKey(raw)
            let bits = norm.count * 8
            return [
                "kty": "oct",
                "k": base64urlEncode(norm),
                "alg": "A\(bits)GCM",
                "ext": extractable.boolValue,
                "key_ops": usages
            ]
        case ("jwk", _):
            guard var jwk = keyData as? [String: Any] else { return nil }
            jwk["ext"] = extractable.boolValue
            jwk["key_ops"] = usages
            return jwk as NSDictionary
        default:
            return nil
        }
    }

    // MARK: – Sign / verify (ECDSA‑P256 + SHA‑256) -------------------------
    /// Sign arbitrary data with an ECDSA P‑256 private key.  WebCrypto
    /// specifies that ECDSA signatures must be returned in the raw
    /// concatenation of the r and s integers (IEEE P1363)【654682988880564†L235-L243】.
    /// CryptoKit produces signatures in DER format by default, but exposes a
    /// `rawRepresentation` property which yields the concatenated r||s
    /// encoding.  This method returns that raw form as an NSData.  If any
    /// parameter is invalid or the signing operation fails, nil is returned.
    @objc(sign:key:data:)
    func sign(_ algorithm: NSDictionary, key: NSDictionary, data: Any) -> NSData? {
        // Ensure the algorithm name is ECDSA.
        guard (algorithm["name"] as? String)?.uppercased() == "ECDSA" else { return nil }
        // Extract the private key material from the JWK and construct a CryptoKit key.
        guard let dStr = key["d"] as? String,
              let dData = base64urlDecode(dStr),
              let privKey = try? P256.Signing.PrivateKey(rawRepresentation: dData) else {
            return nil
        }
        // Convert the input data into a Data object.
        guard let dataToSign = convertToData(data) else { return nil }
        // Perform the signing operation.  If this throws, return nil.
        guard let signature = try? privKey.signature(for: dataToSign) else { return nil }
        // WebCrypto requires the signature as r||s bytes【654682988880564†L235-L243】.
        let rawSig = signature.rawRepresentation
        return Data(rawSig) as NSData
    }

    /// Verify an ECDSA P‑256 signature.  The signature passed from WebCrypto
    /// is expected to be in raw concatenated r||s form【654682988880564†L235-L243】.  This method
    /// converts it into a CryptoKit `ECDSASignature` and then validates it
    /// against the provided public key and data.  Returns true if the
    /// signature is valid, false otherwise or on error.
    @objc(verify:key:signature:data:)
    func verify(_ algorithm: NSDictionary, key: NSDictionary, signature: Any, data: Any) -> NSNumber {
        // Check algorithm type.
        guard (algorithm["name"] as? String)?.uppercased() == "ECDSA" else {
            print("Verify: Algorithm must be ECDSA")
            return false
        }
        
        // Reconstruct the public key from the supplied JWK.
        guard let pubKey = publicKey(from: key) else {
            print("Verify: Failed to reconstruct public key from JWK")
            return false
        }
        
        // Convert the signature and data into Data objects.
        guard let sigBytes = convertToData(signature),
              let message = convertToData(data) else {
            print("Verify: Failed to convert signature or data")
            return false
        }
        
        // Debug: Log signature length
        print("Verify: Signature length: \(sigBytes.count) bytes (expected 64 for P-256)")
        
        // Convert the raw r||s signature into a CryptoKit signature object.
        guard let sigObj = try? P256.Signing.ECDSASignature(rawRepresentation: sigBytes) else {
            print("Verify: Failed to convert raw signature to ECDSASignature")
            return false
        }
        
        // Validate the signature.
        let isValid = pubKey.isValidSignature(sigObj, for: message)
        print("Verify: Signature is \(isValid ? "valid" : "invalid")")
        return isValid as NSNumber
    }

    // MARK: – Encrypt / decrypt (AES‑GCM) -----------------------------------
    /// Encrypt data using AES‑GCM.  The algorithm dictionary must contain an
    /// `iv` (nonce) property as NSData and may optionally contain
    /// `additionalData` for authenticated data.  The key dictionary must be a
    /// JWK with a base64url encoded `k` value.  Returns the ciphertext
    /// concatenated with the authentication tag or nil on failure.
    @objc(encrypt:key:data:)
    func encrypt(_ algorithm: NSDictionary, key: NSDictionary, data: Any) -> NSData? {
        guard (algorithm["name"] as? String)?.uppercased() == "AES-GCM",
              let ivData = extractAlgorithmData(algorithm, key: "iv"),
              let kStr = key["k"] as? String,
              let kData = base64urlDecode(kStr),
              let dataToEncrypt = convertToData(data) else { return nil }

        // Additional authenticated data is optional
        let aad = extractAlgorithmData(algorithm, key: "additionalData")

        // Normalize key to 16/24/32 bytes【841229793092621†L164-L168】
        let keyBytes = normalizeAESKey(kData)
        if ivData.count == 12 {
            // Use CryptoKit when IV length is 12 bytes (standard for GCM)
            let symKey = SymmetricKey(data: keyBytes)
            guard let nonce = try? AES.GCM.Nonce(data: ivData) else { return nil }
            do {
                let sealed = try AES.GCM.seal(dataToEncrypt, using: symKey, nonce: nonce, authenticating: aad ?? Data())
                var out = Data(sealed.ciphertext)
                out.append(sealed.tag)
                return out as NSData
            } catch {
                return nil
            }
        } else {
            // Fallback to CryptoSwift for non‑12‑byte IVs.  CryptoSwift accepts
            // arbitrary IV lengths and produces combined cipher+tag.
            let aadBytes: [UInt8]? = aad.map { [UInt8]($0) }
            do {
                let aes = try AES(key: [UInt8](keyBytes),
                                  blockMode: GCM(iv: [UInt8](ivData),
                                                 additionalAuthenticatedData: aadBytes,
                                                 tagLength: 16,
                                                 mode: .combined),
                                  padding: .noPadding)
                let cipher = try aes.encrypt([UInt8](dataToEncrypt))
                return Data(cipher) as NSData
            } catch {
                return nil
            }
        }
    }

    /// Decrypt data encrypted with AES‑GCM.  Expects the input data to be
    /// ciphertext concatenated with the 16‑byte authentication tag.  The
    /// algorithm dictionary must contain the same `iv` and optional
    /// `additionalData` that were used for encryption.  Returns the plaintext
    /// NSData or nil on failure.
    @objc(decrypt:key:data:)
    func decrypt(_ algorithm: NSDictionary, key: NSDictionary, data: Any) -> NSData? {
        guard (algorithm["name"] as? String)?.uppercased() == "AES-GCM",
              let ivData = extractAlgorithmData(algorithm, key: "iv"),
              let kStr = key["k"] as? String,
              let kData = base64urlDecode(kStr),
              let dataToDecrypt = convertToData(data) else {
            print("Decrypt: Invalid parameters")
            return nil
        }

        let tagLen = 16
        // Fixed: Allow data length equal to tag length (empty ciphertext case)
        guard dataToDecrypt.count >= tagLen else {
            print("Decrypt: Data too short (must be at least \(tagLen) bytes)")
            return nil
        }
        
        let cipher = dataToDecrypt.prefix(dataToDecrypt.count - tagLen)
        let tag = dataToDecrypt.suffix(tagLen)
        let aad = extractAlgorithmData(algorithm, key: "additionalData")

        let keyBytes = normalizeAESKey(kData)
        
        // Debug: Log key and IV info
        print("Decrypt: Key length: \(keyBytes.count) bytes, IV length: \(ivData.count) bytes")
        
        if ivData.count == 12 {
            let symKey = SymmetricKey(data: keyBytes)
            guard let nonce = try? AES.GCM.Nonce(data: ivData) else {
                print("Decrypt: Failed to create nonce")
                return nil
            }
            do {
                let box = try AES.GCM.SealedBox(nonce: nonce, ciphertext: cipher, tag: tag)
                let plain = try AES.GCM.open(box, using: symKey, authenticating: aad ?? Data())
                return plain as NSData
            } catch {
                print("Decrypt: CryptoKit error: \(error)")
                return nil
            }
        } else {
            // Fallback to CryptoSwift for non‑12‑byte IVs.
            let aadBytes: [UInt8]? = aad.map { [UInt8]($0) }
            do {
                let aes = try AES(key: [UInt8](keyBytes),
                                  blockMode: GCM(iv: [UInt8](ivData),
                                                 authenticationTag: [UInt8](tag),
                                                 additionalAuthenticatedData: aadBytes,
                                                 mode: .detached),
                                  padding: .noPadding)
                let plainBytes = try aes.decrypt([UInt8](cipher))
                return Data(plainBytes) as NSData
            } catch {
                print("Decrypt: CryptoSwift error: \(error)")
                return nil
            }
        }
    }

    // MARK: – deriveBits / deriveKey  (ECDH & PBKDF2) ----------------------
    /// Derive raw bits from a base key.  Supports ECDH and PBKDF2.  For ECDH
    /// the algorithm dictionary must have a "public" JWK for the peer’s
    /// public key.  For PBKDF2 the baseKey dictionary must contain a
    /// base64url encoded "rawData" entry.  The `length` parameter is in
    /// bits and must be a multiple of 8.  Returns an NSData or nil on error.
    @objc(deriveBits:baseKey:length:)
    func deriveBits(_ algorithm: NSDictionary, baseKey: NSDictionary, length: NSNumber) -> NSData? {
        guard let name = (algorithm["name"] as? String)?.uppercased() else { return nil }
        let byteCount = length.intValue / 8
        if name == "ECDH" {
            guard let priv = privateKey(from: baseKey),
                  let peerJwk = algorithm["public"] as? NSDictionary,
                  let peerPub = publicKeyAgreement(from: peerJwk) else { return nil }
            do {
                let secret = try priv.sharedSecretFromKeyAgreement(with: peerPub)
                let derived = secret.hkdfDerivedSymmetricKey(using: SHA256.self,
                                                             salt: Data(),
                                                             sharedInfo: Data(),
                                                             outputByteCount: byteCount)
                let raw = derived.withUnsafeBytes { Data(Array($0)) }
                return raw as NSData
            } catch {
                return nil
            }
        }
        if name == "PBKDF2" {
            guard let pwdStr = baseKey["rawData"] as? NSString,
                  let pwdRaw = base64urlDecode(pwdStr as String),
                  let saltObj = algorithm["salt"] as? NSData else { return nil }
            let iterations = (algorithm["iterations"] as? NSNumber)?.intValue ?? 0
            // Convert salt from NSData to Data for withUnsafeBytes support
            let salt = Data(referencing: saltObj)
            var derived = [UInt8](repeating: 0, count: byteCount)
            let status = pwdRaw.withUnsafeBytes { pwdBuf in
                salt.withUnsafeBytes { saltBuf in
                    CCKeyDerivationPBKDF(CCPBKDFAlgorithm(kCCPBKDF2),
                                         pwdBuf.bindMemory(to: Int8.self).baseAddress,
                                         pwdRaw.count,
                                         saltBuf.bindMemory(to: UInt8.self).baseAddress,
                                         salt.count,
                                         CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256),
                                         UInt32(iterations),
                                         &derived,
                                         byteCount)
                }
            }
            guard status == kCCSuccess else { return nil }
            return Data(derived) as NSData
        }
        return nil
    }


    /// Derive a key by wrapping derived bits into a JWK.  Internally calls
    /// deriveBits and then encodes the resulting secret as an AES‑GCM key.  The
    /// `derivedKeyType` must include a `length` property specifying the desired
    /// key length in bits (e.g. 256).  Returns a JWK dictionary or nil on error.
    @objc(deriveKey:baseKey:derivedKeyType:extractable:keyUsages:)
    func deriveKey(_ algorithm: NSDictionary, baseKey: NSDictionary, derivedKeyType: NSDictionary,
                   extractable: NSNumber, keyUsages: NSArray) -> NSDictionary? {
        guard let bits = derivedKeyType["length"] as? NSNumber else { return nil }
        guard let raw = deriveBits(algorithm, baseKey: baseKey, length: bits) as Data? else { return nil }
        let usages = keyUsages as? [String] ?? []
        return [
            "kty": "oct",
            "k": base64urlEncode(raw),
            "alg": "A\(bits.intValue)GCM",
            "ext": extractable.boolValue,
            "key_ops": usages
        ]
    }

    // MARK: – Utilities -----------------------------------------------------
    @objc(textEncode:)
    func textEncode(_ text: NSString) -> NSData {
        return text.data(using: String.Encoding.utf8.rawValue)! as NSData
    }
    @objc(textDecode:)
    func textDecode(_ data: NSData) -> NSString? {
        return String(data: data as Data, encoding: .utf8) as NSString?
    }
    @objc(getRandomValues:)
    func getRandomValues(_ len: NSNumber) -> NSData? {
        let length = len.intValue
        // WebCrypto getRandomValues() throws if length > 65536【408000048587121†L128-L160】.
        if length < 0 || length > 65536 { return nil }
        if length == 0 { return NSData() }
        var bytes = [UInt8](repeating: 0, count: length)
        let status = SecRandomCopyBytes(kSecRandomDefault, length, &bytes)
        return status == errSecSuccess ? Data(bytes) as NSData : nil
    }

    // MARK: – Helper functions
    /// Convert JavaScript input (NSData or Uint8Array dictionary) to Swift Data.
    private func convertToData(_ input: Any) -> Data? {
        if let nsData = input as? NSData {
            return Data(referencing: nsData)
        } else if let dict = input as? NSDictionary {
            // Handle Uint8Array passed as dictionary from JavaScript (index:value)
            guard let arrayData = dict.allValues as? [NSNumber] else { return nil }
            let bytes = arrayData.map { UInt8($0.intValue) }
            return Data(bytes)
        } else if let data = input as? Data {
            return data
        }
        return nil
    }

    /// Extract a Data value from an algorithm dictionary for a given key.
    private func extractAlgorithmData(_ algorithm: NSDictionary, key: String) -> Data? {
        guard let value = algorithm[key] else { return nil }
        // If the value is a string, attempt base64url or base64 decode.  Some
        // callers may provide the IV or additionalData as a base64 encoded
        // string rather than a Uint8Array.  Try base64url first, then
        // standard base64.
        if let str = value as? String {
            // Try base64url decode
            if let decoded = base64urlDecode(str) { return decoded }
            // Try standard base64 decode
            if let decoded = Data(base64Encoded: str) { return decoded }
            // Fallback: treat as UTF‑8 string
            return str.data(using: .utf8)
        }
        return convertToData(value)
    }

    /// Base64url encode without padding as defined by RFC 7515.
    private func base64urlEncode(_ d: Data) -> String {
        var s = d.base64EncodedString()
        s = s.replacingOccurrences(of: "+", with: "-")
             .replacingOccurrences(of: "/", with: "_")
             .replacingOccurrences(of: "=", with: "")
        return s
    }

    /// Base64url decode.  Returns nil for invalid input.
    private func base64urlDecode(_ s: String) -> Data? {
        var b64 = s.replacingOccurrences(of: "-", with: "+").replacingOccurrences(of: "_", with: "/")
        while b64.count % 4 != 0 { b64 += "=" }
        return Data(base64Encoded: b64)
    }

    /// Normalize an AES key to a supported length (16, 24 or 32 bytes).  If the
    /// provided key is not one of those lengths it is hashed with SHA‑256 to
    /// produce a 32‑byte key【841229793092621†L164-L168】.
    private func normalizeAESKey(_ d: Data) -> Data {
        return [16, 24, 32].contains(d.count) ? d : Data(SHA256.hash(data: d))
    }

    /// Create a JWK dictionary from a P256 signing private key.
    private func jwk(from pk: P256.Signing.PrivateKey, ops: [String], ext: Bool) -> NSDictionary {
        let pub = pk.publicKey.x963Representation
        return [
            "kty": "EC",
            "crv": "P-256",
            "alg": "ES256",
            "ext": ext,
            "key_ops": ops,
            "d": base64urlEncode(pk.rawRepresentation),
            "x": base64urlEncode(pub[1..<33]),
            "y": base64urlEncode(pub[33..<65])
        ]
    }
    /// Create a JWK dictionary from a P256 signing public key.
    private func jwk(from pk: P256.Signing.PublicKey, ops: [String], ext: Bool) -> NSDictionary {
        let pub = pk.x963Representation
        return [
            "kty": "EC",
            "crv": "P-256",
            "alg": "ES256",
            "ext": ext,
            "key_ops": ops,
            "x": base64urlEncode(pub[1..<33]),
            "y": base64urlEncode(pub[33..<65])
        ]
    }
    /// Create a JWK dictionary from a P256 key agreement private key.
    private func jwk(fromAgreement pk: P256.KeyAgreement.PrivateKey, ops: [String], ext: Bool) -> NSDictionary {
        let pub = pk.publicKey.x963Representation
        return [
            "kty": "EC",
            "crv": "P-256",
            "alg": "ECDH-ES",
            "ext": ext,
            "key_ops": ops,
            "d": base64urlEncode(pk.rawRepresentation),
            "x": base64urlEncode(pub[1..<33]),
            "y": base64urlEncode(pub[33..<65])
        ]
    }
    /// Create a JWK dictionary from a P256 key agreement public key.
    private func jwk(fromAgreement pk: P256.KeyAgreement.PublicKey, ops: [String], ext: Bool) -> NSDictionary {
        let pub = pk.x963Representation
        return [
            "kty": "EC",
            "crv": "P-256",
            "alg": "ECDH-ES",
            "ext": ext,
            "key_ops": ops,
            "x": base64urlEncode(pub[1..<33]),
            "y": base64urlEncode(pub[33..<65])
        ]
    }

    /// Restore a P256 signing public key from a JWK.
    private func publicKey(from jwk: NSDictionary) -> P256.Signing.PublicKey? {
        guard let x = (jwk["x"] as? String).flatMap(base64urlDecode),
              let y = (jwk["y"] as? String).flatMap(base64urlDecode) else {
            print("publicKey: Missing or invalid x or y in JWK")
            return nil
        }
        
        print("publicKey: x length: \(x.count), y length: \(y.count)")
        
        var bytes = Data([0x04])
        bytes.append(x)
        bytes.append(y)
        
        do {
            let pubKey = try P256.Signing.PublicKey(x963Representation: bytes)
            return pubKey
        } catch {
            print("publicKey: Failed to create public key: \(error)")
            return nil
        }
    }

    /// Restore a P256 key agreement private key from a JWK.
    private func privateKey(from jwk: NSDictionary) -> P256.KeyAgreement.PrivateKey? {
        guard let dStr = jwk["d"] as? String, let d = base64urlDecode(dStr) else { return nil }
        return try? P256.KeyAgreement.PrivateKey(rawRepresentation: d)
    }
    /// Restore a P256 key agreement public key from a JWK.
    private func publicKeyAgreement(from jwk: NSDictionary) -> P256.KeyAgreement.PublicKey? {
        guard let x = (jwk["x"] as? String).flatMap(base64urlDecode),
              let y = (jwk["y"] as? String).flatMap(base64urlDecode) else { return nil }
        var bytes = Data([0x04])
        bytes.append(x)
        bytes.append(y)
        return try? P256.KeyAgreement.PublicKey(x963Representation: bytes)
    }

    // MARK: – Base64 encode/decode helpers
    /// Encode a UTF‑8 string into a standard Base64 string.  This method
    /// mirrors the browser's `btoa()` function.  It takes a string and
    /// returns its Base64 encoding using standard (non‑URL) characters.
    @objc(btoa:)
    func btoa(_ input: NSString) -> NSString? {
        let string = input as String
        // btoa() operates on the raw bytes of the string interpreted as
        // UTF‑8.  Convert to Data and Base64 encode.
        guard let data = string.data(using: .utf8) else { return nil }
        return data.base64EncodedString() as NSString
    }

    /// Decode a standard Base64 string into a binary string.  This method
    /// mirrors the browser's `atob()` function.  It returns a string
    /// containing characters with char codes 0–255 corresponding to the
    /// decoded bytes.  Returns nil for invalid Base64 input.
    @objc(atob:)
    func atob(_ input: NSString) -> NSString? {
        let string = input as String
        guard let data = Data(base64Encoded: string) else { return nil }
        // Interpret bytes as ISO‑8859‑1 characters to preserve values 0–255.
        return String(data: data, encoding: .isoLatin1) as NSString?
    }
    
    // Add this helper function to convert DER to raw
    private func derToRaw(_ derData: Data) -> Data? {
        guard derData.count > 6,
              derData[0] == 0x30 else { return nil }
        
        let totalLength = Int(derData[1])
        guard derData.count >= totalLength + 2 else { return nil }
        
        var offset = 2
        
        // Parse r
        guard derData[offset] == 0x02 else { return nil }
        let rLength = Int(derData[offset + 1])
        guard derData.count >= offset + 2 + rLength else { return nil }
        offset += 2
        let r = derData.subdata(in: offset..<offset + rLength)
        offset += rLength
        
        // Parse s
        guard derData[offset] == 0x02 else { return nil }
        let sLength = Int(derData[offset + 1])
        guard derData.count >= offset + 2 + sLength else { return nil }
        offset += 2
        let s = derData.subdata(in: offset..<offset + sLength)
        
        // Combine r and s, padding to 32 bytes each if needed
        var raw = Data()
        if r.count < 32 {
            raw += Data(repeating: 0, count: 32 - r.count)
        }
        raw += r
        
        if s.count < 32 {
            raw += Data(repeating: 0, count: 32 - s.count)
        }
        raw += s
        
        return raw
    }
}

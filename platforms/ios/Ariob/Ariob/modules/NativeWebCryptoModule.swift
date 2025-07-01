import Foundation
import CryptoKit
import CryptoSwift
import CommonCrypto


// MARK: - Module
@objcMembers
public final class NativeWebCryptoModule: NSObject, LynxModule {

    // MARK: - Lynx Module Registration
    @objc public static var name: String { "NativeWebCryptoModule" }
    @objc public static var methodLookup: [String: String] {  // <methodName>:<selector>
        [
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
            "getRandomValues": #selector(getRandomValues(_:)).description
        ]
    }
    
    @objc public init(param: Any) { super.init() }
    @objc public override init() { super.init() }

    // MARK: - Public Web-Crypto Methods
    
    
    // MARK: – Digest ----------------------------------------------------------
    /// Returns NSData with the hash.  On error ⇒ nil.
    @objc(digest:data:)
    func digest(_ algorithm: NSDictionary, data: Any) -> NSData? {
        guard let name = (algorithm["name"] as? String)?.uppercased() else { return nil }
        
        // Convert data parameter to Data object
        let d: Data
        if let nsData = data as? NSData {
            d = Data(referencing: nsData)
        } else if let dict = data as? NSDictionary {
            // Handle Uint8Array passed as dictionary from JavaScript
            guard let arrayData = dict.allValues as? [NSNumber] else { return nil }
            let bytes = arrayData.map { UInt8($0.intValue) }
            d = Data(bytes)
        } else {
            return nil
        }
        let out: Data
        switch name {
            case "SHA-1": 
                var hash = [UInt8](repeating: 0, count: Int(CC_SHA1_DIGEST_LENGTH))
                _ = d.withUnsafeBytes { bytes in
                    CC_SHA1(bytes.bindMemory(to: UInt8.self).baseAddress, CC_LONG(d.count), &hash)
                }
                out = Data(hash)
            case "SHA-256": out = Data(SHA256.hash(data: d))
            case "SHA-384": out = Data(SHA384.hash(data: d))
            case "SHA-512": out = Data(SHA512.hash(data: d))
            default: return nil
        }
        return out as NSData
    }


    // MARK: – Key generation --------------------------------------------------
    /// algorithm = NSDictionary (eg. `{name:"AES-GCM",length:256}`)
    /// keyUsages = NSArray<NSString>
    @objc(generateKey:extractable:keyUsages:)
    func generateKey(_ algorithm: NSDictionary,
                     extractable: NSNumber,      // BOOL bridge
                     keyUsages: NSArray) -> NSDictionary? {

        guard let name = (algorithm["name"] as? String)?.uppercased() else { return nil }
        let usages = keyUsages as? [String] ?? []

        switch name {

        case "AES-GCM":
            let bits = (algorithm["length"] as? NSNumber)?.intValue ?? 256
            guard [128,192,256].contains(bits) else { return nil }
            let keyLength = bits/8
            var keyBytes = [UInt8](repeating: 0, count: keyLength)
            guard SecRandomCopyBytes(kSecRandomDefault, keyLength, &keyBytes) == errSecSuccess else { return nil }
            let keyData = Data(keyBytes)
            return [
                "kty": "oct",
                "k": base64urlEncode(keyData),
                "alg": "A\(bits)GCM",
                "ext": extractable.boolValue,
                "key_ops": usages
            ]

        case "ECDSA":
            guard (algorithm["namedCurve"] as? String)?.uppercased() == "P-256" else { return nil }
            let priv = P256.Signing.PrivateKey()
            return [
                "privateKey": jwk(from: priv, ops: ["sign"], ext: extractable.boolValue),
                "publicKey":  jwk(from: priv.publicKey, ops: ["verify"], ext: true)
            ]

        case "ECDH":
            guard (algorithm["namedCurve"] as? String)?.uppercased() == "P-256" else { return nil }
            let priv = P256.KeyAgreement.PrivateKey()
            return [
                "privateKey": jwk(fromAgreement: priv,
                                  ops: usages.filter { $0 == "deriveBits" || $0 == "deriveKey" },
                                  ext: extractable.boolValue),
                "publicKey":  jwk(fromAgreement: priv.publicKey, ops: [], ext: true)
            ]

        default: return nil
        }
    }

    // MARK: – Key export / import --------------------------------------------
    @objc(exportKey:key:)
    func exportKey(_ format: NSString, key: NSDictionary) -> Any? {
        switch format.lowercased {
        case "jwk": return key
        case "raw":
            let kty = key["kty"] as? String
            if kty == "oct" {
                // AES key export
                guard let k = key["k"] as? String,
                      let d = base64urlDecode(k) else { return nil }
                return d as NSData
            } else if kty == "EC" {
                // EC key export - return the raw public key bytes
                guard let x = key["x"] as? String,
                      let y = key["y"] as? String,
                      let xData = base64urlDecode(x),
                      let yData = base64urlDecode(y) else { return nil }
                // Return uncompressed point format: 0x04 + x + y
                var rawKey = Data([0x04])
                rawKey.append(xData)
                rawKey.append(yData)
                return rawKey as NSData
            }
            return nil
        default: return nil
        }
    }

    @objc(importKey:keyData:algorithm:extractable:keyUsages:)
    func importKey(_ format: NSString,
                   keyData: Any,                   // NSData for "raw", NSDictionary for "jwk"
                   algorithm: NSDictionary,
                   extractable: NSNumber,
                   keyUsages: NSArray) -> NSDictionary? {

        guard let name = (algorithm["name"] as? String)?.uppercased() else { return nil }
        let usages = keyUsages as? [String] ?? []

        switch (format.lowercased, name) {

        case ("raw", "AES-GCM"):
            guard let raw = keyData as? NSData else { return nil }
            let norm = normalizeAESKey(Data(referencing: raw))
            let bits = norm.count*8
            return [
                "kty":"oct","k":base64urlEncode(norm),
                "alg":"A\(bits)GCM","ext":extractable.boolValue,"key_ops":usages
            ]

        case ("jwk", _):
            guard var jwk = keyData as? [String:Any] else { return nil }
            jwk["ext"] = extractable.boolValue
            jwk["key_ops"] = usages
            return jwk as NSDictionary

        default: return nil
        }
    }

    // MARK: – Sign / verify (ECDSA-P256 + SHA-256) ---------------------------
    @objc(sign:key:data:)
    func sign(_ algorithm: NSDictionary, key: NSDictionary, data: Any) -> NSData? {
        guard (algorithm["name"] as? String)?.uppercased() == "ECDSA",
              let dStr = key["d"] as? String,
              let priv = try? P256.Signing.PrivateKey(rawRepresentation: base64urlDecode(dStr)!),
              let dataToSign = convertToData(data) else { return nil }
        let sig = try? priv.signature(for: dataToSign)
        return sig?.derRepresentation as NSData?
    }

    @objc(verify:key:signature:data:)
    func verify(_ algorithm: NSDictionary, key: NSDictionary,
                signature: Any, data: Any) -> NSNumber {
        guard (algorithm["name"] as? String)?.uppercased() == "ECDSA",
              let pub = publicKey(from: key),
              let signatureData = convertToData(signature),
              let dataToVerify = convertToData(data),
              let sigObj = try? P256.Signing.ECDSASignature(derRepresentation: signatureData) else { return false }
        return pub.isValidSignature(sigObj, for: dataToVerify) as NSNumber
    }

    // MARK: – Encrypt / decrypt (AES-GCM) ------------------------------------
    @objc(encrypt:key:data:)
    func encrypt(_ algorithm: NSDictionary, key: NSDictionary, data: Any) -> NSData? {
        guard algorithm["name"] as? String == "AES-GCM",
              let iv = extractAlgorithmData(algorithm, key: "iv"),
              let kStr = key["k"] as? String,
              let kData = base64urlDecode(kStr),
              let dataToEncrypt = convertToData(data) else { return nil }

        let aad = extractAlgorithmData(algorithm, key: "additionalData").map { [UInt8]($0) }
        do {
            let aes = try AES(key: [UInt8](normalizeAESKey(kData)),
                              blockMode: GCM(iv: [UInt8](iv),
                                             additionalAuthenticatedData: aad,
                                             tagLength: 16,
                                             mode: .combined),
                              padding: .noPadding)
            let cipher = try aes.encrypt([UInt8](dataToEncrypt))
            return Data(cipher) as NSData
        } catch { return nil }
    }

    @objc(decrypt:key:data:)
    func decrypt(_ algorithm: NSDictionary, key: NSDictionary, data: Any) -> NSData? {
        guard algorithm["name"] as? String == "AES-GCM",
              let iv = extractAlgorithmData(algorithm, key: "iv"),
              let kStr = key["k"] as? String,
              let kData = base64urlDecode(kStr),
              let dataToDecrypt = convertToData(data) else { return nil }

        let tagLen = 16
        guard dataToDecrypt.count > tagLen else { return nil }
        let cipher = dataToDecrypt.subdata(in: 0..<(dataToDecrypt.count - tagLen))
        let tag = dataToDecrypt.subdata(in: (dataToDecrypt.count - tagLen)..<dataToDecrypt.count)
        let aad = extractAlgorithmData(algorithm, key: "additionalData").map { [UInt8]($0) }

        do {
            let aes = try AES(key: [UInt8](normalizeAESKey(kData)),
                              blockMode: GCM(iv: [UInt8](iv),
                                             authenticationTag: [UInt8](tag),
                                             additionalAuthenticatedData: aad,
                                             mode: .detached),
                              padding: .noPadding)
            let plain = try aes.decrypt([UInt8](cipher))
            return Data(plain) as NSData
        } catch { return nil }
    }

    // MARK: – deriveBits / deriveKey  (ECDH & PBKDF2) ------------------------
    @objc(deriveBits:baseKey:length:)
    func deriveBits(_ algorithm: NSDictionary, baseKey: NSDictionary, length: NSNumber) -> NSData? {
        guard let name = (algorithm["name"] as? String)?.uppercased() else { return nil }

        if name == "ECDH" {
            guard let priv = privateKey(from: baseKey),
                  let peerJwk = algorithm["public"] as? NSDictionary,
                  let peerPub = publicKeyAgreement(from: peerJwk) else { return nil }
            let secret = try? priv.sharedSecretFromKeyAgreement(with: peerPub)
            let raw = secret?.hkdfDerivedSymmetricKey(using: SHA256.self,
                                                      salt: Data(),
                                                      sharedInfo: Data(),
                                                      outputByteCount: length.intValue/8)
            return raw?.withUnsafeBytes { Data(Array($0)) } as NSData?
        }

        if name == "PBKDF2" {
            guard let pwdRaw = (baseKey["rawData"] as? NSString).flatMap({ base64urlDecode($0 as String) }) else { return nil }
            guard let salt = algorithm["salt"] as? NSData else { return nil }
            let iter = (algorithm["iterations"] as? NSNumber)?.intValue ?? 0
            let variant: CryptoSwift.HMAC.Variant = .sha256
            let out = try? PKCS5.PBKDF2(password: [UInt8](pwdRaw),
                                        salt: [UInt8](salt as Data),
                                        iterations: iter,
                                        keyLength: length.intValue/8,
                                        variant: variant).calculate()
            return out.map { Data($0) as NSData }
        }
        return nil
    }

    // deriveKey – wrapper that calls deriveBits then wraps into JWK
    @objc(deriveKey:baseKey:derivedKeyType:extractable:keyUsages:)
    func deriveKey(_ algorithm: NSDictionary, baseKey: NSDictionary, derivedKeyType: NSDictionary,
                   extractable: NSNumber, keyUsages: NSArray) -> NSDictionary? {

        guard let bits = derivedKeyType["length"] as? NSNumber else { return nil }
        guard let raw = deriveBits(algorithm, baseKey: baseKey, length: bits) else { return nil }
        return [
            "kty":"oct",
            "k": base64urlEncode(raw as Data),
            "alg":"A\(bits.intValue)GCM",
            "ext": extractable.boolValue,
            "key_ops": keyUsages
        ]
    }

    // MARK: – Utilities -------------------------------------------------------
    @objc(textEncode:)
    func textEncode(_ text: NSString) -> NSData {
        text.data(using: String.Encoding.utf8.rawValue)! as NSData
    }

    @objc(textDecode:)
    func textDecode(_ data: NSData) -> NSString? {
        String(data: data as Data, encoding: .utf8) as NSString?
    }

    @objc(getRandomValues:)
    func getRandomValues(_ len: NSNumber) -> NSData? {
        let length = len.intValue
        guard length > 0 else { return NSData() }
        
        var bytes = [UInt8](repeating: 0, count: length)
        let result = SecRandomCopyBytes(kSecRandomDefault, length, &bytes)
        
        return result == errSecSuccess ? Data(bytes) as NSData : nil
    }

    // MARK: – Helpers ---------------------------------------------------------
    
    // Helper function to convert JavaScript data (Uint8Array) to Swift Data
    private func convertToData(_ input: Any) -> Data? {
        if let nsData = input as? NSData {
            return Data(referencing: nsData)
        } else if let dict = input as? NSDictionary {
            // Handle Uint8Array passed as dictionary from JavaScript
            guard let arrayData = dict.allValues as? [NSNumber] else { return nil }
            let bytes = arrayData.map { UInt8($0.intValue) }
            return Data(bytes)
        } else if let data = input as? Data {
            return data
        }
        return nil
    }
    
    // Helper function to extract algorithm parameters that might be dictionaries
    private func extractAlgorithmData(_ algorithm: NSDictionary, key: String) -> Data? {
        guard let value = algorithm[key] else { return nil }
        return convertToData(value)
    }
    
    private func base64urlEncode(_ d: Data) -> String {
        var s = d.base64EncodedString()
        s = s.replacingOccurrences(of: "+", with: "-")
             .replacingOccurrences(of: "/", with: "_")
             .replacingOccurrences(of: "=", with: "")
        return s
    }
    private func base64urlDecode(_ s: String) -> Data? {
        var b64 = s.replacingOccurrences(of: "-", with: "+").replacingOccurrences(of: "_", with: "/")
        while b64.count % 4 != 0 { b64 += "=" }
        return Data(base64Encoded: b64)
    }

    private func normalizeAESKey(_ d: Data) -> Data {
        [16,24,32].contains(d.count) ? d : Data(SHA256.hash(data: d))
    }

    private func jwk(from pk: P256.Signing.PrivateKey, ops:[String], ext:Bool) -> NSDictionary {
        let pub = pk.publicKey.x963Representation
        return [
            "kty":"EC","crv":"P-256","alg":"ES256","ext":ext,"key_ops":ops,
            "d":base64urlEncode(pk.rawRepresentation),
            "x":base64urlEncode(pub[1..<33]),"y":base64urlEncode(pub[33..<65])
        ]
    }
    private func jwk(from pk: P256.Signing.PublicKey, ops:[String], ext:Bool) -> NSDictionary {
        let pub = pk.x963Representation
        return [
            "kty":"EC","crv":"P-256","alg":"ES256","ext":ext,"key_ops":ops,
            "x":base64urlEncode(pub[1..<33]),"y":base64urlEncode(pub[33..<65])
        ]
    }
    private func jwk(fromAgreement pk: P256.KeyAgreement.PrivateKey, ops:[String], ext:Bool) -> NSDictionary {
        let pub = pk.publicKey.x963Representation
        return [
            "kty":"EC","crv":"P-256","alg":"ECDH-ES","ext":ext,"key_ops":ops,
            "d":base64urlEncode(pk.rawRepresentation),
            "x":base64urlEncode(pub[1..<33]),"y":base64urlEncode(pub[33..<65])
        ]
    }
    private func jwk(fromAgreement pk: P256.KeyAgreement.PublicKey, ops:[String], ext:Bool) -> NSDictionary {
        let pub = pk.x963Representation
        return [
            "kty":"EC","crv":"P-256","alg":"ECDH-ES","ext":ext,"key_ops":ops,
            "x":base64urlEncode(pub[1..<33]),"y":base64urlEncode(pub[33..<65])
        ]
    }

    private func publicKey(from jwk:NSDictionary) -> P256.Signing.PublicKey? {
        guard let x = (jwk["x"] as? String).flatMap(base64urlDecode),
              let y = (jwk["y"] as? String).flatMap(base64urlDecode) else { return nil }
        var bytes = Data([0x04]); bytes.append(x); bytes.append(y)
        return try? P256.Signing.PublicKey(x963Representation: bytes)
    }
    private func privateKey(from jwk:NSDictionary) -> P256.KeyAgreement.PrivateKey? {
        guard let dStr = jwk["d"] as? String, let d = base64urlDecode(dStr) else { return nil }
        return try? P256.KeyAgreement.PrivateKey(rawRepresentation: d)
    }
    private func publicKeyAgreement(from jwk:NSDictionary) -> P256.KeyAgreement.PublicKey? {
        guard let x = (jwk["x"] as? String).flatMap(base64urlDecode),
              let y = (jwk["y"] as? String).flatMap(base64urlDecode) else { return nil }
        var bytes = Data([0x04]); bytes.append(x); bytes.append(y)
        return try? P256.KeyAgreement.PublicKey(x963Representation: bytes)
    }
}

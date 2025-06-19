import Foundation
import CryptoKit
import CommonCrypto         // PBKDF2
import Security             // SecKey import/export

// MARK: - Internal helpers ----------------------------------------------------

private enum WCError: Error {
    case unsupportedAlg(String)
    case invalidKeyHandle
    case badParam(String)
}

/// Tiny in-memory key store – we never persist keys.
private final class KeyStore: @unchecked Sendable {
    static let shared = KeyStore()
    private var map  = [String: Any]()
    private let lock = NSLock()

    func put(_ key: Any) -> String {
        lock.lock(); defer { lock.unlock() }
        let h = UUID().uuidString
        map[h] = key
        return h
    }
    func get<T>(_ h: String, as _: T.Type) throws -> T {
        lock.lock(); defer { lock.unlock() }
        guard let k = map[h] as? T else { throw WCError.invalidKeyHandle }
        return k
    }
    func remove(_ h: String) { lock.lock(); defer { lock.unlock() }; map.removeValue(forKey: h) }
}

// MARK: - Module --------------------------------------------------------------

@objcMembers
public final class NativeWebCryptoModule: NSObject, LynxModule {

    // Lynx registration -------------------------------------------------------
    @objc public static var name: String { "NativeWebCryptoModule" }
    @objc public static var methodLookup: [String: String] {
        return [
            "digest"           : NSStringFromSelector(#selector(digest(_:data:))),
            "generateKey"      : NSStringFromSelector(#selector(generateKey(_:extractable:keyUsages:))),
            "importKey"        : NSStringFromSelector(#selector(importKey(_:keyData:algorithm:extractable:keyUsages:))),
            "exportKey"        : NSStringFromSelector(#selector(exportKey(_:keyHandle:))),
            "encrypt"          : NSStringFromSelector(#selector(encrypt(_:keyHandle:data:))),
            "decrypt"          : NSStringFromSelector(#selector(decrypt(_:keyHandle:data:))),
            "sign"             : NSStringFromSelector(#selector(sign(_:keyHandle:data:))),
            "verify"           : NSStringFromSelector(#selector(verify(_:keyHandle:signature:data:))),
            "deriveBits"       : NSStringFromSelector(#selector(deriveBits(_:baseKeyHandle:length:))),
            "getRandomValues"  : NSStringFromSelector(#selector(getRandomValues(_:))),
            "textEncode"       : NSStringFromSelector(#selector(textEncode(_:))),
            "textDecode"       : NSStringFromSelector(#selector(textDecode(_:)))
        ]
    }
    
    @objc public init(param: Any) {
        super.init()
    }
    
    /**
     Default initializer.
     */
    @objc public override init() {
        super.init()
    }

    // MARK: - Public Web-Crypto methods ---------------------------------------

    /**
     digest({ name: "SHA-256" }, dataBase64)
     → Promise<base64Digest>
     */
    @objc
    public func digest(
        _ algorithm: NSDictionary,
        data dataB64: String
    ) -> String {
        do {
            let name = try Self.algName(from: algorithm)
            let data = try Data(base64Encoded: dataB64).unwrap("Bad base64")
            let hash: Data

            switch name {
                case "SHA-256": hash = Data(SHA256.hash(data: data))
                case "SHA-384": hash = Data(SHA384.hash(data: data))
                case "SHA-512": hash = Data(SHA512.hash(data: data))
                default: throw WCError.unsupportedAlg(name)
            }
            return hash.base64EncodedString()
        } catch {
            return "\(error)"
        }
    }

    /**
     generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt","decrypt"])
     → Promise<{ publicKeyHandle?, privateKeyHandle?, secretKeyHandle }>
     */
    @objc
    public func generateKey(
        _ algorithm: NSDictionary,
        extractable: Bool,
        keyUsages: [String]
    ) -> NSDictionary {
        do {
            let name = try Self.algName(from: algorithm)
            switch name {
            case "AES-GCM":
                let len = (algorithm["length"] as? Int) ?? 256
                guard [128,192,256].contains(len) else { throw WCError.badParam("length") }
                let keyData = SymmetricKey(size: .init(bitCount: len))
                let h = KeyStore.shared.put(keyData)
                
                return ["secretKeyHandle": h]
                
            case "ECDSA":
                let priv = P256.Signing.PrivateKey()
                let pub  = priv.publicKey
                return [
                    "privateKey": KeyStore.shared.put(priv),
                    "publicKey" : KeyStore.shared.put(pub)
                ]
                
            case "ECDH":
                let priv = P256.KeyAgreement.PrivateKey()
                let pub  = priv.publicKey
                return [
                    "privateKey": KeyStore.shared.put(priv),
                    "publicKey" : KeyStore.shared.put(pub)
                ]
                
            default: throw WCError.unsupportedAlg(name)
            }
        } catch {
            return ["error": "\(error)"]
        }
    }

    /**
     importKey("raw", base64Key, { name: "AES-GCM" }, true, ["encrypt"])
     → Promise<keyHandle>
     Supports "raw" and "jwk" formats for AES, and "jwk" for P-256 public/private keys.
     */
    @objc
    public func importKey(
        _ format: String,
        keyData: Any,
        algorithm: NSDictionary,
        extractable: Bool,
        keyUsages: [String]
    ) -> String {
        do {
            let algName = try Self.algName(from: algorithm)
            switch (format, algName) {
                case ("raw", "AES-GCM"):
                    guard let keyB64   = keyData as? String,
                          let keyBytes = Data(base64Encoded: keyB64)
                    else { throw WCError.badParam("keyData") }

                    let key = SymmetricKey(data: keyBytes)
                    let h = KeyStore.shared.put(key)
                    return h

                case ("jwk", "AES-GCM"):
                    guard
                        let jwk = keyData as? [String: Any],
                        jwk["kty"] as? String == "oct",
                        let kB64u = jwk["k"] as? String
                    else { throw WCError.badParam("JWK missing kty:oct or k parameter") }

                    // Decode base64url key material
                    let keyBytes = Data(base64URL: kB64u)
                    let key = SymmetricKey(data: keyBytes)
                    let h = KeyStore.shared.put(key)
                    return h

                case ("jwk", "ECDSA"), ("jwk", "ECDH"):
                    guard
                        let jwk = keyData as? [String:Any],
                        jwk["kty"] as? String == "EC",
                        let xB64u = jwk["x"] as? String,
                        let yB64u = jwk["y"] as? String
                    else { throw WCError.badParam("JWK") }

                    let x = Data(base64URL: xB64u)
                    let y = Data(base64URL: yB64u)

                    let h: String
                    
                    // Check if this is a private key (has 'd' parameter)
                    if let dB64u = jwk["d"] as? String {
                        let d = Data(base64URL: dB64u)
                        
                        if algName == "ECDSA" {
                            let privKey = try P256.Signing.PrivateKey(rawRepresentation: d)
                            h = KeyStore.shared.put(privKey)
                        } else {                // "ECDH"
                            let privKey = try P256.KeyAgreement.PrivateKey(rawRepresentation: d)
                            h = KeyStore.shared.put(privKey)
                        }
                    } else {
                        // Public key only - construct from x,y coordinates
                        // 0x04 || X || Y  (uncompressed SEC1 form)
                        var raw = Data([0x04])
                        raw.append(x); raw.append(y)

                        if algName == "ECDSA" {
                            let pub = try P256.Signing.PublicKey(rawRepresentation: raw)
                            h = KeyStore.shared.put(pub)
                        } else {                // "ECDH"
                            let pub = try P256.KeyAgreement.PublicKey(rawRepresentation: raw)
                            h = KeyStore.shared.put(pub)
                        }
                    }
                    return h
                    
                default: throw WCError.unsupportedAlg("\(format)+\(algName)")
            }
        } catch {
            return "\(error)"
        }
    }

    /**
     exportKey("raw", keyHandle) OR exportKey("jwk", keyHandle)
     → Promise<base64 | JWK dict>
     */
    @objc
    public func exportKey(
        _ format: String,
        keyHandle: String
    ) -> NSDictionary {
        do {
            if format == "raw" {
                let key: SymmetricKey = try KeyStore.shared.get(keyHandle, as: SymmetricKey.self)
                return [
                    "raw": key.withUnsafeBytes { Data($0).base64EncodedString() }
                ]
            }
            if format == "jwk" {
                // Try AES symmetric key first
                if let key: SymmetricKey = try? KeyStore.shared.get(keyHandle, as: SymmetricKey.self) {
                    let keyBytes = key.withUnsafeBytes { Data($0) }
                    let keyLength = keyBytes.count * 8 // bits
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
        } catch { return ["error": "\(error)"] }
    }

    /**
     encrypt({ name:"AES-GCM", iv: base64IV }, keyH, plainB64)
     → Promise<base64Cipher>
     */
    @objc
    public func encrypt(
        _ algorithm: NSDictionary,
        keyHandle: String,
        data plainB64: String
    ) -> String {
        do {
            let iv = try Self.iv(from: algorithm)
            let key: SymmetricKey = try KeyStore.shared.get(keyHandle, as: SymmetricKey.self)
            let plain = try Data(base64Encoded: plainB64).unwrap("Bad base64")
            let sealed = try AES.GCM.seal(plain, using: key, nonce: AES.GCM.Nonce(data: iv))
            return sealed.combined!.base64EncodedString();
        } catch {
            return "\(error)"
        }
    }

    /** decrypt is analog to encrypt ---------------------------------------------------- */
    @objc
    public func decrypt(
        _ algorithm: NSDictionary,
        keyHandle: String,
        data cipherB64: String
    ) -> String {
        do {
            let key: SymmetricKey = try KeyStore.shared.get(keyHandle, as: SymmetricKey.self)
            let combined = try Data(base64Encoded: cipherB64).unwrap("Bad base64")
            let box = try AES.GCM.SealedBox(combined: combined)
            let plain = try AES.GCM.open(box, using: key)
            return plain.base64EncodedString()
        } catch { return "\(error)" }
    }

    // MARK: - sign / verify (ECDSA-P256-SHA256) --------------------------------

    @objc
    public func sign(
        _ algorithm: NSDictionary,
        keyHandle: String,
        data msgB64: String
    ) -> String {
        do {
            let priv: P256.Signing.PrivateKey = try KeyStore.shared.get(keyHandle, as: P256.Signing.PrivateKey.self)
            let msg = try Data(base64Encoded: msgB64).unwrap("Bad base64")
            let sig = try priv.signature(for: msg)
            return sig.derRepresentation.base64EncodedString()
        } catch { return "\(error)" }
    }

    @objc
    public func verify(
        _ algorithm: NSDictionary,
        keyHandle: String,
        signature sigB64: String,
        data msgB64: String
    ) -> NSNumber {
        do {
            let pub: P256.Signing.PublicKey = try KeyStore.shared.get(keyHandle, as: P256.Signing.PublicKey.self)
            let msg = try Data(base64Encoded: msgB64).unwrap("Bad base64")
            let sig = try P256.Signing.ECDSASignature(derRepresentation: Data(base64Encoded: sigB64)!)
            return NSNumber(value: pub.isValidSignature(sig, for: msg))
        } catch {
            return 0
        }
    }

    // MARK: - deriveBits (PBKDF2) ---------------------------------------------

    @objc
    public func deriveBits(
        _ algorithm: NSDictionary,
        baseKeyHandle: String,
        length: NSNumber?
    ) -> String {
        do {
            guard let saltB64 = algorithm["salt"] as? String,
                  let iter = algorithm["iterations"] as? Int,
                  let hashName = (algorithm["hash"] as? [String:String])?["name"]
            else { throw WCError.badParam("PBKDF2 params") }

            let salt = try Data(base64Encoded: saltB64).unwrap("Bad salt")
            let secret: SymmetricKey = try KeyStore.shared.get(baseKeyHandle, as: SymmetricKey.self)

            let prf: CCPBKDFAlgorithm = (hashName == "SHA-256") ? UInt32(kCCPRFHmacAlgSHA256)
                                                                : UInt32(kCCPRFHmacAlgSHA512)

            let outputLength = length?.intValue ?? 32
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
        } catch {
            return "\(error)"
        }
    }

    // MARK: - Utility methods ------------------------------------------------

    /**
     getRandomValues(length)
     → base64 random bytes
     
     Generates cryptographically secure random bytes using the system's secure random number generator.
     Compatible with Web Crypto API's crypto.getRandomValues() but returns base64 instead of TypedArray.
     */
    @objc
    public func getRandomValues(
        _ length: Int
    ) -> String {
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

    /**
     textEncode(text)
     → base64 encoded UTF-8 bytes
     
     Equivalent to new TextEncoder().encode(text) but returns base64 string.
     */
    @objc
    public func textEncode(
        _ text: String
    ) -> String {
        let utf8Data = text.data(using: .utf8) ?? Data()
        return utf8Data.base64EncodedString()
    }

    /**
     textDecode(base64Data)
     → decoded UTF-8 string
     
     Equivalent to new TextDecoder().decode(data) but takes base64 string input.
     */
    @objc
    public func textDecode(
        _ base64Data: String
    ) -> String {
        guard let data = Data(base64Encoded: base64Data),
              let decoded = String(data: data, encoding: .utf8) else {
            return "TypeError: Failed to decode base64 or invalid UTF-8"
        }
        return decoded
    }

    // MARK: - helpers ----------------------------------------------------------

    private static func algName(from dict: NSDictionary) throws -> String {
        guard let n = dict["name"] as? String else { throw WCError.badParam("name") }
        return n.uppercased()
    }
    
    private static func iv(from dict: NSDictionary) throws -> Data {
        guard let ivB64 = dict["iv"] as? String,
              let iv = Data(base64Encoded: ivB64), iv.count == 12
        else { throw WCError.badParam("iv") }
        return iv
    }
}

// MARK: - tiny Data helpers ----------------------------------------------------

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

private extension P256.KeyAgreement.PublicKey {
    var xy:(Data,Data) {
        let raw = self.rawRepresentation         // 65 bytes 0x04||X||Y
        return (raw[1..<33], raw[33..<65])
    }
}

private extension P256.Signing.PublicKey {
    var xy:(Data,Data) {
        let raw = self.rawRepresentation         // 65 bytes 0x04||X||Y
        return (raw[1..<33], raw[33..<65])
    }
}

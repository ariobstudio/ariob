package com.ariobstudio.ariob.modules


import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi
import com.lynx.jsbridge.LynxModule
import com.lynx.jsbridge.LynxMethod
import java.math.BigInteger
import java.security.*
import java.security.interfaces.ECPrivateKey
import java.security.interfaces.ECPublicKey
import java.security.spec.*
import java.util.*
import javax.crypto.*
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

/**
 * Native WebCrypto module for Android/Kotlin.
 *
 * This class exposes cryptographic primitives following the WebCrypto
 * specification.  It relies solely on the Android platform’s standard
 * cryptographic providers: SecureRandom for random values, MessageDigest for
 * hashing, KeyPairGenerator/KeyAgreement/Signature for elliptic curve
 * operations and Cipher for AES‑GCM.  PBKDF2 is implemented using
 * SecretKeyFactory with HMAC‑SHA256.  No external dependencies are used, in
 * accordance with Android security best practices which recommend AES‑GCM
 * encryption and SHA‑2 based algorithms
 *
 * All methods take and return simple Kotlin types (maps, lists, byte arrays)
 * which can easily be bridged to JavaScript via LynxJS/React Native.  Keys
 * are represented as JWK‑like maps when imported/exported.
 */
class NativeWebCryptoModule(context: Context) : LynxModule(context) {

    // region Digest
    /**
     * Compute a hash of the provided data using the requested algorithm.  The
     * algorithm map must contain a `name` entry (case‑insensitive) equal to
     * "SHA-1", "SHA-256", "SHA-384" or "SHA-512".  The data may be a
     * ByteArray or a Map representing a JavaScript Uint8Array (index:value).
     */
    @LynxMethod
    fun digest(algorithm: Map<String, Any>, data: Any): ByteArray? {
        val name = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return null
        val input = convertToByteArray(data) ?: return null
        val md = when (name) {
            "SHA-1" -> MessageDigest.getInstance("SHA-1")
            "SHA-256" -> MessageDigest.getInstance("SHA-256")
            "SHA-384" -> MessageDigest.getInstance("SHA-384")
            "SHA-512" -> MessageDigest.getInstance("SHA-512")
            else -> return null
        }
        return md.digest(input)
    }

    // endregion

    // region Key generation
    /**
     * Generate a cryptographic key.  Supported algorithms include:
     * - AES‑GCM: supply `algorithm["length"]` (128,192,256).  Returns a JWK map
     *   with kty="oct" and base64url encoded key material.
     * - ECDSA: P‑256 signing key pair.  Returns a map with `privateKey` and
     *   `publicKey` entries containing JWK maps.
     * - ECDH: P‑256 key agreement key pair.  Only usages "deriveBits" and
     *   "deriveKey" are kept for the private key.
     */
    @LynxMethod
    @RequiresApi(Build.VERSION_CODES.O)
    fun generateKey(
        algorithm: Map<String, Any>,
        extractable: Boolean,
        keyUsages: List<String>
    ): Map<String, Any>? {
        val name = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return null
        return when (name) {
            "AES-GCM" -> {
                val bits = (algorithm["length"] as? Number)?.toInt() ?: 256
                if (bits !in listOf(128, 192, 256)) return null
                val keyBytes = ByteArray(bits / 8)
                SecureRandom().nextBytes(keyBytes)
                mapOf(
                    "kty" to "oct",
                    "k" to base64UrlEncode(keyBytes),
                    "alg" to "A${bits}GCM",
                    "ext" to extractable,
                    "key_ops" to keyUsages
                )
            }
            "ECDSA" -> {
                val curve = (algorithm["namedCurve"] as? String)?.uppercase(Locale.ROOT) ?: return null
                if (curve != "P-256") return null
                val kpg = KeyPairGenerator.getInstance("EC")
                val ecSpec = ECGenParameterSpec("secp256r1")
                kpg.initialize(ecSpec, SecureRandom())
                val kp = kpg.generateKeyPair()
                val priv = kp.private as ECPrivateKey
                val pub = kp.public as ECPublicKey
                mapOf(
                    "privateKey" to jwkFromSigningPrivate(priv, pub, listOf("sign"), extractable),
                    "publicKey" to jwkFromSigningPublic(pub, listOf("verify"), true)
                )
            }
            "ECDH" -> {
                val curve = (algorithm["namedCurve"] as? String)?.uppercase(Locale.ROOT) ?: return null
                if (curve != "P-256") return null
                val kpg = KeyPairGenerator.getInstance("EC")
                val ecSpec = ECGenParameterSpec("secp256r1")
                kpg.initialize(ecSpec, SecureRandom())
                val kp = kpg.generateKeyPair()
                val priv = kp.private as ECPrivateKey
                val pub = kp.public as ECPublicKey
                val allowedOps = keyUsages.filter { it == "deriveBits" || it == "deriveKey" }
                mapOf(
                    "privateKey" to jwkFromAgreementPrivate(priv, pub, allowedOps, extractable),
                    "publicKey" to jwkFromAgreementPublic(pub, emptyList(), true)
                )
            }
            else -> null
        }
    }

    // endregion

    // region Key export / import
    /**
     * Export a key either as a JWK map or as raw bytes.  For AES keys the
     * `raw` format returns the secret key bytes.  For EC public keys the raw
     * format returns the uncompressed point (0x04 || x || y).  Private EC keys
     * are not exported in raw form.
     */
    @LynxMethod
    @RequiresApi(Build.VERSION_CODES.O)
    fun exportKey(format: String, key: Map<String, Any>): Any? {
        return when (format.lowercase(Locale.ROOT)) {
            "jwk" -> key
            "raw" -> {
                val kty = key["kty"] as? String
                if (kty == "oct") {
                    val kStr = key["k"] as? String ?: return null
                    return base64UrlDecode(kStr)
                } else if (kty == "EC") {
                    val x = key["x"] as? String ?: return null
                    val y = key["y"] as? String ?: return null
                    val xBytes = base64UrlDecode(x) ?: return null
                    val yBytes = base64UrlDecode(y) ?: return null
                    val result = ByteArray(1 + xBytes.size + yBytes.size)
                    result[0] = 0x04
                    System.arraycopy(xBytes, 0, result, 1, xBytes.size)
                    System.arraycopy(yBytes, 0, result, 1 + xBytes.size, yBytes.size)
                    result
                } else {
                    null
                }
            }
            else -> null
        }
    }

    /**
     * Import a key from JWK or raw bytes.  For AES‑GCM raw import, the input
     * must be a ByteArray; it will be normalized to 128/192/256 bits by
     * hashing with SHA‑256 if necessary.  For JWK import, the provided map
     * will be returned with `ext` and `key_ops` fields updated.
     */
    @LynxMethod
    @RequiresApi(Build.VERSION_CODES.O)
    fun importKey(
        format: String,
        keyData: Any,
        algorithm: Map<String, Any>,
        extractable: Boolean,
        keyUsages: List<String>
    ): Map<String, Any>? {
        val name = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return null
        return when (format.lowercase(Locale.ROOT) to name) {
            "raw" to "AES-GCM" -> {
                val raw = convertToByteArray(keyData) ?: return null
                val norm = normalizeAESKey(raw)
                val bits = norm.size * 8
                mapOf(
                    "kty" to "oct",
                    "k" to base64UrlEncode(norm),
                    "alg" to "A${bits}GCM",
                    "ext" to extractable,
                    "key_ops" to keyUsages
                )
            }
            else -> {
                if (format.lowercase(Locale.ROOT) == "jwk") {
                    val jwk = (keyData as? Map<*, *>)?.toMutableMap() ?: return null
                    jwk["ext"] = extractable
                    jwk["key_ops"] = keyUsages
                    @Suppress("UNCHECKED_CAST")
                    return jwk as Map<String, Any>
                }
                null
            }
        }
    }
    // endregion

    // region Sign / Verify
    /**
     * Sign the given data with an ECDSA private key.  The key must be a JWK
     * containing base64url encoded `d`, `x` and `y`.  The algorithm
     * dictionary must have name "ECDSA".  Returns the DER‑encoded signature
     * or null on error.
     */
    @LynxMethod
    @RequiresApi(Build.VERSION_CODES.O)
    fun sign(algorithm: Map<String, Any>, key: Map<String, Any>, data: Any): ByteArray? {
        val algName = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return null
        if (algName != "ECDSA") return null
        val dStr = key["d"] as? String ?: return null
        val xStr = key["x"] as? String ?: return null
        val yStr = key["y"] as? String ?: return null
        val d = base64UrlDecode(dStr) ?: return null
        val x = base64UrlDecode(xStr) ?: return null
        val y = base64UrlDecode(yStr) ?: return null
        val dataBytes = convertToByteArray(data) ?: return null
        val ecSpec = getECParameterSpec() ?: return null
        val privSpec = ECPrivateKeySpec(BigInteger(1, d), ecSpec)
        val kf = KeyFactory.getInstance("EC")
        val privKey = kf.generatePrivate(privSpec)
        val sig = Signature.getInstance("SHA256withECDSA")
        sig.initSign(privKey)
        sig.update(dataBytes)
        return sig.sign()
    }

    /**
     * Verify an ECDSA signature over data.  Requires an EC public key JWK.
     * Returns true if the signature is valid.  The signature must be DER
     * encoded as produced by the sign() method.
     */
    @LynxMethod
    @RequiresApi(Build.VERSION_CODES.O)
    fun verify(
        algorithm: Map<String, Any>,
        key: Map<String, Any>,
        signature: Any,
        data: Any
    ): Boolean {
        val algName = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return false
        if (algName != "ECDSA") return false
        val xStr = key["x"] as? String ?: return false
        val yStr = key["y"] as? String ?: return false
        val x = base64UrlDecode(xStr) ?: return false
        val y = base64UrlDecode(yStr) ?: return false
        val sigBytes = convertToByteArray(signature) ?: return false
        val dataBytes = convertToByteArray(data) ?: return false
        val ecSpec = getECParameterSpec() ?: return false
        val pubSpec = ECPublicKeySpec(ECPoint(BigInteger(1, x), BigInteger(1, y)), ecSpec)
        val kf = KeyFactory.getInstance("EC")
        val pubKey = kf.generatePublic(pubSpec)
        val sig = Signature.getInstance("SHA256withECDSA")
        sig.initVerify(pubKey)
        sig.update(dataBytes)
        return sig.verify(sigBytes)
    }
    // endregion

    // region Encrypt / Decrypt
    /**
     * Encrypt data using AES‑GCM.  The `algorithm` map must contain an
     * `iv` ByteArray and may optionally contain `additionalData`.  The `key`
     * map must be a JWK with a base64url encoded `k` field.  The result is
     * the ciphertext followed by the 16‑byte authentication tag.
     */
    @LynxMethod
    @RequiresApi(Build.VERSION_CODES.O)
    fun encrypt(algorithm: Map<String, Any>, key: Map<String, Any>, data: Any): ByteArray? {
        val algName = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return null
        if (algName != "AES-GCM") return null
        val iv = convertToByteArray(algorithm["iv"] ?: return null) ?: return null
        val kStr = key["k"] as? String ?: return null
        val kBytes = base64UrlDecode(kStr) ?: return null
        val plain = convertToByteArray(data) ?: return null
        val aad = algorithm["additionalData"]?.let { convertToByteArray(it) }
        val keyBytes = normalizeAESKey(kBytes)
        val secretKey = SecretKeySpec(keyBytes, "AES")
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val spec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec)
        if (aad != null) cipher.updateAAD(aad)
        return cipher.doFinal(plain)
    }

    /**
     * Decrypt data encrypted with AES‑GCM.  The input data must be the
     * ciphertext followed by the 16‑byte authentication tag.  The same `iv`
     * and optional `additionalData` must be provided as during encryption.
     */
    @LynxMethod
    @RequiresApi(Build.VERSION_CODES.O)
    fun decrypt(algorithm: Map<String, Any>, key: Map<String, Any>, data: Any): ByteArray? {
        val algName = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return null
        if (algName != "AES-GCM") return null
        val iv = convertToByteArray(algorithm["iv"] ?: return null) ?: return null
        val kStr = key["k"] as? String ?: return null
        val kBytes = base64UrlDecode(kStr) ?: return null
        val cipherData = convertToByteArray(data) ?: return null
        val aad = algorithm["additionalData"]?.let { convertToByteArray(it) }
        val keyBytes = normalizeAESKey(kBytes)
        val secretKey = SecretKeySpec(keyBytes, "AES")
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val spec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
        if (aad != null) cipher.updateAAD(aad)
        return try {
            cipher.doFinal(cipherData)
        } catch (e: AEADBadTagException) {
            null
        }
    }

    /**
     * Encrypt a base64 encoded plaintext using AES‑GCM and return separate
     * base64 encoded ciphertext and authentication tag.  This mirrors the
     * NativeScript crypto API and makes it easier to interoperate with code
     * expecting separate cipher and tag values.  The provided key, plaintext,
     * AAD and IV must be standard Base64 strings (not base64url).  The tag
     * length is specified in bits (default 128).
     *
     * @param key Base64 encoded AES key
     * @param plaint Base64 encoded plaintext
     * @param aad Base64 encoded additional authenticated data; an empty
     *            string means no AAD
     * @param iv Base64 encoded initialization vector
     * @param tagLength Tag length in bits (default 128)
     * @return A map with keys "cipherb" and "atag" containing Base64 strings
     */
    @RequiresApi(Build.VERSION_CODES.O)
    @LynxMethod
    fun encryptAES256GCM(
        key: String,
        plaint: String,
        aad: String,
        iv: String,
        tagLength: Int = 128
    ): Map<String, String>? {
        return try {
            val keyBytes = Base64.getDecoder().decode(key)
            val plainBytes = Base64.getDecoder().decode(plaint)
            val aadBytes = if (aad.isNotEmpty()) Base64.getDecoder().decode(aad) else ByteArray(0)
            val ivBytes = Base64.getDecoder().decode(iv)
            val normalizedKey = normalizeAESKey(keyBytes)
            val secretKey = SecretKeySpec(normalizedKey, "AES")
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            val spec = GCMParameterSpec(tagLength, ivBytes)
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec)
            if (aadBytes.isNotEmpty()) cipher.updateAAD(aadBytes)
            val out = cipher.doFinal(plainBytes)
            val tagBytes = tagLength / 8
            val cipherb = out.copyOfRange(0, out.size - tagBytes)
            val atag = out.copyOfRange(out.size - tagBytes, out.size)
            mapOf(
                "cipherb" to Base64.getEncoder().encodeToString(cipherb),
                "atag" to Base64.getEncoder().encodeToString(atag)
            )
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Decrypt a base64 encoded ciphertext and authentication tag using AES‑GCM.
     * All inputs must be standard Base64 strings.  The plaintext is returned
     * as a Base64 encoded string.  This complements encryptAES256GCM().
     *
     * @param key Base64 encoded AES key
     * @param cipherb Base64 encoded ciphertext
     * @param aad Base64 encoded additional authenticated data
     * @param iv Base64 encoded initialization vector
     * @param atag Base64 encoded authentication tag
     * @return Base64 encoded plaintext or null on failure
     */
    @RequiresApi(Build.VERSION_CODES.O)
    @LynxMethod
    fun decryptAES256GCM(
        key: String,
        cipherb: String,
        aad: String,
        iv: String,
        atag: String
    ): String? {
        return try {
            val keyBytes = Base64.getDecoder().decode(key)
            val cipherBytes = Base64.getDecoder().decode(cipherb)
            val aadBytes = if (aad.isNotEmpty()) Base64.getDecoder().decode(aad) else ByteArray(0)
            val ivBytes = Base64.getDecoder().decode(iv)
            val tagBytes = Base64.getDecoder().decode(atag)
            val normalizedKey = normalizeAESKey(keyBytes)
            val secretKey = SecretKeySpec(normalizedKey, "AES")
            val tagLengthBits = tagBytes.size * 8
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            val spec = GCMParameterSpec(tagLengthBits, ivBytes)
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
            if (aadBytes.isNotEmpty()) cipher.updateAAD(aadBytes)
            // Concatenate cipher and tag
            val input = ByteArray(cipherBytes.size + tagBytes.size)
            System.arraycopy(cipherBytes, 0, input, 0, cipherBytes.size)
            System.arraycopy(tagBytes, 0, input, cipherBytes.size, tagBytes.size)
            val plain = cipher.doFinal(input)
            Base64.getEncoder().encodeToString(plain)
        } catch (_: Exception) {
            null
        }
    }
    // endregion

    // region deriveBits / deriveKey
    /**
     * Derive raw bits from a base key.  Supports ECDH and PBKDF2.  The
     * resulting byte array has length equal to `length` in bits divided by 8.
     * For ECDH the algorithm map must contain a `public` JWK for the peer.
     * For PBKDF2 the `baseKey` must include a `rawData` base64url string.
     */
    @LynxMethod
    @RequiresApi(Build.VERSION_CODES.O)
    fun deriveBits(
        algorithm: Map<String, Any>,
        baseKey: Map<String, Any>,
        length: Int
    ): ByteArray? {
        val name = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return null
        val byteCount = length / 8
        return when (name) {
            "ECDH" -> {
                val priv = privateKeyFromJwk(baseKey) ?: return null
                val peerJwkAny = algorithm["public"] as? Map<*, *> ?: return null
                val peerJwk = peerJwkAny as Map<String, Any>
                val peerPub = publicKeyFromJwk(peerJwk) ?: return null
                val ka = KeyAgreement.getInstance("ECDH")
                ka.init(priv)
                ka.doPhase(peerPub, true)
                val secret = ka.generateSecret()
                hkdf(secret, ByteArray(0), ByteArray(0), byteCount)
            }
            "PBKDF2" -> {
                val pwdStr = baseKey["rawData"] as? String ?: return null
                val pwdRaw = base64UrlDecode(pwdStr) ?: return null
                val saltDataAny = algorithm["salt"] ?: return null
                val saltData = convertToByteArray(saltDataAny) ?: return null
                val iterations = (algorithm["iterations"] as? Number)?.toInt() ?: 0
                val skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                // Convert raw bytes to char array by interpreting each byte as ISO-8859-1 char.
                val pwdChars = pwdRaw.toString(Charsets.ISO_8859_1).toCharArray()
                val spec = PBEKeySpec(pwdChars, saltData, iterations, length)
                skf.generateSecret(spec).encoded
            }
            else -> null
        }
    }

    /**
     * Derive a new key (wrapped as a JWK) from a base key using ECDH or
     * PBKDF2.  The `derivedKeyType` map must include a `length` entry
     * specifying the key size in bits.  Returns a JWK map for an AES‑GCM
     * symmetric key.
     */
    @LynxMethod
    @RequiresApi(Build.VERSION_CODES.O)
    fun deriveKey(
        algorithm: Map<String, Any>,
        baseKey: Map<String, Any>,
        derivedKeyType: Map<String, Any>,
        extractable: Boolean,
        keyUsages: List<String>
    ): Map<String, Any>? {
        val bits = (derivedKeyType["length"] as? Number)?.toInt() ?: return null
        val raw = deriveBits(algorithm, baseKey, bits) ?: return null
        return mapOf(
            "kty" to "oct",
            "k" to base64UrlEncode(raw),
            "alg" to "A${bits}GCM",
            "ext" to extractable,
            "key_ops" to keyUsages
        )
    }
    // endregion

    // region Text encoding/decoding and random values
    /** Encode a UTF‑8 string into a byte array. */
    @LynxMethod
    fun textEncode(text: String): ByteArray {
        return text.toByteArray(Charsets.UTF_8)
    }
    /** Decode a UTF‑8 encoded byte array into a string. */
    @LynxMethod
    fun textDecode(data: ByteArray): String {
        return String(data, Charsets.UTF_8)
    }
    /**
     * Fill a buffer with cryptographically secure random bytes.  The length
     * must be between 0 and 65536 bytes; outside this range returns null as
     * mandated by the WebCrypto specification【408000048587121†L128-L160】.
     */
    @LynxMethod
    fun getRandomValues(length: Int): ByteArray? {
        if (length < 0 || length > 65536) return null
        if (length == 0) return ByteArray(0)
        val bytes = ByteArray(length)
        SecureRandom().nextBytes(bytes)
        return bytes
    }
    // endregion

    // region Helper functions
    /** Convert an arbitrary JavaScript value into a ByteArray.  Accepts
     * ByteArray directly or a Map representing a JavaScript Uint8Array
     * (index:value). */
    private fun convertToByteArray(input: Any?): ByteArray? {
        return when (input) {
            null -> null
            is ByteArray -> input
            is IntArray -> input.map { it.toByte() }.toByteArray()
            is List<*> -> {
                val bytes = ByteArray(input.size)
                for (i in input.indices) {
                    val num = (input[i] as? Number)?.toInt() ?: return null
                    bytes[i] = num.toByte()
                }
                bytes
            }
            is Map<*, *> -> {
                val values = input.values.toList()
                val bytes = ByteArray(values.size)
                for (i in values.indices) {
                    val num = (values[i] as? Number)?.toInt() ?: return null
                    bytes[i] = num.toByte()
                }
                bytes
            }
            is String -> input.toByteArray(Charsets.UTF_8)
            else -> null
        }
    }

    /** Compute the SHA‑256 digest of data unless it is already of length
     * 16/24/32 bytes, in which case it is returned unchanged.  This is used
     * to normalize AES keys to valid lengths【841229793092621†L164-L168】. */
    private fun normalizeAESKey(data: ByteArray): ByteArray {
        return if (data.size == 16 || data.size == 24 || data.size == 32) {
            data
        } else {
            val md = MessageDigest.getInstance("SHA-256")
            md.digest(data)
        }
    }

    /** Base64url encode a byte array without padding. */
    @RequiresApi(Build.VERSION_CODES.O)
    private fun base64UrlEncode(data: ByteArray): String {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data)
    }
    /** Base64url decode a string.  Returns null on invalid input. */
    @RequiresApi(Build.VERSION_CODES.O)
    private fun base64UrlDecode(s: String): ByteArray? {
        return try {
            Base64.getUrlDecoder().decode(s)
        } catch (e: IllegalArgumentException) {
            null
        }
    }
    /** Convert a BigInteger to a 32‑byte array, padded with leading zeros. */
    private fun bigIntTo32Bytes(big: BigInteger): ByteArray {
        var bytes = big.toByteArray()
        if (bytes.size == 33 && bytes[0].toInt() == 0) {
            bytes = bytes.copyOfRange(1, 33)
        }
        if (bytes.size < 32) {
            val padded = ByteArray(32)
            System.arraycopy(bytes, 0, padded, 32 - bytes.size, bytes.size)
            return padded
        }
        return bytes
    }
    /** Retrieve the standard P‑256 EC parameter spec. */
    private fun getECParameterSpec(): ECParameterSpec? {
        return try {
            val params = AlgorithmParameters.getInstance("EC")
            params.init(ECGenParameterSpec("secp256r1"))
            params.getParameterSpec(ECParameterSpec::class.java)
        } catch (e: Exception) {
            null
        }
    }
    /** Construct a JWK map from an ECDSA private key. */
    @RequiresApi(Build.VERSION_CODES.O)
    private fun jwkFromSigningPrivate(priv: ECPrivateKey, pub: ECPublicKey, ops: List<String>, ext: Boolean): Map<String, Any> {
        val x = bigIntTo32Bytes(pub.w.affineX)
        val y = bigIntTo32Bytes(pub.w.affineY)
        return mapOf(
            "kty" to "EC",
            "crv" to "P-256",
            "alg" to "ES256",
            "ext" to ext,
            "key_ops" to ops,
            "d" to base64UrlEncode(bigIntTo32Bytes(priv.s)),
            "x" to base64UrlEncode(x),
            "y" to base64UrlEncode(y)
        )
    }
    /** Construct a JWK map from an ECDSA public key. */
    @RequiresApi(Build.VERSION_CODES.O)
    private fun jwkFromSigningPublic(pub: ECPublicKey, ops: List<String>, ext: Boolean): Map<String, Any> {
        val x = bigIntTo32Bytes(pub.w.affineX)
        val y = bigIntTo32Bytes(pub.w.affineY)
        return mapOf(
            "kty" to "EC",
            "crv" to "P-256",
            "alg" to "ES256",
            "ext" to ext,
            "key_ops" to ops,
            "x" to base64UrlEncode(x),
            "y" to base64UrlEncode(y)
        )
    }
    /** Construct a JWK map from an ECDH private key. */
    @RequiresApi(Build.VERSION_CODES.O)
    private fun jwkFromAgreementPrivate(priv: ECPrivateKey, pub: ECPublicKey, ops: List<String>, ext: Boolean): Map<String, Any> {
        val x = bigIntTo32Bytes(pub.w.affineX)
        val y = bigIntTo32Bytes(pub.w.affineY)
        return mapOf(
            "kty" to "EC",
            "crv" to "P-256",
            "alg" to "ECDH-ES",
            "ext" to ext,
            "key_ops" to ops,
            "d" to base64UrlEncode(bigIntTo32Bytes(priv.s)),
            "x" to base64UrlEncode(x),
            "y" to base64UrlEncode(y)
        )
    }
    /** Construct a JWK map from an ECDH public key. */
    @RequiresApi(Build.VERSION_CODES.O)
    private fun jwkFromAgreementPublic(pub: ECPublicKey, ops: List<String>, ext: Boolean): Map<String, Any> {
        val x = bigIntTo32Bytes(pub.w.affineX)
        val y = bigIntTo32Bytes(pub.w.affineY)
        return mapOf(
            "kty" to "EC",
            "crv" to "P-256",
            "alg" to "ECDH-ES",
            "ext" to ext,
            "key_ops" to ops,
            "x" to base64UrlEncode(x),
            "y" to base64UrlEncode(y)
        )
    }
    /** Create an EC private key from a JWK map. */
    @RequiresApi(Build.VERSION_CODES.O)
    private fun privateKeyFromJwk(jwk: Map<String, Any>): PrivateKey? {
        val dStr = jwk["d"] as? String ?: return null
        val d = base64UrlDecode(dStr) ?: return null
        val ecSpec = getECParameterSpec() ?: return null
        val privSpec = ECPrivateKeySpec(BigInteger(1, d), ecSpec)
        val kf = KeyFactory.getInstance("EC")
        return kf.generatePrivate(privSpec)
    }
    /** Create an EC public key from a JWK map. */
    @RequiresApi(Build.VERSION_CODES.O)
    private fun publicKeyFromJwk(jwk: Map<String, Any>): PublicKey? {
        val xStr = jwk["x"] as? String ?: return null
        val yStr = jwk["y"] as? String ?: return null
        val x = base64UrlDecode(xStr) ?: return null
        val y = base64UrlDecode(yStr) ?: return null
        val ecSpec = getECParameterSpec() ?: return null
        val pubSpec = ECPublicKeySpec(ECPoint(BigInteger(1, x), BigInteger(1, y)), ecSpec)
        val kf = KeyFactory.getInstance("EC")
        return kf.generatePublic(pubSpec)
    }
    /** Perform HKDF using HMAC‑SHA256.  Implements the extract‑and‑expand
     * operation defined in RFC 5869.  Takes input keying material (ikm), an
     * optional salt and info, and the desired output length in bytes. */
    @RequiresApi(Build.VERSION_CODES.O)
    private fun hkdf(
        ikm: ByteArray,
        salt: ByteArray,
        info: ByteArray,
        length: Int
    ): ByteArray {
        val mac = Mac.getInstance("HmacSHA256")
        // HKDF-Extract
        val prk: ByteArray = run {
            val keySpec = SecretKeySpec(if (salt.isEmpty()) ByteArray(mac.macLength) else salt, "HmacSHA256")
            mac.init(keySpec)
            mac.doFinal(ikm)
        }
        // HKDF-Expand
        val n = (length + mac.macLength - 1) / mac.macLength
        var previous = ByteArray(0)
        val result = ByteArray(length)
        mac.init(SecretKeySpec(prk, "HmacSHA256"))
        var offset = 0
        for (i in 1..n) {
            mac.reset()
            mac.update(previous)
            mac.update(info)
            mac.update(i.toByte())
            previous = mac.doFinal()
            val bytesToCopy = if (offset + previous.size > length) length - offset else previous.size
            System.arraycopy(previous, 0, result, offset, bytesToCopy)
            offset += bytesToCopy
        }
        return result
    }
    // endregion
}
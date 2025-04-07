package com.lynx.explorer.modules

import android.content.Context
import android.security.keystore.KeyProperties
import android.util.Base64
import android.util.Log
import com.lynx.jsbridge.LynxMethod
import com.lynx.jsbridge.LynxModule
import com.lynx.tasm.behavior.LynxContext
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.math.BigInteger
import java.nio.ByteBuffer
import java.nio.charset.StandardCharsets
import java.security.*
import java.security.interfaces.ECPrivateKey
import java.security.interfaces.ECPublicKey
import java.security.spec.*
import javax.crypto.*
import javax.crypto.spec.*

// BouncyCastle imports
import org.bouncycastle.jce.ECNamedCurveTable
import org.bouncycastle.jce.interfaces.ECPublicKey as BCECPublicKey
import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec
import org.bouncycastle.crypto.agreement.ECDHBasicAgreement
import org.bouncycastle.crypto.params.ECDomainParameters
import org.bouncycastle.crypto.params.ECPrivateKeyParameters
import org.bouncycastle.crypto.params.ECPublicKeyParameters

class NativeWebCryptoModule(context: Context) : LynxModule(context) {
    private val TAG = "NativeWebCryptoModule"

    companion object {
        // Constants for curve information (P-256 parameters)
        // These are standard parameters for the NIST P-256 curve (secp256r1)
        private val P256_FIELD_SIZE = 256
        private val P256_CURVE_NAME = "secp256r1" // Android's name for P-256 curve

        // Standard P-256 curve parameters - these are well-known constants
        private val P256_P = BigInteger("115792089210356248762697446949407573530086143415290314195533631308867097853951")
        private val P256_A = BigInteger("-3")
        private val P256_B = BigInteger("5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b", 16)
        private val P256_G_X = BigInteger("6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296", 16)
        private val P256_G_Y = BigInteger("4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5", 16)
        private val P256_N = BigInteger("115792089210356248762697446949407573529996955224135760342422259061068512044369")
        private val P256_H = BigInteger.ONE

        // Initialize the BouncyCastle provider
        init {
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(BouncyCastleProvider())
            }
        }
    }

    // MARK: - Helper Methods for JSON and Base64

    private fun parseJSONObject(jsonString: String): JSONObject? {
        return try {
            JSONObject(jsonString)
        } catch (e: JSONException) {
            Log.e(TAG, "Failed to parse JSON object: $jsonString", e)
            null
        }
    }

    private fun parseJSONArray(jsonString: String): JSONArray? {
        return try {
            JSONArray(jsonString)
        } catch (e: JSONException) {
            Log.e(TAG, "Failed to parse JSON array: $jsonString", e)
            null
        }
    }

    // Base64URL encoding (RFC 4648 Section 5) - For JWK components
    private fun base64urlEncode(data: ByteArray): String {
        val base64 = Base64.encodeToString(data, Base64.NO_WRAP)
        return base64.replace("+", "-")
            .replace("/", "_")
            .replace("=", "")
    }

    // Base64URL decoding (RFC 4648 Section 5) - For JWK components
    private fun base64urlDecode(string: String): ByteArray? {
        return try {
            var base64 = string
            base64 = base64.replace("-", "+")
                .replace("_", "/")
            // Add padding if needed
            val padding = base64.length % 4
            if (padding > 0) {
                base64 += "=".repeat(4 - padding)
            }
            Base64.decode(base64, Base64.NO_WRAP)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to decode base64url: $string", e)
            null
        }
    }

    // Standard Base64 encode/decode for data transfer
    private fun base64Encode(data: ByteArray): String {
        return Base64.encodeToString(data, Base64.NO_WRAP)
    }

    private fun base64Decode(string: String): ByteArray? {
        return try {
            Base64.decode(string, Base64.NO_WRAP)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to decode base64: $string", e)
            null
        }
    }

    // MARK: - Error JSON Conversion
    private fun errorToJSON(message: String): String {
        val errorObj = JSONObject()
        try {
            errorObj.put("error", true)
            errorObj.put("message", message)
            Log.e(TAG, "Error: $message")
            return errorObj.toString()
        } catch (e: JSONException) {
            return "{\"error\": true, \"message\": \"Failed to serialize error object\"}"
        }
    }

    // MARK: - TextEncoder/TextDecoder Emulation
    @LynxMethod
    fun textEncode(text: String): String {
        try {
            val data = text.toByteArray(StandardCharsets.UTF_8)
            return base64Encode(data)
        } catch (e: Exception) {
            return errorToJSON("UTF-8 encoding failed: ${e.message}")
        }
    }

    @LynxMethod
    fun textDecode(data: String): String {
        try {
            val decodedData = base64Decode(data) ?: throw Exception("Base64 decoding failed")
            return String(decodedData, StandardCharsets.UTF_8)
        } catch (e: Exception) {
            return errorToJSON("Base64 or UTF-8 decoding failed: ${e.message}")
        }
    }

    // MARK: - Random Values Generator
    @LynxMethod
    fun getRandomValues(length: Int): String {
        if (length <= 0) {
            return errorToJSON("Length must be positive")
        }

        try {
            val randomBytes = ByteArray(length)
            SecureRandom().nextBytes(randomBytes)
            return base64Encode(randomBytes)
        } catch (e: Exception) {
            return errorToJSON("Failed to generate random bytes: ${e.message}")
        }
    }

    // MARK: - Digest Function
    @LynxMethod
    fun digest(options: String, data: String): String {
        try {
            val optionsObj = parseJSONObject(options) ?: throw Exception("Invalid options format")
            val algorithmName = optionsObj.getString("name")
            val inputData = base64Decode(data) ?: throw Exception("Invalid input data")

            val hashAlgo = when (algorithmName.uppercase()) {
                "SHA-256" -> "SHA-256"
                "SHA-384" -> "SHA-384"
                "SHA-512" -> "SHA-512"
                else -> throw Exception("Unsupported digest algorithm: $algorithmName")
            }

            val md = MessageDigest.getInstance(hashAlgo)
            val hash = md.digest(inputData)
            return base64Encode(hash)
        } catch (e: Exception) {
            return errorToJSON("Digest failed: ${e.message}")
        }
    }

    // Create P-256 Parameter Specs for EC key operations
    private fun getP256ParameterSpec(): ECParameterSpec {
        // Create the curve using standard P-256 parameters
        val curve = EllipticCurve(ECFieldFp(P256_P), P256_A, P256_B)
        val generator = ECPoint(P256_G_X, P256_G_Y)
        return ECParameterSpec(curve, generator, P256_N, P256_H.toInt())
    }

    // MARK: - EC Key JWK Creation Helpers
    private fun createECJWK(privateKey: ECPrivateKey, publicKey: ECPublicKey, keyOps: List<String>, extractable: Boolean): JSONObject? {
        try {
            // Get the private key data - convert to byte array with proper length
            val dBigInt = privateKey.s
            val dBytes = dBigInt.toByteArray()
            // Trim any leading zero byte if present (from two's complement representation)
            val privData = if (dBytes[0].toInt() == 0 && dBytes.size > 32) dBytes.copyOfRange(1, dBytes.size) else dBytes

            // Get public key coordinates
            val xBigInt = publicKey.w.affineX
            val yBigInt = publicKey.w.affineY

            // Convert to byte arrays with proper length (32 bytes for P-256)
            val xBytes = xBigInt.toByteArray()
            val xData = if (xBytes[0].toInt() == 0 && xBytes.size > 32) xBytes.copyOfRange(1, xBytes.size) else xBytes

            val yBytes = yBigInt.toByteArray()
            val yData = if (yBytes[0].toInt() == 0 && yBytes.size > 32) yBytes.copyOfRange(1, yBytes.size) else yBytes

            // Create JWK
            val jwk = JSONObject()
            jwk.put("kty", "EC")
            jwk.put("crv", "P-256")
            jwk.put("alg", "ES256")
            jwk.put("d", base64urlEncode(privData))
            jwk.put("x", base64urlEncode(xData))
            jwk.put("y", base64urlEncode(yData))
            jwk.put("ext", extractable)

            val keyOpsArray = JSONArray()
            for (op in keyOps) {
                keyOpsArray.put(op)
            }
            jwk.put("key_ops", keyOpsArray)

            return jwk
        } catch (e: Exception) {
            Log.e(TAG, "Failed to create EC JWK", e)
            return null
        }
    }

    private fun createECJWK(publicKey: ECPublicKey, keyOps: List<String>, extractable: Boolean): JSONObject? {
        try {
            // Get public key coordinates
            val xBigInt = publicKey.w.affineX
            val yBigInt = publicKey.w.affineY

            // Convert to byte arrays with proper length (32 bytes for P-256)
            val xBytes = xBigInt.toByteArray()
            val xData = if (xBytes[0].toInt() == 0 && xBytes.size > 32) xBytes.copyOfRange(1, xBytes.size) else xBytes

            val yBytes = yBigInt.toByteArray()
            val yData = if (yBytes[0].toInt() == 0 && yBytes.size > 32) yBytes.copyOfRange(1, yBytes.size) else yBytes

            // Create JWK
            val jwk = JSONObject()
            jwk.put("kty", "EC")
            jwk.put("crv", "P-256")
            jwk.put("alg", "ES256")
            jwk.put("x", base64urlEncode(xData))
            jwk.put("y", base64urlEncode(yData))
            jwk.put("ext", extractable)

            val keyOpsArray = JSONArray()
            for (op in keyOps) {
                keyOpsArray.put(op)
            }
            jwk.put("key_ops", keyOpsArray)

            return jwk
        } catch (e: Exception) {
            Log.e(TAG, "Failed to create EC JWK", e)
            return null
        }
    }

    // MARK: - AES Key Helper
    private fun normalizeAESKey(keyData: ByteArray): ByteArray {
        val keyBitSize = keyData.size * 8
        if (keyBitSize == 128 || keyBitSize == 192 || keyBitSize == 256) {
            return keyData
        }

        // Hash to 256 bits if not standard size
        val md = MessageDigest.getInstance("SHA-256")
        return md.digest(keyData)
    }

    private fun createSymmetricKeyFromJWK(jwk: JSONObject): SecretKey? {
        try {
            if (jwk.getString("kty") != "oct") return null

            val kBase64url = jwk.getString("k")
            val keyData = base64urlDecode(kBase64url) ?: return null
            val normalizedKey = normalizeAESKey(keyData)

            return SecretKeySpec(normalizedKey, "AES")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to create symmetric key from JWK", e)
            return null
        }
    }

    // MARK: - Web Crypto API Methods Implementation

    @LynxMethod
    fun generateKey(algorithm: String, extractable: Boolean, keyUsages: String): String {
        try {
            val algorithmObj = parseJSONObject(algorithm) ?: throw Exception("Invalid algorithm format")
            val algorithmName = algorithmObj.getString("name")
            val keyUsagesArray = parseJSONArray(keyUsages) ?: throw Exception("Invalid keyUsages format")

            val keyUsagesList = mutableListOf<String>()
            for (i in 0 until keyUsagesArray.length()) {
                keyUsagesList.add(keyUsagesArray.getString(i))
            }

            when (algorithmName.uppercase()) {
                "ECDSA" -> {
                    val namedCurve = algorithmObj.getString("namedCurve")
                    if (namedCurve.uppercase() != "P-256") {
                        return errorToJSON("Only P-256 curve is supported for ECDSA")
                    }

                    // Generate EC key pair
                    val kpg = KeyPairGenerator.getInstance("EC")
                    val parameterSpec = ECGenParameterSpec(P256_CURVE_NAME)
                    kpg.initialize(parameterSpec)
                    val keyPair = kpg.generateKeyPair()

                    // Create JWKs
                    val privateKey = keyPair.private as ECPrivateKey
                    val publicKey = keyPair.public as ECPublicKey

                    val privateJWK = createECJWK(
                        privateKey,
                        publicKey,
                        keyUsagesList.filter { it == "sign" },
                        extractable
                    ) ?: throw Exception("Failed to create private ECDSA JWK")

                    val publicJWK = createECJWK(
                        publicKey,
                        keyUsagesList.filter { it == "verify" },
                        true
                    ) ?: throw Exception("Failed to create public ECDSA JWK")

                    val resultObj = JSONObject()
                    resultObj.put("privateKey", privateJWK)
                    resultObj.put("publicKey", publicJWK)

                    return resultObj.toString()
                }

                "ECDH" -> {
                    val namedCurve = algorithmObj.getString("namedCurve")
                    if (namedCurve.uppercase() != "P-256") {
                        return errorToJSON("Only P-256 curve is supported for ECDH")
                    }

                    // Generate EC key pair
                    val kpg = KeyPairGenerator.getInstance("EC")
                    val parameterSpec = ECGenParameterSpec(P256_CURVE_NAME)
                    kpg.initialize(parameterSpec)
                    val keyPair = kpg.generateKeyPair()

                    // Create JWKs
                    val privateKey = keyPair.private as ECPrivateKey
                    val publicKey = keyPair.public as ECPublicKey

                    val allowedOps = keyUsagesList.filter { it == "deriveKey" || it == "deriveBits" }

                    val privateJWK = createECJWK(
                        privateKey,
                        publicKey,
                        allowedOps,
                        extractable
                    ) ?: throw Exception("Failed to create private ECDH JWK")
                    privateJWK.put("alg", "ECDH-ES")

                    val publicJWK = createECJWK(
                        publicKey,
                        emptyList(),
                        true
                    ) ?: throw Exception("Failed to create public ECDH JWK")
                    publicJWK.put("alg", "ECDH-ES")

                    val resultObj = JSONObject()
                    resultObj.put("privateKey", privateJWK)
                    resultObj.put("publicKey", publicJWK)

                    return resultObj.toString()
                }

                "AES-GCM" -> {
                    val keySize = algorithmObj.optInt("length", 256)
                    if (keySize != 128 && keySize != 192 && keySize != 256) {
                        return errorToJSON("AES key size must be 128, 192, or 256 bits")
                    }

                    // Generate AES key
                    val keyGen = KeyGenerator.getInstance("AES")
                    keyGen.init(keySize)
                    val secretKey = keyGen.generateKey()

                    // Create JWK
                    val keyJwk = JSONObject()
                    keyJwk.put("kty", "oct")
                    keyJwk.put("k", base64urlEncode(secretKey.encoded))
                    keyJwk.put("alg", "A${keySize}GCM")
                    keyJwk.put("ext", extractable)

                    val keyOpsArray = JSONArray()
                    for (usage in keyUsagesList) {
                        keyOpsArray.put(usage)
                    }
                    keyJwk.put("key_ops", keyOpsArray)

                    return keyJwk.toString()
                }

                else -> return errorToJSON("Unsupported algorithm for generateKey: $algorithmName")
            }
        } catch (e: Exception) {
            return errorToJSON("Error during key generation: ${e.message}")
        }
    }

    @LynxMethod
    fun exportKey(format: String, key: String): String {
        try {
            val keyObj = parseJSONObject(key) ?: throw Exception("Invalid key format")
            val kty = keyObj.getString("kty")

            val isPublicKey = !keyObj.has("d")
            if (!isPublicKey && keyObj.has("ext") && !keyObj.getBoolean("ext")) {
                return errorToJSON("Key is not extractable")
            }

            when (format.lowercase()) {
                "jwk" -> {
                    return keyObj.toString()
                }
                "raw" -> {
                    if (kty == "oct") {
                        val kBase64url = keyObj.getString("k")
                        val keyData = base64urlDecode(kBase64url) ?: throw Exception("Invalid 'oct' key material")
                        return base64Encode(keyData)
                    } else {
                        return errorToJSON("Raw export format only supported for 'oct' keys")
                    }
                }
                else -> return errorToJSON("Unsupported export format: $format")
            }
        } catch (e: Exception) {
            return errorToJSON("Error during key export: ${e.message}")
        }
    }

    @LynxMethod
    fun importKey(format: String, keyDataString: String, algorithm: String, extractable: Boolean, keyUsages: String): String {
        try {
            val algorithmObj = parseJSONObject(algorithm) ?: throw Exception("Invalid algorithm format")
            val algorithmName = algorithmObj.getString("name")
            val keyUsagesArray = parseJSONArray(keyUsages) ?: throw Exception("Invalid keyUsages format")

            val keyUsagesList = mutableListOf<String>()
            for (i in 0 until keyUsagesArray.length()) {
                keyUsagesList.add(keyUsagesArray.getString(i))
            }

            var importedJWK: JSONObject? = null

            when (format.lowercase()) {
                "jwk" -> {
                    val jwk = parseJSONObject(keyDataString) ?: throw Exception("Invalid JWK data")
                    val kty = jwk.getString("kty")

                    when (algorithmName.uppercase()) {
                        "ECDSA" -> {
                            if (kty != "EC" || jwk.getString("crv") != "P-256" || !jwk.has("x") || !jwk.has("y")) {
                                return errorToJSON("JWK is not a valid P-256 EC key for ECDSA")
                            }
                            jwk.put("alg", "ES256")
                        }
                        "ECDH" -> {
                            if (kty != "EC" || jwk.getString("crv") != "P-256" || !jwk.has("x") || !jwk.has("y")) {
                                return errorToJSON("JWK is not a valid P-256 EC key for ECDH")
                            }
                            jwk.put("alg", "ECDH-ES")
                        }
                        "AES-GCM" -> {
                            if (kty != "oct" || !jwk.has("k")) {
                                return errorToJSON("JWK is not a valid octet key for AES-GCM")
                            }
                            val kBase64url = jwk.getString("k")
                            val kData = base64urlDecode(kBase64url) ?: throw Exception("Invalid key data in JWK")
                            val keySize = normalizeAESKey(kData).size * 8
                            if (keySize != 128 && keySize != 192 && keySize != 256) {
                                return errorToJSON("Imported AES key material has invalid size")
                            }
                            jwk.put("alg", "A${keySize}GCM")
                        }
                        "PBKDF2" -> return errorToJSON("JWK import not supported for PBKDF2 base key (use 'raw')")
                        else -> return errorToJSON("Unsupported algorithm for JWK import: $algorithmName")
                    }

                    jwk.put("ext", extractable)
                    val keyOpsArray = JSONArray()
                    for (usage in keyUsagesList) {
                        keyOpsArray.put(usage)
                    }
                    jwk.put("key_ops", keyOpsArray)

                    importedJWK = jwk
                }

                "raw" -> {
                    val rawData = base64Decode(keyDataString) ?: throw Exception("Invalid raw key data")

                    when (algorithmName.uppercase()) {
                        "AES-GCM" -> {
                            val normalizedKey = normalizeAESKey(rawData)
                            val keyBitSize = normalizedKey.size * 8

                            if (keyBitSize != 128 && keyBitSize != 192 && keyBitSize != 256) {
                                return errorToJSON("Raw AES key data has invalid size")
                            }

                            val jwk = JSONObject()
                            jwk.put("kty", "oct")
                            jwk.put("k", base64urlEncode(normalizedKey))
                            jwk.put("alg", "A${keyBitSize}GCM")
                            jwk.put("ext", extractable)

                            val keyOpsArray = JSONArray()
                            for (usage in keyUsagesList) {
                                keyOpsArray.put(usage)
                            }
                            jwk.put("key_ops", keyOpsArray)

                            importedJWK = jwk
                        }
                        "PBKDF2" -> {
                            val jwk = JSONObject()
                            jwk.put("kty", "PBKDF2-RAW")
                            jwk.put("rawData", base64Encode(rawData))
                            jwk.put("ext", false)

                            val keyOpsArray = JSONArray()
                            for (usage in keyUsagesList) {
                                keyOpsArray.put(usage)
                            }
                            jwk.put("key_ops", keyOpsArray)

                            importedJWK = jwk
                        }
                        else -> return errorToJSON("Raw import not supported for algorithm: $algorithmName")
                    }
                }

                else -> return errorToJSON("Unsupported import format: $format")
            }

            return importedJWK?.toString() ?: errorToJSON("Internal error during key import")
        } catch (e: Exception) {
            return errorToJSON("Error during key import: ${e.message}")
        }
    }

    @LynxMethod
    fun sign(algorithm: String, key: String, data: String): String {
        try {
            val algorithmObj = parseJSONObject(algorithm) ?: throw Exception("Invalid algorithm format")
            val algorithmName = algorithmObj.getString("name")

            if (algorithmName.uppercase() != "ECDSA") {
                return errorToJSON("Unsupported algorithm for sign: $algorithmName")
            }

            val keyObj = parseJSONObject(key) ?: throw Exception("Invalid key format")

            if (!keyObj.has("d")) {
                return errorToJSON("Private key required for signing")
            }

            val inputData = base64Decode(data) ?: throw Exception("Invalid input data")

            // Reconstruct private key from JWK
            val dBase64url = keyObj.getString("d")
            val xBase64url = keyObj.getString("x")
            val yBase64url = keyObj.getString("y")

            val dData = base64urlDecode(dBase64url) ?: throw Exception("Invalid 'd' component in key")
            val xData = base64urlDecode(xBase64url) ?: throw Exception("Invalid 'x' component in key")
            val yData = base64urlDecode(yBase64url) ?: throw Exception("Invalid 'y' component in key")

            // Create EC spec directly without ECNamedCurveTable
            val ecSpec = getP256ParameterSpec()

            val privateKeySpec = ECPrivateKeySpec(BigInteger(1, dData), ecSpec)
            val keyFactory = KeyFactory.getInstance("EC")
            val privateKey = keyFactory.generatePrivate(privateKeySpec)

            // Sign the data
            val signature = Signature.getInstance("SHA256withECDSA")
            signature.initSign(privateKey)
            signature.update(inputData)
            val signatureData = signature.sign()

            return base64Encode(signatureData)
        } catch (e: Exception) {
            return errorToJSON("Signing failed: ${e.message}")
        }
    }

    @LynxMethod
    fun verify(algorithm: String, key: String, signature: String, data: String): String {
        try {
            val algorithmObj = parseJSONObject(algorithm) ?: throw Exception("Invalid algorithm format")
            val algoName = algorithmObj.getString("name")

            if (algoName.uppercase() != "ECDSA") {
                return errorToJSON("Unsupported algorithm for verify: $algoName")
            }

            val keyObj = parseJSONObject(key) ?: throw Exception("Invalid key format")
            val inputData = base64Decode(data) ?: throw Exception("Invalid input data")
            val sigData = base64Decode(signature) ?: throw Exception("Invalid signature data")

            // Extract public key components
            val xBase64url = keyObj.getString("x")
            val yBase64url = keyObj.getString("y")

            val xData = base64urlDecode(xBase64url) ?: throw Exception("Invalid 'x' component in key")
            val yData = base64urlDecode(yBase64url) ?: throw Exception("Invalid 'y' component in key")

            // Create public key from components
            val keyFactory = KeyFactory.getInstance("EC")
            val pubPoint = ECPoint(BigInteger(1, xData), BigInteger(1, yData))
            val ecSpec = getP256ParameterSpec()

            val publicKeySpec = ECPublicKeySpec(pubPoint, ecSpec)
            val publicKey = keyFactory.generatePublic(publicKeySpec)

            // Verify signature
            val verifier = Signature.getInstance("SHA256withECDSA")
            verifier.initVerify(publicKey)
            verifier.update(inputData)
            val isValid = verifier.verify(sigData)

            return if (isValid) "true" else "false"
        } catch (e: Exception) {
            Log.e(TAG, "Verification error: ${e.message}")
            return "false" // Errors in verification process should result in false
        }
    }

    @LynxMethod
    fun encrypt(algorithm: String, key: String, data: String): String {
        try {
            val algorithmObj = parseJSONObject(algorithm) ?: throw Exception("Invalid algorithm format")
            val algorithmName = algorithmObj.getString("name")

            if (algorithmName.uppercase() != "AES-GCM") {
                return errorToJSON("Unsupported algorithm for encrypt: $algorithmName")
            }

            val keyObj = parseJSONObject(key) ?: throw Exception("Invalid key format")
            val inputData = base64Decode(data) ?: throw Exception("Invalid input data")
            val ivBase64 = algorithmObj.getString("iv")
            val iv = base64Decode(ivBase64) ?: throw Exception("Invalid IV")

            val symmetricKey = createSymmetricKeyFromJWK(keyObj) ?: throw Exception("Invalid symmetric key")

            // Optional additional authenticated data
            val aadBase64 = algorithmObj.optString("additionalData", null)
            val aad = if (aadBase64 != null) base64Decode(aadBase64) else null

            // Create GCM parameters
            val gcmParameterSpec = GCMParameterSpec(128, iv) // 128-bit authentication tag

            // Initialize cipher
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.ENCRYPT_MODE, symmetricKey, gcmParameterSpec)

            // Add AAD if provided
            if (aad != null) {
                cipher.updateAAD(aad)
            }

            // Encrypt
            val ciphertext = cipher.doFinal(inputData)

            return base64Encode(ciphertext)
        } catch (e: Exception) {
            return errorToJSON("Encryption failed: ${e.message}")
        }
    }

    @LynxMethod
    fun decrypt(algorithm: String, key: String, data: String): String {
        try {
            val algorithmObj = parseJSONObject(algorithm) ?: throw Exception("Invalid algorithm format")
            val algorithmName = algorithmObj.getString("name")

            if (algorithmName.uppercase() != "AES-GCM") {
                Log.e(TAG, "Decrypt: Unsupported algorithm: $algorithmName")
                return ""
            }

            val keyObj = parseJSONObject(key) ?: throw Exception("Invalid key format")
            val encryptedData = base64Decode(data) ?: throw Exception("Invalid encrypted data")
            val ivBase64 = algorithmObj.getString("iv")
            val iv = base64Decode(ivBase64) ?: throw Exception("Invalid IV")

            val symmetricKey = createSymmetricKeyFromJWK(keyObj) ?: throw Exception("Invalid symmetric key")

            // Optional additional authenticated data
            val aadBase64 = algorithmObj.optString("additionalData", null)
            val aad = if (aadBase64 != null) base64Decode(aadBase64) else null

            // Create GCM parameters
            val gcmParameterSpec = GCMParameterSpec(128, iv) // 128-bit authentication tag

            // Initialize cipher
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, symmetricKey, gcmParameterSpec)

            // Add AAD if provided
            if (aad != null) {
                cipher.updateAAD(aad)
            }

            // Decrypt
            val decryptedData = cipher.doFinal(encryptedData)

            return base64Encode(decryptedData)
        } catch (e: Exception) {
            Log.e(TAG, "Decrypt failed: ${e.message}")
            return "" // Return empty string on decrypt failure
        }
    }

    @LynxMethod
    fun deriveBits(algorithm: String, baseKey: String, length: Int): String {
        try {
            val algoObj = parseJSONObject(algorithm) ?: throw Exception("Invalid algorithm format")
            val algoName = algoObj.getString("name")

            if (length <= 0 || length % 8 != 0) {
                return errorToJSON("deriveBits length must be positive multiple of 8")
            }

            val derivedKeyLengthBytes = length / 8

            when (algoName.uppercase()) {
                "PBKDF2" -> {
                    // Process password data from base key
                    var passwordData: ByteArray? = null

                    // Check if baseKey is a PBKDF2-RAW JWK
                    val baseKeyObj = parseJSONObject(baseKey)
                    if (baseKeyObj != null && baseKeyObj.optString("kty") == "PBKDF2-RAW") {
                        val pwdB64 = baseKeyObj.getString("rawData")
                        passwordData = base64Decode(pwdB64)
                    } else {
                        // Try treating baseKey as raw base64 password
                        passwordData = base64Decode(baseKey)
                    }

                    if (passwordData == null) {
                        return errorToJSON("Invalid base key for PBKDF2")
                    }

                    return deriveBitsPBKDF2(passwordData, algoObj, derivedKeyLengthBytes)
                }

                "ECDH" -> {
                    // Base key = local private key JWK
                    val privateKeyJWK = parseJSONObject(baseKey) ?: throw Exception("Invalid base key format")
                    val dBase64url = privateKeyJWK.getString("d")
                    val privateKeyData = base64urlDecode(dBase64url) ?: throw Exception("Invalid private key data")

                    // Get peer public key from algorithm params
                    val peerPublicKeyJWK = algoObj.getJSONObject("public")
                    val xBase64url = peerPublicKeyJWK.getString("x")
                    val yBase64url = peerPublicKeyJWK.getString("y")

                    val xData = base64urlDecode(xBase64url) ?: throw Exception("Invalid x coordinate")
                    val yData = base64urlDecode(yBase64url) ?: throw Exception("Invalid y coordinate")

                    // Create key objects
                    val keyFactory = KeyFactory.getInstance("EC")

                    // Create private key
                    val privateKeySpec = ECPrivateKeySpec(
                        BigInteger(1, privateKeyData),
                        getP256ParameterSpec()
                    )
                    val privateKey = keyFactory.generatePrivate(privateKeySpec)

                    // Create public key
                    val pubPoint = ECPoint(BigInteger(1, xData), BigInteger(1, yData))
                    val publicKeySpec = ECPublicKeySpec(pubPoint, getP256ParameterSpec())
                    val publicKey = keyFactory.generatePublic(publicKeySpec)

                    // Perform key agreement
                    val keyAgreement = KeyAgreement.getInstance("ECDH")
                    keyAgreement.init(privateKey)
                    keyAgreement.doPhase(publicKey, true)

                    // Get shared secret
                    val sharedSecret = keyAgreement.generateSecret()

                    // Derive the requested number of bytes using HKDF-SHA256
                    val derivedKey = hkdfDerive(sharedSecret, ByteArray(0), ByteArray(0), derivedKeyLengthBytes)

                    // Return derived bytes as BASE64URL
                    return base64urlEncode(derivedKey)
                }

                else -> return errorToJSON("Unsupported derivation algorithm: $algoName")
            }
        } catch (e: Exception) {
            return errorToJSON("Error in deriveBits: ${e.message}")
        }
    }

    // Helper function for PBKDF2 derivation
    private fun deriveBitsPBKDF2(passwordData: ByteArray, algoObj: JSONObject, derivedKeyLengthBytes: Int): String {
        try {
            val saltBase64 = algoObj.getString("salt")
            val saltData = base64Decode(saltBase64) ?: throw Exception("Invalid salt data")

            // Get iterations and hash algorithm
            val iterations = algoObj.optInt("iterations", 100000) // Default from SEA.js
            if (iterations <= 0) {
                return errorToJSON("PBKDF2 iterations must be positive")
            }

            val hashObj = algoObj.optJSONObject("hash")
            val hashAlgoName = hashObj?.optString("name", "SHA-256") ?: "SHA-256"

            // Determine the hash algorithm
            val algorithm = when (hashAlgoName.uppercase()) {
                "SHA-256" -> "PBKDF2WithHmacSHA256"
                "SHA-384" -> "PBKDF2WithHmacSHA384"
                "SHA-512" -> "PBKDF2WithHmacSHA512"
                else -> throw Exception("Unsupported hash for PBKDF2: $hashAlgoName")
            }

            // Create key factory and spec
            val factory = SecretKeyFactory.getInstance(algorithm)
            val spec = PBEKeySpec(
                String(passwordData, Charsets.UTF_8).toCharArray(),
                saltData,
                iterations,
                derivedKeyLengthBytes * 8 // Key length in bits
            )

            // Generate the key
            val secretKey = factory.generateSecret(spec)
            val derivedKey = secretKey.encoded

            return base64Encode(derivedKey)
        } catch (e: Exception) {
            return errorToJSON("PBKDF2 derivation failed: ${e.message}")
        }
    }

    // HKDF implementation for ECDH key derivation
    private fun hkdfDerive(ikm: ByteArray, salt: ByteArray, info: ByteArray, outputLength: Int): ByteArray {
        val effectiveSalt = if (salt.isEmpty()) ByteArray(32) else salt

        // Step 1: Extract
        val prk = hmacSha256(effectiveSalt, ikm)

        // Step 2: Expand
        val result = ByteArray(outputLength)
        val hashLen = 32 // SHA-256 hash length
        val iterations = (outputLength + hashLen - 1) / hashLen

        val t = ByteArray(hashLen)
        var lastT = ByteArray(0)

        for (i in 1..iterations) {
            val input = ByteArray(lastT.size + info.size + 1)
            System.arraycopy(lastT, 0, input, 0, lastT.size)
            System.arraycopy(info, 0, input, lastT.size, info.size)
            input[lastT.size + info.size] = i.toByte()

            lastT = hmacSha256(prk, input)

            val copyLength = if (i == iterations) {
                outputLength - (iterations - 1) * hashLen
            } else {
                hashLen
            }

            System.arraycopy(lastT, 0, result, (i - 1) * hashLen, copyLength)
        }

        return result
    }

    // HMAC-SHA256 implementation
    private fun hmacSha256(key: ByteArray, data: ByteArray): ByteArray {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(key, "HmacSHA256"))
        return mac.doFinal(data)
    }

    @LynxMethod
    fun deriveKey(algorithm: String, baseKey: String, derivedKeyType: String, extractable: Boolean, keyUsages: String): String {
        try {
            // Parse input parameters
            val algoObj = parseJSONObject(algorithm) ?: throw Exception("Invalid algorithm format")
            val algoName = algoObj.getString("name")
            val baseKeyObj = parseJSONObject(baseKey) ?: throw Exception("Invalid base key format")
            val derivedKeyAlgoObj = parseJSONObject(derivedKeyType) ?: throw Exception("Invalid derived key type format")
            val derivedKeyAlgoName = derivedKeyAlgoObj.getString("name")
            val keyUsagesArray = parseJSONArray(keyUsages) ?: throw Exception("Invalid key usages format")

            // Convert JSON array to List
            val targetKeyUsages = mutableListOf<String>()
            for (i in 0 until keyUsagesArray.length()) {
                targetKeyUsages.add(keyUsagesArray.getString(i))
            }

            when (algoName.uppercase()) {
                "ECDH" -> {
                    // Extract local private key from baseKeyObj
                    if (baseKeyObj.getString("kty") != "EC" || !baseKeyObj.has("d")) {
                        return errorToJSON("Invalid baseKey format for ECDH deriveKey")
                    }
                    val dBase64url = baseKeyObj.getString("d")
                    val privateKeyData = base64urlDecode(dBase64url) ?: throw Exception("Invalid private key data")

                    // Extract peer's public key from algorithm parameters
                    val peerPublicKeyJWK = algoObj.getJSONObject("public")
                    if (peerPublicKeyJWK.getString("kty") != "EC") {
                        return errorToJSON("Invalid peer public key format in algorithm parameters")
                    }
                    val xBase64url = peerPublicKeyJWK.getString("x")
                    val yBase64url = peerPublicKeyJWK.getString("y")
                    val xData = base64urlDecode(xBase64url) ?: throw Exception("Invalid x coordinate")
                    val yData = base64urlDecode(yBase64url) ?: throw Exception("Invalid y coordinate")

                    // Determine target key length and algorithm
                    val targetKeyLengthBits: Int
                    val targetKeyAlg: String

                    when (derivedKeyAlgoName.uppercase()) {
                        "AES-GCM" -> {
                            val length = derivedKeyAlgoObj.optInt("length", 256)
                            if (length != 128 && length != 192 && length != 256) {
                                return errorToJSON("Invalid or missing 'length' for AES-GCM derivedKeyType")
                            }
                            targetKeyLengthBits = length
                            targetKeyAlg = "A${length}GCM"
                        }
                        else -> return errorToJSON("Unsupported derivedKeyType algorithm: $derivedKeyAlgoName")
                    }

                    val targetKeyLengthBytes = targetKeyLengthBits / 8

                    // Create key objects using BouncyCastle for better compatibility
                    val ecSpec = ECNamedCurveTable.getParameterSpec("secp256r1") // P-256 curve

                    // Create private key
                    val privateKeyParams = ECPrivateKeyParameters(
                        BigInteger(1, privateKeyData),
                        ECDomainParameters(ecSpec.curve, ecSpec.g, ecSpec.n, ecSpec.h)
                    )

                    // Create public key point
                    val pubPoint = ecSpec.curve.createPoint(
                        BigInteger(1, xData),
                        BigInteger(1, yData)
                    )

                    // Create ECDH agreement
                    val agreement = ECDHBasicAgreement()
                    agreement.init(privateKeyParams)

                    // Create public key parameters
                    val publicKeyParams = ECPublicKeyParameters(
                        pubPoint,
                        ECDomainParameters(ecSpec.curve, ecSpec.g, ecSpec.n, ecSpec.h)
                    )

                    // Calculate shared secret
                    val sharedSecret = agreement.calculateAgreement(publicKeyParams)
                    val sharedSecretBytes = sharedSecret.toByteArray()

                    // Use HKDF to derive the symmetric key (match iOS implementation)
                    val derivedKeyData = hkdfDerive(
                        sharedSecretBytes,
                        ByteArray(0), // empty salt
                        ByteArray(0), // empty info
                        targetKeyLengthBytes
                    )

                    // Construct the JWK for the derived symmetric key
                    val derivedKeyJWK = JSONObject()
                    derivedKeyJWK.put("kty", "oct")
                    derivedKeyJWK.put("k", base64urlEncode(derivedKeyData))
                    derivedKeyJWK.put("alg", targetKeyAlg)
                    derivedKeyJWK.put("ext", extractable)

                    val keyOpsArray = JSONArray()
                    for (usage in targetKeyUsages) {
                        keyOpsArray.put(usage)
                    }
                    derivedKeyJWK.put("key_ops", keyOpsArray)

                    return derivedKeyJWK.toString()
                }

                "PBKDF2" -> {
                    // Extract password data from base key
                    var passwordData: ByteArray? = null

                    if (baseKeyObj.getString("kty") == "PBKDF2-RAW" && baseKeyObj.has("rawData")) {
                        val pwdB64 = baseKeyObj.getString("rawData")
                        passwordData = base64Decode(pwdB64)
                    } else if (baseKey.startsWith("{") && baseKey.endsWith("}")) {
                        // baseKey might already be a JSON string
                        return errorToJSON("Invalid base key format for PBKDF2 deriveKey")
                    } else {
                        // baseKey might be the raw base64 password string itself
                        passwordData = base64Decode(baseKey)
                    }

                    if (passwordData == null) {
                        return errorToJSON("Invalid base key for PBKDF2 deriveKey")
                    }

                    // Extract PBKDF2 parameters
                    val saltBase64 = algoObj.getString("salt")
                    val saltData = base64Decode(saltBase64) ?: throw Exception("Invalid salt data")
                    val iterations = algoObj.optInt("iterations", 100000)

                    if (iterations <= 0) {
                        return errorToJSON("PBKDF2 iterations must be positive")
                    }

                    val hashObj = algoObj.optJSONObject("hash")
                    val hashAlgoName = hashObj?.optString("name", "SHA-256") ?: "SHA-256"

                    // Determine the hash algorithm
                    val algorithm = when (hashAlgoName.uppercase()) {
                        "SHA-256" -> "PBKDF2WithHmacSHA256"
                        "SHA-384" -> "PBKDF2WithHmacSHA384"
                        "SHA-512" -> "PBKDF2WithHmacSHA512"
                        else -> throw Exception("Unsupported hash for PBKDF2: $hashAlgoName")
                    }

                    // Determine target key parameters
                    val targetKeyLengthBits: Int
                    val targetKeyAlg: String

                    when (derivedKeyAlgoName.uppercase()) {
                        "AES-GCM" -> {
                            val length = derivedKeyAlgoObj.optInt("length", 256)
                            if (length != 128 && length != 192 && length != 256) {
                                return errorToJSON("Invalid or missing 'length' for AES-GCM derivedKeyType")
                            }
                            targetKeyLengthBits = length
                            targetKeyAlg = "A${length}GCM"
                        }
                        else -> return errorToJSON("Unsupported derivedKeyType algorithm: $derivedKeyAlgoName")
                    }

                    val targetKeyLengthBytes = targetKeyLengthBits / 8

                    // Create key factory and spec
                    val factory = SecretKeyFactory.getInstance(algorithm)
                    val spec = PBEKeySpec(
                        String(passwordData, Charsets.UTF_8).toCharArray(),
                        saltData,
                        iterations,
                        targetKeyLengthBits
                    )

                    // Generate the key
                    val secretKey = factory.generateSecret(spec)
                    val derivedKeyData = secretKey.encoded

                    // Construct the JWK for the derived key
                    val derivedKeyJWK = JSONObject()
                    derivedKeyJWK.put("kty", "oct")
                    derivedKeyJWK.put("k", base64urlEncode(derivedKeyData))
                    derivedKeyJWK.put("alg", targetKeyAlg)
                    derivedKeyJWK.put("ext", extractable)

                    val keyOpsArray = JSONArray()
                    for (usage in targetKeyUsages) {
                        keyOpsArray.put(usage)
                    }
                    derivedKeyJWK.put("key_ops", keyOpsArray)

                    return derivedKeyJWK.toString()
                }

                else -> return errorToJSON("Unsupported derivation algorithm: $algoName")
            }
        } catch (e: Exception) {
            return errorToJSON("Error in deriveKey: ${e.message}")
        }
    }
}
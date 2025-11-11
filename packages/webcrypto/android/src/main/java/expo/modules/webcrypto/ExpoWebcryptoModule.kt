package expo.modules.webcrypto

import android.os.Build
import androidx.annotation.RequiresApi
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
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
 * Expo WebCrypto Module for Android
 *
 * Provides native WebCrypto API implementation using Android's cryptographic providers.
 * Implements digest, key generation, import/export, sign/verify, encrypt/decrypt, and key derivation.
 */
class ExpoWebcryptoModule : Module() {
  @RequiresApi(Build.VERSION_CODES.O)
  override fun definition() = ModuleDefinition {
    Name("ExpoWebcrypto")

    // ============================================================================
    // Digest
    // ============================================================================
    Function("digest") { algorithm: Map<String, Any>, data: Any ->
      val name = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return@Function null
      val input = convertToByteArray(data) ?: return@Function null
      val md = when (name) {
        "SHA-1" -> MessageDigest.getInstance("SHA-1")
        "SHA-256" -> MessageDigest.getInstance("SHA-256")
        "SHA-384" -> MessageDigest.getInstance("SHA-384")
        "SHA-512" -> MessageDigest.getInstance("SHA-512")
        else -> return@Function null
      }
      md.digest(input)
    }

    // ============================================================================
    // Key Generation
    // ============================================================================
    Function("generateKey") { algorithm: Map<String, Any>, extractable: Boolean, keyUsages: List<String> ->
      val name = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return@Function null
      when (name) {
        "AES-GCM" -> {
          val bits = (algorithm["length"] as? Number)?.toInt() ?: 256
          if (bits !in listOf(128, 192, 256)) return@Function null
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
          val curve = (algorithm["namedCurve"] as? String)?.uppercase(Locale.ROOT) ?: return@Function null
          if (curve != "P-256") return@Function null
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
          val curve = (algorithm["namedCurve"] as? String)?.uppercase(Locale.ROOT) ?: return@Function null
          if (curve != "P-256") return@Function null
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

    // ============================================================================
    // Key Import/Export
    // ============================================================================
    Function("exportKey") { format: String, key: Map<String, Any> ->
      when (format.lowercase(Locale.ROOT)) {
        "jwk" -> key
        "raw" -> {
          val kty = key["kty"] as? String
          if (kty == "oct") {
            val kStr = key["k"] as? String ?: return@Function null
            base64UrlDecode(kStr)
          } else if (kty == "EC") {
            val x = key["x"] as? String ?: return@Function null
            val y = key["y"] as? String ?: return@Function null
            val xBytes = base64UrlDecode(x) ?: return@Function null
            val yBytes = base64UrlDecode(y) ?: return@Function null
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

    Function("importKey") { format: String, keyData: Any, algorithm: Map<String, Any>, extractable: Boolean, keyUsages: List<String> ->
      val name = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return@Function null
      when (format.lowercase(Locale.ROOT) to name) {
        "raw" to "AES-GCM" -> {
          val raw = convertToByteArray(keyData) ?: return@Function null
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
            val jwk = (keyData as? Map<*, *>)?.toMutableMap() ?: return@Function null
            jwk["ext"] = extractable
            jwk["key_ops"] = keyUsages
            @Suppress("UNCHECKED_CAST")
            jwk as Map<String, Any>
          } else {
            null
          }
        }
      }
    }

    // ============================================================================
    // Sign/Verify
    // ============================================================================
    Function("sign") { algorithm: Map<String, Any>, key: Map<String, Any>, data: Any ->
      val algName = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return@Function null
      if (algName != "ECDSA") return@Function null
      val dStr = key["d"] as? String ?: return@Function null
      val xStr = key["x"] as? String ?: return@Function null
      val yStr = key["y"] as? String ?: return@Function null
      val d = base64UrlDecode(dStr) ?: return@Function null
      val x = base64UrlDecode(xStr) ?: return@Function null
      val y = base64UrlDecode(yStr) ?: return@Function null
      val dataBytes = convertToByteArray(data) ?: return@Function null
      val ecSpec = getECParameterSpec() ?: return@Function null
      val privSpec = ECPrivateKeySpec(BigInteger(1, d), ecSpec)
      val kf = KeyFactory.getInstance("EC")
      val privKey = kf.generatePrivate(privSpec)
      val sig = Signature.getInstance("SHA256withECDSA")
      sig.initSign(privKey)
      sig.update(dataBytes)
      sig.sign()
    }

    Function("verify") { algorithm: Map<String, Any>, key: Map<String, Any>, signature: Any, data: Any ->
      val algName = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return@Function false
      if (algName != "ECDSA") return@Function false
      val xStr = key["x"] as? String ?: return@Function false
      val yStr = key["y"] as? String ?: return@Function false
      val x = base64UrlDecode(xStr) ?: return@Function false
      val y = base64UrlDecode(yStr) ?: return@Function false
      val sigBytes = convertToByteArray(signature) ?: return@Function false
      val dataBytes = convertToByteArray(data) ?: return@Function false
      val ecSpec = getECParameterSpec() ?: return@Function false
      val pubSpec = ECPublicKeySpec(ECPoint(BigInteger(1, x), BigInteger(1, y)), ecSpec)
      val kf = KeyFactory.getInstance("EC")
      val pubKey = kf.generatePublic(pubSpec)
      val sig = Signature.getInstance("SHA256withECDSA")
      sig.initVerify(pubKey)
      sig.update(dataBytes)
      sig.verify(sigBytes)
    }

    // ============================================================================
    // Encrypt/Decrypt
    // ============================================================================
    Function("encrypt") { algorithm: Map<String, Any>, key: Map<String, Any>, data: Any ->
      val algName = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return@Function null
      if (algName != "AES-GCM") return@Function null
      val iv = convertToByteArray(algorithm["iv"] ?: return@Function null) ?: return@Function null
      val kStr = key["k"] as? String ?: return@Function null
      val kBytes = base64UrlDecode(kStr) ?: return@Function null
      val plain = convertToByteArray(data) ?: return@Function null
      val aad = algorithm["additionalData"]?.let { convertToByteArray(it) }
      val keyBytes = normalizeAESKey(kBytes)
      val secretKey = SecretKeySpec(keyBytes, "AES")
      val cipher = Cipher.getInstance("AES/GCM/NoPadding")
      val spec = GCMParameterSpec(128, iv)
      cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec)
      if (aad != null) cipher.updateAAD(aad)
      cipher.doFinal(plain)
    }

    Function("decrypt") { algorithm: Map<String, Any>, key: Map<String, Any>, data: Any ->
      val algName = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return@Function null
      if (algName != "AES-GCM") return@Function null
      val iv = convertToByteArray(algorithm["iv"] ?: return@Function null) ?: return@Function null
      val kStr = key["k"] as? String ?: return@Function null
      val kBytes = base64UrlDecode(kStr) ?: return@Function null
      val cipherData = convertToByteArray(data) ?: return@Function null
      val aad = algorithm["additionalData"]?.let { convertToByteArray(it) }
      val keyBytes = normalizeAESKey(kBytes)
      val secretKey = SecretKeySpec(keyBytes, "AES")
      val cipher = Cipher.getInstance("AES/GCM/NoPadding")
      val spec = GCMParameterSpec(128, iv)
      cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
      if (aad != null) cipher.updateAAD(aad)
      try {
        cipher.doFinal(cipherData)
      } catch (e: AEADBadTagException) {
        null
      }
    }

    // ============================================================================
    // Key Derivation
    // ============================================================================
    Function("deriveBits") { algorithm: Map<String, Any>, baseKey: Map<String, Any>, length: Int ->
      val name = (algorithm["name"] as? String)?.uppercase(Locale.ROOT) ?: return@Function null
      val byteCount = length / 8
      when (name) {
        "ECDH" -> {
          val priv = privateKeyFromJwk(baseKey) ?: return@Function null
          val peerJwkAny = algorithm["public"] as? Map<*, *> ?: return@Function null
          @Suppress("UNCHECKED_CAST")
          val peerJwk = peerJwkAny as Map<String, Any>
          val peerPub = publicKeyFromJwk(peerJwk) ?: return@Function null
          val ka = KeyAgreement.getInstance("ECDH")
          ka.init(priv)
          ka.doPhase(peerPub, true)
          val secret = ka.generateSecret()
          hkdf(secret, ByteArray(0), ByteArray(0), byteCount)
        }
        "PBKDF2" -> {
          val pwdStr = baseKey["rawData"] as? String ?: return@Function null
          val pwdRaw = base64UrlDecode(pwdStr) ?: return@Function null
          val saltDataAny = algorithm["salt"] ?: return@Function null
          val saltData = convertToByteArray(saltDataAny) ?: return@Function null
          val iterations = (algorithm["iterations"] as? Number)?.toInt() ?: 0
          val skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
          val pwdChars = pwdRaw.toString(Charsets.ISO_8859_1).toCharArray()
          val spec = PBEKeySpec(pwdChars, saltData, iterations, length)
          skf.generateSecret(spec).encoded
        }
        else -> null
      }
    }

    Function("deriveKey") { algorithm: Map<String, Any>, baseKey: Map<String, Any>, derivedKeyType: Map<String, Any>, extractable: Boolean, keyUsages: List<String> ->
      val bits = (derivedKeyType["length"] as? Number)?.toInt() ?: return@Function null
      val raw = deriveBits(algorithm, baseKey, bits) ?: return@Function null
      mapOf(
        "kty" to "oct",
        "k" to base64UrlEncode(raw),
        "alg" to "A${bits}GCM",
        "ext" to extractable,
        "key_ops" to keyUsages
      )
    }

    // ============================================================================
    // Random & Text Encoding
    // ============================================================================
    Function("getRandomValues") { length: Int ->
      if (length < 0 || length > 65536) return@Function null
      if (length == 0) return@Function ByteArray(0)
      val bytes = ByteArray(length)
      SecureRandom().nextBytes(bytes)
      bytes
    }

    Function("textEncode") { text: String ->
      text.toByteArray(Charsets.UTF_8)
    }

    Function("textDecode") { data: ByteArray ->
      String(data, Charsets.UTF_8)
    }
  }

  // ============================================================================
  // Helper Functions
  // ============================================================================

  @RequiresApi(Build.VERSION_CODES.O)
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

  private fun normalizeAESKey(data: ByteArray): ByteArray {
    return if (data.size == 16 || data.size == 24 || data.size == 32) {
      data
    } else {
      val md = MessageDigest.getInstance("SHA-256")
      md.digest(data)
    }
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun base64UrlEncode(data: ByteArray): String {
    return Base64.getUrlEncoder().withoutPadding().encodeToString(data)
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private fun base64UrlDecode(s: String): ByteArray? {
    return try {
      Base64.getUrlDecoder().decode(s)
    } catch (e: IllegalArgumentException) {
      null
    }
  }

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

  private fun getECParameterSpec(): ECParameterSpec? {
    return try {
      val params = AlgorithmParameters.getInstance("EC")
      params.init(ECGenParameterSpec("secp256r1"))
      params.getParameterSpec(ECParameterSpec::class.java)
    } catch (e: Exception) {
      null
    }
  }

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

  @RequiresApi(Build.VERSION_CODES.O)
  private fun privateKeyFromJwk(jwk: Map<String, Any>): PrivateKey? {
    val dStr = jwk["d"] as? String ?: return null
    val d = base64UrlDecode(dStr) ?: return null
    val ecSpec = getECParameterSpec() ?: return null
    val privSpec = ECPrivateKeySpec(BigInteger(1, d), ecSpec)
    val kf = KeyFactory.getInstance("EC")
    return kf.generatePrivate(privSpec)
  }

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

  @RequiresApi(Build.VERSION_CODES.O)
  private fun hkdf(ikm: ByteArray, salt: ByteArray, info: ByteArray, length: Int): ByteArray {
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
}

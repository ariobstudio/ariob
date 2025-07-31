  /*
  * WebCrypto polyfill bridging to native modules.
  *
  * This implementation exposes a subset of the WebCrypto API using a
  * React Native/LynxJS native module.  Supported algorithms mirror those
  * used by SEA.js: AES‑GCM for symmetric encryption, ECDSA and ECDH on
  * P‑256, PBKDF2 with SHA‑256, and SHA‑{1,256,384,512} digests.  Only JWK
  * and raw key formats are supported.  Additional algorithms (e.g. AES‑CBC,
  * HMAC, RSA) are intentionally omitted to reduce the attack surface.
  */

  const native = NativeModules?.NativeWebCryptoModule;

  // Helper: ensure value is an ArrayBuffer
  const toAB = (v) => (v instanceof ArrayBuffer ? v : v.buffer);
  // Helper: ensure value is a Uint8Array view of an ArrayBuffer
  const toU8 = (v) => {
    if (v instanceof Uint8Array) {
      return v;
    }
    const result = new Uint8Array(v);
    return result;
  };
  // Helper: wrap synchronous or asynchronous native return values into a promise
  const maybePromise = (x) => (x instanceof Promise ? x : Promise.resolve(x));

  // Normalize algorithm names from string or object
  const normalizeAlgorithm = (alg) => {
    if (typeof alg === 'string') return { name: alg };
    return { ...alg };
  };
  // Normalize hash algorithm names if present
  const normalizeHashAlgorithm = (hash) => {
    if (typeof hash === 'string') return { name: hash };
    return { ...hash };
  };
  // Prepare algorithm dictionaries: convert typed arrays to Uint8Array
  const prepareAlgorithm = (algorithm) => {
    const alg = { ...normalizeAlgorithm(algorithm) };
    if (alg.hash) alg.hash = normalizeHashAlgorithm(alg.hash);
    // Convert iv/additionalData/counter/salt/info to Uint8Array if present
    ["iv", "additionalData", "counter", "salt", "info"].forEach((key) => {
      const val = alg[key];
      if (val && (val instanceof ArrayBuffer || ArrayBuffer.isView(val))) {
        alg[key] = toU8(toAB(val));
      }
    });
    return alg;
  };

  if (!globalThis.crypto) globalThis.crypto = {};
  if (!globalThis.crypto.subtle) globalThis.crypto.subtle = {};

  // digest
  crypto.subtle.digest = (algorithm, data) => {
    console.log('---> [input] digest <algorithm =', algorithm, 'data =', data, '>')
    return maybePromise(
      native.digest(normalizeAlgorithm(algorithm), toU8(toAB(data)))
    ).then((res) => {
      console.log('---> [output] digest <res =', res, '>')
      if (res == null) throw new Error('digest failed');
      return toU8(res).buffer;
    });
  };

  // generateKey
  crypto.subtle.generateKey = (algorithm, extractable, usages) => {
    console.log('---> [input] generateKey <algorithm =', algorithm, 'extractable =', extractable, 'usages =', usages, '>')
    return maybePromise(
      native.generateKey(prepareAlgorithm(algorithm), !!extractable, Array.from(usages || []))
    ).then((key) => {
      console.log('---> [output] generateKey <key =', key, '>')
      if (key == null) throw new Error('generateKey failed');
      // Attach algorithm and usage information to the returned key objects
      const alg = prepareAlgorithm(algorithm);
      if (key.privateKey && key.publicKey) {
        if (!key.privateKey.algorithm) key.privateKey.algorithm = alg;
        if (!key.publicKey.algorithm) key.publicKey.algorithm = alg;
        key.privateKey.type = 'private';
        key.publicKey.type = 'public';
        key.privateKey.usages = Array.from(usages || []).filter((u) => ['sign', 'deriveBits', 'deriveKey'].includes(u));
        key.publicKey.usages = Array.from(usages || []).filter((u) => ['verify'].includes(u));
      } else {
        if (!key.algorithm) key.algorithm = alg;
        key.type = 'secret';
        key.usages = Array.from(usages || []);
      }
      return key;
    });
  };

  // importKey
  crypto.subtle.importKey = (format, keyData, algorithm, extractable, usages) => {
    console.log('---> [input] importKey <format =', format, 'keyData =', keyData, 'algorithm =', algorithm, 'extractable =', extractable, 'usages =', usages, '>')
    let param = keyData;
    if (format === 'raw' || format === 'spki' || format === 'pkcs8') {
      param = toU8(toAB(keyData));
    } else if (format === 'jwk' && typeof keyData === 'string') {
      try {
        param = JSON.parse(keyData);
      } catch (e) {
        return Promise.reject(new Error('Invalid JWK format'));
      }
    }
    return maybePromise(
      native.importKey(format, param, prepareAlgorithm(algorithm), !!extractable, Array.from(usages || []))
    ).then((r) => {
      console.log('---> [output] importKey <r =', r, '>')
      if (r == null) throw new Error('importKey failed');
      const alg = prepareAlgorithm(algorithm);
      if (!r.algorithm) r.algorithm = alg;
      if (!r.type) r.type = r.d ? 'private' : (r.kty === 'oct' ? 'secret' : 'public');
      if (!r.usages) r.usages = Array.from(usages || []);
      r.extractable = !!extractable;
      return r;
    });
  };

  // exportKey
  crypto.subtle.exportKey = (format, key) => {
    console.log('---> [input] exportKey <format =', format, 'key =', key, '>')
    return maybePromise(native.exportKey(format, key)).then((r) => {
      console.log('---> [output] exportKey <r =', r, '>')
      if (r == null) throw new Error('exportKey failed');
      if (format === 'raw' || format === 'spki' || format === 'pkcs8') {
        return toU8(r).buffer;
      }
      return r;
    });
  };

  // sign
  crypto.subtle.sign = (algorithm, key, data) => {
    console.log('---> [input] sign <algorithm =', algorithm, 'key =', key, 'data =', data, '>')
    return maybePromise(
      native.sign(prepareAlgorithm(algorithm), key, toU8(toAB(data)))
    ).then((r) => {
      console.log('---> [output] sign <r =', r, '>')
      if (r == null) throw new Error('sign failed');
      return toU8(r).buffer;
    });
  };

  // verify
  crypto.subtle.verify = (algorithm, key, signature, data) => {
    console.log('---> [input] verify <algorithm =', algorithm, 'key =', key, 'signature =', signature, 'data =', data, '>')
    return maybePromise(
      native.verify(prepareAlgorithm(algorithm), key, toU8(toAB(signature)), toU8(toAB(data)))
    ).then((x) => {
      console.log('---> [output] verify <x =', x, '>')
      return !!x;
    });
  };

  // encrypt
  crypto.subtle.encrypt = (algorithm, key, data) => {
    console.log('---> [input] encrypt <algorithm =', algorithm, 'key =', key, 'data =', data, '>')
    return maybePromise(
      native.encrypt(prepareAlgorithm(algorithm), key, toU8(toAB(data)))
    ).then((r) => {
      console.log('---> [output] encrypt <r =', r, '>')
      if (!r) throw new Error('encrypt failed');
      return toU8(r).buffer;
    });
  };

  // decrypt
  crypto.subtle.decrypt = (algorithm, key, data) => {
    console.log('---> [input] decrypt <algorithm =', algorithm, 'key =', key, 'data =', data, '>')
    return maybePromise(
      native.decrypt(prepareAlgorithm(algorithm), key, toU8(toAB(data)))
    ).then((r) => {
      console.log('---> [output] decrypt <r =', r, '>')
      if (!r) throw new Error('decrypt failed');
      return toU8(r).buffer;
    });
  };

  // deriveBits
  crypto.subtle.deriveBits = (algorithm, baseKey, length) => {
    console.log('---> [input] deriveBits <algorithm =', algorithm, 'baseKey =', baseKey, 'length =', length, '>')
    const alg = prepareAlgorithm(algorithm);
    // For PBKDF2, convert baseKey {k: ...} to {rawData: ...}
    if (alg.name && alg.name.toUpperCase() === 'PBKDF2' && baseKey && baseKey.k) {
      baseKey = { rawData: baseKey.k };
    }
    return maybePromise(
      native.deriveBits(alg, baseKey, length)
    ).then((r) => {
      console.log('---> [output] deriveBits <r =', r, '>')
      if (r == null) throw new Error('deriveBits failed');
      return toU8(r).buffer;
    });
  };

  // deriveKey
  crypto.subtle.deriveKey = (algorithm, baseKey, derivedKeyAlgorithm, extractable, usages) => {
    console.log('---> [input] deriveKey <algorithm =', algorithm, 'baseKey =', baseKey, 'derivedKeyAlgorithm =', derivedKeyAlgorithm, 'extractable =', extractable, 'usages =', usages, '>')
    const alg = prepareAlgorithm(algorithm);
    const dAlg = prepareAlgorithm(derivedKeyAlgorithm);
    if (alg.name && alg.name.toUpperCase() === 'PBKDF2' && baseKey && baseKey.k) {
      baseKey = { rawData: baseKey.k };
    }
    return maybePromise(
      native.deriveKey(alg, baseKey, dAlg, !!extractable, Array.from(usages || []))
    ).then((r) => {
      console.log('---> [output] deriveKey <r =', r, '>')
      if (r == null) throw new Error('deriveKey failed');
      if (!r.algorithm) r.algorithm = dAlg;
      r.type = 'secret';
      r.usages = Array.from(usages || []);
      r.extractable = !!extractable;
      return r;
    });
  };

  // getRandomValues
  crypto.getRandomValues = (typedArray) => {
    console.log('---> [input] getRandomValues <typedArray =', typedArray, '>')
    if (!typedArray || !typedArray.length) {
      throw new TypeError('Argument 1 of Crypto.getRandomValues does not implement interface ArrayBufferView');
    }
    const length = typedArray.length;
    if (length > 65536) {
      throw new DOMException('Requested length exceeds maximum array size', 'QuotaExceededError');
    }
    // Check if we're in a promise context
    const result = native.getRandomValues(length);
    console.log('---> [output] getRandomValues <result =', result, '>')
    
    if (result && typeof result.then === 'function') {
      // If native returns a promise
      return result.then((b) => {
        console.log('---> [output] getRandomValues <b =', b, '>')
        if (!b) throw new Error('getRandomValues failed');
        const bytes = toU8(b);
        console.log('---> [output] getRandomValues <bytes =', bytes, '>')
        typedArray.set(bytes);
        console.log('---> [output] getRandomValues <typedArray =', typedArray, '>')
        return typedArray;
      });
    } else if (result) {
      // If native returns synchronously
      console.log('---> [output] getRandomValues <result =', result, '>')
      const bytes = toU8(result);
      console.log('---> [output] getRandomValues <bytes =', bytes, '>')
      typedArray.set(bytes);
      console.log('---> [output] getRandomValues <typedArray =', typedArray, '>')
      return typedArray;
    } else {
      console.log('---> [output] getRandomValues <No result from native>')
      throw new Error('getRandomValues failed');
    }
  };

  // btoa: encode a string or binary data to Base64
  globalThis.btoa = (input) => {
    console.log('---> [input] btoa <input =', input, '>')
    // If input is ArrayBuffer/TypedArray, decode bytes to a string using ISO‑8859‑1
    let str;
    if (typeof input === 'string') {
      str = input;
    } else if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
      const bytes = toU8(toAB(input));
      // Convert each byte to a character preserving 0–255 values
      str = String.fromCharCode(...bytes);
    } else {
      str = String(input);
    }
    return maybePromise(native.btoa(str)).then((r) => {
      console.log('---> [output] btoa <r =', r, '>')
      if (r == null) throw new Error('btoa failed');
      return r;
    });
  };

  // atob: decode a Base64 string to a binary string
  globalThis.atob = (input) => {
    console.log('---> [input] atob <input =', input, '>')
    return maybePromise(native.atob(String(input))).then((r) => {
      console.log('---> [output] atob <r =', r, '>')
      if (r == null) throw new Error('atob failed');
      return r;
    });
  };

  // Provide TextEncoder and TextDecoder if not present
  globalThis.TextEncoder = globalThis.TextEncoder || class TextEncoder {
    encode(str) {
      return maybePromise(native.textEncode(str)).then((d) => toU8(d));
    }
  };
  globalThis.TextDecoder = globalThis.TextDecoder || class TextDecoder {
    decode(buffer) {
      const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
      return maybePromise(native.textDecode(data)).then((s) => s || '');
    }
  };

  // Make crypto available globally
  globalThis.crypto = crypto;

  // Optional: debug list of supported algorithms
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('WebCrypto polyfill loaded (limited algorithms):', {
      digest: ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'],
      symmetric: ['AES-GCM'],
      asymmetric: ['ECDSA', 'ECDH'],
      derivation: ['ECDH', 'PBKDF2'],
      curves: ['P-256'],
      keyFormats: ['raw', 'jwk']
    });
  }
function arrayBufferToBase64(buffer) {
    const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const uint8Array = new Uint8Array(buffer);
    let result = "";
    let i = 0;
    while (i < uint8Array.length) {
      const byte1 = uint8Array[i];
      const byte2 = uint8Array[i + 1];
      const byte3 = uint8Array[i + 2];
  
      const char1 = base64Chars.charAt(byte1 >> 2);
      const char2 = base64Chars.charAt(((byte1 & 0x03) << 4) | (byte2 >> 4));
      const char3 = base64Chars.charAt(((byte2 & 0x0F) << 2) | (byte3 >> 6));
      const char4 = base64Chars.charAt(byte3 & 0x3F);
  
      result += char1 + char2 + char3 + char4;
      i += 3;
    }
    if (uint8Array.length % 3 === 1) {
      result = result.substring(0, result.length - 2) + "==";
    } else if (uint8Array.length % 3 === 2) {
      result = result.substring(0, result.length - 1) + "=";
    }
    return result;
}

function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
}

export const Crypto = {
    digest: async (algorithm, data) => {
        const dataBase64 = typeof data === 'string' ? data : arrayBufferToBase64(data);
        return NativeModules.NativeWebCryptoModule.digest(algorithm, dataBase64);
    },

    generateKey: async (algorithm, extractable, keyUsages) => {
        var k =  await NativeModules.NativeWebCryptoModule.generateKey(algorithm, extractable, keyUsages);
        console.log('k', k);
        return k;
        // return JSON.parse(await NativeModules.NativeWebCryptoModule.generateKey(algorithm, extractable, keyUsages));
    },

    exportKey: async (format, key) => {
        console.log('exportKey', format, key);
        var k = await NativeModules.NativeWebCryptoModule.exportKey(format, key);
        return k;
    },

    importKey: async (format, keyData, algorithm, extractable, keyUsages) => {
        return JSON.parse(await NativeModules.NativeWebCryptoModule.importKey(format, keyData, algorithm, extractable, keyUsages));
    },

    encrypt: async (algorithm, key, data) => {
        const dataBase64 = typeof data === 'string' ? data : arrayBufferToBase64(data);
        return NativeModules.NativeWebCryptoModule.encrypt(algorithm, key, dataBase64);
    },

    decrypt: async (algorithm, key, data) => {
        const dataBase64 = typeof data === 'string' ? data : arrayBufferToBase64(data);
        return NativeModules.NativeWebCryptoModule.decrypt(algorithm, key, dataBase64);
    },

    sign: async (algorithm, key, data) => {
        const dataBase64 = typeof data === 'string' ? data : arrayBufferToBase64(data);
        return NativeModules.NativeWebCryptoModule.sign(algorithm, key, dataBase64);
    },

    verify: async (algorithm, key, signature, data) => {
        const dataBase64 = typeof data === 'string' ? data : arrayBufferToBase64(data);
        return NativeModules.NativeWebCryptoModule.verify(algorithm, key, signature, dataBase64);
    },

    deriveBits: async (algorithm, key, length) => {

        return NativeModules.NativeWebCryptoModule.deriveBits(algorithm, key, length);
    },

    deriveKey: async (algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages) => {
        return NativeModules.NativeWebCryptoModule.deriveKey(algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages);
    },

    getRandomValues: (length) => {
        if (length instanceof Uint8Array) {
            length = length.length;
        }
        const randomValues = NativeModules.NativeWebCryptoModule.getRandomValues(length);
        return randomValues;
    },

    textEncode: async (text) => {
        const textBase64 = typeof text === 'string' ? text : arrayBufferToBase64(text);
        return NativeModules.NativeWebCryptoModule.textEncode(textBase64);
    },

    textDecode: async (data) => {
        return NativeModules.NativeWebCryptoModule.textDecode(data);
    }
}
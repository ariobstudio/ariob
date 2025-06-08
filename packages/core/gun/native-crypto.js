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
export const Crypto = {
    digest: async (algorithm, data) => {
        const dataBase64 = typeof data === 'string' ? data : arrayBufferToBase64(data);
        return NativeModules.NativeWebCryptoModule.digest(JSON.stringify(algorithm), dataBase64);
    },

    generateKey: async (algorithm, extractable, keyUsages) => {
        return JSON.parse(await NativeModules.NativeWebCryptoModule.generateKey(JSON.stringify(algorithm), extractable, JSON.stringify(keyUsages)));
    },

    exportKey: async (format, key) => {
    
        return JSON.parse(await NativeModules.NativeWebCryptoModule.exportKey(format, JSON.stringify(key)));
    },

    importKey: async (format, keyData, algorithm, extractable, keyUsages) => {
        return JSON.parse(await NativeModules.NativeWebCryptoModule.importKey(format, JSON.stringify(keyData), JSON.stringify(algorithm), extractable, JSON.stringify(keyUsages)));
    },

    encrypt: async (algorithm, key, data) => {
        const dataBase64 = typeof data === 'string' ? data : arrayBufferToBase64(data);
        return NativeModules.NativeWebCryptoModule.encrypt(JSON.stringify(algorithm), key, dataBase64);
    },

    decrypt: async (algorithm, key, data) => {
        const dataBase64 = typeof data === 'string' ? data : arrayBufferToBase64(data);
        return NativeModules.NativeWebCryptoModule.decrypt(JSON.stringify(algorithm), key, dataBase64);
    },

    sign: async (algorithm, key, data) => {
        const dataBase64 = typeof data === 'string' ? data : arrayBufferToBase64(data);
        return NativeModules.NativeWebCryptoModule.sign(JSON.stringify(algorithm), JSON.stringify(key), dataBase64);
    },

    verify: async (algorithm, key, signature, data) => {
        const dataBase64 = typeof data === 'string' ? data : arrayBufferToBase64(data);
        return NativeModules.NativeWebCryptoModule.verify(JSON.stringify(algorithm), key, signature, dataBase64);
    },

    deriveBits: async (algorithm, key, length) => {

        return NativeModules.NativeWebCryptoModule.deriveBits(JSON.stringify(algorithm), JSON.stringify(key), length);
    },

    deriveKey: async (algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages) => {
        return NativeModules.NativeWebCryptoModule.deriveKey(JSON.stringify(algorithm), baseKey, derivedKeyAlgorithm, extractable, keyUsages);
    },

    getRandomValues: (length) => {
        console.log('getRandomValues', length);
        // IF Uint8Array, convert to length
        if (length instanceof Uint8Array) {
            length = length.length;
        }
       return NativeModules.NativeWebCryptoModule.getRandomValues(length);
    },

    textEncode: async (text) => {
        const textBase64 = typeof text === 'string' ? text : arrayBufferToBase64(text);
        return NativeModules.NativeWebCryptoModule.textEncode(textBase64);
    },

    textDecode: async (data) => {
        return NativeModules.NativeWebCryptoModule.textDecode(data);
    }
}

class TextDecoder {
  constructor() {}

  decode(buffer) {
    if (buffer.byteLength === 0) {
      return '';
    }

    if (buffer instanceof DataView) {
      buffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
    } else if (ArrayBuffer.isView(buffer)) {
      buffer = buffer.buffer;
    }

    return globalThis.TextCodecHelper.decode(buffer);
  }

  encodeInto() {
    throw TypeError('TextEncoder().encodeInto not supported');
  }

  get encoding() {
    return 'utf-8';
  }

  get fatal() {
    return false;
  }

  get ignoreBOM() {
    return true;
  }
}

class TextEncoder {
    constructor() {}
  
    encode(str) {
      return new Uint8Array(globalThis.TextCodecHelper.encode(str));
    }
  
    encodeInto() {
      throw TypeError('TextEncoder().encodeInto not supported');
    }
  
    get encoding() {
      return 'utf-8';
    }
}

export { TextEncoder, TextDecoder };
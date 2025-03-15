// gunPolyfill.js
// This file provides polyfills required for GUN/SEA to work in Node.js environment

const crypto = require('crypto');
const { Crypto } = require('@peculiar/webcrypto');

// Create a WebCrypto API compatible instance
const webcrypto = new Crypto();

// Polyfill global crypto if it doesn't exist
if (typeof global.crypto === 'undefined') {
  global.crypto = webcrypto;
}

// Ensure the subtle crypto is available
if (typeof global.crypto.subtle === 'undefined') {
  global.crypto.subtle = webcrypto.subtle;
}

// Ensure getRandomValues is available
if (typeof global.crypto.getRandomValues === 'undefined') {
  global.crypto.getRandomValues = function(array) {
    const randomBytes = crypto.randomBytes(array.length);
    for (let i = 0; i < array.length; i++) {
      array[i] = randomBytes[i];
    }
    return array;
  };
}

// Ensure TextEncoder/TextDecoder are available
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

module.exports = {
  crypto: global.crypto
}; 
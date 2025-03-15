// First import the polyfill
require('./gunPolyfill');

// Then import Gun with SEA
const Gun = require('gun');
require('gun/sea');

// Now you can use Gun with SEA without getRandomValues errors
const gun = Gun();

// Example of using SEA
const SEA = Gun.SEA;

async function example() {
  try {
    // Generate a key pair
    const pair = await SEA.pair();
    console.log('Generated key pair:', pair);
    
    // Encrypt some data
    const data = 'Secret data';
    const encrypted = await SEA.encrypt(data, pair);
    console.log('Encrypted data:', encrypted);
    
    // Decrypt the data
    const decrypted = await SEA.decrypt(encrypted, pair);
    console.log('Decrypted data:', decrypted);
  } catch (error) {
    console.error('Error:', error);
  }
}

example(); 
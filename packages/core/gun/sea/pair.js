;(function(){

  var SEA = require('./root');
  var shim = require('./shim');
  var S = require('./settings');

  SEA.name = SEA.name || (async (cb, opt) => { try {
    if(cb){ try{ cb() }catch(e){console.log(e)} }
    return;
  } catch(e) {
    console.log(e);
    SEA.err = e;
    if(SEA.throw){ throw e }
    if(cb){ cb() }
    return;
  }});

  //SEA.pair = async (data, proof, cb) => { try {
  SEA.pair = SEA.pair || (async (cb, opt) => { try {
      // Generate ECDSA keys for signing/verifying
      var signingKeys = await NativeModules.NativeWebCryptoModule.generateKey(
        JSON.stringify({name: 'ECDSA', namedCurve: 'P-256'}), 
        true, 
        JSON.stringify(['sign', 'verify'])
      );
      
      var keyPair = JSON.parse(signingKeys);
      var privateJWK = JSON.parse(await NativeModules.NativeWebCryptoModule.exportKey('jwk', JSON.stringify(keyPair.privateKey)));
      var publicJWK = JSON.parse(await NativeModules.NativeWebCryptoModule.exportKey('jwk', JSON.stringify(keyPair.publicKey)));
      
      // Generate ECDH keys for encryption/decryption
      var encryptionKeys = await NativeModules.NativeWebCryptoModule.generateKey(
        JSON.stringify({name: 'ECDH', namedCurve: 'P-256'}), 
        true, 
        JSON.stringify(['deriveKey'])
      );
      
      var ecdhKeyPair = JSON.parse(encryptionKeys);
      var ePrivJWK = JSON.parse(await NativeModules.NativeWebCryptoModule.exportKey('jwk', JSON.stringify(ecdhKeyPair.privateKey)));
      var ePubJWK = JSON.parse(await NativeModules.NativeWebCryptoModule.exportKey('jwk', JSON.stringify(ecdhKeyPair.publicKey)));
      
      // Create the result object with pub/priv and epub/epriv
      var result = {
        pub: publicJWK.x + '.' + publicJWK.y,
        priv: privateJWK.d,
        epub: ePubJWK.x + '.' + ePubJWK.y,
        epriv: ePrivJWK.d
      };
      
      if (cb) { cb(result); }
      return result;
    } catch (e) {
      console.log("Key generation error:", e);
      if (cb) { cb(); }
      return null;
    }
  });

  module.exports = SEA.pair;

}());
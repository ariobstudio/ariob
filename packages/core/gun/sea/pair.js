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

    // var ecdhSubtle = shim.ossl || shim.subtle;
    // First: ECDSA keys for signing/verifying...
    let sa;
    try {
      sa = await Promise.resolve(NativeModules.NativeWebCryptoModule.generateKey(JSON.stringify({name: 'ECDSA', namedCurve: 'P-256'}), true, JSON.stringify(['sign', 'verify'])))
      .then(async (keys) => {
        var key = {};
        var vkeys = JSON.parse(keys);
        var priv = await NativeModules.NativeWebCryptoModule.exportKey('jwk', JSON.stringify(vkeys.privateKey));
        key.priv = JSON.parse(priv);
        var pub = await NativeModules.NativeWebCryptoModule.exportKey('jwk', JSON.stringify(vkeys.publicKey));
        pub = JSON.parse(pub);
        key.pub = pub.x+'.'+pub.y;
        return key;
      });
    } catch(e) {
      console.error('Error generating ECDSA keys:', e);
      throw e;
    }
    
    // To include PGPv4 kind of keyId:
    // const pubId = await SEA.keyid(keys.pub)
    // Next: ECDH keys for encryption/decryption...

    // await ecdhSubtle.generateKey({name: 'ECDH', namedCurve: 'P-256'}, true, ['deriveKey'])
    let dh = {};
    try {
      dh = await Promise.resolve(NativeModules.NativeWebCryptoModule.generateKey(JSON.stringify({name: 'ECDH', namedCurve: 'P-256'}), true, JSON.stringify(['deriveKey'])))
      .then(async (keys) => {
        var key = {};
        var vkeys = JSON.parse(keys);
        var epriv = await NativeModules.NativeWebCryptoModule.exportKey('jwk', JSON.stringify(vkeys.privateKey));
        key.epriv = JSON.parse(epriv);
        var pub = await NativeModules.NativeWebCryptoModule.exportKey('jwk', JSON.stringify(vkeys.publicKey));
        pub = JSON.parse(pub);
        key.epub = pub.x+'.'+pub.y;
        return key;
      });
    } catch(e) {
      if(SEA.window){ throw e }
      if(e == 'Error: ECDH is not a supported algorithm'){ 
        console.log('Ignoring ECDH...');
      } else { 
        throw e;
      }
    }

    var r = { pub: sa.pub, priv: sa.priv.d, /* pubId, */ epub: dh.epub, epriv: dh.epriv.d }
    if(cb){ try{ cb(r) }catch(e){console.log(e)} }
    return r;
  } catch(e) {
    console.log(e);
    SEA.err = e;
    if(SEA.throw){ throw e }
    if(cb){ cb() }
    return;
  }});

  module.exports = SEA.pair;

}());
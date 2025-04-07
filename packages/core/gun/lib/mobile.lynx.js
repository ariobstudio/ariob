;(function(){
  // Base SEA namespace
  var SEA = {};
  
  // Utilities
  var shim = {}; // Simplified shim module
  shim.Buffer = {
    from: function(data, encoding) {
      // Simple buffer conversion for base64/binary
      return {
        toString: function(outEncoding) {
          return data; // This is a simplification, actual implementation would convert formats
        }
      };
    }
  };
  
  shim.stringify = async function(data) {
    return JSON.stringify(data);
  };
  
  // Settings
  var S = {};
  
  S.parse = async function(text) {
    if (typeof text !== 'string') {
      return text;
    }
    if (text.slice(0, 3) !== 'SEA') {
      try { return JSON.parse(text); } 
      catch (e) { return text; }
    }
    try { return JSON.parse(text.slice(3)); } 
    catch (e) { return text; }
  };
  
  // Create JWK from key
  S.jwk = function(pub, priv) {
    if (priv) {
      // Create EC private key JWK from x.y formatted public key and d-value
      var jwk = {
        kty: "EC",
        crv: "P-256",
        ext: true,
        key_ops: ["sign"],
        x: pub.split('.')[0],
        y: pub.split('.')[1],
        d: priv
      };
      return jwk;
    }
    // Create EC public key JWK
    return {
      kty: "EC",
      crv: "P-256",
      ext: true,
      key_ops: ["verify"],
      x: pub.split('.')[0],
      y: pub.split('.')[1]
    };
  };
  
  // SHA-256 hash function
  var sha = async function(data) {
    if (typeof data === 'string') {
      data = NativeModules.NativeWebCryptoModule.textEncode(data);
    }
    var hash = await NativeModules.NativeWebCryptoModule.digest(
      JSON.stringify({name: 'SHA-256'}), 
      data
    );
    return shim.Buffer.from(hash);
  };
  
  // AES key generation from password/salt
  var aeskey = async function(key, salt, opt) {
    // Convert key to appropriate format if needed
    var jwkKey = null;
    if (typeof key === 'object' && key.d) {
      // It's a private key object
      jwkKey = {
        kty: "oct",
        k: await sha(JSON.stringify(key))
      };
    } else if (typeof key === 'string') {
      // It's a string key
      jwkKey = {
        kty: "oct",
        k: await sha(key + salt)
      };
    }
    
    return JSON.stringify(jwkKey);
  };
  
  // SEA.pair - Generate a cryptographic keypair (signing/verification and encryption/decryption)
  SEA.pair = async function(cb) {
    try {
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
  };
  
  // SEA.sign - Create a signature
  SEA.sign = async function(data, pair, cb) {
    try {
      if (!pair || !pair.priv) {
        throw 'No signing key.';
      }
      
      var json = await S.parse(data);
      var jwk = S.jwk(pair.pub, pair.priv);
      var hash = await sha(json);
      
      var key = await NativeModules.NativeWebCryptoModule.importKey(
        'jwk', 
        JSON.stringify(jwk), 
        JSON.stringify({name: 'ECDSA', namedCurve: 'P-256'}), 
        false, 
        JSON.stringify(['sign'])
      );
      
      var sig = await NativeModules.NativeWebCryptoModule.sign(
        JSON.stringify({name: 'ECDSA', hash: {name: 'SHA-256'}}), 
        key, 
        hash.toString("base64")
      );
      
      var result = {
        m: json, 
        s: shim.Buffer.from(sig, 'binary').toString('base64')
      };
      
      var resultStr = 'SEA' + await shim.stringify(result);
      
      if (cb) { cb(resultStr); }
      return resultStr;
    } catch (e) {
      console.log("Signing error:", e);
      if (cb) { cb(); }
      return null;
    }
  };
  
  // SEA.verify - Verify a signature
  SEA.verify = async function(data, pair, cb) {
    try {
      var json = await S.parse(data);
      
      if (!json || !json.m || !json.s) {
        throw "Invalid signature format";
      }
      
      var pub = pair.pub || pair;
      
      // Import the public key
      var key = await NativeModules.NativeWebCryptoModule.importKey(
        'jwk',
        JSON.stringify(S.jwk(pub)), 
        JSON.stringify({name: 'ECDSA', namedCurve: 'P-256'}), 
        false, 
        JSON.stringify(['verify'])
      );
      
      var hash = await sha(json.m);
      var buf = shim.Buffer.from(json.s, 'base64');
      
      var check = await NativeModules.NativeWebCryptoModule.verify(
        JSON.stringify({name: 'ECDSA', hash: {name: 'SHA-256'}}),
        key,
        buf.toString("base64"),
        hash.toString("base64")
      );
      
      if (!check) { 
        throw "Signature did not match."; 
      }
      
      var result = check ? await S.parse(json.m) : undefined;
      if (cb) { cb(result); }
      return result;
    } catch (e) {
      console.log("Verification error:", e);
      if (cb) { cb(); }
      return null;
    }
  };
  
  // SEA.encrypt - Encrypt data
  SEA.encrypt = async function(data, pair, cb) {
    try {
      var key = pair.epriv || pair;
      
      if (!key) {
        throw 'No encryption key.';
      }
      
      // Convert data to string if it's not already
      var msg = (typeof data == 'string') ? data : await shim.stringify(data);
      
      // Generate random salt and IV
      var rand = {
        s: NativeModules.NativeWebCryptoModule.getRandomValues(9), 
        iv: NativeModules.NativeWebCryptoModule.getRandomValues(15)
      };
      
      // Derive AES key from the encryption key and salt
      var aes = await aeskey(key, rand.s);
      
      // Encrypt the data
      var ct = await NativeModules.NativeWebCryptoModule.encrypt(
        JSON.stringify({name: 'AES-GCM', iv: rand.iv}),
        aes,
        NativeModules.NativeWebCryptoModule.textEncode(msg)
      );
      
      // Create and return the result
      var result = {
        ct: ct,
        iv: rand.iv.toString('base64'),
        s: rand.s.toString('base64')
      };
      
      var resultStr = 'SEA' + await shim.stringify(result);
      
      if (cb) { cb(resultStr); }
      return resultStr;
    } catch (e) {
      console.log("Encryption error:", e);
      if (cb) { cb(); }
      return null;
    }
  };
  
  // SEA.decrypt - Decrypt data
  SEA.decrypt = async function(data, pair, cb) {
    try {
      var key = pair.epriv || pair;
      
      if (!key) {
        throw 'No decryption key.';
      }
      
      var json = await S.parse(data);
      
      if (!json || !json.ct || !json.iv || !json.s) {
        throw "Invalid encrypted data format";
      }
      
      // Derive AES key from the decryption key and salt
      var aes = await aeskey(key, json.s);
      
      // Decrypt the data
      var ct = await NativeModules.NativeWebCryptoModule.decrypt(
        JSON.stringify({name: 'AES-GCM', iv: json.iv, tagLength: 128}),
        aes,
        json.ct
      );
      
      // Parse and return the decrypted data
      var result = await S.parse(NativeModules.NativeWebCryptoModule.textDecode(ct));
      
      if (cb) { cb(result); }
      return result;
    } catch (e) {
      console.log("Decryption error:", e);
      if (cb) { cb(); }
      return null;
    }
  };

  SEA.work = SEA.work || (async (data, pair, cb, opt) => { try { // used to be named `proof`
    var salt = (pair||{}).epub || pair; // epub not recommended, salt should be random!
    opt = opt || {};
    if(salt instanceof Function){
      cb = salt;
      salt = u;
    }
    data = (typeof data == 'string')? data : await shim.stringify(data);
    if('sha' === (opt.name||'').toLowerCase().slice(0,3)){
      var rsha = shim.Buffer.from(await sha(data, opt.name), 'binary').toString(opt.encode || 'base64')
      if(cb){ try{ cb(rsha) }catch(e){console.log(e)} }
      return rsha;
    }
    salt = salt || NativeModules.NativeWebCryptoModule.getRandomValues(9);
    var key = await NativeModules.NativeWebCryptoModule.importKey('raw', NativeModules.NativeWebCryptoModule.textEncode(data), JSON.stringify({name: opt.name || 'PBKDF2'}), false, JSON.stringify(['deriveBits']));
    var work = await NativeModules.NativeWebCryptoModule.deriveBits(JSON.stringify({
      name: opt.name || 'PBKDF2',
      iterations: opt.iterations || S.pbkdf2.iter,
      salt: NativeModules.NativeWebCryptoModule.textEncode(opt.salt || salt),
      hash: opt.hash || JSON.stringify(S.pbkdf2.hash),
    }), key, opt.length || (S.pbkdf2.ks * 8))
    data = NativeModules.NativeWebCryptoModule.getRandomValues(data.length)  // Erase data in case of passphrase
    var r = shim.Buffer.from(work, 'binary').toString(opt.encode || 'base64')
    if(cb){ try{ cb(r) }catch(e){console.log(e)} }
    return r;
  } catch(e) { 
    console.log(e);
    SEA.err = e;
    if(SEA.throw){ throw e }
    if(cb){ cb() }
    return;
  }});

  
  // Export the SEA object with its methods
  module.exports = SEA;
})();
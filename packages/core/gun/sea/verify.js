;(function(){
  var SEA = require('./root');
  var shim = require('./shim');
  var S = require('./settings');
  var sha = require('./sha256');
  var u;

  // Updated verify – now assuming signatures are DER encoded.
  SEA.verify = SEA.verify || (async (data, pair, cb, opt) => { 
    try {
      var json = await S.parse(data);
      if(false === pair){ // don't verify!
        var raw = await S.parse(json.m);
        if(cb){ try{ cb(raw) }catch(e){console.log(e)} }
        return raw;
      }
      opt = opt || {};
      var pub = pair.pub || pair;
      // Import the public key using JWK (or SPKI if you prefer)
      var key = await NativeModules.NativeWebCryptoModule.importKey(
        'jwk',
        JSON.stringify(S.jwk(pub)), 
        JSON.stringify({name: 'ECDSA', namedCurve: 'P-256'}), 
        false, 
        JSON.stringify(['verify'])
      );
      var hash = await sha(json.m);
      // Here we assume the signature is now DER encoded.
      var buf = shim.Buffer.from(json.s, opt.encode || 'base64');
      var check = await NativeModules.NativeWebCryptoModule.verify(
        JSON.stringify({name: 'ECDSA', hash: {name: 'SHA-256'}}),
        key,
        buf.toString("base64"),
        hash.toString("base64")
      );
      if(!check){ throw "Signature did not match." }
      var r = check ? await S.parse(json.m) : u;
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) {
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }
  });

  module.exports = SEA.verify;
}());
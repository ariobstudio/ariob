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
  });

  module.exports = SEA.verify;
}());
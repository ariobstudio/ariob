;(function(){

    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var sha = require('./sha256');
    var u;

    SEA.sign = SEA.sign || (async (data, pair, cb, opt) => { try {
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
    }});

    module.exports = SEA.sign;
  
}());
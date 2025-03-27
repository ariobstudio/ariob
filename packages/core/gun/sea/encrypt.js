;(function(){

    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var aeskey = require('./aeskey');
    var u;

    SEA.encrypt = SEA.encrypt || (async (data, pair, cb, opt) => { try {
      opt = opt || {};
      var key = (pair||opt).epriv || pair;
      if(u === data){ throw '`undefined` not allowed.' }
      if(!key){
        if(!SEA.I){ throw 'No encryption key.' }
        pair = await SEA.I(null, {what: data, how: 'encrypt', why: opt.why});
        key = pair.epriv || pair;
      }
      var msg = (typeof data == 'string')? data : await shim.stringify(data);
      var rand = {s: NativeModules.NativeWebCryptoModule.getRandomValues(9), iv: NativeModules.NativeWebCryptoModule.getRandomValues(15)}; // consider making this 9 and 15 or 18 or 12 to reduce == padding.
      var ct = await aeskey(key, rand.s, opt).then((aes) => {
        console.log("Encryption - Params: ", JSON.stringify(JSON.stringify({
          name: opt.name || 'AES-GCM', iv: rand.iv
        }), aes, NativeModules.NativeWebCryptoModule.textEncode(msg)))
        return NativeModules.NativeWebCryptoModule.encrypt(JSON.stringify({
          name: opt.name || 'AES-GCM', iv: rand.iv
        }), aes, NativeModules.NativeWebCryptoModule.textEncode(msg));
      });
      var r = {
        ct: ct, // ct is already base64 encoded from native module
        iv: rand.iv.toString(opt.encode || 'base64'),
        s: rand.s.toString(opt.encode || 'base64')
      }
      if(!opt.raw){ r = 'SEA' + await shim.stringify(r) }
      console.log("Encryption - Result: ", r)

      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) { 
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.encrypt;
  
}());
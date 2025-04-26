;(function(){

    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var sha = require('./sha256');
    var u;

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

    module.exports = SEA.work;
  
}());
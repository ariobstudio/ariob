;(function(){

    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var aeskey = require('./aeskey');

    SEA.decrypt = SEA.decrypt || (async (data, pair, cb, opt) => { try {
      opt = opt || {};
      var key = (pair||opt).epriv || pair;
      if(!key){
        if(!SEA.I){ throw 'No decryption key.' }
        pair = await SEA.I(null, {what: data, how: 'decrypt', why: opt.why});
        key = pair.epriv || pair;
      }
      var json = await S.parse(data);
      var buf, bufiv, bufct; try{
        buf = shim.Buffer.from(json.s, opt.encode || 'base64');
        bufiv = shim.Buffer.from(json.iv, opt.encode || 'base64');
        bufct = shim.Buffer.from(json.ct, opt.encode || 'base64');
        
        const ivArray = Array.from(bufiv).map(c => c);
        // Add logging
        console.log('Decryption - Salt length:', buf.length);
        console.log('Decryption - IV length:', bufiv.length);
        console.log('Decryption - Ciphertext length:', bufct.length);
        console.log('Decryption - IV array first 5 values:', ivArray.slice(0, 5));
        console.log('Decryption - bufct as base64:', bufct.toString('base64').substring(0, 20) + '...');
        var aes = await aeskey(key, buf, opt);
        console.log('Decryption - Using key:', aes);
        
        var ct = await NativeModules.NativeWebCryptoModule.decrypt(JSON.stringify({
          name: opt.name || 'AES-GCM', 
          iv: ivArray
        }), aes, bufct);
        
        
      }catch(e){
        console.log('Decryption processing error:', e);
        if('utf8' === opt.encode){ throw "Could not decrypt" }
        if(SEA.opt.fallback){
          opt.encode = 'utf8';
          return await SEA.decrypt(data, pair, cb, opt);
        }
      }

      console.log('Decryption - Ciphertext:', ct);
      console.log('Decryption - Result received:', ct ? 'success' : 'failed');
      var r = await S.parse(NativeModules.NativeWebCryptoModule.textDecode(ct));
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) { 
      console.log('Decryption error:', e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.decrypt;
  
}());
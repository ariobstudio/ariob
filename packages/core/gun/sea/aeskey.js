;(function(){

    var shim = require('./shim');
    var S = require('./settings');
    var sha256hash = require('./sha256');

    const importGen = async (key, salt, opt) => {
      //const combo = shim.Buffer.concat([shim.Buffer.from(key, 'utf8'), salt || shim.random(8)]).toString('utf8') // old
      opt = opt || {};
      const combo = key + (salt || NativeModules.NativeWebCryptoModule.getRandomValues(8)).toString('utf8');
      const hash = shim.Buffer.from(await sha256hash(combo), 'binary')
      
      const jwkKey = S.keyToJwk(hash)
      return await NativeModules.NativeWebCryptoModule.importKey('jwk', JSON.stringify(jwkKey), JSON.stringify({name:'AES-GCM'}), false, JSON.stringify(['encrypt', 'decrypt']))
    }
    module.exports = importGen;
  
}());
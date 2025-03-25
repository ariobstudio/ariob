;(function(){

    var shim = require('./shim');
    var S = require('./settings');
    var sha256hash = require('./sha256');

    const importGen = async (key, salt, opt) => {
      //const combo = shim.Buffer.concat([shim.Buffer.from(key, 'utf8'), salt || shim.random(8)]).toString('utf8') // old
      opt = opt || {};
      console.log('aeskey input key:', key);
      console.log('aeskey input salt:', salt.toString('utf8'));
      
      const combo = key + (salt || shim.random(8)).toString('utf8');
      console.log('aeskey combo:', combo);
      
      const hash = shim.Buffer.from(await sha256hash(combo), 'binary')
      console.log('aeskey hash:', hash.toString('base64'));
      
      const jwkKey = S.keyToJwk(hash)
      console.log('aeskey JWK:', JSON.stringify(jwkKey));
      
      return await NativeModules.NativeWebCryptoModule.importKey('jwk', JSON.stringify(jwkKey), JSON.stringify({name:'AES-GCM'}), false, JSON.stringify(['encrypt', 'decrypt']))
    }
    module.exports = importGen;
  
}());
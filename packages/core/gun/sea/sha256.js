;(function(){

    var shim = require('./shim');
    module.exports = async function(d, o){
      var t = (typeof d == 'string')? d : await shim.stringify(d);
      var hash = await NativeModules.NativeWebCryptoModule.digest(JSON.stringify({name: o||'SHA-256'}), NativeModules.NativeWebCryptoModule.textEncode(t));
      return shim.Buffer.from(hash);
    }
  
}());
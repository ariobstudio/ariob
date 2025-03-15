;(function(){

    var u, Gun = (''+u != typeof GUN)? (GUN||{chain:{}}) : require('./gun.js');
    Gun.chain.then = function(cb, opt){
      var gun = this, p = (new Promise(function(res, rej){
        gun.once(res, opt);
      }));
      return cb? p.then(cb) : p;
    }
  
}());
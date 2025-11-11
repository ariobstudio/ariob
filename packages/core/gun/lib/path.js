// Path extension for Gun
// Allows path-based navigation: gun.path('user.profile.name')

;(function(){
	'background only';

	var Gun;

	// Try to get Gun from different contexts
	if (typeof module !== 'undefined' && module.exports) {
		// CommonJS
		try {
			Gun = require('./gun');
		} catch(e) {
			console.warn('[Gun path] Could not require Gun:', e.message);
		}
	}

	// Also try to get from global/window
	if (!Gun && typeof window !== 'undefined') {
		Gun = window.Gun;
	}

	if (!Gun && typeof global !== 'undefined') {
		Gun = global.Gun;
	}

	// Define the path function
	function pathExtension(field, opt){
		var back = this, gun = back, tmp;
		if(typeof field === 'string'){
			tmp = field.split(opt || '.');
			if(1 === tmp.length){
				gun = back.get(field);
				return gun;
			}
			field = tmp;
		}
		if(field instanceof Array){
			if(field.length > 1){
				gun = back;
				var i = 0, l = field.length;
				for(i; i < l; i++){
					gun = gun.get(field[i]);
				}
			} else {
				gun = back.get(field[0]);
			}
			return gun;
		}
		if(!field && 0 != field){
			return back;
		}
		gun = back.get(''+field);
		return gun;
	}

	// Apply extension if Gun.chain exists
	if (Gun && Gun.chain) {
		Gun.chain.path = pathExtension;
	} else if (Gun && Gun.prototype) {
		Gun.prototype.path = pathExtension;
	} else {
		console.warn('[Gun path] Gun.chain not available, path extension not loaded');
	}

	// Export for CommonJS
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = Gun;
	}
}());

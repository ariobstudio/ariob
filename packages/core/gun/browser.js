// Gun.js for browser environments
const Gun = require('./src/index');

// Add browser-specific adapters and polyfills
require('./lib/dom');
require('./lib/store');

// Make SEA available
Gun.SEA = require('./sea');

// Export Gun
module.exports = Gun; 
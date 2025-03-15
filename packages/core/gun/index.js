// Export the main Gun library
const Gun = require('./src/index');

// Make SEA available
Gun.SEA = require('./sea');

// Export the Gun library
module.exports = Gun; 
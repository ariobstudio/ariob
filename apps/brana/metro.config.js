const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// Disable watchman due to macOS permission issues
config.watcher = {
  ...config.watcher,
  watchman: {
    enabled: false,
  },
};

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './uniwind-types.d.ts',
  // Using built-in light/dark themes, no extraThemes needed
});

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'react-native-unistyles/plugin',
        {
          root: __dirname, // Point to ripple app directory
        },
      ],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};

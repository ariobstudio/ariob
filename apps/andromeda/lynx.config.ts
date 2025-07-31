import { defineConfig } from '@lynx-js/rspeedy';

import { reactRouterPlugin } from '@ariob/router';
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
  plugins: [
    pluginSass(),
    pluginNodePolyfill(),
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`;
      },
    }),
    pluginReactLynx({
      enableCSSInheritance: true,
      defaultDisplayLinear: false,
    }),
    reactRouterPlugin({
      root: './src/pages',
      output: './src/generated/_routes.tsx',
      srcAlias: '@/',
      layoutFilename: '_layout.tsx',
    }),
  ],
  environments: {
    web: {
      output: {
        assetPrefix: '/',
      },
    },
    lynx: {},
  },
});

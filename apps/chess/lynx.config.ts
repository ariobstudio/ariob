import { defineConfig } from '@lynx-js/rspeedy'

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'

export default defineConfig({
  source: {
    entry: {
      main: './src/index.tsx',  // Single bundle with all features
    },
  },
  plugins: [
    pluginQRCode({
      schema(url) {
        // Simple schema - just open the app fullscreen
        return `${url}?fullscreen=true`;
      },
    }),
    pluginReactLynx(),
    pluginTypeCheck(),
  ],
})

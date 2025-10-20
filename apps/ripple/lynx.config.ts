import { fileURLToPath } from 'node:url'
import { defineConfig } from '@lynx-js/rspeedy'

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'

const aiPackagePath = fileURLToPath(new URL('../../packages/ai/index.ts', import.meta.url))

export default defineConfig({
  source: {
    // Single entry point - simple!
    entry: {
      main: './src/index.tsx',
    },
  },
  resolve: {
    alias: {
      '@ariob/ai': aiPackagePath,
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

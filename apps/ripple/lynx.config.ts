import { fileURLToPath } from 'node:url'
import { defineConfig } from '@lynx-js/rspeedy'

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'

const aiPackagePath = fileURLToPath(new URL('../../packages/ai/index.ts', import.meta.url))

const ripplePackagePath = fileURLToPath(new URL('../../packages/ripple/src/index.ts', import.meta.url))

export default defineConfig({
  source: {
    // Multi-bundle architecture for feature-based code-splitting
    entry: {
      main: './src/index.tsx',           // Main shell
      auth: './src/auth/index.tsx',      // Auth feature
      feed: './src/feed/index.tsx',      // Feed feature (main pillar)
      thread: './src/thread/index.tsx',  // Thread viewer feature
      composer: './src/composer/index.tsx', // Composer feature
      profile: './src/profile/index.tsx'    // Profile feature
    },
  },
  resolve: {
    alias: {
      '@ariob/ai': aiPackagePath,
      '@ariob/ripple': ripplePackagePath,
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

import { defineConfig } from '@lynx-js/rspeedy'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginSass } from '@rsbuild/plugin-sass'

export default defineConfig({
  plugins: [
    pluginSass(),
    pluginQRCode({
      schema(url) {
        return `${url}?fullscreen=true`
      },
    }),
    pluginReactLynx(),
  ],
  environments: {
    web: {},
    lynx: {},
  },
})

import * as path from 'path';
import { createVitestConfig } from '@lynx-js/react/testing-library/vitest-config';
import { defineConfig, mergeConfig } from 'vitest/config';

const defaultConfig = await createVitestConfig();
const config = defineConfig({
  test: {
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ariob/core': path.resolve(__dirname, '../../packages/core'),
    },
  },
});

export default mergeConfig(defaultConfig, config);

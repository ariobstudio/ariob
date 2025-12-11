import sharedConfig from '@ariob/ui/tailwind.config.js';

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  ...sharedConfig,
};

export default config;

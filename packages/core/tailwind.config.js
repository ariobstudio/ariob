/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    presets: [require('@lynx-js/tailwind-preset-canary')],
    darkMode: 'media',
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#3B82F6',
            light: '#60A5FA',
          },
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        spacing: {
          'safe-top': 'calc(env(safe-area-inset-top) + 48px)',
          'safe-bottom': 'calc(env(safe-area-inset-bottom) + 1rem)',
          'safe-left': 'calc(env(safe-area-inset-left) + 1rem)',
          'safe-right': 'calc(env(safe-area-inset-right) + 1rem)',
        },
      },
    },
    plugins: [],
  };
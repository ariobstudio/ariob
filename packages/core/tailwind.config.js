/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    presets: [require('@lynx-js/tailwind-preset-canary')],
    darkMode: 'media',
    theme: {
      extend: {
        colors: {
          background: '#FFFFFF',
          border: '#D4D4D4',
          muted: '#B3B3B3',
          foreground: '#2B2B2B',
          primary: {
            DEFAULT: '#2B2B2B',
            light: '#B3B3B3',
          },
          success: {
            DEFAULT: '#4ADE80', // soft green
            light: '#D1FAE5',
          },
          warning: {
            DEFAULT: '#FACC15', // soft yellow
            light: '#FEF9C3',
          },
          error: {
            DEFAULT: '#F87171', // soft red
            light: '#FEE2E2',
          },
          neutral: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          },
          card: {
            DEFAULT: '#FFFFFF',
            dark: '#2B2B2B',
          },
          outline: '#D4D4D4',
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
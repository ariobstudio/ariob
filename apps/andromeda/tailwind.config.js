
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    presets: [require('@lynx-js/tailwind-preset-canary')],
    darkMode: 'media',
    theme: {
      extend: {
        colors: {
          primary: {
            50:  '#E3F2FD', 100: '#BBDEFB', 200: '#90CAF9',
            300: '#64B5F6', 400: '#42A5F5', DEFAULT: '#2196F3',
            600: '#1E88E5', 700: '#1976D2', 800: '#1565C0',
            900: '#0D47A1', on: '#FFFFFF'
          },
          secondary: {
            50:  '#F3E5F5', 100: '#E1BEE7', 200: '#CE93D8',
            300: '#BA68C8', 400: '#AB47BC', DEFAULT: '#9C27B0',
            600: '#8E24AA', 700: '#7B1FA2', 800: '#6A1B9A',
            900: '#4A148C', on: '#FFFFFF'
          },
          accent: {
            50:  '#FFF8E1', 100: '#FFECB3', 200: '#FFE082',
            300: '#FFD54F', 400: '#FFCA28', DEFAULT: '#FFC107',
            600: '#FFB300', 700: '#FFA000', 800: '#FF8F00',
            900: '#FF6F00', on: '#000000'
          },
          info:    { light: '#BBDEFB', DEFAULT: '#2196F3', dark: '#1976D2', on: '#FFFFFF' },
          success: { light: '#C8E6C9', DEFAULT: '#4CAF50', dark: '#388E3C', on: '#FFFFFF' },
          warning: { light: '#FFE0B2', DEFAULT: '#FF9800', dark: '#F57C00', on: '#000000' },
          danger:  { light: '#FFCDD2', DEFAULT: '#F44336', dark: '#D32F2F', on: '#FFFFFF' },
          neutral: {
            50: '#F9FAFB',100: '#F3F4F6',200: '#E5E7EB',300: '#D1D5DB',
            400: '#9CA3AF',500: '#6B7280',600: '#4B5563',700: '#374151',
            800: '#1F2937',900: '#111827'
          },
          background: { light: '#F5F7FA', dark: '#121212' },
          surface:    { light: '#FFFFFF', dark: '#1E1E1E' },
          border:     { light: '#E5E7EB', DEFAULT: '#D1D5DB', dark: '#4B5563' }
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          mono: ['Fira Code', 'monospace']
        },
        fontSize: {
          xs:  ['0.75rem',  { lineHeight: '1rem' }],
          sm:  ['0.875rem', { lineHeight: '1.25rem' }],
          base:['1rem',    { lineHeight: '1.5rem' }],
          lg:  ['1.125rem',{ lineHeight: '1.75rem' }],
          xl:  ['1.25rem', { lineHeight: '1.75rem' }],
          '2xl':['1.5rem', { lineHeight: '2rem' }],
          '3xl':['1.875rem',{ lineHeight: '2.25rem' }],
          '4xl':['2.25rem', { lineHeight: '2.5rem' }],
          '5xl':['3rem',    { lineHeight: '1' }],
          '6xl':['3.75rem', { lineHeight: '1' }]
        },
        spacing: {
          'safe-top':    'calc(env(safe-area-inset-top) + 4rem)',
          'safe-bottom': 'calc(env(safe-area-inset-bottom) + 1rem)',
          'safe-left':   'calc(env(safe-area-inset-left) + 1rem)',
          'safe-right':  'calc(env(safe-area-inset-right) + 1rem)'
        },
        borderRadius: {
          sm: '0.125rem', DEFAULT: '0.25rem', md: '0.375rem',
          lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', full: '9999px'
        },
        boxShadow: {
          xs: '0 0 0 1px rgba(0,0,0,0.05)',
          sm: '0 1px 2px -1px rgba(0,0,0,0.1)',
          DEFAULT:
            '0 1px 3px rgba(0,0,0,0.1),' +
            '0 1px 2px rgba(0,0,0,0.06)',
          md:
            '0 4px 6px -1px rgba(0,0,0,0.1),' +
            '0 2px 4px -1px rgba(0,0,0,0.06)',
          lg:
            '0 10px 15px -3px rgba(0,0,0,0.1),' +
            '0 4px 6px -2px rgba(0,0,0,0.05)',
          xl:
            '0 20px 25px -5px rgba(0,0,0,0.1),' +
            '0 10px 10px -5px rgba(0,0,0,0.04)',
          '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
          inner:'inset 0 2px 4px rgba(0,0,0,0.06)',
          none: 'none'
        },
        transitionTimingFunction: {
          DEFAULT: 'cubic-bezier(0.4,0,0.2,1)',
          'in-out': 'cubic-bezier(0.4,0,0.2,1)',
          out:      'cubic-bezier(0,0,0.2,1)',
          in:       'cubic-bezier(0.4,0,1,1)'
        },
        transitionDuration: {
          DEFAULT: '150ms', 75: '75ms', 100: '100ms',
          200: '200ms', 300: '300ms', 500: '500ms',
          700: '700ms', 1000: '1000ms'
        },
        maxWidth: { '8xl': '88rem', '9xl': '96rem' },
        screens:  { '3xl': '1920px' }
      }
    },
    plugins: [],
  };
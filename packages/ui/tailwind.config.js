/** @type {Partial<import('tailwindcss').Config>} */
export const tailwindBaseConfig = {
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        border: `var(--border)`,
        input: `var(--input)`,
        ring: `var(--ring)`,
        background: `var(--background)`,
        foreground: `var(--foreground)`,
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
      },
      borderRadius: {
        xl: '1.25rem',
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
      },
      spacing: {
        'safe-top': 'calc(env(safe-area-inset-top))',
        'safe-bottom': 'calc(env(safe-area-inset-bottom)) - 1rem',
        'safe-left': 'calc(env(safe-area-inset-left))',
        'safe-right': 'calc(env(safe-area-inset-right))',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4,0,0.2,1)',
        'in-out': 'cubic-bezier(0.4,0,0.2,1)',
        out: 'cubic-bezier(0,0,0.2,1)',
        in: 'cubic-bezier(0.4,0,1,1)',
      },
    },
  },
  presets: [require('@lynx-js/tailwind-preset')],
  plugins: [require('tailwindcss-animate')],
};

export default tailwindBaseConfig;

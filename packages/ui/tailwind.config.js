/** @type {Partial<import('tailwindcss').Config>} */
export const tailwindBaseConfig = {
  darkMode: 'media',
  corePlugins: {
    // Disable backdrop utilities (::backdrop pseudo-element not supported in LynxJS)
    backdropOpacity: false,
    backdropFilter: false,
    // Disable placeholder variants (will handle with global CSS using LynxJS-native ::placeholder)
    placeholderColor: false,
    placeholderOpacity: false,
  },
  theme: {
    extend: {
      colors: {
        // Ariob Brand Colors - "Digital Sovereignty" Theme
        brand: {
          primary: "#2D3142",
          'primary-light': "#4F5D75",
          'primary-dark': "#1A1D2E",
          secondary: "#FF6B6B",
          'secondary-light': "#FF8787",
          'secondary-dark': "#E65555",
          accent: "#FFE66D",
          'accent-light': "#FFF29C",
          'accent-dark': "#F5D642",
          success: "#06D6A0",
          'success-light': "#38E1B3",
          'success-dark': "#05BF8E",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        'tiny': '0.875rem',
        'xs': '1rem', 
        'sm': '1.125rem',    
        '2.5xl': '1.5rem',
        'huge': '5rem',
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
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        spin: 'spin 1s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      spacing: {
        'safe-top': 'calc(env(safe-area-inset-top))',
        'safe-bottom': 'calc(env(safe-area-inset-bottom))',
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
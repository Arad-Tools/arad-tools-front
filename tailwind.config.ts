import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        vazir: ['var(--font-vazir)', 'Tahoma', 'Arial', 'sans-serif'],
        sans: ['var(--font-vazir)', 'Tahoma', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fff4ed',
          100: '#ffe6d5',
          200: '#ffc9a8',
          300: '#ffa270',
          400: '#fe7137',
          500: '#fc4d0f',
          600: '#ed3405',
          700: '#c52306',
          800: '#9c1e0d',
          900: '#7e1c0e',
          950: '#440a04',
          DEFAULT: '#D4490E',
        },
        navy: {
          50:  '#eef3f8',
          100: '#d4e1ec',
          200: '#a9c3d9',
          300: '#7399bb',
          400: '#4a75a0',
          500: '#305b87',
          600: '#254870',
          700: '#1f3b5c',
          800: '#1a2e44', // ← primary brand navy
          900: '#111f2e',
          950: '#080f17',
          DEFAULT: '#1a2e44',
        },
      },
      screens: {
        xs: '375px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)',
        'card-hover': '0 8px 24px -4px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.07)',
        'product': '0 2px 8px rgba(0,0,0,0.06)',
        'product-hover': '0 12px 32px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.25rem',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'slide-in-rtl': 'slideInRtl 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        slideInRtl: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

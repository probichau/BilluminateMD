/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#CCFBF1',
          600: '#0D9488',
          700: '#0F766E',
        },
        accent: {
          500: '#10B981',
          600: '#059669',
        },
        error: {
          500: '#EF4444',
        },
        warning: {
          500: '#F59E0B',
        },
        gray: {
          100: '#F3F4F6',
          400: '#9CA3AF',
          700: '#374151',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Source Sans Pro', 'system-ui', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'Satoshi', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-trust': 'linear-gradient(135deg, #0D9488 0%, #059669 100%)',
      },
    },
  },
  plugins: [],
}

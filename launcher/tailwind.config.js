/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070a0f',
          900: '#0c1017',
          800: '#141a24',
          700: '#1c2433',
          600: '#242e40',
          500: '#2e3a50',
        },
        cyan: {
          glow: '#00f0ff',
          accent: '#00c8ff',
          dark: '#008ba3',
        },
        brand: {
          blue: '#0088ff',
          purple: '#7928ca',
          gold: '#ffb700',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}

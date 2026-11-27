/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        trilha: {
          blue: {
            50: '#EEF2FF',
            100: '#E0E7FF',
            500: '#3E64DE',
            600: '#3252B8',
            700: '#273F8F',
            800: '#1D2F6B',
            900: '#142049',
          },
          gold: {
            400: '#FBBF24',
            500: '#FFC107',
            600: '#E0A800',
            700: '#B45309',
          },
          dark: {
            800: '#1E293B',
            900: '#0F172A',
            950: '#020617',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

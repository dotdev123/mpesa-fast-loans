/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional M-Pesa inspired palette
        mpesa: {
          50:  '#e8f8ef',
          100: '#d1f1df',
          200: '#a3e3bf',
          300: '#75d59f',
          400: '#47c77f',
          500: '#00A651',   // Main M-Pesa green
          600: '#008f45',
          700: '#007839',
          800: '#00612e',
          900: '#004b23',
        },
        dark: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
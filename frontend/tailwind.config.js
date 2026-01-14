/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#050a18',
        accent: '#d4af37',
        'accent-dark': '#b8941f',
        surface: '#0f172a',
        'surface-light': '#1e293b',
      },
      boxShadow: {
        glow: '0 0 40px rgba(212, 175, 55, 0.3)',
        'glow-lg': '0 10px 60px rgba(212, 175, 55, 0.4)',
      },
    },
  },
  plugins: [],
};

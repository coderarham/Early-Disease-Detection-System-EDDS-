/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
      },
      fontSize: {
        'xs': '0.7rem',
        'sm': '0.8rem', 
        'base': '0.9rem',
        'lg': '1rem',
        'xl': '1.1rem',
        '2xl': '1.25rem',
        '3xl': '1.45rem',
        '4xl': '1.75rem',
        '5xl': '2.15rem',
        '6xl': '2.55rem'
      }
    },
  },
  plugins: [],
}

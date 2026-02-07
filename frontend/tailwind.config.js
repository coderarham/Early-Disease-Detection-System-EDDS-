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
        'xs': '0.8rem',
        'sm': '0.925rem', 
        'base': '1.05rem',
        'lg': '1.175rem',
        'xl': '1.3rem',
        '2xl': '1.55rem',
        '3xl': '1.925rem',
        '4xl': '2.3rem',
        '5xl': '3.05rem',
        '6xl': '3.8rem'
      }
    },
  },
  plugins: [],
}

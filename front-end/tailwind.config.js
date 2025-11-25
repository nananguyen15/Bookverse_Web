/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brown: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
        beige: {
          50: '#fdfbf7',
          100: '#f7f3e8',
          200: '#efe9d8',
          300: '#e5dec6',
          400: '#d8cfb2',
          500: '#c6b996',
          600: '#b3a480',
          700: '#9c8c6b',
          800: '#857659',
          900: '#6e6047',
        },
      }
    },
  },
  plugins: [],
};

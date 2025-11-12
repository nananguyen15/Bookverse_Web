/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        beige: {
          100: "rgb(248, 244, 225)",
          300: "rgb(175, 143, 111)",
          500: "rgb(116, 81, 45)",
          700: "rgb(84, 51, 16)",
          800: "rgb(66, 33, 0)",
          900: "rgb(51, 20, 0)",
        },
      },
      fontFamily: {
        brand: ["LovelyHome", "serif"],
        heading: ["BelgianoSerif2", "serif"],
        body: ["OpenSans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

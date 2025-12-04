// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <--- THIS LINE IS IMPORTANT
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
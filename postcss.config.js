// postcss.config.js (Correct for Tailwind v4+)
export default {
  plugins: {
    // Use the dedicated PostCSS plugin package
    '@tailwindcss/postcss': {}, 
    autoprefixer: {},
  },
}
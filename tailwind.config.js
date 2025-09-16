/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add custom utility for pixelated image rendering
      imageRendering: {
        'pixelated': 'pixelated',
      }
    },
  },
  plugins: [
    // Add custom utility plugin for image rendering
    function({ addUtilities }) {
      const newUtilities = {
        '.image-render-pixelated': {
          'image-rendering': 'pixelated',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

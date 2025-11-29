/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a237e',  // Indigo blue
        dark: '#0f0f0f',     // Netflix black
      },
    },
  },
  plugins: [],
  darkMode: 'class',  // For future dark mode
}
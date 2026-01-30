// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",      // All components
    "./src/**/**/*.{js,jsx,ts,tsx}",   // (Optional) Deep nested folders
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

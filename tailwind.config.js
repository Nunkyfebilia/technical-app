/** @type {import('tailwindcss').Config} */
module.exports = {
  // Update this to include your src folder and App.js
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
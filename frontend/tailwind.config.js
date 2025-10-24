/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#1193d4',
        'primary-dark': '#0d7ab8',
        success: '#078836',
        warning: '#F0AD4E',
        danger: '#D9534F',
      },
    },
  },
  plugins: [],
}

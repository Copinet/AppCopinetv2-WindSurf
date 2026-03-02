/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C0C0C0', // Prata
          dark: '#A8A8A8',
          light: '#D3D3D3',
        },
        secondary: {
          DEFAULT: '#FFD700', // Dourado
          dark: '#DAA520',
          light: '#FFEC8B',
        },
      },
    },
  },
  plugins: [],
}


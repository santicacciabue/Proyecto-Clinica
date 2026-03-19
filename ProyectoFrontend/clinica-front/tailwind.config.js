/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1e3a5f', light: '#2d5a8e' },
        accent: { DEFAULT: '#00b4d8', light: '#48cae4' },
        success: { DEFAULT: '#2ecc71' },
        warn: { DEFAULT: '#e74c3c' },
        surface: { DEFAULT: '#ffffff', hover: '#f8f9fb' },
        border: { DEFAULT: '#e2e8f0', light: '#f1f3f5' },
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
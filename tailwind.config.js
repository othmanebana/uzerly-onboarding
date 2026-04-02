/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        main: '#EE0669',
        'main-dark': '#cc0558',
        bg: '#f2f4f7',
        'text-base': '#303030',
        secondary: '#f9f9f9',
        border: '#D8DFE9',
        success: '#13d275',
        info: '#7f88ad',
        error: '#ff4861',
      },
      fontSize: {
        base: ['13px', { lineHeight: '1.6' }],
      },
    },
  },
  plugins: [],
}

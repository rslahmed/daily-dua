/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0A0F0D',
          card: '#111D19',
          cardSecondary: '#0D1613',
          border: '#192C25',
          borderHover: '#234438',
        },
        emerald: {
          primary: '#10B981',
          light: '#34D399',
          lighter: '#6EE7B7',
          dark: '#065F46',
          darker: '#044E39',
        }
      },
      fontFamily: {
        arabic: ['hafs', 'noorehuda', 'serif'],
        bangla: ['Noto Sans Bengali', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

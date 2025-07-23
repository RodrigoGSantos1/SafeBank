/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FE7359',
        background: '#121E28',
        card: '#1E293B',
        textPrimary: '#FFFFFF',
        textSecondary: '#CBD5E1',
        border: '#334155',
      },
      fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
      },
      borderRadius: {
        sm: 6,
        md: 10,
        lg: 16,
        xl: 24,
        '2xl': 32,
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
      },
    },
  },
  plugins: [],
};

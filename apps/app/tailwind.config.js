/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // 'class' lets NativeWind apply dark styles via the colorScheme flag
  // rather than CSS media queries, which aligns with React Native's
  // Appearance API and app.json userInterfaceStyle.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // TruthLayer brand palette
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
}

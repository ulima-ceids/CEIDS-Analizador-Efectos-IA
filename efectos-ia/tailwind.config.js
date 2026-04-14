/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07070A',
          900: '#0D0D12',
          800: '#141419',
          700: '#1C1C24',
          600: '#252530',
          500: '#32323F',
          400: '#4A4A5C',
          300: '#6B6B82',
          200: '#9898AC',
          100: '#C4C4D0',
          50:  '#E8E8EE',
        },
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-amber': '0 0 20px rgba(249,115,22,0.3), 0 0 60px rgba(249,115,22,0.1)',
        'glow-cyan':  '0 0 20px rgba(34,211,238,0.25), 0 0 60px rgba(34,211,238,0.08)',
        'inner-ink':  'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
};

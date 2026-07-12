/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0E17',
        surface: '#121A2B',
        line: '#24304A',
        cyan: '#00E5FF',
        magenta: '#FF2E92',
        amber: '#FFB020',
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

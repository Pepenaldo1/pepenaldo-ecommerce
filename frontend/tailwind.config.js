/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0A17',
        surface: '#161329',
        line: '#2E2650',
        cyan: '#A855F7',
        magenta: '#F472B6',
        amber: '#FBBF24',
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

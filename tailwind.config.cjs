/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#080a0f',
          panel: '#0d111a',
          surface: '#141a26',
          border: '#1f293d',
          highlight: '#2a3752',
          text: '#d1d5db',
          muted: '#6b7280',
        },
        cyber: {
          green: '#00f796',
          red: '#ff3366',
          amber: '#ffb703',
          blue: '#00d2ff',
          purple: '#bd00ff',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(0, 247, 150, 0.35)',
        'glow-red': '0 0 15px rgba(255, 51, 102, 0.35)',
        'glow-blue': '0 0 15px rgba(0, 210, 255, 0.35)',
        'glow-amber': '0 0 15px rgba(255, 183, 3, 0.35)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 0.15s infinite',
      }
    },
  },
  plugins: [],
}

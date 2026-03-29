/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gh: {
          bg: '#0d1117',        // GitHub Dark main background
          canvas: '#161b22',    // GitHub Dark card background
          border: '#30363d',    // GitHub Dark border
          text: '#c9d1d9',      // GitHub Dark main text
          muted: '#8b949e',     // GitHub Dark secondary text
          link: '#58a6ff',      // GitHub Dark blue links
          green: '#238636',     // GitHub Dark primary button
          greenHover: '#2ea043',
          danger: '#f85149',    // GitHub Dark error text
          dangerBg: 'rgba(248, 81, 73, 0.1)', // Subtle red background
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Noto Sans"', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
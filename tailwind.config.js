/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,tsx}"],
  theme: {
    extend: {
      fontSize: {
        '2xl': '1.25rem', // h2 size
        '4xl': '2.5rem', // h1 size

      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      colors: {
        primary: '#7d4cdb',
        accent: '#32CD32',
        card: '#0F0F0F',
        'card-dark': '#0c0c0c',
        'chat-box': '#111111',
        'card-light': '#1F1F1F',
      },
      gridTemplateColumns: {
        'profile': '1fr 3fr'
      },
      height: {
        vp: 'calc(100vh - 108px)'
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
}


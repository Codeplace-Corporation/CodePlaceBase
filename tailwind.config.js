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
      },
      gridTemplateColumns: {
        'profile': '1fr 3fr'
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}


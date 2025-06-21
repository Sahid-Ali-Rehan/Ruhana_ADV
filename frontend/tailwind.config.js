/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enhanced color palette
        primary: "#8A5750",     // Refined reddish-brown (more muted)
        secondary: "#4D6B43",   // Deeper natural green
        accent: "#F9A02B",      // Vibrant orange for highlights
        teal: "#56C5DC",        // Complementary teal
        neutral: {
          light: "#EFE2B2",     // Soft cream background
          medium: "#97A276",    // Sage green muted
          dark: "#5D3A38",      // Deep earthy brown
        },
        
        // Refined color scales
        terracotta: {
          DEFAULT: '#8A5750',
          100: '#1a100f',
          200: '#34201e',
          300: '#4f302d',
          400: '#69403c',
          500: '#8A5750',
          600: '#a97a73',
          700: '#c19d98',
          800: '#d8bebb',
          900: '#f0dedc'
        },
        moss: {
          DEFAULT: '#4D6B43',
          100: '#0f150e',
          200: '#1e2a1c',
          300: '#2d3f29',
          400: '#3c5437',
          500: '#4D6B43',
          600: '#6c8b61',
          700: '#90a888',
          800: '#b5c5b0',
          900: '#dae2d7'
        },
        parchment: {
          DEFAULT: '#EFE2B2',
          100: '#3f3514',
          200: '#7e6a28',
          300: '#be9f3c',
          400: '#d7c46f',
          500: '#EFE2B2',
          600: '#f2e8c1',
          700: '#f6eed1',
          800: '#f9f3e0',
          900: '#fcf9f0'
        },
        sunset: {
          DEFAULT: '#F9A02B',
          100: '#342008',
          200: '#674010',
          300: '#9b6018',
          400: '#ce8020',
          500: '#F9A02B',
          600: '#fab355',
          700: '#fbc680',
          800: '#fcd9aa',
          900: '#feecd5'
        },
        lagoon: {
          DEFAULT: '#56C5DC',
          100: '#0c2c33',
          200: '#185766',
          300: '#248399',
          400: '#30aecd',
          500: '#56C5DC',
          600: '#77d0e3',
          700: '#99dcea',
          800: '#bbe7f1',
          900: '#ddf3f8'
        }
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    },
  },
  plugins: [],
};
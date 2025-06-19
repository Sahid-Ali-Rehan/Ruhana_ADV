/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F68C1F",   // Orange for buttons and accents
        secondary: "#56C5DC", // Light blue for highlights
        black: "#000000",     // Black for text
        white: "#FFFFFF",     // White for backgrounds and contrast
        muted: "#7D835F",     // Muted tone for borders and subtle text
        
      },
       transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    },
  },
  plugins: [],
};

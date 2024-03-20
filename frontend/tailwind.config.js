// tailwind.config.js

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Enable dark mode using the 'class' strategy
  theme: {
    extend: {
      colors: {
        // Define your custom dark theme colors
        'dark-primary': '#1a202c',
        'dark-secondary': '#2d3748',
        'dark-text': '#f7fafc',
        // Add more custom colors as needed
      },
    },
  },
  plugins: [],
};
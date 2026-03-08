import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Palette A — "Hedgerow & Chalk" */
        brand: {
          50:  '#EEF7EF',   /* Palest green tint */
          100: '#D5ECD7',   /* Light green wash */
          200: '#B0D9B4',   /* Soft green */
          300: '#82C288',   /* Mid-light green */
          400: '#5FB366',   /* Approach green */
          500: '#4AA853',   /* Litter Pick Green – primary */
          600: '#3D8B45',   /* Deep green */
          700: '#2F6C36',   /* Dark green */
          800: '#224E27',   /* Near-black green */
          900: '#153319',   /* Deepest green */
        },
        accent: {
          50:  '#FDF5EC',   /* Lightest clay */
          100: '#F7E4D0',   /* Warm clay wash */
          200: '#EECBA5',   /* Pale terracotta */
          300: '#DBA576',   /* Soft terracotta */
          400: '#C67B4E',   /* Clay Terracotta – accent */
          500: '#B06A3B',   /* Rich terracotta */
          600: '#8C5030',   /* Dark clay */
        },
        stone: {
          50:  '#FAF8F5',   /* Chalk White – main bg */
          100: '#F2EEEA',   /* Warm stone wash */
          200: '#E3DDD6',   /* Light stone */
          300: '#B8A98F',   /* Warm Stone – secondary */
          400: '#9A8E78',   /* Mid stone */
        },
      },
      textColor: {
        loam:      '#2C2C2A',   /* Dark Loam – primary text */
        weathered: '#6B6B65',   /* Weathered – secondary text */
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;

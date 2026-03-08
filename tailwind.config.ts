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
          50:  '#F2F7EC',   /* Pale Meadow – tinted card bg */
          100: '#E1ECDA',   /* Light hedgerow wash */
          200: '#C5D6A8',   /* Soft leaf */
          300: '#9BB88A',   /* Lichen bridge */
          400: '#7A9B5A',   /* Mid hedgerow */
          500: '#3A6B1E',   /* Deep Hedgerow – primary */
          600: '#2D5016',   /* Deep Moss – darker primary */
          700: '#1E3A0F',   /* Dark canopy */
          800: '#142A0A',   /* Near-black green */
          900: '#0B1C06',   /* Deepest green */
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

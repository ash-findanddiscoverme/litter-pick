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
        /* Palette — "Hedgerow & Chalk" (refined) */
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
        /* New nature-inspired accents */
        sky: {
          50:  '#EBF6F8',
          100: '#D0EBF0',
          200: '#A8D9E3',
          300: '#7BBFCF',   /* Fresh outdoorsy blue */
          400: '#5AA8BC',
          500: '#3D8FA6',
        },
        sunlight: {
          50:  '#FEF9EC',
          100: '#FCF0D0',
          200: '#F9E4A8',
          300: '#F5C864',   /* Warm optimistic yellow */
          400: '#E8B23D',
          500: '#D49A1F',
        },
        bark: {
          50:  '#F5F0ED',
          100: '#E8DED7',
          200: '#D1BFB2',
          300: '#A98F7C',
          400: '#6B5344',   /* Rich brown for grounding */
          500: '#4D3B30',
        },
        moss: {
          50:  '#F2F5EF',
          100: '#E2E9DB',
          200: '#C8D6BA',
          300: '#A8C094',
          400: '#8BA872',   /* Softer green variant */
          500: '#6E8F55',
        },
      },
      textColor: {
        loam:      '#2C2C2A',   /* Dark Loam – primary text */
        weathered: '#6B6B65',   /* Weathered – secondary text */
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(44, 44, 42, 0.08), 0 4px 16px -4px rgba(44, 44, 42, 0.12)',
        'soft-lg': '0 4px 12px -2px rgba(44, 44, 42, 0.1), 0 8px 24px -4px rgba(44, 44, 42, 0.15)',
        'glow-brand': '0 0 20px rgba(74, 168, 83, 0.25)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

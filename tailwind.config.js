/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8edf5',
          100: '#c5d0e6',
          200: '#9eb0d5',
          300: '#7690c4',
          400: '#5878b8',
          500: '#3a60ab',
          600: '#2d4f91',
          700: '#1e3a73',
          800: '#122657',
          900: '#0a1830',
          950: '#060e1d',
        },
        teal: {
          50:  '#e0faf8',
          100: '#b3f3ee',
          200: '#7feae3',
          300: '#4adfd7',
          400: '#1fd6ce',
          500: '#00ccc4',
          600: '#00b5ae',
          700: '#009991',
          800: '#007d76',
          900: '#005f5a',
        },
        accent: {
          yellow: '#f9c846',
          coral:  '#ff6b6b',
          green:  '#51cf66',
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        body:    ['"Inter"',   'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern':
          'linear-gradient(135deg, #0a1830 0%, #122657 50%, #007d76 100%)',
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease-in-out',
        'slide-up':    'slideUp 0.3s ease-out',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'skeleton':    'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        skeleton: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
      },
      boxShadow: {
        card:  '0 4px 24px rgba(0,0,0,0.18)',
        glow:  '0 0 20px rgba(0,204,196,0.3)',
        'glow-lg': '0 0 40px rgba(0,204,196,0.4)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /* Brand accent tokens */
        'accent-pink': {
          DEFAULT:    'hsl(var(--accent-pink))',
          foreground: 'hsl(0 0% 100%)',
        },
        'accent-gold': {
          DEFAULT:    'hsl(var(--accent-gold))',
          foreground: 'hsl(246 17% 20%)',
        },
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'glow-primary':  '0 0 20px -4px hsl(var(--primary) / 0.35)',
        'glow-secondary':'0 0 20px -4px hsl(var(--secondary) / 0.35)',
        /* keep legacy names for any components not yet updated */
        'glow-teal':     '0 0 20px -4px hsl(var(--primary) / 0.35)',
        'glow-purple':   '0 0 20px -4px hsl(var(--secondary) / 0.35)',
        'card':          '0 2px 16px -4px rgba(0,0,0,0.06)',
        'card-lg':       '0 4px 32px -8px rgba(0,0,0,0.10)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'shimmer':        'shimmer 1.8s ease-in-out infinite',
        'fade-up':        'fade-up 0.35s ease-out',
      },
      backgroundImage: {
        'gradient-radial':    'radial-gradient(var(--tw-gradient-stops))',
        'noise':              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
        'hero-gradient':      'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--secondary) / 0.08) 50%, hsl(var(--primary) / 0.06) 100%)',
        'card-gradient':      'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.8) 100%)',
        'brand-gradient':     'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
        'primary-gradient':   'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%)',
        'secondary-gradient': 'linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--secondary) / 0.7) 100%)',
        /* legacy aliases */
        'teal-gradient':      'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%)',
        'purple-gradient':    'linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--secondary) / 0.7) 100%)',
      },
    },
  },
  plugins: [],
}

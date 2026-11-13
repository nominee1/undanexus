/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        ink: {
          950: '#110f0d',
          900: '#0a0a0f',
          800: '#0d0d12',
          700: '#16161d',
        },
        brand: {
          DEFAULT: 'var(--brand)',
          soft: 'var(--brand-soft)',
          glow: 'var(--brand-glow)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['"Space Mono"', 'Inter', 'sans-serif'],
        mono: ['Menlo', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['"Space Mono"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        brand: '0 0 0 1px color-mix(in srgb, var(--brand) 35%, transparent), 0 0 28px var(--brand-glow)',
        card: '0 30px 80px -20px rgba(0, 0, 0, 0.8)',
      },
      letterSpacing: {
        access: '0.12em',
      },
    },
  },
  plugins: [],
};

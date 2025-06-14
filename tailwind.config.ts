
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Verdana', 'sans-serif'],
        headline: ['Verdana', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)', // 1.5rem (24px)
        md: 'calc(var(--radius) - 0.5rem)', // 1rem (16px)
        sm: 'calc(var(--radius) - 1rem)', // 0.5rem (8px)
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'rgb-border-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'bobble': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-6px) rotate(-5deg)'},
          '50%': { transform: 'translateY(0px) rotate(0deg)' },
          '75%': { transform: 'translateY(-6px) rotate(5deg)' },
        },
        'rgb-icon-animation': {
          '0%, 100%': { color: 'hsl(var(--primary))' },
          '25%': { color: 'hsl(var(--accent))' },
          '50%': { color: 'hsl(var(--destructive))' },
          '75%': { color: 'hsl(var(--destructive))' },
        },
        'chefhat-fill': {
          '0%, 100%': { color: 'hsla(var(--accent), 0.4)' }, // Use accent color (orange)
          '50%': { color: 'hsla(var(--accent), 1)' },
        },
        'subtle-opacity-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'rgb-border-spin': 'rgb-border-spin 4s linear infinite',
        'bobble': 'bobble 2.5s ease-in-out infinite',
        'rgb-icon': 'rgb-icon-animation 3s linear infinite',
        'chefhat-fill': 'chefhat-fill 2s ease-in-out infinite', // Adjusted duration
        'subtle-opacity-pulse': 'subtle-opacity-pulse 3s ease-in-out infinite',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

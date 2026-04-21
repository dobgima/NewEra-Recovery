import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 40px 120px rgba(15, 23, 42, 0.12)'
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top left, rgba(56, 189, 248, 0.2), transparent 30%), radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.16), transparent 25%)'
      },
      textColor: {
        'sky-700': '#0369a1',
        'cyan-700': '#0e7490',
        'emerald-700': '#047857'
      }
    }
  },
  plugins: [],
} satisfies Config

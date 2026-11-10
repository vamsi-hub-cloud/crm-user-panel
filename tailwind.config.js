/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        // brand = vivid violet; accents (fuchsia, orange, teal, amber) come from Tailwind defaults
        brand: {
          50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
          500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(76,29,149,.05), 0 4px 14px rgba(76,29,149,.07)',
        glow: '0 10px 30px -8px rgba(124,58,237,.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg,#7c3aed 0%,#d946ef 55%,#f97316 100%)',
      },
    },
  },
  plugins: [],
};

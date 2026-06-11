/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coral:    { DEFAULT: '#FF6B6B', light: '#FFE5E5', dark: '#E85555' },
        amber:    { DEFAULT: '#FFB347', light: '#FFF0D0', dark: '#E89A2E' },
        teal:     { DEFAULT: '#4ECDC4', light: '#E0F7F6', dark: '#37B5AC' },
        lavender: { DEFAULT: '#A78BFA', light: '#EDE9FE', dark: '#8B6FE0' },
        mint:     { DEFAULT: '#6BCB77', light: '#E5F7E8', dark: '#4FB55C' },
        warm: {
          50:  '#FFFAF5',
          100: '#FFF8F0',
          200: '#FFF0E0',
          300: '#FFE4C8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        glass:    '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
        'glass-lg': '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
        'glass-xl': '0 16px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        soft:     '0 2px 12px rgba(0,0,0,0.06)',
        glow:     '0 0 24px rgba(255,107,107,0.25)',
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E8 50%, #F5F0FF 100%)',
        'coral-gradient': 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
        'teal-gradient':  'linear-gradient(135deg, #4ECDC4, #7EDDD7)',
        'lavender-gradient': 'linear-gradient(135deg, #A78BFA, #C4B0FD)',
        'amber-gradient': 'linear-gradient(135deg, #FFB347, #FFCA7A)',
        'mint-gradient':  'linear-gradient(135deg, #6BCB77, #96DA9F)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

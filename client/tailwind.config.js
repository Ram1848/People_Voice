/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.65)',
          surfaceHover: 'rgba(255, 255, 255, 0.82)',
          border: 'rgba(255, 255, 255, 0.6)',
          borderHover: 'rgba(255, 255, 255, 0.9)',
          pill: 'rgba(255, 255, 255, 0.5)',
        }
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'glass-sm': '0 2px 10px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'glass': '0 8px 30px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        'glass-modal': '0 24px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'voice-glow': '0 0 35px rgba(34, 197, 94, 0.35)',
        'ai-glow': '0 0 35px rgba(124, 58, 237, 0.25)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 1.5s ease-out infinite',
        'liquid-breathe': 'liquidBreathe 3s ease-in-out infinite',
        'wave-bar': 'waveBar 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.85)', opacity: '0.9' },
          '100%': { transform: 'scale(2.3)', opacity: '0' },
        },
        liquidBreathe: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 25px rgba(34, 197, 94, 0.25)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 45px rgba(34, 197, 94, 0.45)' },
        },
        waveBar: {
          '0%': { height: '6px' },
          '100%': { height: '32px' },
        }
      }
    },
  },
  plugins: [],
}

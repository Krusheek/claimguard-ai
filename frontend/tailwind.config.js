/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      scale: {
        '101': '1.01',
      },
      colors: {
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7', // Primary interactive
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          navy: '#0F172A', // Slate 900
          midnight: '#0B1120',
          accent: '#2563EB',
        },
        medical: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          500: '#14B8A6',
          600: '#0D9488', // Clinical teal
          700: '#0F766E',
          cyan: '#06B6D4',
          slate: '#1E293B',
        },
        status: {
          pass: {
            DEFAULT: '#059669',
            bg: '#ECFDF5',
            border: '#A7F3D0',
            text: '#047857',
          },
          warning: {
            DEFAULT: '#D97706',
            bg: '#FFFBEB',
            border: '#FDE68A',
            text: '#B45309',
          },
          fail: {
            DEFAULT: '#E11D48',
            bg: '#FFF1F2',
            border: '#FECDD3',
            text: '#BE123C',
          },
          info: {
            DEFAULT: '#2563EB',
            bg: '#EFF6FF',
            border: '#BFDBFE',
            text: '#1D4ED8',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'elevation': '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'inner-subtle': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'diffused': '0 4px 20px 0 rgba(0, 0, 0, 0.03)',
        'diffused-hover': '0 8px 30px 0 rgba(0, 0, 0, 0.06)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.8s infinite',
        'pulse-slow': 'pulseSlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

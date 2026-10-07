/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#4F46E5',
          dark: '#3730A3',
          light: '#EEF2FF',
          hover: '#4338CA'
        },
        accent: {
          DEFAULT: '#0EA5E9',
          light: '#E0F2FE'
        },
        charcoal: {
          DEFAULT: '#172033',
          muted: '#64748B',
          light: '#94A3B8'
        },
        border: '#E2E8F0',
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7'
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
        'btn': '10px',
        'modal': '16px',
        'input': '10px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 2px 6px -1px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}

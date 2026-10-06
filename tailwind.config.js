/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kd: {
          'navy-900': 'var(--kd-navy-900, #0E2350)',
          'navy-800': '#102A60',
          'navy-700': 'var(--kd-navy-700, #14336F)',
          'navy-500': 'var(--kd-navy-500, #2A4E96)',
          'navy-100': '#DCE5F5',
          'navy-50': 'var(--kd-navy-50, #EEF2FA)',
          
          saffron: 'var(--kd-saffron, #F07421)',
          'saffron-hover': '#D96214',
          'saffron-100': '#FFE5D3',
          'saffron-50': 'var(--kd-saffron-50, #FFF3EA)',
          
          green: 'var(--kd-green, #1C8A3C)',
          'green-hover': '#157030',
          'green-100': '#D4EEDC',
          'green-50': 'var(--kd-green-50, #EAF6EE)',
          
          'grey-050': 'var(--kd-grey-050, #F6F7F9)',
          'grey-100': '#ECEEF2',
          'grey-200': 'var(--kd-grey-200, #E3E6EB)',
          'grey-300': '#D1D5DB',
          'grey-400': '#9CA3AF',
          'grey-500': 'var(--kd-grey-500, #6B7280)',
          'grey-700': '#374151',
          'grey-900': 'var(--kd-grey-900, #111827)',
          
          success: 'var(--kd-success, #1C8A3C)',
          warning: 'var(--kd-warning, #B45309)',
          danger: 'var(--kd-danger, #B42318)',
          info: 'var(--kd-info, #2A4E96)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(14, 35, 80, 0.06), 0 1px 2px 0 rgba(14, 35, 80, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(14, 35, 80, 0.08), 0 8px 10px -6px rgba(14, 35, 80, 0.04)',
        'header': '0 1px 2px 0 rgba(14, 35, 80, 0.05)',
      },
    },
  },
  plugins: [],
}

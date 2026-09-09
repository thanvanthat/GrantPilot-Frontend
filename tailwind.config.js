import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // --- Government saffron (primary action colour, used with restraint) ---
        saffron: {
          50: '#FDF3E8',
          100: '#FBE3C6',
          200: '#F7C88C',
          300: '#F4AE59',
          400: '#F29A3D',
          500: '#F28C28',
          600: '#D9761A',
          700: '#B45E12',
          DEFAULT: '#F28C28',
        },
        // --- Government navy (sidebar, headers, trust elements) ---
        navy: {
          50: '#EEF2F8',
          100: '#D8E1EE',
          700: '#1B4A7A',
          800: '#153F68',
          900: '#12355B',
          950: '#0B2447',
          DEFAULT: '#12355B',
        },
        gov: {
          green: '#2E7D32',
          greenLight: '#E6F4EA',
          amber: '#ED6C02',        // warning
          amberLight: '#FDF0E3',
          red: '#C62828',          // danger
          redLight: '#FBEAEA',
          info: '#1565C0',
          infoLight: '#E7F0FA',
          bg: '#F4F6F8',
          card: '#FFFFFF',
          border: '#D8DEE6',
          ink: '#1F2937',
          muted: '#5B6573',
        },
        // --- AI-assisted information only (never the dominant colour) ---
        ai: {
          DEFAULT: '#4F46A5',
          light: '#EEEDF7',
          border: '#D8D5EE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        cardHover: '0 6px 16px -4px rgba(15, 23, 42, 0.12), 0 2px 6px -2px rgba(15, 23, 42, 0.06)',
        strip: '0 1px 0 0 rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        gov: '8px',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
      },
    },
  },
  plugins: [animate],
}

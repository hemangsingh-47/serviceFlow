/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: 'var(--color-primary-100)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
        },
        neutral: {
          50: 'var(--color-neutral-50)',
          200: 'var(--color-neutral-200)',
          500: 'var(--color-neutral-500)',
          700: 'var(--color-neutral-700)',
          900: 'var(--color-neutral-900)',
        },
        status: {
          received: 'var(--color-status-received)',
          diagnosed: 'var(--color-status-diagnosed)',
          'in-progress': 'var(--color-status-in-progress)',
          'awaiting-parts': 'var(--color-status-awaiting-parts)',
          ready: 'var(--color-status-ready)',
          delivered: 'var(--color-status-delivered)',
        },
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      }
    },
  },
  plugins: [],
}

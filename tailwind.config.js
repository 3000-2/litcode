/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          hover: 'var(--bg-hover)',
          active: 'var(--bg-active)',
        },
        fg: {
          primary: 'var(--fg-primary)',
          secondary: 'var(--fg-secondary)',
          muted: 'var(--fg-muted)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
          hover: 'var(--accent-hover)',
        },
        diff: {
          'added-bg': 'var(--diff-added-bg)',
          'added-fg': 'var(--diff-added-fg)',
          'removed-bg': 'var(--diff-removed-bg)',
          'removed-fg': 'var(--diff-removed-fg)',
          'modified-bg': 'var(--diff-modified-bg)',
          'modified-fg': 'var(--diff-modified-fg)',
        },
      },
      fontFamily: {
        mono: ['var(--font-family)', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        '2xs': '10px',
        xs: '11px',
        sm: '12px',
        base: '13px',
      },
      spacing: {
        'sidebar': 'var(--sidebar-width)',
        'sidebar-expanded': 'var(--sidebar-expanded-width)',
        'statusbar': 'var(--statusbar-height)',
        'tabbar': 'var(--tabbar-height)',
      },
      width: {
        'sidebar': 'var(--sidebar-width)',
        'sidebar-expanded': 'var(--sidebar-expanded-width)',
      },
      minWidth: {
        'sidebar': 'var(--sidebar-width)',
        'sidebar-expanded': 'var(--sidebar-expanded-width)',
      },
      height: {
        'sidebar': 'var(--sidebar-width)',
        'statusbar': 'var(--statusbar-height)',
        'tabbar': 'var(--tabbar-height)',
      },
      minHeight: {
        'header': '36px',
        'statusbar': 'var(--statusbar-height)',
        'tabbar': 'var(--tabbar-height)',
      },
      borderRadius: {
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
}

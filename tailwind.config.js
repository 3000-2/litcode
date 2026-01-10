/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        tertiary: 'var(--bg-tertiary)',
        hover: 'var(--bg-hover)',
        active: 'var(--bg-active)',
        accent: {
          DEFAULT: 'var(--accent-color)',
          hover: 'var(--accent-hover)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
        },
        diff: {
          added: 'var(--diff-added-bg)',
          removed: 'var(--diff-removed-bg)',
          modified: 'var(--diff-modified-bg)',
        },
      },
      textColor: {
        fg: {
          primary: 'var(--fg-primary)',
          secondary: 'var(--fg-secondary)',
          muted: 'var(--fg-muted)',
        },
        accent: 'var(--accent-color)',
        diff: {
          added: 'var(--diff-added-fg)',
          removed: 'var(--diff-removed-fg)',
          modified: 'var(--diff-modified-fg)',
        },
      },
      borderColor: {
        default: 'var(--border-color)',
        accent: 'var(--accent-color)',
      },
      fontFamily: {
        mono: ['var(--editor-font-family)', 'monospace'],
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

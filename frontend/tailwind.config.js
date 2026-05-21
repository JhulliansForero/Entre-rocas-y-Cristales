/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:    '#2a1f17',
        bark:   '#3a2a1e',
        bronze: '#6c4d29',
        amber:  '#b27729',
        clay:   '#c8895a',
        forest: '#2f3e1c',
        moss:   '#5e7c34',
        sage:   '#889b6b',
        fern:   '#d7dec6',
        cream:  '#f8f5e8',
        paper:  '#fbf8e9',
        bone:   '#f0ebd6',
        snow:   '#ffffff',
        muted:  '#7a6a55',
        faint:  '#aa9c83',
        danger: '#b8392b',
        warn:   '#c98a1f',
        ok:     '#4a7728',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mark:    ['Marcellus', '"Cormorant Garamond"', 'serif'],
        body:    ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(42,31,23,.06), 0 1px 1px rgba(42,31,23,.04)',
        md: '0 6px 24px -8px rgba(42,31,23,.18), 0 2px 6px rgba(42,31,23,.06)',
        lg: '0 24px 60px -20px rgba(42,31,23,.28), 0 8px 16px -8px rgba(42,31,23,.08)',
      },
    },
  },
  plugins: [],
}

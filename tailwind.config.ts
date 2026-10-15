import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vellum:    '#FAF5EE',
        forest:    '#0D1F14',
        ink:       '#1C1107',
        sienna:    '#B5421A',
        canopy:    '#3D6E35',
        gold:      '#C9924A',
        mist:      '#8C7B6A',
        sand:      '#D6C4A8',
        parchment: '#EDE5D5',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

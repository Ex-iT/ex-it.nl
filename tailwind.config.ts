/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin'
import type { PluginAPI } from 'tailwindcss/types/config'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--color-base))',
        back: 'rgb(var(--color-back))',
        primary: 'rgb(var(--color-primary))',
        secondary: 'rgb(var(--color-secondary))',
        hover: 'rgb(var(--color-hover))',
        active: 'rgb(var(--color-active))',
        highlight: 'rgb(var(--color-ex-it))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    plugin(function ({ addVariant, addUtilities }: PluginAPI) {
      addVariant('starting', '@starting-style')

      addUtilities({
        '.transition-discrete': {
          transitionBehavior: 'allow-discrete',
        },
      })
    }),
  ],
}

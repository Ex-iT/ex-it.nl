import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import pagefind from 'astro-pagefind'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import icon from 'astro-icon'
import { siteConfig } from './src/config'

export default defineConfig({
  site: siteConfig.site,
  server: { port: 3000 },
  build: {
    format: 'file',
  },
  integrations: [
    mdx(),
    pagefind(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
    icon({
      iconDir: 'src/assets/icons',
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'dracula-soft',
        dark: 'dracula',
      },
    },
  },
  devToolbar: {
    enabled: false,
  },
})

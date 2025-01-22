import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { siteConfig } from '../config'

export async function GET(context) {
  const notes = await getCollection('notes')

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site,
    items: notes.map(({ data, id }) => ({
      title: data.title,
      description: data.description,
      link: `/notes/${id}`,
      pubDate: data.pubDate,
    })),
  })
}

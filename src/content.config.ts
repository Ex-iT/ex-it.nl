import { defineCollection, z } from 'astro:content'
import { file, glob } from 'astro/loaders'
import { rssSchema } from '@astrojs/rss'

export const notesSchema = rssSchema.extend({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
})

const notes = defineCollection({
  loader: glob({
    pattern: ['*.{md,mdx}', '*/*/index.{md,mdx}'],
    base: './src/content/notes',
  }),
  schema: notesSchema,
})

export const pageSchema = z.object({
  title: z.string(),
})

const projectSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string(),
  avatar: z.string(),
})

const projects = defineCollection({
  loader: file('src/content/projects.json'),
  schema: projectSchema,
})

export const collections = { notes, projects }

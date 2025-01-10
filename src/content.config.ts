import { defineCollection, z } from 'astro:content'
import { file, glob } from 'astro/loaders'

export const notesSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  isDraft: z.boolean().optional(),
  tag: z.string().optional(),
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

const pages = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/pages',
  }),
  schema: pageSchema,
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

export const collections = { notes, pages, projects }

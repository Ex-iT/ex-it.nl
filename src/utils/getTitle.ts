import { siteConfig } from '../config.ts'

export default function (title: string) {
  return [title, siteConfig.title].join(' | ')
}

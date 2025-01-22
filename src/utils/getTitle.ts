import { siteConfig } from '../config.ts'

export default function (title = '') {
  return [title, siteConfig.title].filter(Boolean).join(' | ')
}

import { siteConfig } from '../config'

export default function (
  date: Date,
  language = siteConfig.language,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
) {
  return new Date(date).toLocaleDateString(language, options)
}

import { siteConfig } from '../config'

export default (
  date: Date,
  language = siteConfig.language,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
) => new Date(date).toLocaleDateString(language, options)

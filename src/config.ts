interface SiteConfig {
  title: string
  language: Intl.LocalesArgument
  direction: 'ltr' | 'rtl'
  description: string
  keywords: string
  author: string
  avatar: string
  favicon: string
  site: string
  pageSize: number
  latestNotesSize: number
  filesContentUrl: string
}

interface NavBarConfig {
  links: {
    name: string
    url: string
    target?: string
  }[]
}

interface SocialLink {
  label: string
  icon: string
  url: string
}

export const siteConfig: SiteConfig = {
  title: "Ex-iT's Notes",
  language: 'en',
  direction: 'ltr',
  description: "Ex-iT's notes on CTF's, cyber security, and development.",
  keywords:
    'Ex-iT, blog, CTF, HackTheBox, TryHackMe, security, programming, development',
  author: 'Ex-iT',
  avatar: '/images/me.png',
  favicon: '/favicon.ico',
  site: 'https://ex-it.nl',
  pageSize: 10,
  latestNotesSize: 3,
  filesContentUrl:
    'https://api.github.com/repos/Ex-iT/ex-it.nl/contents/src/content/notes',
}

export const navBarConfig: NavBarConfig = {
  links: [
    {
      name: 'Notes',
      url: '/notes',
    },
    {
      name: 'Projects',
      url: '/projects',
    },
    {
      name: 'About',
      url: '/about',
    },
  ],
}

export const socialLinks: SocialLink[] = [
  {
    label: 'GitHub',
    icon: 'mdi-github',
    url: 'https://github.com/Ex-iT/',
  },
  {
    label: 'Stack Overflow',
    icon: 'stack-overflow-icon-logo',
    url: 'https://stackoverflow.com/users/3351720/ex-it',
  },
  {
    label: 'Steam',
    icon: 'steam-icon-logo',
    url: 'https://steamcommunity.com/id/ex-it/',
  },
]

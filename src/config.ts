export const siteConfig: SiteConfig = {
  title: "Ex-iT's Notes",
  language: 'en',
  description: "Ex-iT's notes",
  keywords:
    'Ex-iT, blog, CTF, HackTheBox, TryHackMe, security, programming, development',
  author: 'Ex-iT',
  avatar: '/me.png',
  favicon: '/favicon.ico',
  site: 'https://ex-it.nl',
  page_size: 10,
}

export const navBarConfig: NavBarConfig = {
  links: [
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
  // https://icon-sets.iconify.design/material-symbols/
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

interface SiteConfig {
  title: string
  language: string
  description: string
  keywords: string
  author: string
  avatar: string
  favicon: string
  site: string
  page_size: number
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

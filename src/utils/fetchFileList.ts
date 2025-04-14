import { siteConfig } from '../config'

export interface File {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: string
  _links: {
    self: string
    git: string
    html: string
  }
}

export default function (id: string) {
  // const token = import.meta.env.GITHUB_AUTHORIZATION_BEARER_TOKEN
  const headers: RequestInit['headers'] = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`
  // }

  return fetch(`${siteConfig.filesContentUrl}/${id}`, { headers })
}

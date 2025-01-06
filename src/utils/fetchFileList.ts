import { siteConfig } from '../config'

// @TODO: handle errors
export default function (tag: string, project: string) {
  return fetch(`${siteConfig.filesContentUrl}/${tag}/${project}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
}

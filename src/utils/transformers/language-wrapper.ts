import type { ShikiTransformer } from '@shikijs/types'

export function transformerLanguageWrapper(): ShikiTransformer {
  return {
    name: 'language-wrapper',
    root(root) {
      root.children = [
        {
          type: 'element',
          tagName: 'div',
          properties: {
            class: 'shiki-wrapper',
          },
          children: [
            {
              type: 'element',
              tagName: 'span',
              properties: {
                class: 'lang',
              },
              children: [
                {
                  type: 'text',
                  value: String(this.pre.properties.dataLanguage ?? ''),
                },
              ],
            },
            ...(root.children as []),
          ],
        },
      ]
    },
  }
}

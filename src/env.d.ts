/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GITHUB_AUTHORIZATION_BEARER_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

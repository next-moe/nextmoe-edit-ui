export const REPO_URL = 'https://github.com/next-moe/nextmoe-edit-ui'

export const npmUrl = (name: string) =>
  `https://www.npmjs.com/package/${name}`

export interface SitePackage {
  name: string
  summary: string
}

export const PACKAGES: SitePackage[] = [
  {
    name: '@nextmoe/edit-ui-core',
    summary:
      'Framework-free TypeScript: the wire/schema types plus the pure diff, formatting and badge helpers. No Vue in its dependency closure.'
  },
  {
    name: '@nextmoe/edit-ui-vue',
    summary:
      'The Vue 3 components — the schema form, the per-field controls, the diff / proposal / revision views. Ships no CSS of its own.'
  },
  {
    name: '@nextmoe/edit-ui-nuxt',
    summary:
      'A Nuxt module that auto-imports every component under a configurable prefix (default Edit), so templates need no imports.'
  }
]

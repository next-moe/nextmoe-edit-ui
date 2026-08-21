import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

// The public demo + integration docs for @nextmoe/edit-ui, served at
// https://edit-ui.nextmoe.dev. It consumes the packages exactly the way a real
// site does — KunUI chrome from the @kungal/ui-nuxt layer, the edit components
// through this repo's own Nuxt module — so every deploy exercises the
// auto-import path the guide documents.

const readVersion = (): string => {
  const url = new URL('../../packages/vue/package.json', import.meta.url)
  const pkg = JSON.parse(readFileSync(fileURLToPath(url), 'utf8')) as {
    version: string
  }
  return pkg.version
}

// KunUI's dark variant keys off `.kun-dark-mode` on <html>; applying it before
// first paint is what keeps a dark-mode visitor from seeing a light flash.
const THEME_BOOT = `(()=>{try{const s=localStorage.getItem('edit-ui-theme');const d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('kun-dark-mode',d)}catch{}})()`

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%232563eb'/%3E%3Cpath d='M9 10h14M9 16h9M9 22h14' stroke='%23fff' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E"

export default defineNuxtConfig({
  devtools: { enabled: false },

  extends: ['@kungal/ui-nuxt'],
  modules: ['@nextmoe/edit-ui-nuxt'],

  css: ['~/assets/css/main.css'],

  devServer: { port: 6898 },

  runtimeConfig: {
    public: {
      version: readVersion()
    }
  },

  // @nuxt/icon (from the KunUI layer) only inlines an icon during SSR when it
  // is in the client bundle; anything else is fetched after hydration and the
  // server HTML ships an empty span. `scan` covers this app's own sources, but
  // the icons the edit components use live inside @nextmoe/edit-ui-vue's dist,
  // which the scan does not reach — hence the explicit list. It is the full set
  // of `rg -o 'lucide:[a-z0-9-]+' packages/vue/src`; a new icon over there needs
  // a line here.
  icon: {
    clientBundle: {
      scan: true,
      icons: [
        'lucide:grip-vertical',
        'lucide:loader',
        'lucide:lock',
        'lucide:pin',
        'lucide:plus',
        'lucide:trash-2',
        'lucide:undo-2',
        'lucide:upload',
        'lucide:x'
      ]
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: '@nextmoe/edit-ui',
      meta: [
        {
          name: 'description',
          content:
            'Schema-driven edit components for Vue and Nuxt: one form rendered from a server-sent field schema, plus the diff, proposal and revision views that go with it.'
        }
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: FAVICON }],
      script: [{ innerHTML: THEME_BOOT, tagPosition: 'head' }]
    }
  },

  vite: {
    plugins: [tailwindcss()]
  },

  compatibilityDate: '2025-01-01'
})

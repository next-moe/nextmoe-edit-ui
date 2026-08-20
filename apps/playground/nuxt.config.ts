import tailwindcss from '@tailwindcss/vite'

// The edit-ui playground: one page that renders every EditControl plus the
// diff / review / timeline views off a fixture schema. KunUI chrome comes from
// the @kungal/ui-nuxt layer; the edit components come from this repo's own
// Nuxt module, so the module's auto-import path is exercised on every build.
export default defineNuxtConfig({
  devtools: { enabled: false },

  extends: ['@kungal/ui-nuxt'],
  modules: ['@nextmoe/edit-ui-nuxt'],

  css: ['~/assets/css/main.css'],

  devServer: { port: 6898 },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: 'NextMoe edit-ui playground'
    }
  },

  vite: {
    plugins: [tailwindcss()]
  },

  compatibilityDate: '2025-01-01'
})

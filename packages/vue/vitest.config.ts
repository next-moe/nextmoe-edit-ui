import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    // The component specs assert on rendered HTML (image `src`, chip text), so
    // they need a DOM. The forum ran them under @nuxt/test-utils' nuxt
    // environment, happy-dom underneath; this package has no Nuxt, so it is
    // happy-dom + @vue/test-utils directly. Not jsdom: jsdom has no
    // Element.scrollTo, which KunTab calls — every test still passes there but
    // the unhandled rejection makes vitest exit 1.
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts']
  }
})

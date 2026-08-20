import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Library build: compile the .vue components to JS up front so any consumer's
// bundler can use them without transpiling .vue inside node_modules (Vite does
// NOT process .vue in deps by default). Types are emitted by vue-tsc separately
// (see the build script).
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      // Externalize the framework, KunUI and every runtime dependency (incl.
      // subpath imports like @vueuse/integrations/useSortable) so the consumer
      // dedupes them. A second @kungal/ui-vue copy would give KunUI two config
      // provide/inject identities.
      external: (id) => {
        if (id.endsWith('.css')) return false
        return (
          id === 'vue' ||
          id === 'sortablejs' ||
          id.startsWith('@kungal/') ||
          id.startsWith('@nextmoe/') ||
          id.startsWith('@vueuse/')
        )
      }
    }
  }
})

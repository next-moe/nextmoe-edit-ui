<script setup lang="ts">
const main = `// main.ts
import { createApp } from 'vue'
import { installKunUIConfig } from '@kungal/ui-vue'
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import App from './App.vue'
import './style.css'

const app = createApp(App)

installKunUIConfig(app, {
  iconComponent: Icon,      // see the note below — without this some icons vanish
  linkComponent: RouterLink // optional: keeps KunUI hrefs in the SPA router
})

app.mount('#app')`

const usage = `<script setup lang="ts">
import { SchemaForm, FieldDiff } from '@nextmoe/edit-ui-vue'
import type { EditFieldConfigMap, EditSchemaField } from '@nextmoe/edit-ui-vue'

const fields = ref<EditSchemaField[]>([])
const config: EditFieldConfigMap = { title: { label: 'Title', control: 'input' } }
<\/script>

<template>
  <SchemaForm :fields="fields" :values="values" :config="config" />
<\/template>`
</script>

<template>
  <SiteSection
    id="vue"
    title="Path A — Vue 3 + Vite"
    description="Components are exported under their bare names; the Edit prefix is applied only by the Nuxt module."
  >
    <SiteCodeBlock :code="main" label="main.ts" />
    <SiteCodeBlock :code="usage" label="Editor.vue" />
    <KunInfo
      color="warning"
      variant="flat"
      icon="lucide:triangle-alert"
      title="Icons: KunUI only inlines its bundled registry"
      description="KunIcon renders icons from KunUI's own bundled set as inline SVG and never fetches anything. A name outside that set — lucide:undo-2 on the field revert button, for one — renders nothing at all unless you inject an iconComponent through installKunUIConfig. The Nuxt layer does this for you with @nuxt/icon; a plain Vue app must do it itself."
    />
  </SiteSection>
</template>

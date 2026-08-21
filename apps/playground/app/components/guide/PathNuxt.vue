<script setup lang="ts">
const config = `// nuxt.config.ts
export default defineNuxtConfig({
  // KunUI's Nuxt layer: auto-imports every Kun* component and injects
  // NuxtLink / @nuxt/icon / @nuxt/image into KunUI's config.
  extends: ['@kungal/ui-nuxt'],

  modules: ['@nextmoe/edit-ui-nuxt'],

  css: ['~/assets/css/main.css'],

  editUi: {
    prefix: 'Edit', // default. <SchemaForm> registers as <EditSchemaForm>
    global: false   // default: lazy registration
  }
})`

const usage = `<template>
  <EditSchemaForm
    :fields="fields"
    :values="values"
    :config="config"
    :group-order="['Basics', 'Media']"
    layout="tabs"
    @update:patch="(patch) => (draft = patch)"
  />

  <EditFieldDiff label="Title" diff-hint="inline" :from="a" :to="b" />
  <EditReviewQueue v-model:status="status" :items="open" :label-for="labelFor" />
</template>`
</script>

<template>
  <SiteSection
    id="nuxt"
    title="Path B — Nuxt"
    description="The module registers all 14 components as auto-imports, so templates need no import at all."
  >
    <SiteCodeBlock :code="config" label="nuxt.config.ts" />
    <SiteCodeBlock :code="usage" label="pages/edit.vue" />
    <p class="text-default-500 text-sm">
      The prefix is why the module exists: a site migrating off its own local
      copy of these components can set
      <code>prefix: 'Editkit'</code> and keep every existing
      <code>&lt;EditkitSchemaForm&gt;</code> tag untouched. The component names
      come from <code>EDIT_UI_COMPONENT_NAMES</code> in
      <code>@nextmoe/edit-ui-vue</code>, so the module never drifts from the
      package.
    </p>
  </SiteSection>
</template>

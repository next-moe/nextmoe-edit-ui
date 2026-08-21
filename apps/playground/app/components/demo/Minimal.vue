<script setup lang="ts">
import { ref } from 'vue'
import type { EditFieldConfigMap } from '@nextmoe/edit-ui-vue'
import { field } from '~/fixtures'

const fields = [
  field('title', 'text'),
  field('intro', 'text', 'lines'),
  field('aliases', 'list', 'items')
]

const config: EditFieldConfigMap = {
  title: { label: 'Title', control: 'input' },
  intro: { label: 'Intro', control: 'textarea' },
  aliases: {
    label: 'Aliases',
    control: 'string-list',
    placeholder: 'type and press Enter'
  }
}

const values: Record<string, unknown> = {
  title: 'ひぐらしのなく頃に',
  intro: '雏见泽村，昭和五十八年六月。',
  aliases: ['寒蝉鸣泣之时', 'Higurashi']
}

const patch = ref<Record<string, unknown>>({})

const scriptSample = `import type { EditFieldConfigMap } from '@nextmoe/edit-ui-vue'

// \`fields\` and \`values\` come from your API. \`config\` is the presentation
// layer only the site knows about — labels, controls, placeholders.
const config: EditFieldConfigMap = {
  title: { label: 'Title', control: 'input' },
  intro: { label: 'Intro', control: 'textarea' },
  aliases: { label: 'Aliases', control: 'string-list' }
}`

const templateSample = `<EditSchemaForm
  :fields="fields"
  :values="values"
  :config="config"
  @update:patch="(value) => (patch = value)"
/>`
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    <!-- Client-only for the same KunUI hydration reason as demo/Full.vue. -->
    <ClientOnly>
      <KunCard :is-transparent="false" content-class="space-y-3">
        <EditSchemaForm
          :fields="fields"
          :values="values"
          :config="config"
          @update:patch="(value) => (patch = value)"
        />
        <p class="text-default-400 text-xs">
          {{ Object.keys(patch).length }} field(s) changed
        </p>
      </KunCard>
      <template #fallback>
        <KunCard :is-transparent="false">
          <KunSkeleton variant="rect" height="16rem" />
        </KunCard>
      </template>
    </ClientOnly>
    <div class="space-y-3">
      <SiteCodeBlock :code="scriptSample" label="script" />
      <SiteCodeBlock :code="templateSample" label="template" />
    </div>
  </div>
</template>

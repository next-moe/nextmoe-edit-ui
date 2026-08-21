<script setup lang="ts">
import { ref } from 'vue'
import { config, fields, groupOrder, values } from '~/fixtures'

const layout = ref<'stack' | 'tabs'>('stack')
const readOnly = ref(false)
const patch = ref<Record<string, unknown>>({})

const layoutItems = [
  { value: 'stack', textValue: 'stack' },
  { value: 'tabs', textValue: 'tabs' }
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
      <KunTab v-model="layout" :items="layoutItems" variant="pills" size="sm" />
      <KunSwitch v-model="readOnly" size="sm" label="disabled (review mode)" />
    </div>

    <!--
      Client-only on purpose: KunDatePicker and KunTagInput (KunUI 2.24.0)
      hydrate with a different child structure than they server-render, which
      turns the whole page into "Hydration completed but contains mismatches".
      Drop the wrapper once that is fixed upstream — the form itself SSRs fine.
    -->
    <ClientOnly>
      <KunCard :is-transparent="false" content-class="space-y-4">
        <EditSchemaForm
          :fields="fields"
          :values="values"
          :config="config"
          :group-order="groupOrder"
          :layout="layout"
          :tabbed-groups="['关系']"
          :disabled="readOnly"
          @update:patch="(value) => (patch = value)"
        />
      </KunCard>
      <template #fallback>
        <KunCard :is-transparent="false">
          <KunSkeleton variant="rect" height="28rem" />
        </KunCard>
      </template>
    </ClientOnly>

    <div class="border-default-200 bg-content1 rounded-lg border p-3">
      <p class="text-default-500 mb-1 text-xs">
        <code>update:patch</code> — only the fields that actually differ from
        the server values, deep-compared. Edit anything above to see it appear.
      </p>
      <pre
        class="text-default-700 max-h-64 overflow-auto font-mono text-xs"
      >{{ JSON.stringify(patch, null, 2) }}</pre>
    </div>
  </div>
</template>

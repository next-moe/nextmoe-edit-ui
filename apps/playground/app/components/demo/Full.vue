<script setup lang="ts">
import { ref } from 'vue'
import { config, fields, groupOrder, values, vocabularies } from '~/fixtures'

const layout = ref<'stack' | 'tabs'>('stack')
const readOnly = ref(false)
const patch = ref<Record<string, unknown>>({})

const layoutItems = [
  { value: 'stack', textValue: '纵向堆叠' },
  { value: 'tabs', textValue: '分组标签页' }
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
      <KunTab v-model="layout" :items="layoutItems" variant="pills" size="sm" />
      <KunSwitch v-model="readOnly" size="sm" label="只读（审阅模式）" />
    </div>

    <KunCard :is-transparent="false" content-class="space-y-4">
      <EditSchemaForm
        :fields="fields"
        :values="values"
        :config="config"
        :vocabularies="vocabularies"
        :group-order="groupOrder"
        :layout="layout"
        :tabbed-groups="['关系']"
        :disabled="readOnly"
        @update:patch="(value) => (patch = value)"
      />
    </KunCard>

    <div class="border-default-200 bg-content1 rounded-lg border p-3">
      <p class="text-default-500 mb-1 text-xs"><code>update:patch</code> —— 只包含与服务端值深比较后确实不同的字段。在上面随便改点什么，它就会出现在这里。</p>
      <pre
        class="text-default-700 max-h-64 overflow-auto font-mono text-xs"
      >{{ JSON.stringify(patch, null, 2) }}</pre>
    </div>
  </div>
</template>

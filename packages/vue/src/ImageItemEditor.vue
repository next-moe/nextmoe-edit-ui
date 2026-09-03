<script setup lang="ts">
import { computed } from 'vue'
import { KunButton, KunIcon } from '@kungal/ui-vue'
import { buildEditRow } from '@nextmoe/edit-ui-core'
import ObjectListCell from './ObjectListCell.vue'
import type { EditObjectColumn } from './types'

const props = defineProps<{
  modelValue: unknown
  columns: EditObjectColumn[]
  previewURL?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  close: []
}>()

const item = computed<Record<string, unknown>>(() =>
  props.modelValue && typeof props.modelValue === 'object'
    ? (props.modelValue as Record<string, unknown>)
    : {}
)

const issues = computed(() => buildEditRow(item.value, props.columns).issues)

const issueFor = (key: string) =>
  issues.value.find((i) => i.key === key)?.reason

// Unlike an object-list row, the item carries keys no column owns — image_hash
// above all — so the edit is a merge, not a rebuild. Clearing a field has to
// delete its key explicitly or the old value survives the blank.
const setCell = (key: string, value: unknown) => {
  const next = { ...item.value, [key]: value }
  const built = buildEditRow(next, props.columns).row
  for (const column of props.columns) {
    if (column.key in built) {
      next[column.key] = built[column.key]
    } else {
      delete next[column.key]
    }
  }
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="border-default-200 bg-content1 space-y-3 rounded-lg border p-3">
    <div class="flex items-start gap-3">
      <img
        v-if="previewURL"
        :src="previewURL"
        loading="lazy"
        class="bg-default-100 h-16 w-24 shrink-0 rounded object-contain"
      />
      <div class="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        <label v-for="col in columns" :key="col.key" class="block space-y-1">
          <span class="text-default-500 text-xs">{{ col.label }}</span>
          <ObjectListCell
            :column="col"
            :model-value="item[col.key]"
            :disabled="disabled"
            :error="issueFor(col.key)"
            @update:model-value="(value) => setCell(col.key, value)"
          />
        </label>
      </div>
      <KunButton
        :is-icon-only="true"
        variant="light"
        color="default"
        size="sm"
        aria-label="收起"
        @click="emit('close')"
      >
        <KunIcon name="lucide:x" />
      </KunButton>
    </div>
  </div>
</template>

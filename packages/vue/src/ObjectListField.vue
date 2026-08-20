<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  KunButton,
  KunIcon,
  KunInput,
  KunSelect,
  KunTextarea
} from '@kungal/ui-vue'
import type { EditFieldConfig, EditObjectColumn } from './types'

type ObjectRow = Record<string, unknown>

const props = defineProps<{
  modelValue: unknown
  config?: EditFieldConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const columns = computed<EditObjectColumn[]>(() => props.config?.columns ?? [])

const rows = ref<ObjectRow[]>([])
watch(
  () => props.modelValue,
  (value) => {
    rows.value = Array.isArray(value)
      ? (value as ObjectRow[]).map((row) => ({ ...row }))
      : []
  },
  { immediate: true }
)

const emitRows = () => {
  const cols = columns.value
  emit(
    'update:modelValue',
    rows.value
      .filter((row) => cols.some((c) => String(row[c.key] ?? '').trim() !== ''))
      .map((row) => {
        const out: ObjectRow = { ...row }
        for (const c of cols) {
          if (typeof out[c.key] === 'string') {
            out[c.key] = (out[c.key] as string).trim()
          }
        }
        return out
      })
  )
}

const coerceColumnValue = (col: EditObjectColumn, raw: string): unknown => {
  const match = (col.options ?? []).find((o) => String(o.value) === raw)
  return match ? match.value : raw
}

const addRow = () => {
  const blank: ObjectRow = {}
  for (const c of columns.value) {
    blank[c.key] = c.control === 'select' ? (c.options?.[0]?.value ?? '') : ''
  }
  rows.value.push({ ...blank, ...(props.config?.newRow?.() ?? {}) })
}

const removeRow = (index: number) => {
  rows.value.splice(index, 1)
  emitRows()
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="(row, index) in rows"
      :key="index"
      class="flex items-start gap-2"
    >
      <template v-for="col in columns" :key="col.key">
        <KunSelect
          v-if="col.control === 'select'"
          :model-value="String(row[col.key] ?? '')"
          :options="
            (col.options ?? []).map((o) => ({
              value: String(o.value),
              label: o.label
            }))
          "
          :class-name="col.width ?? 'flex-1'"
          @update:model-value="
            (v: string | string[] | null) => {
              row[col.key] = coerceColumnValue(col, String(v ?? ''))
              emitRows()
            }
          "
        />
        <KunTextarea
          v-else-if="col.control === 'textarea'"
          v-model="row[col.key] as string"
          :placeholder="col.placeholder ?? col.label"
          :class-name="col.width ?? 'flex-1'"
          @update:model-value="emitRows"
        />
        <KunInput
          v-else
          v-model="row[col.key] as string"
          :placeholder="col.placeholder ?? col.label"
          :class-name="col.width ?? 'flex-1'"
          @update:model-value="emitRows"
        />
      </template>
      <KunButton
        :is-icon-only="true"
        variant="light"
        color="danger"
        size="sm"
        @click="removeRow(index)"
      >
        <KunIcon name="lucide:x" />
      </KunButton>
    </div>

    <KunButton variant="flat" color="default" size="sm" @click="addRow">
      <KunIcon name="lucide:plus" />
      添加一行
    </KunButton>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { KunButton, KunChip, KunIcon } from '@kungal/ui-vue'
import {
  blankEditRow,
  buildEditRow,
  buildEditRows,
  isSuppressed,
  toggleSuppressedKey
} from '@nextmoe/edit-ui-core'
import ObjectListCell from './ObjectListCell.vue'
import type { EditFieldConfig, EditObjectColumn, EditRowIssue } from './types'

type ObjectRow = Record<string, unknown>

const props = defineProps<{
  modelValue: unknown
  config?: EditFieldConfig
  disabled?: boolean
  max?: number
  suppressed?: unknown
  identityKey?: (item: unknown) => string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  'update:issues': [issues: (EditRowIssue & { index: number })[]]
  'update:suppressed': [value: string[]]
}>()

const columns = computed<EditObjectColumn[]>(() => props.config?.columns ?? [])

// `:key="index"` reuses the previous row's input state when a row above is
// removed — the deleted row's text appears to jump down one row. The id lives
// on the editing row only; buildEditRow drops every key the columns do not
// declare, so it never reaches the patch.
const ROW_ID = '__rid'
let seq = 0
const withId = (row: ObjectRow): ObjectRow => ({ ...row, [ROW_ID]: ++seq })

const rows = ref<ObjectRow[]>([])
watch(
  () => props.modelValue,
  (value) => {
    rows.value = Array.isArray(value)
      ? (value as ObjectRow[]).map((row) => withId(row))
      : []
  },
  { immediate: true }
)

const issues = ref<(EditRowIssue & { index: number })[]>([])

const issueFor = (index: number, key: string) =>
  issues.value.find((i) => i.index === index && i.key === key)?.reason

const isEmptyRow = (row: ObjectRow) =>
  !columns.value.some((c) => {
    const v = row[c.key]
    return v === true || (v !== null && v !== undefined && String(v).trim() !== '')
  })

const emitRows = () => {
  const kept = rows.value.filter((row) => !isEmptyRow(row))
  const built = buildEditRows(kept, columns.value)
  issues.value = built.issues
  emit('update:issues', built.issues)
  emit('update:modelValue', built.rows)
}

const setCell = (row: ObjectRow, key: string, value: unknown) => {
  row[key] = value
  emitRows()
}

const canAdd = computed(() => props.config?.allowAdd !== false)
const canRemove = computed(() => props.config?.allowRemove !== false)

const atCap = computed(
  () => typeof props.max === 'number' && props.max > 0 && rows.value.length >= props.max
)

// The key has to be derived from the payload the server would see, not from the
// editing row: that one still carries the local row id.
const keyOf = (row: ObjectRow) =>
  props.identityKey
    ? props.identityKey(buildEditRow(row, columns.value).row)
    : null

const rowSuppressed = (row: ObjectRow) =>
  isSuppressed(props.suppressed, keyOf(row))

const toggleSuppressed = (row: ObjectRow) => {
  emit('update:suppressed', toggleSuppressedKey(props.suppressed, keyOf(row)))
}

const addRow = () => {
  rows.value.push(
    withId({ ...blankEditRow(columns.value), ...(props.config?.newRow?.() ?? {}) })
  )
}

const removeRow = (index: number) => {
  rows.value.splice(index, 1)
  emitRows()
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="columns.length > 1"
      class="text-default-400 hidden items-center gap-2 px-0.5 text-xs md:flex"
    >
      <span
        v-for="col in columns"
        :key="col.key"
        :class="[col.width ?? 'flex-1', 'min-w-0']"
      >
        {{ col.label }}
        <span v-if="col.required" class="text-danger-500">*</span>
      </span>
      <span class="w-8 shrink-0" />
    </div>

    <div
      v-for="(row, index) in rows"
      :key="String(row[ROW_ID])"
      class="flex flex-col items-start gap-2 md:flex-row"
      :class="{ 'opacity-50': rowSuppressed(row) }"
    >
      <div
        v-for="col in columns"
        :key="col.key"
        :class="[col.width ?? 'flex-1', 'min-w-0']"
      >
        <ObjectListCell
          :column="col"
          :model-value="row[col.key]"
          :disabled="disabled || rowSuppressed(row)"
          :error="issueFor(index, col.key)"
          @update:model-value="(value) => setCell(row, col.key, value)"
        />
      </div>
      <KunChip
        v-if="rowSuppressed(row)"
        size="sm"
        variant="flat"
        color="warning"
        class="shrink-0"
      >
        已隐藏
      </KunChip>
      <KunButton
        v-if="identityKey && keyOf(row)"
        :is-icon-only="true"
        variant="light"
        :color="rowSuppressed(row) ? 'warning' : 'default'"
        size="sm"
        :disabled="disabled"
        :title="rowSuppressed(row) ? '恢复显示' : '在本站隐藏这一条'"
        :aria-label="rowSuppressed(row) ? '恢复显示' : '在本站隐藏这一条'"
        @click="toggleSuppressed(row)"
      >
        <KunIcon :name="rowSuppressed(row) ? 'lucide:eye-off' : 'lucide:eye'" />
      </KunButton>
      <KunButton
        v-if="canRemove"
        :is-icon-only="true"
        variant="light"
        color="danger"
        size="sm"
        :disabled="disabled"
        :aria-label="`删除第 ${index + 1} 行`"
        @click="removeRow(index)"
      >
        <KunIcon name="lucide:x" />
      </KunButton>
    </div>

    <p v-if="!rows.length" class="text-default-400 text-sm">暂无条目</p>

    <div v-if="canAdd || max" class="flex items-center gap-3">
      <KunButton
        v-if="canAdd"
        variant="flat"
        color="default"
        size="sm"
        :disabled="disabled || atCap"
        @click="addRow"
      >
        <KunIcon name="lucide:plus" />
        添加一行
      </KunButton>
      <span v-if="max" class="text-default-400 text-xs">
        {{ rows.length }} / {{ max }}
      </span>
    </div>
  </div>
</template>

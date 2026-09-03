<script setup lang="ts">
import { computed } from 'vue'
import { KunInput, KunSelect, KunSwitch, KunTextarea } from '@kungal/ui-vue'
import EntityPicker from './EntityPicker.vue'
import type { EditObjectColumn } from './types'

const props = defineProps<{
  column: EditObjectColumn
  modelValue: unknown
  disabled?: boolean
  error?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const selectOptions = computed(() =>
  (props.column.options ?? []).map((o) => ({
    value: String(o.value),
    label: o.label
  }))
)

// KunSelect round-trips its value as a string, so an int enum has to be mapped
// back to the option's own typed value or the row emits "1" where the catalog
// engine's objInt demands 1.
const onSelect = (raw: string | string[] | null) => {
  const text = String(Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? ''))
  const hit = (props.column.options ?? []).find((o) => String(o.value) === text)
  emit('update:modelValue', hit ? hit.value : text)
}

const asText = computed(() =>
  props.modelValue === null || props.modelValue === undefined
    ? ''
    : String(props.modelValue)
)

const placeholder = computed(
  () => props.column.placeholder ?? props.column.label
)
</script>

<template>
  <KunSelect
    v-if="column.control === 'select'"
    :model-value="asText"
    :options="selectOptions"
    :disabled="disabled"
    @update:model-value="onSelect"
  />
  <KunSwitch
    v-else-if="column.control === 'switch' || column.type === 'boolean'"
    :model-value="modelValue === true"
    :disabled="disabled"
    :label="column.label"
    @update:model-value="(value: boolean) => emit('update:modelValue', value)"
  />
  <EntityPicker
    v-else-if="column.control === 'entity-picker' && column.searchEntities"
    :model-value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder"
    :search="column.searchEntities"
    :resolve="column.resolveEntities"
    @update:model-value="(value) => emit('update:modelValue', value)"
  />
  <KunTextarea
    v-else-if="column.control === 'textarea'"
    :model-value="asText"
    :placeholder="placeholder"
    :disabled="disabled"
    :error="error"
    @update:model-value="(value: string) => emit('update:modelValue', value)"
  />
  <KunInput
    v-else
    :model-value="asText"
    :type="column.type === 'integer' || column.type === 'number' ? 'number' : 'text'"
    :placeholder="placeholder"
    :disabled="disabled"
    :error="error"
    :is-invalid="Boolean(error)"
    @update:model-value="
      (value: string | number) => emit('update:modelValue', value)
    "
  />
</template>

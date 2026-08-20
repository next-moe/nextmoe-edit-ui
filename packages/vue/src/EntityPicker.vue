<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { KunAutocomplete, KunChip } from '@kungal/ui-vue'
import type { EditSelectOption } from './types'

const props = defineProps<{
  modelValue: unknown
  multiple?: boolean
  disabled?: boolean
  placeholder?: string
  search: (keyword: string) => Promise<EditSelectOption[]>
  resolve?: (
    ids: (string | number)[]
  ) => Promise<EditSelectOption[]> | EditSelectOption[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const keyOf = (id: string | number) => String(id)
const labels = ref(new Map<string, string>())
const origIds = ref(new Map<string, string | number>())
const labelFor = (id: string | number) =>
  labels.value.get(keyOf(id)) ?? `#${id}`

const remember = (option: EditSelectOption) => {
  const k = keyOf(option.value)
  labels.value = new Map(labels.value).set(k, option.label)
  if (!origIds.value.has(k)) {
    origIds.value = new Map(origIds.value).set(k, option.value)
  }
}

const selectedIds = computed<(string | number)[]>(() => {
  const v = props.modelValue
  if (props.multiple) {
    return Array.isArray(v) ? (v as (string | number)[]) : []
  }
  return v === null || v === undefined || v === '' ? [] : [v as string | number]
})

watch(
  selectedIds,
  async (ids) => {
    const missing = ids.filter((id) => !labels.value.has(keyOf(id)))
    if (!missing.length || !props.resolve) {
      return
    }
    const resolved = await props.resolve(missing)
    for (const option of resolved) {
      remember(option)
    }
  },
  { immediate: true }
)

const query = ref('')
const options = ref<{ value: string; label: string }[]>([])
const isLoading = ref(false)
let searchSeq = 0

const onSearch = async (raw: string) => {
  const kw = raw.trim()
  const seq = ++searchSeq
  if (!kw) {
    options.value = []
    isLoading.value = false
    return
  }
  isLoading.value = true
  const hits = await props.search(kw)
  if (seq !== searchSeq) {
    return
  }
  const chosen = new Set(selectedIds.value.map(keyOf))
  options.value = hits
    .filter((o) => !chosen.has(keyOf(o.value)))
    .map((o) => {
      remember(o)
      return { value: keyOf(o.value), label: o.label }
    })
  isLoading.value = false
}

const onSelect = (opt: { value: string; label: string }) => {
  const id = origIds.value.get(opt.value) ?? opt.value
  if (props.multiple) {
    if (!selectedIds.value.some((x) => keyOf(x) === opt.value)) {
      emit('update:modelValue', [...selectedIds.value, id])
    }
  } else {
    emit('update:modelValue', id)
  }
  query.value = ''
  options.value = []
}

const removeId = (id: string | number) => {
  if (props.multiple) {
    emit(
      'update:modelValue',
      selectedIds.value.filter((x) => keyOf(x) !== keyOf(id))
    )
  } else {
    emit('update:modelValue', null)
  }
}
</script>

<template>
  <div class="space-y-2">
    <div v-if="selectedIds.length" class="flex flex-wrap gap-1.5">
      <KunChip
        v-for="id in selectedIds"
        :key="keyOf(id)"
        size="sm"
        variant="flat"
        color="primary"
        :closable="!disabled"
        @close="removeId(id)"
      >
        {{ labelFor(id) }}
      </KunChip>
    </div>
    <KunAutocomplete
      v-if="!disabled"
      v-model="query"
      :options="options"
      :loading="isLoading"
      :debounce="300"
      manual-filter
      clearable
      :placeholder="placeholder ?? '输入名称搜索'"
      loading-text="搜索中…"
      no-result-text="无匹配结果"
      @search="onSearch"
      @select="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { KunAutocomplete, KunButton, KunChip, KunSelect } from '@kungal/ui-vue'
import type { EditSelectOption } from './types'

interface KindOption {
  value: number
  label: string
}

const props = defineProps<{
  modelValue: unknown
  disabled?: boolean
  placeholder?: string
  idKey: string
  kindOptions: KindOption[]
  defaultKind: number
  search: (keyword: string) => Promise<EditSelectOption[]>
  resolve?: (
    ids: (string | number)[]
  ) => Promise<EditSelectOption[]> | EditSelectOption[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

interface Edge {
  id: number
  kind: number
}

const labels = ref(new Map<number, string>())
const labelFor = (id: number) => labels.value.get(id) ?? `#${id}`
const kindLabel = (kind: number) =>
  props.kindOptions.find((k) => k.value === kind)?.label ?? String(kind)

const edges = computed<Edge[]>(() => {
  const v = props.modelValue
  if (!Array.isArray(v)) {
    return []
  }
  return (v as Record<string, unknown>[]).flatMap((row) => {
    const id = Number(row?.[props.idKey])
    if (!Number.isFinite(id) || id <= 0) {
      return []
    }
    return [{ id, kind: Number(row?.kind ?? props.defaultKind) }]
  })
})

const commit = (next: Edge[]) => {
  emit(
    'update:modelValue',
    next.map((e) => ({ [props.idKey]: e.id, kind: e.kind }))
  )
}

watch(
  edges,
  async (rows) => {
    const missing = [...new Set(rows.map((r) => r.id))].filter(
      (id) => !labels.value.has(id)
    )
    if (!missing.length || !props.resolve) {
      return
    }
    const resolved = await props.resolve(missing)
    const next = new Map(labels.value)
    for (const option of resolved) {
      next.set(Number(option.value), option.label)
    }
    labels.value = next
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
  const next = new Map(labels.value)
  options.value = hits.map((o) => {
    next.set(Number(o.value), o.label)
    return { value: String(o.value), label: o.label }
  })
  labels.value = next
  isLoading.value = false
}

const onSelect = (opt: { value: string; label: string }) => {
  const id = Number(opt.value)
  const already = edges.value.some(
    (e) => e.id === id && e.kind === props.defaultKind
  )
  if (!already) {
    commit([...edges.value, { id, kind: props.defaultKind }])
  }
  query.value = ''
  options.value = []
}

const setKind = (index: number, kind: number) => {
  const next = edges.value.map((e, i) => (i === index ? { ...e, kind } : e))
  const seen = new Set<string>()
  commit(
    next.filter((e) => {
      const key = `${e.id}:${e.kind}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  )
}

const removeAt = (index: number) => {
  commit(edges.value.filter((_, i) => i !== index))
}
</script>

<template>
  <div class="space-y-2">
    <div v-if="edges.length" class="space-y-1.5">
      <div
        v-for="(edge, index) in edges"
        :key="`${edge.id}:${edge.kind}`"
        class="flex flex-wrap items-center gap-2"
      >
        <KunChip size="sm" variant="flat" color="primary">
          {{ labelFor(edge.id) }}
        </KunChip>
        <KunSelect
          v-if="!disabled"
          :model-value="edge.kind"
          :options="kindOptions"
          size="sm"
          class-name="w-32"
          @update:model-value="(value) => setKind(index, Number(value))"
        />
        <span v-else class="text-default-500 text-sm">
          {{ kindLabel(edge.kind) }}
        </span>
        <KunButton
          v-if="!disabled"
          variant="light"
          color="danger"
          size="sm"
          @click="removeAt(index)"
        >
          移除
        </KunButton>
      </div>
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

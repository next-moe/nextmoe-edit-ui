<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { KunBadge, KunTab } from '@kungal/ui-vue'
import { cloneEditValue, editValueEqual } from '@nextmoe/edit-ui-core'
import SchemaField from './SchemaField.vue'
import type { EditFieldConfigMap, EditSchemaField } from './types'

const props = withDefaults(
  defineProps<{
    fields: EditSchemaField[]
    values: Record<string, unknown>
    config: EditFieldConfigMap
    groupOrder?: string[]
    disabled?: boolean
    layout?: 'stack' | 'tabs'
    tabbedGroups?: string[]
  }>(),
  { layout: 'stack' }
)

const emit = defineEmits<{
  'update:patch': [patch: Record<string, unknown>]
}>()

const working = reactive<Record<string, unknown>>({})
watch(
  () => props.values,
  (values) => {
    for (const key of Object.keys(working)) {
      Reflect.deleteProperty(working, key)
    }
    for (const field of props.fields) {
      working[field.key] = cloneEditValue(values[field.key])
    }
  },
  { immediate: true, deep: false }
)

const patch = computed<Record<string, unknown>>(() => {
  const out: Record<string, unknown> = {}
  for (const field of props.fields) {
    if (field.locked || field.deprecated || !field.can_propose) {
      continue
    }
    const baseline = props.values[field.key] ?? null
    const current = working[field.key] ?? null
    if (!editValueEqual(baseline, current)) {
      out[field.key] = current
    }
  }
  return out
})
watch(patch, (value) => emit('update:patch', value), { deep: false })

const dirtyCount = computed(() => Object.keys(patch.value).length)
defineExpose({ dirtyCount })

const UNGROUPED = '__ungrouped'
const SUPPRESSED_SUFFIX = '.suppressed'

const pairsSuppressed = (key: string) =>
  props.config[key]?.pairsSuppressed === true

const companionKey = (key: string) => key + SUPPRESSED_SUFFIX

const isPairedCompanion = (key: string) =>
  key.endsWith(SUPPRESSED_SUFFIX) &&
  pairsSuppressed(key.slice(0, -SUPPRESSED_SUFFIX.length))

const setSuppressed = (parentKey: string, value: unknown) => {
  working[companionKey(parentKey)] = value
}

const sections = computed(() => {
  const byGroup = new Map<string, EditSchemaField[]>()
  for (const field of props.fields) {
    if (field.deprecated || isPairedCompanion(field.key)) {
      continue
    }
    const group = props.config[field.key]?.group ?? ''
    const bucket = byGroup.get(group)
    if (bucket) {
      bucket.push(field)
    } else {
      byGroup.set(group, [field])
    }
  }
  const order = props.groupOrder ?? [...byGroup.keys()]
  const out: { name: string; fields: EditSchemaField[] }[] = []
  for (const name of order) {
    const fields = byGroup.get(name)
    if (fields?.length) {
      out.push({ name, fields })
      byGroup.delete(name)
    }
  }
  for (const [name, fields] of byGroup) {
    out.push({ name, fields })
  }
  return out
})

const isDesktop = useMediaQuery('(min-width: 768px)')
const tabOrientation = computed(() =>
  isDesktop.value ? 'vertical' : 'horizontal'
)

const tabKey = (name: string) => name || UNGROUPED

const dirtyBySection = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {}
  for (const key of Object.keys(patch.value)) {
    const group = props.config[key]?.group ?? ''
    counts[tabKey(group)] = (counts[tabKey(group)] ?? 0) + 1
  }
  return counts
})

const tabItems = computed(() =>
  sections.value.map((section) => ({
    value: tabKey(section.name),
    textValue: section.name || '其他',
    count: dirtyBySection.value[tabKey(section.name)] ?? 0
  }))
)

const active = ref('')
watch(
  sections,
  (list) => {
    if (!list.some((s) => tabKey(s.name) === active.value)) {
      active.value = list.length ? tabKey(list[0]!.name) : ''
    }
  },
  { immediate: true }
)

const isTabbedGroup = (name: string) =>
  props.tabbedGroups?.includes(name) ?? false

const activeField = reactive<Record<string, string>>({})
watch(
  sections,
  (list) => {
    for (const section of list) {
      if (!isTabbedGroup(section.name)) {
        continue
      }
      const keys = section.fields.map((f) => f.key)
      if (!keys.includes(activeField[section.name] ?? '')) {
        activeField[section.name] = keys[0] ?? ''
      }
    }
  },
  { immediate: true }
)

const subTabItems = (section: { name: string; fields: EditSchemaField[] }) =>
  section.fields.map((field) => ({
    value: field.key,
    textValue:
      props.config[field.key]?.tabLabel ??
      props.config[field.key]?.label ??
      field.key,
    dirty: field.key in patch.value
  }))
</script>

<template>
  <div
    v-if="layout === 'tabs'"
    class="flex flex-col gap-4 md:flex-row md:gap-6"
  >
    <KunTab
      :model-value="active"
      :items="tabItems"
      :orientation="tabOrientation"
      variant="pills"
      color="primary"
      size="md"
      class="md:w-44 md:shrink-0"
      @update:model-value="(value) => (active = value)"
    >
      <template #tab="{ item }">
        {{ item.textValue }}
        <KunBadge
          v-if="item.count"
          variant="count"
          :count="item.count"
          color="danger"
          size="sm"
        />
      </template>
    </KunTab>
    <div class="min-w-0 flex-1">
      <section
        v-for="section in sections"
        v-show="tabKey(section.name) === active"
        :key="section.name"
        class="grid grid-cols-1 gap-5"
      >
        <template v-if="isTabbedGroup(section.name)">
          <KunTab
            :model-value="activeField[section.name] ?? ''"
            :items="subTabItems(section)"
            orientation="horizontal"
            variant="underlined"
            color="primary"
            size="sm"
            @update:model-value="(value) => (activeField[section.name] = value)"
          >
            <template #tab="{ item }">
              {{ item.textValue }}
              <KunBadge
                v-if="item.dirty"
                variant="dot"
                color="danger"
                size="sm"
              />
            </template>
          </KunTab>
          <SchemaField
            v-for="field in section.fields"
            v-show="field.key === activeField[section.name]"
            :key="field.key"
            v-model="working[field.key]"
            :field="field"
            :config="config[field.key]"
            :baseline="values[field.key]"
            :suppressed="
              pairsSuppressed(field.key)
                ? working[companionKey(field.key)]
                : undefined
            "
            :disabled="disabled"
            @update:suppressed="(value) => setSuppressed(field.key, value)"
          />
        </template>
        <template v-else>
          <SchemaField
            v-for="field in section.fields"
            :key="field.key"
            v-model="working[field.key]"
            :field="field"
            :config="config[field.key]"
            :baseline="values[field.key]"
            :suppressed="
              pairsSuppressed(field.key)
                ? working[companionKey(field.key)]
                : undefined
            "
            :disabled="disabled"
            @update:suppressed="(value) => setSuppressed(field.key, value)"
          />
        </template>
      </section>
    </div>
  </div>

  <div v-else class="space-y-6">
    <section v-for="section in sections" :key="section.name" class="space-y-3">
      <h3
        v-if="section.name"
        class="text-default-900 border-b pb-1 text-base font-semibold"
      >
        {{ section.name }}
      </h3>
      <div class="grid grid-cols-1 gap-4">
        <SchemaField
          v-for="field in section.fields"
          :key="field.key"
          v-model="working[field.key]"
          :field="field"
          :config="config[field.key]"
          :baseline="values[field.key]"
          :suppressed="
            pairsSuppressed(field.key)
              ? working[companionKey(field.key)]
              : undefined
          "
          :disabled="disabled"
          @update:suppressed="(value) => setSuppressed(field.key, value)"
        />
      </div>
    </section>
  </div>
</template>

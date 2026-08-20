<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  KunButton,
  KunChip,
  KunDatePicker,
  KunIcon,
  KunInput,
  KunSelect,
  KunSwitch,
  KunTagInput,
  KunTextarea
} from '@kungal/ui-vue'
import {
  cloneEditValue,
  editValueEqual,
  formatEditValue,
  isEditControl,
  resolveControl
} from '@nextmoe/edit-ui-core'
import EntityKindPicker from './EntityKindPicker.vue'
import EntityPicker from './EntityPicker.vue'
import ImageField from './ImageField.vue'
import ObjectListField from './ObjectListField.vue'
import SourceContext from './SourceContext.vue'
import type { EditFieldConfig, EditSchemaField } from './types'

const props = defineProps<{
  field: EditSchemaField
  config?: EditFieldConfig
  modelValue: unknown
  baseline?: unknown
  suppressed?: unknown
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  'update:suppressed': [value: unknown]
}>()

const control = computed(() => resolveControl(props.field, props.config))
const label = computed(() => props.config?.label ?? props.field.key)

// Forward compatibility: the edit engine may start sending a control the
// installed package predates. Render it read-only rather than falling through
// to the text input (which would silently invite an edit the site cannot
// serialise) — and never throw.
const isKnownControl = computed(() => isEditControl(control.value))

const readonlyReason = computed(() => {
  if (props.field.locked) {
    return '锁定字段'
  }
  if (props.field.deprecated) {
    return '已废弃'
  }
  if (!props.field.can_propose) {
    return '无编辑权限'
  }
  if (
    (control.value === 'image' || control.value === 'image-list') &&
    !props.config?.uploadImage
  ) {
    return '本期只读'
  }
  if (control.value === 'readonly') {
    return '本期只读'
  }
  return ''
})
const editable = computed(() => !props.disabled && readonlyReason.value === '')

const isDirty = computed(
  () => !editValueEqual(props.baseline ?? null, props.modelValue ?? null)
)
const revert = () => emit('update:modelValue', cloneEditValue(props.baseline))

const contextItems = computed(() =>
  props.config?.contextItems ? props.config.contextItems(props.modelValue) : []
)

const textBuffer = ref('')
const boolBuffer = ref(false)
const stringList = ref<string[]>([])

const syncFromValue = () => {
  const v = props.modelValue
  switch (control.value) {
    case 'switch':
      boolBuffer.value = v === true
      break
    case 'string-list':
    case 'number-list':
      stringList.value = Array.isArray(v) ? v.map((x) => String(x)) : []
      break
    default:
      textBuffer.value = v === null || v === undefined ? '' : String(v)
  }
}
watch(() => props.modelValue, syncFromValue, { immediate: true })

const emitText = (raw: string | number) => {
  const value = String(raw)
  textBuffer.value = value
  switch (control.value) {
    case 'number': {
      const trimmed = value.trim()
      if (trimmed === '') {
        emit('update:modelValue', props.config?.nullable ? null : 0)
        return
      }
      const n = Number(trimmed)
      emit('update:modelValue', Number.isFinite(n) ? n : trimmed)
      return
    }
    case 'date':
      emit('update:modelValue', value === '' ? null : value)
      return
    default:
      emit('update:modelValue', value)
  }
}

const onDatePicked = (
  value: string | null | [string | null, string | null]
) => {
  const single = Array.isArray(value) ? (value[0] ?? null) : value
  emit('update:modelValue', single || null)
}

const emitSelect = (value: string | number | (string | number)[] | null) => {
  emit('update:modelValue', Array.isArray(value) ? (value[0] ?? null) : value)
}

const emitSwitch = (value: boolean) => {
  boolBuffer.value = value
  emit('update:modelValue', value)
}

const emitStringList = (items: string[]) => {
  stringList.value = items
  if (control.value === 'number-list') {
    emit(
      'update:modelValue',
      items
        .map((x) => Number(x.trim()))
        .filter((n) => Number.isInteger(n) && n > 0)
    )
    return
  }
  emit(
    'update:modelValue',
    items.map((x) => x.trim()).filter((x) => x.length > 0)
  )
}

const selectOptions = computed(() =>
  (props.config?.options ?? []).map((o) => ({ value: o.value, label: o.label }))
)

// Cast here, not in the template. `:model-value="modelValue as string | number
// | null"` makes vue-eslint-parser read the top-level `|` as a Vue 2 filter
// (vue/no-deprecated-filter). Parentheses used to hide it until prettier
// stripped them as redundant.
const selectValue = computed(() => props.modelValue as string | number | null)

const resolveImageURL = (v: unknown) =>
  props.config?.resolveImage ? props.config.resolveImage(v) : ''

const readonlyImageURLs = computed(() => {
  if (control.value === 'image') {
    const url = resolveImageURL(props.modelValue)
    return url ? [url] : []
  }
  if (control.value === 'image-list' && Array.isArray(props.modelValue)) {
    return props.modelValue.map(resolveImageURL).filter((u) => u !== '')
  }
  return []
})
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-center gap-2">
      <span class="text-default-700 text-sm font-medium">{{ label }}</span>
      <KunChip v-if="readonlyReason" size="sm" variant="flat" color="default">
        {{ readonlyReason }}
      </KunChip>
      <template v-if="isDirty">
        <KunChip size="sm" variant="flat" color="warning">已修改</KunChip>
        <KunButton variant="light" color="default" size="sm" @click="revert">
          <KunIcon name="lucide:undo-2" />
          撤销
        </KunButton>
      </template>
    </div>

    <p
      v-if="config?.description && control !== 'switch'"
      class="text-default-400 text-xs"
    >
      {{ config.description }}
    </p>

    <template v-if="config?.component">
      <component
        :is="config.component"
        v-bind="config.fieldProps"
        :model-value="modelValue"
        :suppressed="suppressed"
        :disabled="!editable"
        @update:model-value="
          (value: unknown) => emit('update:modelValue', value)
        "
        @update:suppressed="
          (value: unknown) => emit('update:suppressed', value)
        "
      />
    </template>

    <template
      v-else-if="
        control === 'entity-kind-picker' &&
        config?.searchEntities &&
        config?.entityIdKey &&
        config?.entityKinds
      "
    >
      <EntityKindPicker
        :model-value="modelValue"
        :disabled="!editable"
        :placeholder="config?.placeholder"
        :id-key="config.entityIdKey"
        :kind-options="config.entityKinds"
        :default-kind="
          config?.entityDefaultKind ?? config.entityKinds[0]!.value
        "
        :search="config.searchEntities"
        :resolve="config?.resolveEntities"
        @update:model-value="(value) => emit('update:modelValue', value)"
      />
    </template>

    <template v-else-if="control === 'entity-picker' && config?.searchEntities">
      <EntityPicker
        :model-value="modelValue"
        :multiple="config?.multiple"
        :disabled="!editable"
        :placeholder="config?.placeholder"
        :search="config.searchEntities"
        :resolve="config?.resolveEntities"
        @update:model-value="(value) => emit('update:modelValue', value)"
      />
    </template>

    <template v-else-if="!editable">
      <div
        v-if="readonlyImageURLs.length"
        class="flex flex-wrap items-start gap-2"
      >
        <img
          v-for="(url, i) in readonlyImageURLs"
          :key="i"
          :src="url"
          loading="lazy"
          class="max-h-24 max-w-full rounded object-cover"
        />
      </div>
      <p v-else class="text-default-500 text-sm break-all whitespace-pre-wrap">
        {{ formatEditValue(modelValue, config) }}
      </p>
    </template>

    <template v-else-if="!isKnownControl">
      <p class="text-default-500 text-sm break-all whitespace-pre-wrap">
        {{ formatEditValue(modelValue, config) }}
      </p>
    </template>

    <template v-else>
      <KunTextarea
        v-if="control === 'textarea'"
        :model-value="textBuffer"
        :placeholder="config?.placeholder"
        @update:model-value="emitText"
      />
      <KunSelect
        v-else-if="control === 'select'"
        :model-value="selectValue"
        :options="selectOptions"
        @update:model-value="emitSelect"
      />
      <KunSwitch
        v-else-if="control === 'switch'"
        :model-value="boolBuffer"
        :label="config?.description ?? ''"
        @update:model-value="emitSwitch"
      />
      <KunTagInput
        v-else-if="control === 'string-list' || control === 'number-list'"
        :model-value="stringList"
        :placeholder="config?.placeholder ?? '输入后回车添加'"
        @update:model-value="emitStringList"
      />
      <ObjectListField
        v-else-if="control === 'object-list'"
        :model-value="modelValue"
        :config="config"
        @update:model-value="(value) => emit('update:modelValue', value)"
      />
      <ImageField
        v-else-if="control === 'image' || control === 'image-list'"
        :model-value="modelValue"
        :config="config"
        :multiple="control === 'image-list'"
        @update:model-value="(value) => emit('update:modelValue', value)"
      />
      <KunDatePicker
        v-else-if="control === 'date'"
        :model-value="(modelValue as string | null) ?? null"
        mode="single"
        :placeholder="config?.placeholder"
        @update:model-value="onDatePicked"
      />
      <KunInput
        v-else
        :model-value="textBuffer"
        :type="control === 'number' ? 'number' : 'text'"
        :placeholder="config?.placeholder"
        @update:model-value="emitText"
      />
    </template>

    <SourceContext
      v-if="config?.contextNote"
      :note="config.contextNote"
      :items="contextItems"
    />
  </div>
</template>

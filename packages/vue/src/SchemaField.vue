<script setup lang="ts">
import { computed, ref } from 'vue'
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
  applyVocabularyOptions,
  cloneEditValue,
  editValueEqual,
  guardEditControl,
  isEditControl,
  overElementCap,
  resolveControl
} from '@nextmoe/edit-ui-core'
import EntityKindPicker from './EntityKindPicker.vue'
import EntityPicker from './EntityPicker.vue'
import FieldReadonly from './FieldReadonly.vue'
import ImageField from './ImageField.vue'
import ObjectListField from './ObjectListField.vue'
import SourceContext from './SourceContext.vue'
import { useFieldBuffer } from './useFieldBuffer'
import type {
  EditFieldConfig,
  EditRowIssue,
  EditSchemaField,
  EditVocabularyMap
} from './types'

const props = defineProps<{
  field: EditSchemaField
  config?: EditFieldConfig
  vocabularies?: EditVocabularyMap
  modelValue: unknown
  baseline?: unknown
  suppressed?: unknown
  disabled?: boolean
  errors?: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  'update:suppressed': [value: unknown]
}>()

// A schema-declared vocabulary can turn a config-less enum into a select, so
// the merged config, not the raw prop, is what every consumer below sees.
const cfg = computed(() =>
  applyVocabularyOptions(
    props.field,
    props.config,
    props.vocabularies,
    props.modelValue
  )
)

const guarded = computed(() =>
  guardEditControl(resolveControl(props.field, cfg.value), props.modelValue)
)
const control = computed(() => guarded.value.control)
const label = computed(() => cfg.value?.label ?? props.field.key)

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
  if (guarded.value.degraded) {
    return '结构不支持'
  }
  if (
    (control.value === 'image' || control.value === 'image-list') &&
    !cfg.value?.uploadImage
  ) {
    return '本期只读'
  }
  if (control.value === 'readonly') {
    return '本期只读'
  }
  return ''
})
const editable = computed(() => !props.disabled && readonlyReason.value === '')

const rowIssues = ref<(EditRowIssue & { index: number })[]>([])

const capExceeded = computed(() =>
  overElementCap(props.modelValue, props.field.max_elements)
)

const messages = computed(() => {
  const out = [...(props.errors ?? [])]
  if (guarded.value.reason) {
    out.push(guarded.value.reason)
  }
  if (capExceeded.value) {
    out.push(`最多 ${props.field.max_elements} 项，当前已超出`)
  }
  for (const issue of rowIssues.value) {
    out.push(`第 ${issue.index + 1} 行 ${issue.key}：${issue.reason}`)
  }
  return out
})

const isDirty = computed(
  () => !editValueEqual(props.baseline ?? null, props.modelValue ?? null)
)
const revert = () => emit('update:modelValue', cloneEditValue(props.baseline))

const contextItems = computed(() =>
  cfg.value?.contextItems ? cfg.value.contextItems(props.modelValue) : []
)

const {
  textBuffer,
  boolBuffer,
  stringList,
  emitText,
  emitDate,
  emitSelect,
  emitSwitch,
  emitStringList
} = useFieldBuffer(
  control,
  () => props.modelValue,
  (value) => emit('update:modelValue', value),
  () => cfg.value?.nullable
)

const selectOptions = computed(() =>
  (cfg.value?.options ?? []).map((o) => ({ value: o.value, label: o.label }))
)

// Cast here, not in the template. `:model-value="modelValue as string | number
// | null"` makes vue-eslint-parser read the top-level `|` as a Vue 2 filter
// (vue/no-deprecated-filter). Parentheses used to hide it until prettier
// stripped them as redundant.
const selectValue = computed(() => props.modelValue as string | number | null)
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
      v-if="cfg?.description && control !== 'switch'"
      class="text-default-400 text-xs"
    >
      {{ cfg.description }}
    </p>

    <template v-if="cfg?.component">
      <component
        :is="cfg.component"
        v-bind="cfg.fieldProps"
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
        cfg?.searchEntities &&
        cfg?.entityIdKey &&
        cfg?.entityKinds
      "
    >
      <EntityKindPicker
        :model-value="modelValue"
        :disabled="!editable"
        :placeholder="cfg?.placeholder"
        :id-key="cfg.entityIdKey"
        :kind-options="cfg.entityKinds"
        :default-kind="cfg?.entityDefaultKind ?? cfg.entityKinds[0]!.value"
        :search="cfg.searchEntities"
        :resolve="cfg?.resolveEntities"
        @update:model-value="(value) => emit('update:modelValue', value)"
      />
    </template>

    <template v-else-if="control === 'entity-picker' && cfg?.searchEntities">
      <EntityPicker
        :model-value="modelValue"
        :multiple="cfg?.multiple"
        :disabled="!editable"
        :placeholder="cfg?.placeholder"
        :search="cfg.searchEntities"
        :resolve="cfg?.resolveEntities"
        @update:model-value="(value) => emit('update:modelValue', value)"
      />
    </template>

    <template v-else-if="!editable || !isKnownControl">
      <FieldReadonly
        :model-value="modelValue"
        :config="cfg"
        :control="control"
      />
    </template>

    <template v-else>
      <KunTextarea
        v-if="control === 'textarea'"
        :model-value="textBuffer"
        :placeholder="cfg?.placeholder"
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
        :label="cfg?.description ?? ''"
        @update:model-value="emitSwitch"
      />
      <KunTagInput
        v-else-if="control === 'string-list' || control === 'number-list'"
        :model-value="stringList"
        :placeholder="cfg?.placeholder ?? '输入后回车添加'"
        :max-tags="field.max_elements"
        :show-counter="Boolean(field.max_elements)"
        :respect-composition="true"
        @update:model-value="emitStringList"
      />
      <ObjectListField
        v-else-if="control === 'object-list'"
        :model-value="modelValue"
        :config="cfg"
        :max="field.max_elements"
        :suppressed="suppressed"
        :identity-key="cfg?.identityKey"
        @update:model-value="(value) => emit('update:modelValue', value)"
        @update:issues="(value) => (rowIssues = value)"
        @update:suppressed="(value) => emit('update:suppressed', value)"
      />
      <ImageField
        v-else-if="control === 'image' || control === 'image-list'"
        :model-value="modelValue"
        :config="cfg"
        :multiple="control === 'image-list'"
        @update:model-value="(value) => emit('update:modelValue', value)"
      />
      <KunDatePicker
        v-else-if="control === 'date'"
        :model-value="(modelValue as string | null) ?? null"
        mode="single"
        :placeholder="cfg?.placeholder"
        @update:model-value="emitDate"
      />
      <KunInput
        v-else
        :model-value="textBuffer"
        :type="control === 'number' ? 'number' : 'text'"
        :placeholder="cfg?.placeholder"
        @update:model-value="emitText"
      />
    </template>

    <ul v-if="messages.length" class="space-y-0.5">
      <li
        v-for="(message, i) in messages"
        :key="i"
        class="text-danger-600 flex items-start gap-1 text-xs"
      >
        <KunIcon name="lucide:circle-alert" class="mt-0.5 shrink-0" />
        <span>{{ message }}</span>
      </li>
    </ul>

    <SourceContext
      v-if="cfg?.contextNote"
      :note="cfg.contextNote"
      :items="contextItems"
    />
  </div>
</template>

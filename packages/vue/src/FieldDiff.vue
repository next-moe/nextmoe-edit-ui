<script setup lang="ts">
import { computed } from 'vue'
import { KunChip } from '@kungal/ui-vue'
import {
  diffItems,
  formatEditItem,
  formatEditValue
} from '@nextmoe/edit-ui-core'
import ImageDiff from './ImageDiff.vue'
import TextDiff from './TextDiff.vue'
import type { EditFieldConfig, ImageDiffEntry } from './types'

const props = defineProps<{
  label: string
  diffHint?: string
  from: unknown
  to: unknown
  config?: EditFieldConfig
}>()

const text = computed(() =>
  props.diffHint === 'lines'
    ? {
        from: typeof props.from === 'string' ? props.from : '',
        to: typeof props.to === 'string' ? props.to : '',
        preWrap: true
      }
    : {
        from: formatEditValue(props.from, props.config),
        to: formatEditValue(props.to, props.config),
        preWrap: false
      }
)

const items = computed(() =>
  props.diffHint === 'items' || props.diffHint === 'image'
    ? diffItems(props.from, props.to)
    : { added: [], removed: [], kept: [] }
)

const resolveImage = (value: unknown): string =>
  props.config?.resolveImage ? props.config.resolveImage(value) : ''

const isImage = computed(() => props.diffHint === 'image')

const imageEntry = (value: unknown): ImageDiffEntry => ({
  url: resolveImage(value),
  text: formatEditItem(value, props.config)
})

const present = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== ''

const imageDiff = computed(() => {
  if (!isImage.value) {
    return { removed: [], added: [], keptCount: 0 }
  }
  if (Array.isArray(props.from) || Array.isArray(props.to)) {
    return {
      removed: items.value.removed.map(imageEntry),
      added: items.value.added.map(imageEntry),
      keptCount: items.value.kept.length
    }
  }
  return {
    removed: present(props.from) ? [imageEntry(props.from)] : [],
    added: present(props.to) ? [imageEntry(props.to)] : [],
    keptCount: 0
  }
})
</script>

<template>
  <div class="space-y-1">
    <p class="text-default-700 text-sm font-semibold">{{ label }}</p>

    <ImageDiff
      v-if="isImage"
      :removed="imageDiff.removed"
      :added="imageDiff.added"
      :kept-count="imageDiff.keptCount"
    />

    <div v-else-if="diffHint === 'items'" class="space-y-1">
      <div v-if="items.removed.length" class="flex flex-wrap gap-1">
        <KunChip
          v-for="(item, i) in items.removed"
          :key="`del-${i}`"
          size="sm"
          variant="flat"
          color="danger"
        >
          − {{ formatEditItem(item, config) }}
        </KunChip>
      </div>
      <div v-if="items.added.length" class="flex flex-wrap gap-1">
        <KunChip
          v-for="(item, i) in items.added"
          :key="`add-${i}`"
          size="sm"
          variant="flat"
          color="success"
        >
          + {{ formatEditItem(item, config) }}
        </KunChip>
      </div>
      <p
        v-if="!items.added.length && !items.removed.length"
        class="text-default-400 text-xs"
      >
        仅顺序调整
      </p>
    </div>

    <TextDiff v-else :from="text.from" :to="text.to" :pre-wrap="text.preWrap" />
  </div>
</template>

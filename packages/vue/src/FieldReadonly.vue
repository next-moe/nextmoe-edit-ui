<script setup lang="ts">
import { computed } from 'vue'
import { formatEditValue } from '@nextmoe/edit-ui-core'
import type { EditControl, EditFieldConfig } from './types'

const props = defineProps<{
  modelValue: unknown
  config?: EditFieldConfig
  control: EditControl
}>()

const resolveImageURL = (value: unknown) =>
  props.config?.resolveImage ? props.config.resolveImage(value) : ''

const imageURLs = computed(() => {
  if (props.control === 'image') {
    const url = resolveImageURL(props.modelValue)
    return url ? [url] : []
  }
  if (props.control === 'image-list' && Array.isArray(props.modelValue)) {
    return props.modelValue.map(resolveImageURL).filter((u) => u !== '')
  }
  return []
})
</script>

<template>
  <div v-if="imageURLs.length" class="flex flex-wrap items-start gap-2">
    <img
      v-for="(url, i) in imageURLs"
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

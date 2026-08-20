<script setup lang="ts">
import { computed, ref } from 'vue'
import { KunButton, KunChip, KunIcon } from '@kungal/ui-vue'
import type { EditContextItem } from './types'

const props = defineProps<{
  note?: string
  items: EditContextItem[]
}>()

const isImageStrip = computed(() => props.items.some((item) => item.image))
const previewCount = computed(() => (isImageStrip.value ? 8 : 14))

const expanded = ref(false)
const visible = computed(() =>
  expanded.value ? props.items : props.items.slice(0, previewCount.value)
)
const folded = computed(() => props.items.length - visible.value.length)
</script>

<template>
  <div
    v-if="items.length || note"
    class="border-default-200 bg-default-100/50 space-y-2 rounded-lg border border-dashed p-3"
  >
    <p class="text-default-500 flex items-start gap-1.5 text-xs">
      <KunIcon name="lucide:lock" class="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{{ note }}</span>
    </p>

    <div
      v-if="isImageStrip"
      class="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6"
    >
      <img
        v-for="(item, index) in visible"
        :key="index"
        :src="item.image"
        :alt="item.label"
        :title="item.label"
        loading="lazy"
        class="bg-default-200 aspect-video w-full rounded object-contain opacity-70"
      />
    </div>
    <div v-else-if="items.length" class="flex flex-wrap gap-1">
      <KunChip
        v-for="(item, index) in visible"
        :key="index"
        size="sm"
        variant="flat"
        color="default"
      >
        {{ item.label }}
      </KunChip>
    </div>

    <KunButton
      v-if="folded > 0"
      variant="light"
      color="default"
      size="sm"
      @click="expanded = true"
    >
      还有 {{ folded }} 项，全部显示
    </KunButton>
  </div>
</template>

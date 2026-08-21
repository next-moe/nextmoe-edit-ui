<script setup lang="ts">
import { computed } from 'vue'
import { DOCS_PAGES } from '~/site'

const route = useRoute()

const index = computed(() =>
  DOCS_PAGES.findIndex((page) => page.to === route.path)
)
const prev = computed(() =>
  index.value > 0 ? DOCS_PAGES[index.value - 1] : undefined
)
const next = computed(() =>
  index.value >= 0 ? DOCS_PAGES[index.value + 1] : undefined
)
</script>

<template>
  <nav
    v-if="prev || next"
    aria-label="上下篇导航"
    class="border-default-200 grid grid-cols-1 gap-3 border-t pt-6 sm:grid-cols-2"
  >
    <NuxtLink
      v-if="prev"
      :to="prev.to"
      class="border-default-200 hover:border-primary group rounded-lg border px-4 py-3 transition"
    >
      <span class="text-default-400 flex items-center gap-1 text-xs">
        <KunIcon name="lucide:arrow-left" class="h-3 w-3" />
        上一篇
      </span>
      <span class="text-default-700 group-hover:text-primary text-sm">
        {{ prev.label }}
      </span>
    </NuxtLink>
    <NuxtLink
      v-if="next"
      :to="next.to"
      class="border-default-200 hover:border-primary group rounded-lg border px-4 py-3 text-right transition sm:col-start-2"
    >
      <span
        class="text-default-400 flex items-center justify-end gap-1 text-xs"
      >
        下一篇
        <KunIcon name="lucide:arrow-right" class="h-3 w-3" />
      </span>
      <span class="text-default-700 group-hover:text-primary text-sm">
        {{ next.label }}
      </span>
    </NuxtLink>
  </nav>
</template>

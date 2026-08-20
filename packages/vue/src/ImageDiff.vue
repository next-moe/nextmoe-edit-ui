<script setup lang="ts">
import { computed } from 'vue'
import { KunChip } from '@kungal/ui-vue'
import type { ImageDiffEntry } from './types'

const props = defineProps<{
  removed: ImageDiffEntry[]
  added: ImageDiffEntry[]
  keptCount: number
}>()

const hasChange = computed(
  () => props.removed.length > 0 || props.added.length > 0
)
</script>

<template>
  <div class="space-y-1">
    <div v-if="hasChange" class="flex flex-wrap items-center gap-2">
      <span
        v-if="added.length"
        class="text-success-600 text-[10px] tabular-nums"
      >
        +{{ added.length }}
      </span>
      <span
        v-if="removed.length"
        class="text-danger-600 text-[10px] tabular-nums"
      >
        −{{ removed.length }}
      </span>
      <span v-if="keptCount" class="text-default-400 text-[10px] tabular-nums">
        {{ keptCount }} 张未改动
      </span>
    </div>

    <div
      class="border-default-200 bg-content1 flex flex-wrap gap-2 rounded-lg border px-2 py-2"
    >
      <figure
        v-for="(entry, i) in [
          ...removed.map((e) => ({ ...e, op: 'delete' as const })),
          ...added.map((e) => ({ ...e, op: 'insert' as const }))
        ]"
        :key="`${entry.op}-${i}`"
        class="relative"
      >
        <img
          v-if="entry.url"
          :src="entry.url"
          loading="lazy"
          class="max-h-24 rounded border-2 object-cover"
          :class="
            entry.op === 'delete'
              ? 'border-danger/60 opacity-70 grayscale'
              : 'border-success/60'
          "
        />
        <KunChip
          v-else
          size="sm"
          variant="flat"
          :color="entry.op === 'delete' ? 'danger' : 'success'"
        >
          {{ entry.op === 'delete' ? '−' : '+' }} {{ entry.text }}
        </KunChip>
        <figcaption
          v-if="entry.url"
          class="absolute top-1 left-1 rounded px-1 text-[10px] font-semibold text-white"
          :class="entry.op === 'delete' ? 'bg-danger' : 'bg-success'"
        >
          {{ entry.op === 'delete' ? '−' : '+' }}
        </figcaption>
      </figure>

      <p v-if="!hasChange" class="text-default-400 text-xs">
        <template v-if="keptCount"
          >仅顺序调整（{{ keptCount }} 张未改动）</template
        >
        <template v-else>（空）</template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  diffTextSegments,
  diffTextStats,
  elideTextDiff,
  isTextDiffElidable
} from '@nextmoe/edit-ui-core'

const props = withDefaults(
  defineProps<{
    from: string
    to: string
    preWrap?: boolean
  }>(),
  { preWrap: false }
)

const segments = computed(() => diffTextSegments(props.from, props.to))
const stats = computed(() => diffTextStats(segments.value))
const elidable = computed(() => isTextDiffElidable(segments.value))

const expanded = ref(false)
const pieces = computed(() => elideTextDiff(segments.value, expanded.value))
</script>

<template>
  <div class="space-y-1">
    <div
      v-if="stats.added || stats.removed || elidable"
      class="flex flex-wrap items-center gap-2"
    >
      <span
        v-if="stats.added"
        class="text-success-600 text-[10px] tabular-nums"
      >
        +{{ stats.added }}
      </span>
      <span
        v-if="stats.removed"
        class="text-danger-600 text-[10px] tabular-nums"
      >
        −{{ stats.removed }}
      </span>
      <button
        v-if="elidable"
        type="button"
        class="text-primary text-[10px] hover:underline"
        @click="expanded = !expanded"
      >
        {{ expanded ? '折叠未改动内容' : '显示全部' }}
      </button>
    </div>

    <div
      class="border-default-200 bg-content1 rounded-lg border px-2 py-1.5 text-sm leading-relaxed break-words"
      :class="{ 'whitespace-pre-wrap': preWrap }"
    >
      <template v-for="(p, i) in pieces" :key="i">
        <del
          v-if="p.kind === 'text' && p.op === 'delete'"
          class="bg-danger/15 text-danger-600 decoration-danger-600/50 rounded px-0.5"
          >{{ p.text }}</del
        >
        <ins
          v-else-if="p.kind === 'text' && p.op === 'insert'"
          class="bg-success/15 text-success-600 rounded px-0.5 no-underline"
          >{{ p.text }}</ins
        >
        <span v-else-if="p.kind === 'text'" class="text-default-500">{{
          p.text
        }}</span>
        <span
          v-else
          class="text-default-400 bg-default-100 mx-1 rounded px-1 text-[10px] select-none"
          >⋯ 省略 {{ p.count }} 字未改动 ⋯</span
        >
      </template>
      <span v-if="!pieces.length" class="text-default-400 text-xs italic">
        （空）
      </span>
    </div>
  </div>
</template>

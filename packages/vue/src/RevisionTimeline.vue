<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  KunButton,
  KunCheckBox,
  KunChip,
  KunNull,
  KunUserChip
} from '@kungal/ui-vue'
import { revisionActionBadge } from '@nextmoe/edit-ui-core'
import Time from './Time.vue'
import type { EditRevision, EditUser } from './types'

const props = defineProps<{
  items: EditRevision[]
  users?: Record<number, EditUser>
  labelFor: (key: string) => string
  legacyActionLabels?: Record<string, string>
}>()

const emit = defineEmits<{
  diff: [fromSeq: number, toSeq: number]
}>()

const selected = ref<number[]>([])
watch(
  () => props.items,
  (items) => {
    selected.value = items.slice(0, 2).map((r) => r.seq)
  },
  { immediate: true }
)

const changedSummary = (keys: string[]) => {
  const labels = keys.map((k) => props.labelFor(k))
  const CAP = 8
  return labels.length <= CAP
    ? labels.join('、')
    : `${labels.slice(0, CAP).join('、')} … 共 ${labels.length} 项`
}

const toggle = (seq: number) => {
  const index = selected.value.indexOf(seq)
  if (index >= 0) {
    selected.value.splice(index, 1)
    return
  }
  if (selected.value.length === 2) {
    selected.value.shift()
  }
  selected.value.push(seq)
}

const canDiff = computed(() => selected.value.length === 2)
const requestDiff = () => {
  if (!canDiff.value) {
    return
  }
  const [a, b] = [...selected.value].sort((x, y) => x - y)
  emit('diff', a!, b!)
}

const legacyLabel = (word: string) => props.legacyActionLabels?.[word] ?? word
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-default-500 text-sm">点击任意两个版本进行对比</p>
      <KunButton
        size="sm"
        color="primary"
        variant="flat"
        :disabled="!canDiff"
        @click="requestDiff"
      >
        对比所选版本
      </KunButton>
    </div>

    <KunNull v-if="!items.length" description="暂无修订记录" />

    <div v-else class="space-y-2">
      <div
        v-for="revision in items"
        :key="revision.id"
        class="relative cursor-pointer rounded border p-3 transition"
        :class="
          selected.includes(revision.seq)
            ? 'border-primary bg-primary/5 ring-primary ring-1'
            : 'border-default-200 hover:border-default-300'
        "
        @click="toggle(revision.seq)"
      >
        <div class="flex items-start gap-3">
          <KunCheckBox
            :model-value="selected.includes(revision.seq)"
            color="primary"
            size="sm"
            class="pointer-events-none absolute top-3 right-3 shrink-0"
          />
          <div class="min-w-0 flex-1 space-y-2 pr-7">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-default-700 text-sm font-semibold">
                #{{ revision.seq }}
              </span>
              <KunChip
                size="sm"
                variant="flat"
                :color="revisionActionBadge(revision.action).color"
              >
                {{ revisionActionBadge(revision.action).label }}
              </KunChip>
              <KunChip
                v-if="revision.legacy_action"
                size="sm"
                variant="flat"
                color="warning"
              >
                迁移 · {{ legacyLabel(revision.legacy_action) }}
              </KunChip>
              <KunChip
                v-if="revision.legacy_minor"
                size="sm"
                variant="flat"
                color="default"
              >
                小修改
              </KunChip>
              <span class="text-default-400 ml-auto text-xs">
                <Time :time="revision.created_at" type="date" show-year />
              </span>
            </div>

            <p
              v-if="revision.changed_fields?.length"
              class="text-default-500 text-xs"
            >
              <span class="text-default-400">修改字段：</span>
              {{ changedSummary(revision.changed_fields) }}
            </p>

            <p v-if="revision.legacy_note" class="text-default-500 text-sm">
              {{ revision.legacy_note }}
            </p>

            <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span class="text-default-500 flex items-center gap-1.5 text-xs">
                <span class="text-default-400">编辑者</span>
                <KunUserChip
                  v-if="users?.[revision.actor_uid]"
                  :user="users?.[revision.actor_uid]"
                  size="sm"
                  :is-navigation="false"
                  :disable-floating="true"
                />
                <span v-else>用户 #{{ revision.actor_uid }}</span>
              </span>
              <span
                v-if="revision.amender_uid"
                class="text-default-500 flex items-center gap-1.5 text-xs"
              >
                <span class="text-default-400">审核者</span>
                <KunUserChip
                  v-if="users?.[revision.amender_uid]"
                  :user="users?.[revision.amender_uid]"
                  size="sm"
                  :is-navigation="false"
                  :disable-floating="true"
                />
                <span v-else>用户 #{{ revision.amender_uid }}</span>
              </span>
            </div>

            <div class="flex justify-end" @click.stop>
              <slot name="actions" :revision="revision" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

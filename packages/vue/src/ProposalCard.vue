<script setup lang="ts">
import { computed } from 'vue'
import { KunCard, KunChip, KunInfo } from '@kungal/ui-vue'
import { proposalStatusBadge } from '@nextmoe/edit-ui-core'
import Time from './Time.vue'
import type { EditProposal, EditUser } from './types'

const props = defineProps<{
  proposal: EditProposal
  labelFor: (key: string) => string
  proposer?: EditUser
  decider?: EditUser
}>()

const badge = computed(() => proposalStatusBadge(props.proposal.status))
const patchKeys = computed(() =>
  Object.keys(props.proposal.effective_patch ?? props.proposal.patch)
)
const amendedCount = computed(() => props.proposal.amendments?.length ?? 0)
</script>

<template>
  <KunCard
    :is-hoverable="true"
    :is-transparent="false"
    content-class="space-y-2"
  >
    <div class="flex flex-wrap items-center gap-2">
      <KunChip size="sm" variant="flat" :color="badge.color">
        {{ badge.label }}
      </KunChip>
      <slot name="title">
        <span class="text-default-700 text-sm font-medium">
          提案 #{{ proposal.id }}
        </span>
      </slot>
      <KunChip v-if="amendedCount" size="sm" variant="flat" color="secondary">
        审核修正 ×{{ amendedCount }}
      </KunChip>
      <span class="text-default-400 ml-auto text-xs">
        <Time :time="proposal.created_at" type="date" show-year />
      </span>
    </div>

    <div class="flex flex-wrap gap-1">
      <KunChip
        v-for="key in patchKeys"
        :key="key"
        size="sm"
        variant="flat"
        color="default"
      >
        {{ labelFor(key) }}
      </KunChip>
    </div>

    <p v-if="proposal.note" class="text-default-500 text-sm">
      {{ proposal.note }}
    </p>

    <div class="text-default-400 flex flex-wrap items-center gap-2 text-xs">
      <slot name="proposer">
        <span
          >提案人：{{
            proposer?.name ?? `用户 #${proposal.proposer_uid}`
          }}</span
        >
      </slot>
      <template v-if="proposal.status !== 'open' && proposal.decided_by_uid">
        <span>
          处理人：{{ decider?.name ?? `用户 #${proposal.decided_by_uid}` }}
        </span>
      </template>
    </div>

    <KunInfo
      v-if="proposal.status === 'declined' && proposal.decision_note"
      color="danger"
      title="拒绝理由"
      :description="proposal.decision_note"
    />

    <div v-if="$slots.actions" class="flex justify-end gap-2">
      <slot name="actions" />
    </div>
  </KunCard>
</template>

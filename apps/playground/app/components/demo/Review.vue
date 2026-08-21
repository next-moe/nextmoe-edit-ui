<script setup lang="ts">
import { computed, ref } from 'vue'
import { labelFor, proposals, revisions, users } from '~/fixtures'

const status = ref('open')
const visible = computed(() =>
  proposals.filter((proposal) => proposal.status === status.value)
)

const diffRequest = ref('')
const onDiff = (from: number, to: number) => {
  diffRequest.value = `#${from} → #${to}`
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <div class="space-y-2">
      <h3 class="text-default-700 text-sm font-medium">
        ReviewQueue + ProposalCard
      </h3>
      <p class="text-default-400 text-xs">
        Proposals by status, with the patched field labels resolved through the
        <code>labelFor</code> function the site supplies.
      </p>
      <KunCard :is-transparent="false">
        <EditReviewQueue
          v-model:status="status"
          :items="visible"
          :users="users"
          :label-for="labelFor"
        />
      </KunCard>
    </div>

    <div class="space-y-2">
      <h3 class="text-default-700 text-sm font-medium">RevisionTimeline</h3>
      <p class="text-default-400 text-xs">
        Pick any two revisions and it emits <code>diff(fromSeq, toSeq)</code> —
        fetching that diff is the site's job.
        <span v-if="diffRequest" class="text-primary">
          Last request: {{ diffRequest }}
        </span>
      </p>
      <KunCard :is-transparent="false">
        <EditRevisionTimeline
          :items="revisions"
          :users="users"
          :label-for="labelFor"
          :legacy-action-labels="{ import: '导入' }"
          @diff="onDiff"
        />
      </KunCard>
    </div>
  </div>
</template>

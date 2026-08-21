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
      <p class="text-default-400 text-xs leading-relaxed">按状态筛选的提案列表；被改动字段的标签，是通过站点提供的 <code>labelFor</code> 函数解析出来的。</p>
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
      <p class="text-default-400 text-xs leading-relaxed">任选两个版本，它会抛出 <code>diff(fromSeq, toSeq)</code> —— 真正去取这份差异是站点的事。<span v-if="diffRequest" class="text-primary">最近一次请求：{{ diffRequest }}</span></p>
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

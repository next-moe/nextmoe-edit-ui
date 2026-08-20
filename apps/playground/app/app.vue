<script setup lang="ts">
import { ref } from 'vue'
import {
  config,
  fields,
  groupOrder,
  labelFor,
  proposals,
  resolveImage,
  revisions,
  users,
  values
} from './fixtures'

const layout = ref<'stack' | 'tabs'>('stack')
const patch = ref<Record<string, unknown>>({})
const reviewStatus = ref('open')
const diffRequest = ref('')

const layoutItems = [
  { value: 'stack', textValue: 'stack' },
  { value: 'tabs', textValue: 'tabs' }
]

const onDiff = (from: number, to: number) => {
  diffRequest.value = `#${from} → #${to}`
}
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <div class="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <header class="space-y-1">
        <h1 class="text-2xl font-bold">NextMoe edit-ui playground</h1>
        <p class="text-default-500 text-sm">
          fixture schema 驱动，逐一渲染全部 EditControl 与 diff / review /
          timeline 视图。
        </p>
      </header>

      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold">SchemaForm</h2>
          <KunTab
            v-model="layout"
            :items="layoutItems"
            variant="pills"
            size="sm"
          />
        </div>
        <EditSchemaForm
          :fields="fields"
          :values="values"
          :config="config"
          :group-order="groupOrder"
          :layout="layout"
          :tabbed-groups="['关系']"
          @update:patch="(value) => (patch = value)"
        />
        <div class="border-default-200 rounded-lg border p-3">
          <p class="text-default-500 mb-1 text-xs">update:patch</p>
          <pre class="text-default-700 overflow-x-auto text-xs">{{
            JSON.stringify(patch, null, 2)
          }}</pre>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">FieldDiff</h2>
        <EditFieldDiff
          label="标题"
          diff-hint="inline"
          from="ひぐらしのなく頃に"
          to="ひぐらしのなく頃に 礼"
        />
        <EditFieldDiff
          label="简介"
          diff-hint="lines"
          :from="values.intro"
          to="雏见泽村，昭和五十八年六月。&#10;绵流之夜，连续怪死事件第四次上演。"
        />
        <EditFieldDiff
          label="别名"
          diff-hint="items"
          :from="['寒蝉鸣泣之时', 'Higurashi']"
          :to="['寒蝉鸣泣之时', '寒蝉鸣泣之时 礼']"
        />
        <EditFieldDiff
          label="画廊"
          diff-hint="image"
          :from="[{ image_hash: 'shot-a' }, { image_hash: 'shot-b' }]"
          :to="[{ image_hash: 'shot-a' }, { image_hash: 'shot-d' }]"
          :config="{
            label: '画廊',
            resolveImage,
            formatItem: (v) => String((v as { image_hash: string }).image_hash)
          }"
        />
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">ProposalCard</h2>
        <EditProposalCard
          :proposal="proposals[0]!"
          :label-for="labelFor"
          :proposer="users[11]"
        />
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">ReviewQueue</h2>
        <EditReviewQueue
          v-model:status="reviewStatus"
          :items="proposals.filter((p) => p.status === reviewStatus)"
          :users="users"
          :label-for="labelFor"
        />
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">RevisionTimeline</h2>
        <p v-if="diffRequest" class="text-default-500 text-sm">
          请求对比：{{ diffRequest }}
        </p>
        <EditRevisionTimeline
          :items="revisions"
          :users="users"
          :label-for="labelFor"
          :legacy-action-labels="{ import: '导入' }"
          @diff="onDiff"
        />
      </section>
    </div>
  </div>
</template>

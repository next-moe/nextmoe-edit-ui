<script setup lang="ts">
definePageMeta({ layout: 'docs' })

useSeoMeta({
  title: '审核与历史演示 — @nextmoe/edit-ui',
  description:
    'EditReviewQueue、EditProposalCard 与 EditRevisionTimeline 的在线演示——一套编辑工作流的读侧视图。'
})
</script>

<template>
  <SitePageHeader
    eyebrow="在线演示"
    title="审核与历史"
    lede="提案队列与修订时间线——一套编辑工作流的读侧。它们只负责展示与抛事件，取数与落库都由站点完成。"
  />

  <SiteSection
    id="views"
    title="两个视图"
    description="左边按状态看待审提案，右边按序号看历史修订。"
  >
    <DemoReview />
  </SiteSection>
</template>

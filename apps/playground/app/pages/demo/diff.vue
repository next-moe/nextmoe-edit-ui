<script setup lang="ts">
definePageMeta({ layout: 'docs' })

useSeoMeta({
  title: '字段差异演示 — @nextmoe/edit-ui',
  description:
    'EditFieldDiff 按 diff_hint 分派四种前后对比：按词的文本差异、多行文本、列表成员，以及只画变化部分的图片差异。'
})
</script>

<template>
  <SitePageHeader
    eyebrow="在线演示"
    title="字段差异"
    lede="FieldDiff 按字段的 diff_hint，把一份前后值分派给对应的对比视图。"
  />

  <SiteSection
    id="hints"
    title="四种 diff_hint"
    description="服务端在 schema 里给出 diff_hint，前端据此决定这个字段怎么对比。"
  >
    <DemoDiff />
  </SiteSection>

  <SiteSection
    id="cjk"
    title="中文是按词切分的"
    description="这决定了差异读起来是否像人写的。"
  >
    <p class="text-default-500 text-sm leading-relaxed">文本差异走 <code>Intl.Segmenter('zh')</code>，中文按词而不是按字切分：把「我喜欢这个游戏」改成「我喜爱这个游戏」，标出来的是 <code>喜欢 → 喜爱</code>，而不是散落的单字。超过 180 字的未改动段落会被折叠，只保留改动两侧的上下文，可以手动展开。</p>
  </SiteSection>
</template>

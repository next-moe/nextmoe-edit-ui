<script setup lang="ts">
definePageMeta({ layout: 'docs' })

useSeoMeta({
  title: '真实 schema 演示 — @nextmoe/edit-ui',
  description:
    '用 @nextmoe/edit-ui-catalog 的预设渲染 catalog.work 的真实 schema：对象行编辑、行内实体选择、图片属性、抑制开关与字段级错误。'
})

const shapeNote =
  'catalog.work.links 的元素是纯 URL 字符串，catalog.work.titles 的元素是 ' +
  '{lang, title, latin, kind} 对象，两者的 schema 一模一样。没有预设时，标题字段会被当成纯文本' +
  '列表渲染成 [object Object]，用户一动就把整个字段写坏——所以组件现在会按运行时的值降级为只读，' +
  '而预设直接给出正确的行编辑器。'

const intNote =
  '公开 API 的 content_rating 是 all_ages / sensitive / r18，编辑引擎要的是 0 / 1 / 2；' +
  'gender 是 1 / 2 / 3，没有 0。照着公开词表拼出来的选项，每一次提交都是 422。' +
  '预设里的值全部取自引擎自己的字段规格。'
</script>

<template>
  <SitePageHeader
    eyebrow="在线演示"
    title="真实 schema"
    lede="上面那个演示是为了展示控件而编的 schema。这一个不是：字段、kind、diff_hint 与上限全部照抄编辑引擎注册的 catalog.work，config 一行没写，来自 catalogConfig()。"
  />

  <SiteSection
    id="work"
    title="catalog.work"
    description="十八个字段，含四个只有对象行才能表达的列表、两个图片列表，以及一个被抑制的标题行。打开上面的开关可以看服务端拒绝时错误落到哪个字段上。"
  >
    <DemoCatalog />
  </SiteSection>

  <SiteSection
    id="why"
    title="为什么需要预设"
    description="schema 接口只回答 key / kind / diff_hint / 上限，从不回答元素形状、枚举词表和可空性。"
  >
    <KunInfo
      color="warning"
      variant="flat"
      icon="lucide:triangle-alert"
      title="list + items 同时覆盖两种完全不同的东西"
      :description="shapeNote"
    />
    <KunInfo
      color="danger"
      variant="flat"
      icon="lucide:triangle-alert"
      title="读接口给字符串，写接口要整数"
      :description="intNote"
    />
  </SiteSection>
</template>

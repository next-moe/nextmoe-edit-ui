<script setup lang="ts">
definePageMeta({ layout: 'docs' })

useSeoMeta({
  title: '组件一览 — @nextmoe/edit-ui',
  description:
    '@nextmoe/edit-ui-vue 导出的 14 个组件各自负责什么，以及未知控件降级、内置文案语言两条需要知道的约定。'
})

const componentList = [
  ['SchemaForm', '整个表单：分组渲染成区块（堆叠或标签页），抛出 update:patch。'],
  ['SchemaField', '单个字段；根据 schema 与 config 选出控件。'],
  ['ObjectListField', '若干列类型固定的可增删行。'],
  ['ImageField', '单图或多图上传，支持拖拽排序与置顶标记。'],
  ['EntityPicker', '搜索并选取实体引用。'],
  ['EntityKindPicker', '带「关系类型」的实体引用。'],
  ['SourceContext', '字段下方那条「这些内容来自上游」的只读说明。'],
  ['FieldDiff', '单个字段的前后对比，按 diff_hint 分派。'],
  ['TextDiff', '按词粒度的文本差异，长段未改动内容自动折叠。'],
  ['ImageDiff', '只画变化的图片，绝不铺开整个图库。'],
  ['ProposalCard', '一条编辑提案。'],
  ['ReviewQueue', '按状态分页的提案列表，提供 item 插槽。'],
  ['RevisionTimeline', '修订列表，两两选择，抛出 diff(fromSeq, toSeq)。'],
  ['Time', '上面两个视图用到的极简相对 / 绝对时间戳。']
]
</script>

<template>
  <SitePageHeader
    eyebrow="参考"
    title="组件一览"
    lede="@nextmoe/edit-ui-vue 共导出 14 个组件。在 Nuxt 模块下，每一个都会带上你配置的前缀。"
  />

  <SiteSection
    id="list"
    title="导出清单"
    description="表单一族、差异一族、审阅一族。大多数站点只会直接用到 SchemaForm、FieldDiff 与 ReviewQueue，其余是它们内部的组成部分，但都可以单独使用。"
  >
    <SiteTable :rows="componentList" />
  </SiteSection>

  <SiteSection
    id="contracts"
    title="两条需要知道的约定"
    description="一条关于前向兼容，一条关于文案语言。"
  >
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <KunInfo
        color="success"
        variant="flat"
        icon="lucide:shield-check"
        title="未知控件降级，绝不抛错"
        description="你的编辑引擎可能会开始下发已安装版本还不认识的 control（或 schema kind）。SchemaField 会把这样的字段渲染成只读的文本 / JSON 展示，而不是抛错，也不会退化成一个文本输入框去诱导用户做一次根本存不回去的编辑。isEditControl() 是那个判断，并有测试把这个行为钉住。"
      />
      <KunInfo
        color="warning"
        variant="flat"
        icon="lucide:languages"
        title="内置文案目前是简体中文"
        description="少量文案写在组件内部——被修改字段上的「已修改」「撤销」、ReviewQueue 的状态标签页、相对时间等。目前还没有 locale 选项。除此之外的一切（字段标签、分组名、选项文案）都来自你传入的 config，本来就用你自己的语言。"
      />
    </div>
  </SiteSection>
</template>

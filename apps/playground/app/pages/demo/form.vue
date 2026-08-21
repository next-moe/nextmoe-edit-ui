<script setup lang="ts">
definePageMeta({ layout: 'docs' })

useSeoMeta({
  title: '编辑表单演示 — @nextmoe/edit-ui',
  description:
    'EditSchemaForm 的在线演示：包含全部控件的完整配置、两种布局、只读审阅模式，以及三个字段的最小接入。'
})
</script>

<template>
  <SitePageHeader
    eyebrow="在线演示"
    title="编辑表单"
    lede="下面的一切都是活的。schema、值与注入的函数（上传 / 搜索 / 解析）全部是本地 fixture，这个页面从不请求网络。"
  />

  <SiteSection
    id="full"
    title="完整配置"
    description="包里全部控件，按分组排布，两种布局都可切换。最后一个字段带的是包不认识的 control——它降级成了只读展示，而不是抛错。"
  >
    <DemoFull />
  </SiteSection>

  <SiteSection
    id="minimal"
    title="最小配置"
    description="同一个组件，三个字段，不分组。这就是最小可用的接入形态。"
  >
    <DemoMinimal />
  </SiteSection>

  <KunInfo
    color="info"
    variant="flat"
    icon="lucide:info"
    title="所有字段标签都来自站点，不来自包"
    description="你在上面看到的每一个标签、分组名与选项文案，都出自这个站点自己的 config。包内部只有极少量固定文案（「已修改」「撤销」等），目前是简体中文。"
  />
</template>

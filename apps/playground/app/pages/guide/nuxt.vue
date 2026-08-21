<script setup lang="ts">
definePageMeta({ layout: 'docs' })

useSeoMeta({
  title: '在 Nuxt 中使用 — @nextmoe/edit-ui',
  description:
    '用 @nextmoe/edit-ui-nuxt 模块把全部组件注册成自动导入，并通过 prefix 选项决定模板里的标签名。'
})

const config = `// nuxt.config.ts
export default defineNuxtConfig({
  // KunUI 的 Nuxt 层：自动导入全部 Kun* 组件，并把
  // NuxtLink / @nuxt/icon / @nuxt/image 注入 KunUI 的配置。
  extends: ['@kungal/ui-nuxt'],

  modules: ['@nextmoe/edit-ui-nuxt'],

  css: ['~/assets/css/main.css'],

  editUi: {
    prefix: 'Edit', // 默认值。<SchemaForm> 注册为 <EditSchemaForm>
    global: false   // 默认值：按需（懒）注册
  }
})`

const usage = `<template>
  <EditSchemaForm
    :fields="fields"
    :values="values"
    :config="config"
    :group-order="['基础', '媒体']"
    layout="tabs"
    @update:patch="(patch) => (draft = patch)"
  />

  <EditFieldDiff label="标题" diff-hint="inline" :from="a" :to="b" />
  <EditReviewQueue v-model:status="status" :items="open" :label-for="labelFor" />
</template>`
</script>

<template>
  <SitePageHeader
    eyebrow="开始"
    title="在 Nuxt 中使用"
    lede="模块把 14 个组件全部注册成自动导入，模板里一个 import 都不用写。"
  />

  <SiteSection
    id="config"
    title="配置"
    description="模块的配置键是 editUi。KunUI 的 Nuxt 层必须一并 extends，组件用到的 Kun* 与图标都由它提供。"
  >
    <SiteCodeBlock :code="config" label="nuxt.config.ts" />
  </SiteSection>

  <SiteSection
    id="usage"
    title="用起来"
    description="所有组件都带上配置的前缀，无需 import。"
  >
    <SiteCodeBlock :code="usage" label="pages/edit.vue" />
  </SiteSection>

  <SiteSection
    id="prefix"
    title="prefix 才是这个模块存在的理由"
    description="它让一次迁移可以不改任何模板。"
  >
    <p class="text-default-500 text-sm leading-relaxed">如果你的站点原本在本地维护了一份同族组件，把 <code>prefix</code> 设成你原来的前缀（例如 <code>prefix: 'Editkit'</code>），现有的 <code>&lt;EditkitSchemaForm&gt;</code> 标签一个字都不用动。组件名来自 <code>@nextmoe/edit-ui-vue</code> 导出的 <code>EDIT_UI_COMPONENT_NAMES</code>，所以模块永远不会和包本身的组件清单对不上。</p>
    <KunInfo
      color="info"
      variant="flat"
      icon="lucide:info"
      title="global 选项"
      description="默认 false，即 Nuxt 的懒注册：组件只在真正用到的那个 chunk 里出现。设为 true 会把它们放进全局 bundle，只有在需要动态标签名（<component :is>）时才有必要。"
    />
  </SiteSection>
</template>

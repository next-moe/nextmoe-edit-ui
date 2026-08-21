<script setup lang="ts">
definePageMeta({ layout: 'docs' })

useSeoMeta({
  title: '在 Vue 中使用 — @nextmoe/edit-ui',
  description:
    '在任意 Vue 3 + Vite 项目里直接引入 @nextmoe/edit-ui-vue 的组件，以及必须配置 iconComponent 的原因。'
})

const main = `// main.ts
import { createApp } from 'vue'
import { installKunUIConfig } from '@kungal/ui-vue'
import { Icon } from '@iconify/vue'
import { RouterLink } from 'vue-router'
import App from './App.vue'
import './style.css'

const app = createApp(App)

installKunUIConfig(app, {
  iconComponent: Icon,      // 见下方提示：不配它，部分图标会直接消失
  linkComponent: RouterLink // 可选：让 KunUI 的链接走 SPA 路由
})

app.mount('#app')`

const usage = `<script setup lang="ts">
import { SchemaForm, FieldDiff } from '@nextmoe/edit-ui-vue'
import type { EditFieldConfigMap, EditSchemaField } from '@nextmoe/edit-ui-vue'

const fields = ref<EditSchemaField[]>([])
const config: EditFieldConfigMap = { title: { label: '标题', control: 'input' } }
<\/script>

<template>
  <SchemaForm :fields="fields" :values="values" :config="config" />
<\/template>`
</script>

<template>
  <SitePageHeader
    eyebrow="开始"
    title="在 Vue 中使用"
    lede="组件以裸名字导出，Edit 前缀只由 Nuxt 模块添加。任何 Vue 3 项目都能直接引。"
  />

  <SiteSection
    id="setup"
    title="初始化 KunUI"
    description="没有 Nuxt 层代劳，KunUI 的图标与链接组件需要你自己注入。"
  >
    <SiteCodeBlock :code="main" label="main.ts" />
  </SiteSection>

  <SiteSection
    id="import"
    title="按名字引入"
    description="类型和组件从同一个入口导出，core 里的纯函数也由 Vue 包转出一份，通常不必单独 import core。"
  >
    <SiteCodeBlock :code="usage" label="Editor.vue" />
  </SiteSection>

  <SiteSection
    id="icons"
    title="图标"
    description="这是纯 Vue 项目最容易踩的一个坑。"
  >
    <KunInfo
      color="warning"
      variant="flat"
      icon="lucide:triangle-alert"
      title="KunIcon 只内联 KunUI 自带的图标集"
      description="KunIcon 把 KunUI 内置图标集里的图标渲染成内联 SVG，从不发起任何请求。不在这个集合里的名字——比如字段撤销按钮用的 lucide:undo-2——如果没有通过 installKunUIConfig 注入 iconComponent，就会渲染成空白。Nuxt 层用 @nuxt/icon 替你做了这件事，纯 Vue 项目必须自己做。"
    />
  </SiteSection>
</template>

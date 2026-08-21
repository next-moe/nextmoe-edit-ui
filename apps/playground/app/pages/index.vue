<script setup lang="ts">
import { KUN_UI_URL, npmUrl, PACKAGES, REPO_URL } from '~/site'

const version = useRuntimeConfig().public.version

useSeoMeta({
  title: '@nextmoe/edit-ui — Vue 与 Nuxt 的 schema 驱动编辑组件',
  description:
    '服务端下发字段 schema，前端渲染出整套编辑表单，以及配套的差异对比、提案审核与修订历史视图。组合 KunUI，自身不含任何 CSS。'
})

const install = 'pnpm add @nextmoe/edit-ui-nuxt @nextmoe/edit-ui-vue @nextmoe/edit-ui-core'

const FEATURES = [
  {
    icon: 'lucide:layout-list',
    title: '一份 schema，一整个表单',
    body: '服务端说哪些字段可编辑，前端就渲染哪些。控件由 kind 与 diff_hint 推导，也可以在 config 里逐字段指定。'
  },
  {
    icon: 'lucide:git-compare-arrows',
    title: '只吐出 patch',
    body: '表单内部维护一份工作副本，update:patch 只给出与服务端值真正不同的字段——深比较，锁定与无权限字段永远不会出现。'
  },
  {
    icon: 'lucide:plug',
    title: '后端知识全部外置',
    body: '上传图片、搜索实体、把 id 解析回名称，都是你通过 EditFieldConfig 注入的函数。包里没有任何默认请求或内置 endpoint。'
  },
  {
    icon: 'lucide:shield-check',
    title: '未知控件降级而非崩溃',
    body: '编辑引擎可以先于前端发布新控件。遇到不认识的 control，字段退化为只读展示，既不抛错也不会伪装成可编辑的输入框。'
  },
  {
    icon: 'lucide:palette',
    title: '零 CSS，跟随 KunUI 主题',
    body: '全部使用 KunUI 语义色板 token，明暗自动切换，没有 dark: 前缀，也没有任何渐变背景。'
  },
  {
    icon: 'lucide:languages',
    title: '对中文友好的 diff',
    body: '文本差异基于 Intl.Segmenter 按词切分中文而非逐字，长段未改动内容自动折叠，图片差异只画变化的那几张。'
  }
]
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
    <section class="space-y-6">
      <div class="flex flex-wrap items-center gap-2">
        <KunChip size="sm" variant="flat" color="success">
          v{{ version }} · 已发布至 npm
        </KunChip>
        <KunChip size="sm" variant="flat" color="default">AGPL-3.0-only</KunChip>
      </div>

      <div class="space-y-4">
        <h1 class="text-3xl leading-tight font-bold sm:text-5xl">
          Schema 驱动的编辑组件
        </h1>
        <p class="text-default-500 max-w-2xl leading-relaxed sm:text-lg">服务端下发一份字段 schema，前端据此渲染出整套编辑表单、逐字段控件，以及审阅改动所需的差异对比、提案队列与修订历史视图。组合 <KunLink :href="KUN_UI_URL" target="_blank" color="primary" underline="hover">KunUI</KunLink>，自身不含任何 CSS。</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <KunButton href="/guide/install" color="primary" variant="solid">
          快速开始
          <KunIcon name="lucide:arrow-right" />
        </KunButton>
        <KunButton href="/demo/form" variant="flat" color="default">
          在线演示
        </KunButton>
        <KunButton
          :href="REPO_URL"
          target="_blank"
          variant="light"
          color="default"
        >
          <KunIcon name="lucide:github" />
          GitHub
        </KunButton>
      </div>

      <SiteCodeBlock :code="install" label="安装" />
    </section>

    <section class="space-y-6">
      <h2 class="text-xl font-semibold">它替你解决什么</h2>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <KunCard
          v-for="feature in FEATURES"
          :key="feature.title"
          :is-transparent="false"
          :is-hoverable="true"
          padding="md"
          content-class="space-y-2"
        >
          <div class="flex items-center gap-2">
            <KunIcon :name="feature.icon" class="text-primary h-4 w-4" />
            <h3 class="text-default-900 text-sm font-semibold">
              {{ feature.title }}
            </h3>
          </div>
          <p class="text-default-500 text-xs leading-relaxed">
            {{ feature.body }}
          </p>
        </KunCard>
      </div>
    </section>

    <section class="space-y-6">
      <div class="space-y-1.5">
        <h2 class="text-xl font-semibold">三个包</h2>
        <p class="text-default-500 text-sm">
          三包版本锁步发布。只用 Vue 的项目装前两个即可，Nuxt 项目再加上模块包。
        </p>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KunCard
          v-for="pkg in PACKAGES"
          :key="pkg.name"
          :is-transparent="false"
          :is-hoverable="true"
          padding="md"
          content-class="space-y-2"
        >
          <KunLink
            :href="npmUrl(pkg.name)"
            target="_blank"
            color="primary"
            underline="hover"
            size="sm"
          >
            <span class="font-mono text-xs break-all">{{ pkg.name }}</span>
          </KunLink>
          <p class="text-default-500 text-xs leading-relaxed">
            {{ pkg.summary }}
          </p>
        </KunCard>
      </div>
    </section>

    <KunCard :is-transparent="false" content-class="space-y-3">
      <h2 class="text-lg font-semibold">两条接入路径</h2>
      <p class="text-default-500 text-sm leading-relaxed">Nuxt 项目用模块自动导入全部组件，模板里一个 import 都不用写；任何 Vue 3 项目也可以直接按名字引入。两条路都需要一行很容易被漏掉的 Tailwind <code>@source</code> 配置——漏了不会报错，只会没有样式。</p>
      <div class="flex flex-wrap gap-2">
        <KunButton href="/guide/install" color="primary" variant="flat">
          阅读接入指南
          <KunIcon name="lucide:arrow-right" />
        </KunButton>
        <KunButton href="/guide/styling" variant="light" color="default">
          直接看 Tailwind 那一步
        </KunButton>
      </div>
    </KunCard>
  </div>
</template>

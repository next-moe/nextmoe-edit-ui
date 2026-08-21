<script setup lang="ts">
definePageMeta({ layout: 'docs' })

useSeoMeta({
  title: '安装 — @nextmoe/edit-ui',
  description:
    '@nextmoe/edit-ui 的三个包、各自的 peer 依赖，以及 Nuxt 项目与 Vue + Vite 项目分别需要装什么。'
})

const nuxtInstall = `pnpm add @nextmoe/edit-ui-nuxt @nextmoe/edit-ui-vue @nextmoe/edit-ui-core
pnpm add @kungal/ui-nuxt @kungal/ui-tokens @kungal/ui-vue
pnpm add -D tailwindcss @tailwindcss/vite @iconify-json/lucide`

const vueInstall = `pnpm add @nextmoe/edit-ui-vue @nextmoe/edit-ui-core
pnpm add @kungal/ui-vue @kungal/ui-tokens
pnpm add @iconify/vue          # 原因见「在 Vue 中使用」的图标一节
pnpm add -D tailwindcss @tailwindcss/vite`

const peers = [
  [
    '@nextmoe/edit-ui-core',
    '无',
    '自带 diff ^9。依赖闭包里没有任何 Vue，Node 脚本、SSR 或测试里都能直接引。'
  ],
  [
    '@nextmoe/edit-ui-vue',
    'vue ^3.5.0 · @kungal/ui-vue ^2',
    '另外以普通依赖引入 @vueuse/core、@vueuse/integrations 与 sortablejs。'
  ],
  [
    '@nextmoe/edit-ui-nuxt',
    'vue ^3.5.0 · nuxt ^4.0.0 · @kungal/ui-vue ^2',
    '交给 Nuxt 的 jiti 直接加载原始 TS，没有构建产物。'
  ]
]
</script>

<template>
  <SitePageHeader
    eyebrow="开始"
    title="安装"
    lede="三个包都以 AGPL-3.0-only 公开发布，版本锁步。模块包依赖 Vue 包，Vue 包依赖 core——三个都显式安装，能让版本在你的 manifest 里保持可见。"
  />

  <SiteSection
    id="commands"
    title="安装命令"
    description="按你的项目类型选一边。Nuxt 项目多出来的那几个包，是 KunUI 的 Nuxt 层与它需要的图标集。"
  >
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <SiteCodeBlock :code="nuxtInstall" label="Nuxt 项目" />
      <SiteCodeBlock :code="vueInstall" label="Vue + Vite 项目" />
    </div>
  </SiteSection>

  <SiteSection
    id="peers"
    title="peer 依赖"
    description="KunUI 与 Vue 都是 peer 依赖，由你的项目提供，包本身不会再装一份——否则 KunUI 会出现两个 provide/inject 身份。"
  >
    <SiteTable
      :head="['包', 'peer 依赖', '说明']"
      :rows="peers"
      :mono="[0, 1]"
    />
  </SiteSection>

  <SiteSection
    id="next"
    title="下一步"
    description="装完之后还差两件事：把组件接进项目，以及让 Tailwind 扫到它们的类名。"
  >
    <KunInfo
      color="danger"
      variant="flat"
      icon="lucide:triangle-alert"
      title="别跳过 Tailwind 那一步"
      description="这些包不含任何 CSS。少了一行 @source 配置，组件会以完全没有样式的形态渲染出来——没有报错，没有警告，只有一个塌掉的表单。"
    />
    <div class="flex flex-wrap gap-2">
      <KunButton href="/guide/nuxt" color="primary" variant="flat" size="sm">
        在 Nuxt 中使用
      </KunButton>
      <KunButton href="/guide/vue" variant="flat" color="default" size="sm">
        在 Vue 中使用
      </KunButton>
      <KunButton
        href="/guide/styling"
        variant="flat"
        color="danger"
        size="sm"
      >
        样式与 Tailwind
      </KunButton>
    </div>
  </SiteSection>
</template>

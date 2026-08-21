<script setup lang="ts">
definePageMeta({ layout: 'docs' })

useSeoMeta({
  title: '样式与 Tailwind — @nextmoe/edit-ui',
  description:
    '这些包不含任何 CSS。Tailwind v4 的 @source 一行决定了组件有没有样式——这一节讲清楚它该写在哪、写成什么。'
})

const nuxtCss = `/* app/assets/css/main.css —— 路径相对于「这个文件」 */
@import 'tailwindcss';
@import '@kungal/ui-tokens';
@import '@kungal/ui-vue/style.css';

@source '../../../node_modules/@kungal/ui-vue';
@source '../../../node_modules/@nextmoe/edit-ui-vue/dist';`

const viteCss = `/* src/style.css —— 比 node_modules 深一层 */
@import 'tailwindcss';
@import '@kungal/ui-tokens';
@import '@kungal/ui-vue/style.css';

@source '../node_modules/@kungal/ui-vue';
@source '../node_modules/@nextmoe/edit-ui-vue/dist';`

const NOTES = [
  {
    title: '指向 /dist，不要指向包根目录',
    body: 'dist 是这个包唯一发布的目录；把扫描范围收窄，产出的 CSS 也只包含真正用到的类。'
  },
  {
    title: '路径相对于 CSS 文件本身',
    body: '不是相对于项目根目录。入口在 app/assets/css/main.css 的 Nuxt 项目需要三个 ../ 才能回到 node_modules，入口在 src/style.css 的 Vite 项目只需要一个。'
  },
  {
    title: '两个目录通常都被 git 忽略，Tailwind 照样会扫',
    body: '显式写出的 @source 不受自动内容探测规则的约束。如果类名还是缺，先检查路径本身写对没有。'
  },
  {
    title: 'KunUI 也要同样处理',
    body: '上面第二行 @source 同样不是可选项；而 @kungal/ui-tokens 才是这些类名背后色板的定义处。'
  },
  {
    title: '深色模式是 <html> 上的 .kun-dark-mode 类',
    body: 'KunUI 自己的开关。组件内部从不写 dark: 前缀，只用会自动翻转的语义 token。'
  }
]
</script>

<template>
  <SitePageHeader
    eyebrow="开始"
    title="样式与 Tailwind"
    lede="整个接入流程里唯一会让人白白搭上一个下午的步骤。"
  />

  <SiteSection
    id="why"
    title="为什么必须手动加一行"
    description="包不含 CSS，是刻意的设计：颜色由宿主站点的 KunUI 主题决定。代价是 Tailwind 得知道去哪里找类名。"
  >
    <KunInfo
      color="danger"
      variant="flat"
      icon="lucide:triangle-alert"
      title="漏掉它，界面会静默地垮掉，不报任何错"
      description="这些包不含任何 CSS，其中每一个类都是 KunUI 的工具类；而 Tailwind v4 只会为它扫描到的文件生成工具类，node_modules 默认不在扫描范围内。没有下面这行 @source，组件用到的类根本不会被生成：没有构建错误，没有控制台警告，只有一个间距塌陷、没有边框、没有颜色的表单。"
    />
  </SiteSection>

  <SiteSection
    id="source"
    title="把这行加进你的 CSS 入口"
    description="按项目类型选一边，注意两者的 ../ 数量不同。"
  >
    <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <SiteCodeBlock :code="nuxtCss" label="Nuxt" />
      <SiteCodeBlock :code="viteCss" label="Vue + Vite" />
    </div>
  </SiteSection>

  <SiteSection
    id="notes"
    title="五个容易写错的细节"
    description="按被问到的频率排序。"
  >
    <ul class="space-y-3">
      <li
        v-for="note in NOTES"
        :key="note.title"
        class="border-default-200 rounded-lg border px-4 py-3"
      >
        <p class="text-default-700 text-sm font-medium">{{ note.title }}</p>
        <p class="text-default-500 mt-1 text-sm leading-relaxed">
          {{ note.body }}
        </p>
      </li>
    </ul>
  </SiteSection>
</template>

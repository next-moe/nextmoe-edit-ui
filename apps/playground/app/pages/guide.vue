<script setup lang="ts">
useSeoMeta({
  title: 'Integration guide — @nextmoe/edit-ui',
  description:
    'How to install @nextmoe/edit-ui in a Vue + Vite or a Nuxt app: packages, peer dependencies, the Tailwind v4 @source line, and the schema/config contract.'
})

const toc = [
  { id: 'install', label: 'Install' },
  { id: 'nuxt', label: 'Path B — Nuxt' },
  { id: 'vue', label: 'Path A — Vue + Vite' },
  { id: 'tailwind', label: 'Tailwind @source' },
  { id: 'api', label: 'Schema and config' },
  { id: 'components', label: 'What is in the box' }
]
</script>

<template>
  <div class="space-y-10">
    <header class="space-y-3">
      <h1 class="text-2xl font-bold sm:text-3xl">Integration guide</h1>
      <p class="text-default-500 max-w-2xl text-sm">
        Everything a consuming site needs, in the order it needs it. The one
        step that silently breaks the UI is the Tailwind
        <code>@source</code> line — it has its own section below.
      </p>
      <nav class="flex flex-wrap gap-1.5">
        <KunButton
          v-for="item in toc"
          :key="item.id"
          :href="`#${item.id}`"
          size="sm"
          variant="flat"
          color="default"
        >
          {{ item.label }}
        </KunButton>
      </nav>
    </header>

    <GuideInstall />
    <GuidePathNuxt />
    <GuidePathVue />
    <GuideStyling />
    <GuideApi />
    <GuideComponents />

    <KunCard :is-transparent="false" content-class="space-y-2">
      <h2 class="text-lg font-semibold">Still stuck?</h2>
      <p class="text-default-500 text-sm">
        The repository's playground app is this very site — it consumes the
        packages the way your app will, so its source is a working reference.
      </p>
      <div class="flex flex-wrap gap-2">
        <KunButton
          href="https://github.com/next-moe/nextmoe-edit-ui/tree/main/apps/playground"
          target="_blank"
          variant="flat"
          color="primary"
          size="sm"
        >
          <KunIcon name="lucide:github" />
          Read this site's source
        </KunButton>
        <KunButton
          href="https://github.com/next-moe/nextmoe-edit-ui/issues"
          target="_blank"
          variant="flat"
          color="default"
          size="sm"
        >
          Open an issue
        </KunButton>
      </div>
    </KunCard>
  </div>
</template>

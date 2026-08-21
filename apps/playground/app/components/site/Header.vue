<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { REPO_URL } from '~/site'

const version = useRuntimeConfig().public.version
const route = useRoute()

const NAV = [
  { to: '/guide/install', label: '指南', section: '/guide' },
  { to: '/demo/form', label: '演示', section: '/demo' }
]

const isActive = (section: string) => route.path.startsWith(section)

const drawer = ref(false)
watch(() => route.fullPath, () => (drawer.value = false))

const dark = ref(false)
onMounted(() => {
  dark.value = document.documentElement.classList.contains('kun-dark-mode')
})

const toggleTheme = () => {
  dark.value = !dark.value
  document.documentElement.classList.toggle('kun-dark-mode', dark.value)
  localStorage.setItem('edit-ui-theme', dark.value ? 'dark' : 'light')
}
</script>

<template>
  <header
    class="border-default-200 bg-background/85 z-kun-sticky sticky top-0 border-b backdrop-blur"
  >
    <div class="mx-auto flex h-14 max-w-[88rem] items-center gap-2 px-4 sm:px-6">
      <KunButton
        class-name="lg:hidden"
        :is-icon-only="true"
        variant="light"
        color="default"
        size="sm"
        aria-label="打开文档导航"
        @click="drawer = true"
      >
        <KunIcon name="lucide:menu" />
      </KunButton>

      <NuxtLink to="/" class="flex items-baseline gap-1 font-semibold">
        <span class="text-default-500 hidden text-sm sm:inline">@nextmoe/</span>
        <span class="text-primary">edit-ui</span>
      </NuxtLink>
      <KunChip
        size="sm"
        variant="flat"
        color="default"
        class-name="hidden sm:inline-flex"
      >
        v{{ version }}
      </KunChip>

      <nav aria-label="主导航" class="ml-auto flex items-center gap-1">
        <KunButton
          v-for="item in NAV"
          :key="item.to"
          :href="item.to"
          variant="light"
          size="sm"
          :color="isActive(item.section) ? 'primary' : 'default'"
        >
          {{ item.label }}
        </KunButton>
        <KunButton
          :href="REPO_URL"
          target="_blank"
          variant="light"
          color="default"
          size="sm"
          :is-icon-only="true"
          aria-label="GitHub 仓库"
        >
          <KunIcon name="lucide:github" />
        </KunButton>
        <KunButton
          variant="light"
          color="default"
          size="sm"
          :is-icon-only="true"
          aria-label="切换深色模式"
          @click="toggleTheme"
        >
          <KunIcon :name="dark ? 'lucide:moon' : 'lucide:sun'" />
        </KunButton>
      </nav>
    </div>

    <KunDrawer v-model="drawer" placement="left" size="sm" title="文档导航">
      <SiteSidebarNav />
    </KunDrawer>
  </header>
</template>

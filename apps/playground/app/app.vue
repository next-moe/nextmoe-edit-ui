<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { REPO_URL } from '~/site'

const version = useRuntimeConfig().public.version

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
  <div class="bg-background text-foreground min-h-dvh">
    <NuxtLoadingIndicator color="var(--color-primary)" />

    <header
      class="border-default-200 bg-background z-kun-sticky sticky top-0 border-b"
    >
      <div class="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5">
        <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
          <span class="text-default-500 hidden sm:inline">@nextmoe/</span>
          <span class="text-primary">edit-ui</span>
        </NuxtLink>
        <KunChip size="sm" variant="flat" color="default">
          v{{ version }}
        </KunChip>

        <nav class="ml-auto flex items-center gap-0.5 sm:gap-1">
          <KunButton href="/" variant="light" color="default" size="sm">
            Demo
          </KunButton>
          <KunButton href="/guide" variant="light" color="default" size="sm">
            Guide
          </KunButton>
          <KunButton
            :href="REPO_URL"
            target="_blank"
            variant="light"
            color="default"
            size="sm"
            is-icon-only
            aria-label="GitHub repository"
          >
            <KunIcon name="lucide:github" />
          </KunButton>
          <KunButton
            variant="light"
            color="default"
            size="sm"
            is-icon-only
            aria-label="Toggle dark mode"
            @click="toggleTheme"
          >
            <KunIcon :name="dark ? 'lucide:moon' : 'lucide:sun'" />
          </KunButton>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <NuxtPage />
    </main>

    <footer class="border-default-200 mt-8 border-t">
      <div
        class="text-default-400 mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-6 text-xs"
      >
        <span>AGPL-3.0-only</span>
        <span>Part of the NextMoe ecosystem</span>
        <KunLink
          :href="REPO_URL"
          target="_blank"
          color="default"
          size="sm"
          underline="hover"
        >
          GitHub
        </KunLink>
        <KunLink
          href="https://github.com/kungal/kun-ui"
          target="_blank"
          color="default"
          size="sm"
          underline="hover"
        >
          KunUI
        </KunLink>
      </div>
    </footer>

    <KunMessageProvider />
  </div>
</template>

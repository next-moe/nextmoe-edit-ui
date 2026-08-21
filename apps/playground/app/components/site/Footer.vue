<script setup lang="ts">
import { ISSUES_URL, KUN_UI_URL, REPO_URL } from '~/site'

const links = [
  { href: REPO_URL, label: 'GitHub' },
  { href: ISSUES_URL, label: '反馈问题' },
  { href: KUN_UI_URL, label: 'KunUI' }
]
</script>

<template>
  <footer class="border-default-200 mt-12 border-t">
    <div
      class="text-default-400 mx-auto flex max-w-[88rem] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-6 text-xs sm:px-6"
    >
      <span>AGPL-3.0-only</span>
      <span>NextMoe 生态的一部分</span>
      <KunLink
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        target="_blank"
        color="default"
        size="sm"
        underline="hover"
      >
        {{ link.label }}
      </KunLink>
    </div>
  </footer>
</template>

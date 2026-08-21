<script setup lang="ts">
import { DOCS_NAV } from '~/site'

const route = useRoute()
</script>

<template>
  <nav aria-label="文档导航" class="space-y-6">
    <div v-for="group in DOCS_NAV" :key="group.title" class="space-y-1.5">
      <p class="text-default-900 pl-3 text-xs font-semibold">
        {{ group.title }}
      </p>
      <ul class="border-default-200 border-l">
        <li v-for="item in group.items" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="-ml-px block border-l py-1.5 pl-3 text-sm transition"
            :class="
              route.path === item.to
                ? 'border-primary text-primary font-medium'
                : 'text-default-500 hover:text-default-900 border-transparent'
            "
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

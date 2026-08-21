<script setup lang="ts">
const { headings, active } = useToc()
</script>

<template>
  <nav v-if="headings.length" aria-label="本页目录" class="space-y-2">
    <p class="text-default-900 text-xs font-semibold">本页目录</p>
    <ul class="space-y-1.5">
      <li v-for="heading in headings" :key="heading.id">
        <a
          :href="`#${heading.id}`"
          class="block text-xs leading-relaxed transition"
          :class="[
            heading.level === 3 ? 'pl-3' : '',
            active === heading.id
              ? 'text-primary font-medium'
              : 'text-default-500 hover:text-default-900'
          ]"
        >
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

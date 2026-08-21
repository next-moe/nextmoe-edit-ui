<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; lede?: string }>()
</script>

<template>
  <header class="space-y-2">
    <p v-if="eyebrow" class="text-primary text-xs font-medium">
      {{ eyebrow }}
    </p>
    <h1 class="text-2xl font-bold sm:text-3xl">{{ title }}</h1>
    <p v-if="lede" class="text-default-500 max-w-2xl leading-relaxed">
      {{ lede }}
    </p>
    <slot />
  </header>
</template>

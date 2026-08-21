<script setup lang="ts">
defineProps<{ title: string; description?: string; id?: string }>()
</script>

<template>
  <section :id="id" class="space-y-4 scroll-mt-20">
    <div class="space-y-1">
      <h2 class="text-xl font-semibold">{{ title }}</h2>
      <p v-if="description" class="text-default-500 text-sm">
        {{ description }}
      </p>
    </div>
    <slot />
  </section>
</template>

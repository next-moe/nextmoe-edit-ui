<script setup lang="ts">
defineProps<{ id: string; title: string; description?: string }>()
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-1.5">
      <h2
        :id="id"
        :data-toc-text="title"
        class="group scroll-mt-20 text-xl font-semibold"
      >
        {{ title }}
        <a
          :href="`#${id}`"
          class="text-default-300 hover:text-primary ml-1 opacity-0 transition group-hover:opacity-100"
          aria-hidden="true"
          tabindex="-1"
          >#</a
        >
      </h2>
      <p v-if="description" class="text-default-500 text-sm leading-relaxed">
        {{ description }}
      </p>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ code: string; label?: string }>(), { label: 'ts' })
</script>

<template>
  <div class="border-default-200 bg-content1 overflow-hidden rounded-lg border">
    <div
      class="border-default-200 bg-content2 flex items-center gap-2 border-b px-3 py-1"
    >
      <span class="text-default-500 font-mono text-xs">{{ label }}</span>
      <KunCopy
        :text="code"
        name="复制"
        copied-text="已复制"
        size="sm"
        variant="light"
        color="default"
        class-name="ml-auto"
      />
    </div>
    <pre
      class="text-default-700 overflow-x-auto px-3 py-2.5 font-mono text-xs leading-relaxed"
    ><code>{{ code }}</code></pre>
  </div>
</template>

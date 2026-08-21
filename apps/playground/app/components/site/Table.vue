<script setup lang="ts">
const props = withDefaults(
  defineProps<{ head?: string[]; rows: string[][]; mono?: number[] }>(),
  { mono: () => [0] }
)

const cellClass = (column: number) => {
  if (!props.mono.includes(column)) {
    return 'text-default-500'
  }
  return column === 0
    ? 'text-default-700 font-mono whitespace-nowrap'
    : 'text-default-600 font-mono'
}
</script>

<template>
  <div class="border-default-200 overflow-x-auto rounded-lg border">
    <table class="w-full text-left text-xs">
      <thead v-if="head" class="bg-content2 text-default-600">
        <tr>
          <th
            v-for="column in head"
            :key="column"
            class="px-3 py-2 font-medium whitespace-nowrap"
          >
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="index"
          :class="index || head ? 'border-default-200 border-t' : ''"
        >
          <td
            v-for="(cell, column) in row"
            :key="column"
            class="px-3 py-2 align-top"
            :class="cellClass(column)"
          >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

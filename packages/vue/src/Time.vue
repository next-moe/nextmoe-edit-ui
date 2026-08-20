<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    time: number | string | Date | null | undefined
    type?: 'relative' | 'date' | 'datetime' | 'auto'
    showYear?: boolean
  }>(),
  { type: 'relative', showYear: false }
)

const pad = (n: number) => String(n).padStart(2, '0')

const relative = (value: number | string | Date): string => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 10) {
    return '数秒前'
  }
  if (seconds < 60) {
    return `${seconds} 秒前`
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} 分钟前`
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)} 小时前`
  }
  if (seconds < 2592000) {
    return `${Math.floor(seconds / 86400)} 天前`
  }
  if (seconds < 31536000) {
    return `${Math.floor(seconds / 2592000)} 个月前`
  }
  return `${Math.floor(seconds / 31536000)} 年前`
}

const absolute = (value: number | string | Date): string => {
  const d = new Date(value)
  const day = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const date = props.showYear ? `${d.getFullYear()}-${day}` : day
  return props.type === 'datetime' || props.type === 'auto'
    ? `${date} - ${pad(d.getHours())}:${pad(d.getMinutes())}`
    : date
}

const isWithinDay = (value: number | string | Date): boolean =>
  Date.now() - new Date(value).getTime() < 86_400_000

const parsed = computed(() => {
  if (props.time === null || props.time === undefined || props.time === '') {
    return null
  }
  const d = new Date(props.time)
  return Number.isNaN(d.getTime()) ? null : d
})

const render = (): string => {
  const value = parsed.value
  if (!value) {
    return ''
  }
  return props.type === 'relative' ||
    (props.type === 'auto' && isWithinDay(value))
    ? relative(value)
    : absolute(value)
}

const text = ref(render())

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  text.value = render()
  if (props.type === 'relative' || props.type === 'auto') {
    timer = setInterval(() => {
      text.value = render()
    }, 60_000)
  }
})
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})

const machineDateTime = computed(() => parsed.value?.toISOString())
</script>

<template>
  <time class="text-default-500" :datetime="machineDateTime" data-allow-mismatch
    >{{ text }}</time
  >
</template>

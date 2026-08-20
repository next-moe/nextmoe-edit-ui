<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { KunButton, KunChip, KunIcon } from '@kungal/ui-vue'
import { editValueEqual } from '@nextmoe/edit-ui-core'
import type { EditFieldConfig } from './types'

const props = defineProps<{
  modelValue: unknown
  config?: EditFieldConfig
  multiple?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const resolveImageURL = (v: unknown) =>
  props.config?.resolveImage ? props.config.resolveImage(v) : ''

const singleURL = computed(() =>
  props.multiple ? '' : resolveImageURL(props.modelValue)
)

const items = computed<unknown[]>(() =>
  Array.isArray(props.modelValue) ? (props.modelValue as unknown[]) : []
)

const emitItems = (next: unknown[]) => {
  const normalize = props.config?.normalizeItems
  emit('update:modelValue', normalize ? normalize(next) : next)
}

const isUploading = ref(false)
const uploadProgress = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const pickFiles = () => fileInput.value?.click()

const onFilesPicked = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? []).filter((f) =>
    f.type.startsWith('image/')
  )
  input.value = ''
  const upload = props.config?.uploadImage
  if (!upload || files.length === 0 || isUploading.value) {
    return
  }
  isUploading.value = true
  try {
    if (!props.multiple) {
      const file = files[0]
      if (!file) {
        return
      }
      uploadProgress.value = '上传中'
      const value = await upload(file, [])
      if (value !== null && value !== undefined) {
        emit('update:modelValue', value)
      }
      return
    }
    let next = [...items.value]
    for (const [i, file] of files.entries()) {
      uploadProgress.value =
        files.length > 1 ? `上传中 ${i + 1}/${files.length}` : '上传中'
      const item = await upload(file, next)
      if (item !== null && item !== undefined) {
        next = [...next, item]
      }
    }
    emitItems(next)
  } finally {
    isUploading.value = false
    uploadProgress.value = ''
  }
}

const clearImage = () => emit('update:modelValue', '')

const removeItem = (index: number) => {
  emitItems(items.value.filter((_, i) => i !== index))
}

const gridRef = ref<HTMLElement | null>(null)
const sortItems = ref<unknown[]>([...items.value])
watch(items, (next) => {
  if (!editValueEqual(next, sortItems.value)) {
    sortItems.value = [...next]
  }
})
watch(sortItems, (next) => {
  if (!editValueEqual(next, items.value)) {
    emitItems([...next])
  }
})
useSortable(gridRef, sortItems, {
  animation: 150,
  handle: '.ek-drag-handle',
  draggable: '.ek-image-item'
})

const pinItemKey = computed(() => props.config?.pinItemFlag?.key)

const isPinnedItem = (item: unknown) => {
  const key = pinItemKey.value
  return !!key && !!(item as Record<string, unknown> | null)?.[key]
}

const pinItem = (index: number) => {
  const key = pinItemKey.value
  if (!key) {
    return
  }
  emitItems(
    items.value.map((item, i) => {
      const { [key]: _dropped, ...rest } = item as Record<string, unknown>
      return i === index ? { ...rest, [key]: true } : rest
    })
  )
}
</script>

<template>
  <div class="space-y-2">
    <template v-if="multiple">
      <div
        ref="gridRef"
        class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
      >
        <div
          v-for="(item, index) in sortItems"
          :key="resolveImageURL(item) || index"
          class="ek-image-item border-default-200 group relative overflow-hidden rounded border"
          :class="{ 'ring-primary border-primary ring-2': isPinnedItem(item) }"
        >
          <img
            :src="resolveImageURL(item)"
            loading="lazy"
            class="bg-default-100 aspect-video w-full object-contain"
          />
          <div
            class="ek-drag-handle absolute top-1 left-1 flex cursor-move items-center rounded bg-black/50 p-1 text-white"
            title="拖动排序"
          >
            <KunIcon name="lucide:grip-vertical" class="h-4 w-4" />
          </div>
          <KunChip
            v-if="config?.pinItemFlag && isPinnedItem(item)"
            color="primary"
            variant="solid"
            size="sm"
            class="pointer-events-none absolute bottom-1 left-1"
          >
            {{ config.pinItemFlag.label }}
          </KunChip>
          <div class="absolute top-1 right-1 flex gap-1">
            <KunButton
              v-if="config?.pinItemFlag && !isPinnedItem(item)"
              :is-icon-only="true"
              size="sm"
              variant="solid"
              color="default"
              :title="`设为${config.pinItemFlag.label}`"
              @click="pinItem(index)"
            >
              <KunIcon name="lucide:pin" />
            </KunButton>
            <KunButton
              :is-icon-only="true"
              size="sm"
              variant="solid"
              color="danger"
              title="移除"
              @click="removeItem(index)"
            >
              <KunIcon name="lucide:trash-2" />
            </KunButton>
          </div>
        </div>
      </div>
      <button
        type="button"
        class="border-default-200 text-default-400 hover:border-primary hover:text-primary flex w-full cursor-pointer items-center justify-center gap-1 rounded border border-dashed py-3 text-sm"
        :disabled="isUploading"
        @click="pickFiles"
      >
        <KunIcon :name="isUploading ? 'lucide:loader' : 'lucide:plus'" />
        {{ isUploading ? uploadProgress : '添加图片' }}
      </button>
      <p
        v-if="sortItems.length > 1"
        class="text-default-400 flex items-center gap-1 text-xs"
      >
        <KunIcon name="lucide:grip-vertical" class="h-3 w-3 shrink-0" />
        拖动图片左上角的按钮可调整顺序
      </p>
    </template>

    <template v-else>
      <img
        v-if="singleURL"
        :src="singleURL"
        loading="lazy"
        class="max-h-32 max-w-full rounded object-cover"
      />
      <div class="flex items-center gap-2">
        <KunButton
          variant="flat"
          color="default"
          size="sm"
          :disabled="isUploading"
          @click="pickFiles"
        >
          <KunIcon name="lucide:upload" />
          {{
            isUploading ? uploadProgress : singleURL ? '更换图片' : '上传图片'
          }}
        </KunButton>
        <KunButton
          v-if="singleURL"
          variant="light"
          color="danger"
          size="sm"
          :disabled="isUploading"
          @click="clearImage"
        >
          移除
        </KunButton>
      </div>
    </template>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      :multiple="multiple"
      class="hidden"
      @change="onFilesPicked"
    />
  </div>
</template>

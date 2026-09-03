import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { EditControl } from './types'

export const useFieldBuffer = (
  control: Ref<EditControl>,
  value: () => unknown,
  emit: (value: unknown) => void,
  nullable: () => boolean | undefined
) => {
  const textBuffer = ref('')
  const boolBuffer = ref(false)
  const stringList = ref<string[]>([])

  const sync = () => {
    const v = value()
    switch (control.value) {
      case 'switch':
        boolBuffer.value = v === true
        break
      case 'string-list':
      case 'number-list':
        stringList.value = Array.isArray(v) ? v.map((x) => String(x)) : []
        break
      default:
        textBuffer.value = v === null || v === undefined ? '' : String(v)
    }
  }
  watch(value, sync, { immediate: true })
  watch(control, sync)

  const emitText = (raw: string | number) => {
    const text = String(raw)
    textBuffer.value = text
    switch (control.value) {
      case 'number': {
        const trimmed = text.trim()
        if (trimmed === '') {
          emit(nullable() ? null : 0)
          return
        }
        const n = Number(trimmed)
        emit(Number.isFinite(n) ? n : trimmed)
        return
      }
      case 'date':
        emit(text === '' ? null : text)
        return
      default:
        emit(text)
    }
  }

  const emitDate = (picked: string | null | [string | null, string | null]) => {
    const single = Array.isArray(picked) ? (picked[0] ?? null) : picked
    emit(single || null)
  }

  const emitSelect = (picked: string | number | (string | number)[] | null) => {
    emit(Array.isArray(picked) ? (picked[0] ?? null) : picked)
  }

  const emitSwitch = (picked: boolean) => {
    boolBuffer.value = picked
    emit(picked)
  }

  const emitStringList = (items: string[]) => {
    stringList.value = items
    if (control.value === 'number-list') {
      emit(
        items.map((x) => Number(x.trim())).filter((n) => Number.isInteger(n) && n > 0)
      )
      return
    }
    emit(items.map((x) => x.trim()).filter((x) => x.length > 0))
  }

  return {
    textBuffer,
    boolBuffer,
    stringList,
    emitText,
    emitDate,
    emitSelect,
    emitSwitch,
    emitStringList
  }
}

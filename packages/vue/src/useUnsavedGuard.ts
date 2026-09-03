import { onBeforeUnmount, onMounted, watch } from 'vue'
import type { Ref } from 'vue'

// Only a real event listener stops the tab from closing; returning true from a
// router guard cannot. Registered in onMounted so SSR never touches window, and
// removed on unmount so a form left behind does not keep blocking navigation.
export const useUnsavedGuard = (
  active: Ref<boolean>,
  message = '有未提交的修改，确定要离开吗？'
) => {
  const onBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault()
    event.returnValue = message
    return message
  }

  let attached = false

  const sync = (shouldGuard: boolean) => {
    if (typeof window === 'undefined' || shouldGuard === attached) {
      return
    }
    if (shouldGuard) {
      window.addEventListener('beforeunload', onBeforeUnload)
    } else {
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
    attached = shouldGuard
  }

  onMounted(() => sync(active.value))
  watch(active, sync)
  onBeforeUnmount(() => sync(false))
}

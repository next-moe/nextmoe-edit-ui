import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface TocHeading {
  id: string
  text: string
  level: number
}

const READING_LINE = 96

// The table of contents is read out of the rendered DOM rather than declared
// per page: a hand-kept list drifted from the headings the moment a section was
// renamed. `data-toc-text` is what SiteSection stamps, so the anchor glyph
// inside the heading never leaks into the label.
export const useToc = (selector = '[data-docs-content]') => {
  const headings = ref<TocHeading[]>([])
  const active = ref('')
  const route = useRoute()

  let nodes: HTMLElement[] = []

  const syncActive = () => {
    if (!nodes.length) {
      active.value = ''
      return
    }
    const atBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 4
    if (atBottom) {
      active.value = nodes[nodes.length - 1]!.id
      return
    }
    let current = nodes[0]!.id
    for (const node of nodes) {
      if (node.getBoundingClientRect().top <= READING_LINE) {
        current = node.id
      }
    }
    active.value = current
  }

  const collect = () => {
    const root = document.querySelector(selector)
    nodes = root
      ? [...root.querySelectorAll<HTMLElement>('h2[id], h3[id]')]
      : []
    headings.value = nodes.map((node) => ({
      id: node.id,
      text: node.dataset.tocText ?? node.textContent?.trim() ?? '',
      level: node.tagName === 'H3' ? 3 : 2
    }))
    syncActive()
  }

  onMounted(() => {
    collect()
    window.addEventListener('scroll', syncActive, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', syncActive)
  })

  watch(
    () => route.fullPath,
    () => nextTick(collect)
  )

  return { headings, active }
}

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FieldDiff from './FieldDiff.vue'

const imageConfig = {
  label: '画廊',
  resolveImage: (v: unknown) =>
    `https://img.test/${(v as { image_hash: string }).image_hash}.webp`,
  formatItem: (v: unknown) => (v as { image_hash: string }).image_hash
}

const shot = (hash: string) => ({ image_hash: hash, sort_order: 0 })

describe('FieldDiff — image hint', () => {
  it('draws only the changed pictures, never the whole gallery', async () => {
    const kept = ['a', 'b', 'c', 'd'].map(shot)
    const w = mount(FieldDiff, {
      props: {
        label: '画廊',
        diffHint: 'image',
        from: kept,
        to: [...kept, shot('new')],
        config: imageConfig
      }
    })

    const html = w.html()
    expect(html).toContain('https://img.test/new.webp')
    for (const hash of ['a', 'b', 'c', 'd']) {
      expect(html).not.toContain(`https://img.test/${hash}.webp`)
    }
    expect(w.text()).toContain('4 张未改动')
    expect(w.text()).toContain('+1')
  })

  it('marks removed and added pictures in one strip', async () => {
    const w = mount(FieldDiff, {
      props: {
        label: '画廊',
        diffHint: 'image',
        from: [shot('old')],
        to: [shot('new')],
        config: imageConfig
      }
    })
    const html = w.html()
    expect(html).toContain('https://img.test/old.webp')
    expect(html).toContain('https://img.test/new.webp')
    expect(w.text()).not.toContain('修改前')
    expect(w.text()).not.toContain('修改后')
  })

  it('a pure reorder draws nothing and says so', async () => {
    const a = shot('a')
    const b = shot('b')
    const w = mount(FieldDiff, {
      props: {
        label: '画廊',
        diffHint: 'image',
        from: [a, b],
        to: [b, a],
        config: imageConfig
      }
    })
    expect(w.html()).not.toContain('https://img.test/')
    expect(w.text()).toContain('仅顺序调整')
  })

  it('scalar imagehash renders both sides of the replace', async () => {
    const w = mount(FieldDiff, {
      props: {
        label: '横幅图',
        diffHint: 'image',
        from: 'oldhash',
        to: 'newhash',
        config: {
          label: '横幅图',
          resolveImage: (v: unknown) => `https://img.test/${String(v)}.webp`
        }
      }
    })
    const html = w.html()
    expect(html).toContain('https://img.test/oldhash.webp')
    expect(html).toContain('https://img.test/newhash.webp')
  })

  it('falls back to the item identity, not the field, when unresolvable', async () => {
    const w = mount(FieldDiff, {
      props: {
        label: '画廊',
        diffHint: 'image',
        from: [shot('a'), shot('b')],
        to: [shot('a'), shot('b'), shot('c')],
        config: { label: '画廊', formatItem: imageConfig.formatItem }
      }
    })
    const text = w.text()
    expect(text).toContain('+ c')
    expect(text).not.toContain('a')
    expect(text).not.toContain('b')
  })
})

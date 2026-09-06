import { describe, it, expect } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import SchemaForm from './SchemaForm.vue'
import type { EditSchemaField } from './types'

const field = (key: string): EditSchemaField => ({
  key,
  kind: 'text',
  diff_hint: 'inline',
  locked: false,
  can_propose: true,
  can_review: false,
  would_automerge: false
})

const fields = [field('a'), field('b')]
const config = {
  a: { label: '字段A', group: '第一组' },
  b: { label: '字段B', group: '第二组' }
}
const props = {
  fields,
  values: { a: 'x', b: 'y' },
  config,
  groupOrder: ['第一组', '第二组']
}

describe('SchemaForm', () => {
  it('tabs layout renders a tab per group + the first group label', async () => {
    const w = mount(SchemaForm, {
      props: { ...props, layout: 'tabs' }
    })
    const html = w.html()
    expect(html).toContain('第一组')
    expect(html).toContain('第二组')
    expect(html).toContain('字段A')
  })

  // JS media query / ssrWidth both guess a viewport at SSR, so the single
  // KunTab's orientation hydrates against a different DOM. Two copies, CSS
  // toggled, must both be in the HTML regardless of matchMedia.
  it('tabs layout always renders both orientations', () => {
    const w = mount(SchemaForm, {
      props: { ...props, layout: 'tabs' }
    })
    const lists = w.findAll('[role="tablist"]')
    const orientations = lists.map((list) =>
      list.attributes('aria-orientation')
    )
    expect(orientations).toContain('horizontal')
    expect(orientations).toContain('vertical')
    const html = w.html()
    expect(html).toContain('schema-form-groups-h-tab-')
    expect(html).toContain('schema-form-groups-v-tab-')
    expect(html).toContain('md:hidden')
    expect(html).toContain('md:block')
  })

  it('tabs layout SSRs both orientations without a viewport', async () => {
    const app = createSSRApp({
      render: () => h(SchemaForm, { ...props, layout: 'tabs' })
    })
    const html = await renderToString(app)
    expect(html).toContain('aria-orientation="horizontal"')
    expect(html).toContain('aria-orientation="vertical"')
    expect(html).toContain('md:hidden')
    expect(html).toContain('md:block')
  })

  it('stack layout (default) renders every section heading', async () => {
    const w = mount(SchemaForm, { props })
    const html = w.html()
    expect(html).toContain('第一组')
    expect(html).toContain('第二组')
    expect(html).toContain('字段A')
    expect(html).toContain('字段B')
  })
})

const titles: EditSchemaField = {
  key: 'catalog.work.titles',
  kind: 'list',
  diff_hint: 'items',
  locked: false,
  can_propose: true,
  can_review: false,
  would_automerge: false
}

const titlesProps = {
  fields: [titles],
  values: { 'catalog.work.titles': [{ lang: 'ja', title: 'ひぐらし' }] },
  config: {
    'catalog.work.titles': {
      label: '标题',
      columns: [
        { key: 'lang', label: '语言', required: true },
        { key: 'title', label: '标题', required: true }
      ]
    }
  }
}

// Without this the host had no signal at all: the row message rendered, the
// submit button stayed live, and the user got the engine's English
// "element 0: title must not be empty" back instead.
describe('SchemaForm — submit gate', () => {
  it('goes invalid when a row loses a required column, and back', async () => {
    const w = mount(SchemaForm, { props: titlesProps })
    expect(w.vm.valid).toBe(true)

    const title = w.findAll('input').at(1)!
    await title.setValue('')
    expect(w.emitted('update:valid')?.at(-1)?.[0]).toBe(false)
    expect(w.vm.valid).toBe(false)
    expect(w.vm.invalidFields).toEqual({
      'catalog.work.titles': ['第 1 行 标题：必填']
    })

    await w.findAll('input').at(1)!.setValue('ひぐらし')
    expect(w.emitted('update:valid')?.at(-1)?.[0]).toBe(true)
    expect(w.vm.invalidFields).toEqual({})
  })

  // The header says 「标题 *」, so a message naming the wire key sends the user
  // looking for a column that is not on screen.
  it('names the row issue by column label, not by key', async () => {
    const w = mount(SchemaForm, { props: titlesProps })
    await w.findAll('input').at(1)!.setValue('')
    expect(w.text()).toContain('第 1 行 标题：必填')
    expect(w.text()).not.toContain('第 1 行 title')
  })
})

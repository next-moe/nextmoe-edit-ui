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

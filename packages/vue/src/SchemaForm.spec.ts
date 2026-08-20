import { describe, it, expect } from 'vitest'
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

  it('stack layout (default) renders every section heading', async () => {
    const w = mount(SchemaForm, { props })
    const html = w.html()
    expect(html).toContain('第一组')
    expect(html).toContain('第二组')
    expect(html).toContain('字段A')
    expect(html).toContain('字段B')
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SchemaForm from './SchemaForm.vue'
import type { EditFieldConfigMap, EditSchemaField } from './types'

const field = (key: string): EditSchemaField => ({
  key,
  kind: 'list',
  diff_hint: 'items',
  locked: false,
  can_propose: true,
  can_review: false,
  would_automerge: false
})

const fields = [field('titles'), field('titles.suppressed')]

const config: EditFieldConfigMap = {
  titles: {
    label: '标题',
    columns: [
      { key: 'lang', label: '语言' },
      { key: 'title', label: '标题' }
    ],
    identityKey: (item) => {
      const row = item as Record<string, unknown>
      return row.lang && row.title ? `title:0:${row.lang}:${row.title}` : null
    }
  }
}

const values = {
  titles: [
    { lang: 'ja', title: 'ひぐらし' },
    { lang: 'en', title: 'Higurashi' }
  ],
  'titles.suppressed': ['title:0:en:Higurashi']
}

describe('suppression pairing', () => {
  it('hides the companion field once an identityKey is configured', () => {
    const w = mount(SchemaForm, { props: { fields, values, config } })
    expect(w.text()).not.toContain('titles.suppressed')
  })

  it('toggles a row into the companion set, sorted', async () => {
    const w = mount(SchemaForm, { props: { fields, values, config } })

    const hide = w
      .findAll('button')
      .filter((b) => b.attributes('aria-label') === '在本站隐藏这一条')
    expect(hide).toHaveLength(1)

    await hide[0]!.trigger('click')
    const patch = w.emitted('update:patch')?.at(-1)?.[0] as Record<
      string,
      unknown
    >
    expect(patch['titles.suppressed']).toEqual([
      'title:0:en:Higurashi',
      'title:0:ja:ひぐらし'
    ])
  })

  it('restores a suppressed row instead of only ever hiding', async () => {
    const w = mount(SchemaForm, { props: { fields, values, config } })

    const show = w
      .findAll('button')
      .filter((b) => b.attributes('aria-label') === '恢复显示')
    expect(show).toHaveLength(1)

    await show[0]!.trigger('click')
    const patch = w.emitted('update:patch')?.at(-1)?.[0] as Record<
      string,
      unknown
    >
    expect(patch['titles.suppressed']).toEqual([])
  })
})

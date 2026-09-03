import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ObjectListField from './ObjectListField.vue'
import SchemaField from './SchemaField.vue'
import type { EditFieldConfig, EditSchemaField } from './types'

const listField = (extra: Partial<EditSchemaField> = {}): EditSchemaField => ({
  key: 'catalog.work.titles',
  kind: 'list',
  diff_hint: 'items',
  locked: false,
  can_propose: true,
  can_review: false,
  would_automerge: false,
  ...extra
})

const rosterConfig: EditFieldConfig = {
  label: '登场角色',
  columns: [
    { key: 'character_id', label: '角色', type: 'integer', required: true },
    { key: 'spoiler', label: '剧透', type: 'integer' }
  ]
}

// A scalar list editor fed object rows used to stringify them to
// "[object Object]" and then emit that string array back as the field's value.
describe('SchemaField — object rows in a scalar list', () => {
  it('degrades to read-only instead of destroying the rows', () => {
    const w = mount(SchemaField, {
      props: {
        field: listField(),
        config: { label: '标题', control: 'string-list' },
        modelValue: [{ lang: 'ja', title: 'ひぐらし' }]
      }
    })

    expect(w.text()).toContain('结构不支持')
    expect(w.text()).not.toContain('[object Object]')
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })

  it('leaves a genuine string list editable', () => {
    const w = mount(SchemaField, {
      props: {
        field: listField({ key: 'catalog.work.links' }),
        config: { label: '链接', control: 'string-list' },
        modelValue: ['https://example.com']
      }
    })

    expect(w.text()).not.toContain('结构不支持')
    expect(w.find('input').exists()).toBe(true)
  })
})

describe('ObjectListField', () => {
  it('emits integers for integer columns', async () => {
    const w = mount(ObjectListField, {
      props: { modelValue: [{ character_id: 7 }], config: rosterConfig }
    })

    await w.find('input').setValue('128')
    const emitted = w.emitted('update:modelValue')
    expect(emitted?.at(-1)?.[0]).toEqual([{ character_id: 128 }])
  })

  it('drops keys the columns do not declare', async () => {
    const w = mount(ObjectListField, {
      props: {
        modelValue: [{ character_id: 7, legacy_note: 'stale' }],
        config: rosterConfig
      }
    })

    await w.find('input').setValue('8')
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([
      { character_id: 8 }
    ])
  })

  // A number input rejects non-numeric typing, so the way a bad integer reaches
  // the patch is a value that was already wrong when the server sent it.
  it('reports a non-numeric cell rather than sending it silently', async () => {
    const w = mount(ObjectListField, {
      props: {
        modelValue: [{ character_id: 'legacy-7', spoiler: 0 }],
        config: rosterConfig
      }
    })

    await w.findAll('input').at(1)!.setValue('1')
    expect(w.emitted('update:issues')?.at(-1)?.[0]).toEqual([
      { index: 0, key: 'character_id', reason: '必须是整数' }
    ])
  })

  it('stops adding rows at the element cap', async () => {
    const w = mount(ObjectListField, {
      props: { modelValue: [{ character_id: 1 }], config: rosterConfig, max: 1 }
    })

    expect(w.text()).toContain('1 / 1')
    const add = w.findAll('button').at(-1)
    expect(add?.attributes('disabled')).toBeDefined()
  })
})

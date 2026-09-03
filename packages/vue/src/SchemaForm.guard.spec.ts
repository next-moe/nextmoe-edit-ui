import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SchemaForm from './SchemaForm.vue'
import type { EditFieldConfigMap, EditSchemaField } from './types'

const fields: EditSchemaField[] = [
  {
    key: 'title',
    kind: 'text',
    diff_hint: 'inline',
    locked: false,
    can_propose: true,
    can_review: false,
    would_automerge: false
  }
]

const config: EditFieldConfigMap = { title: { label: '标题' } }

afterEach(() => vi.restoreAllMocks())

describe('SchemaForm — unsaved guard', () => {
  it('registers the listener only once the form is dirty, and drops it on unmount', async () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')

    const w = mount(SchemaForm, {
      props: { fields, values: { title: 'a' }, config },
      attachTo: document.body
    })
    expect(add.mock.calls.some(([e]) => e === 'beforeunload')).toBe(false)

    await w.find('input').setValue('b')
    expect(add.mock.calls.some(([e]) => e === 'beforeunload')).toBe(true)

    w.unmount()
    expect(remove.mock.calls.some(([e]) => e === 'beforeunload')).toBe(true)
  })

  it('stays out of the way when the site turns it off', async () => {
    const add = vi.spyOn(window, 'addEventListener')
    const w = mount(SchemaForm, {
      props: { fields, values: { title: 'a' }, config, warnOnLeave: false },
      attachTo: document.body
    })
    await w.find('input').setValue('b')
    expect(add.mock.calls.some(([e]) => e === 'beforeunload')).toBe(false)
  })

  it('reset() puts the working copy back to the server values', async () => {
    const w = mount(SchemaForm, {
      props: { fields, values: { title: 'a' }, config }
    })
    await w.find('input').setValue('b')
    expect(w.emitted('update:patch')?.at(-1)?.[0]).toEqual({ title: 'b' })

    ;(w.vm as unknown as { reset: () => void }).reset()
    await w.vm.$nextTick()
    expect(w.emitted('update:patch')?.at(-1)?.[0]).toEqual({})
  })

  it('shows a form-level rejection banner', () => {
    const w = mount(SchemaForm, {
      props: {
        fields,
        values: { title: 'a' },
        config,
        formErrors: ['not allowed to propose field "title"']
      }
    })
    expect(w.text()).toContain('提交被拒绝')
    expect(w.text()).toContain('not allowed to propose')
  })
})

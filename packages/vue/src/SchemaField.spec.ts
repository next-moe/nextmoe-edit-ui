import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SchemaField from './SchemaField.vue'
import type {
  EditControl,
  EditFieldConfig,
  EditSchemaField,
  EditVocabularyMap
} from './types'

const field = (key: string): EditSchemaField => ({
  key,
  kind: 'text',
  diff_hint: 'inline',
  locked: false,
  can_propose: true,
  can_review: false,
  would_automerge: false
})

// The engine is allowed to ship a control this package predates; a released
// site must degrade to a read-only view instead of breaking the whole form.
const futureConfig: EditFieldConfig = {
  label: '未来字段',
  control: 'holo-slider' as unknown as EditControl
}

describe('SchemaField — unknown control', () => {
  it('renders the value read-only instead of throwing', () => {
    const w = mount(SchemaField, {
      props: {
        field: field('future'),
        config: futureConfig,
        modelValue: { a: 1, b: 'two' }
      }
    })

    expect(w.text()).toContain('未来字段')
    expect(w.text()).toContain('{"a":1,"b":"two"}')
    expect(w.find('input').exists()).toBe(false)
    expect(w.find('textarea').exists()).toBe(false)
  })

  it('emits nothing for an unknown control', async () => {
    const w = mount(SchemaField, {
      props: {
        field: field('future'),
        config: futureConfig,
        modelValue: 'kept'
      }
    })
    await w.vm.$nextTick()
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })

  // Positive control: the same mount path must still produce a real editor for
  // a control the package does know, or the assertions above prove nothing.
  it('still renders the editor for a known control', () => {
    const w = mount(SchemaField, {
      props: {
        field: field('title'),
        config: { label: '标题', control: 'input' } as EditFieldConfig,
        modelValue: 'hello'
      }
    })

    expect(w.find('input').exists()).toBe(true)
    expect(w.find('input').element.value).toBe('hello')
  })
})

const VOCABULARIES: EditVocabularyMap = {
  gender: {
    name: 'gender',
    closed: true,
    values: [
      { value: 'male', display_name: 'Male' },
      { value: 'female', display_name: 'Female' },
      { value: 'other', display_name: 'Other' }
    ]
  }
}

describe('SchemaField — schema-declared vocabulary', () => {
  const enumField = (extra?: Partial<EditSchemaField>): EditSchemaField => ({
    ...field('catalog.character.gender'),
    kind: 'enum',
    ...extra
  })

  it('renders a select from the vocabulary when no config exists', () => {
    const w = mount(SchemaField, {
      props: {
        field: enumField({ vocabulary: 'gender', encoding: 'int', base: 1 }),
        vocabularies: VOCABULARIES,
        modelValue: 2
      }
    })
    expect(w.text()).not.toContain('本期只读')
    expect(w.text()).toContain('Female')
  })

  // The options come from the declaration, not from the value: an empty field
  // is the one that most needs the picker.
  it('renders the select on an empty value', () => {
    const w = mount(SchemaField, {
      props: {
        field: enumField({ vocabulary: 'gender', encoding: 'int', base: 1 }),
        vocabularies: VOCABULARIES,
        modelValue: null
      }
    })
    expect(w.text()).not.toContain('本期只读')
  })

  it('stays read-only when the vocabulary is not in the map', () => {
    const w = mount(SchemaField, {
      props: {
        field: enumField({ vocabulary: 'unheard_of', encoding: 'int' }),
        vocabularies: VOCABULARIES,
        modelValue: 2
      }
    })
    expect(w.text()).toContain('本期只读')
  })

  // A vocabulary with no encoding is a pre-2.8.0 server or the caps face alone;
  // guessing the wrong one submits a 422, so the field offers no editor.
  it('stays read-only when the encoding is not declared', () => {
    const w = mount(SchemaField, {
      props: {
        field: enumField({ vocabulary: 'gender', base: 1 }),
        vocabularies: VOCABULARIES,
        modelValue: 2
      }
    })
    expect(w.text()).toContain('本期只读')
  })
})

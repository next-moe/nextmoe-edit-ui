import { describe, it, expect } from 'vitest'
import {
  applyVocabularyOptions,
  fieldVocabularyCoding,
  fieldVocabularyOptions,
  mergeSchemaFaces,
  vocabularyOptions
} from './schema'
import type { EditVocabularyMap } from './schema'
import type { EditSchemaField } from './types'

const capsField = (extra?: Partial<EditSchemaField>): EditSchemaField => ({
  key: 'catalog.character.gender',
  kind: 'enum',
  diff_hint: 'inline',
  locked: false,
  can_propose: true,
  can_review: false,
  would_automerge: false,
  ...extra
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
  },
  olang: {
    name: 'olang',
    closed: false,
    values: [
      { value: 'en', display_name: 'English' },
      { value: 'ja', display_name: 'Japanese' }
    ]
  }
}

describe('mergeSchemaFaces', () => {
  it('attaches value shapes onto the caps face by key', () => {
    const merged = mergeSchemaFaces(
      [capsField()],
      [
        {
          key: 'catalog.character.gender',
          field_type: 'enum',
          vocabulary: 'gender',
          base: 1,
          nullable: true
        }
      ]
    )
    expect(merged[0]).toMatchObject({
      vocabulary: 'gender',
      base: 1,
      nullable: true,
      can_propose: true
    })
  })

  it('drops fields the caps face does not list', () => {
    const merged = mergeSchemaFaces(
      [capsField()],
      [
        { key: 'catalog.character.gender', field_type: 'enum' },
        { key: 'catalog.character.secret', field_type: 'text' }
      ]
    )
    expect(merged.map((f) => f.key)).toEqual(['catalog.character.gender'])
  })

  // The v2 face serialises "no vocabulary" as "", not as an absent key.
  it('never records an empty-string vocabulary', () => {
    const merged = mergeSchemaFaces(
      [capsField()],
      [{ key: 'catalog.character.gender', field_type: 'enum', vocabulary: '' }]
    )
    expect(merged[0]!.vocabulary).toBeUndefined()
  })
})

describe('fieldVocabularyCoding', () => {
  it('trusts a number value', () => {
    expect(fieldVocabularyCoding({ base: 0 }, 2)).toBe('integer')
  })

  it('trusts a string value, the empty string included', () => {
    expect(fieldVocabularyCoding({ base: 0 }, 'ja')).toBe('token')
    expect(fieldVocabularyCoding({ base: 0 }, '')).toBe('token')
  })

  it('takes a positive base as proof of integer coding when the value is null', () => {
    expect(fieldVocabularyCoding({ base: 1 }, null)).toBe('integer')
  })

  it('refuses to guess on a null value with base 0', () => {
    expect(fieldVocabularyCoding({ base: 0 }, null)).toBeNull()
    expect(fieldVocabularyCoding({}, undefined)).toBeNull()
  })
})

describe('fieldVocabularyOptions', () => {
  it('derives integer codes as base plus published-order index', () => {
    const options = fieldVocabularyOptions(
      { kind: 'enum', vocabulary: 'gender', base: 1 },
      VOCABULARIES,
      2
    )
    expect(options).toEqual([
      { value: 1, label: 'Male' },
      { value: 2, label: 'Female' },
      { value: 3, label: 'Other' }
    ])
  })

  it('derives token values for a string-coded field', () => {
    const options = fieldVocabularyOptions(
      { kind: 'enum', vocabulary: 'olang', base: 0 },
      VOCABULARIES,
      'ja'
    )
    expect(options).toEqual([
      { value: 'en', label: 'English' },
      { value: 'ja', label: 'Japanese' }
    ])
  })

  it('returns null when the vocabulary is unknown or the coding undecidable', () => {
    expect(
      fieldVocabularyOptions(
        { kind: 'enum', vocabulary: 'nope', base: 0 },
        VOCABULARIES,
        1
      )
    ).toBeNull()
    expect(
      fieldVocabularyOptions(
        { kind: 'enum', vocabulary: 'olang', base: 0 },
        VOCABULARIES,
        null
      )
    ).toBeNull()
    expect(
      fieldVocabularyOptions({ kind: 'text', vocabulary: 'olang' }, VOCABULARIES, 'ja')
    ).toBeNull()
  })

  it('prefers caller labels over published display names', () => {
    const options = vocabularyOptions(VOCABULARIES.gender!, {
      coding: 'integer',
      base: 1,
      labels: { male: '男性' }
    })
    expect(options[0]).toEqual({ value: 1, label: '男性' })
  })
})

describe('applyVocabularyOptions', () => {
  it('keeps a config that already has options', () => {
    const config = { label: '性别', options: [{ value: 1, label: '男性' }] }
    const applied = applyVocabularyOptions(
      capsField({ vocabulary: 'gender', base: 1 }),
      config,
      VOCABULARIES,
      1
    )
    expect(applied!.options).toBe(config.options)
  })

  it('fills options and nullable for a bare field', () => {
    const applied = applyVocabularyOptions(
      capsField({ vocabulary: 'gender', base: 1, nullable: true }),
      undefined,
      VOCABULARIES,
      null
    )
    expect(applied).toMatchObject({
      label: 'catalog.character.gender',
      nullable: true
    })
    expect(applied!.options).toHaveLength(3)
  })

  it('returns the original config untouched when nothing is derivable', () => {
    const config = { label: '性别' }
    expect(
      applyVocabularyOptions(capsField(), config, VOCABULARIES, null)
    ).toBe(config)
    expect(
      applyVocabularyOptions(capsField(), undefined, undefined, null)
    ).toBeUndefined()
  })

  it('lets an explicit config nullable win over the schema', () => {
    const config = { label: '性别', nullable: false }
    const applied = applyVocabularyOptions(
      capsField({ nullable: true }),
      config,
      VOCABULARIES,
      null
    )
    expect(applied!.nullable).toBe(false)
  })
})

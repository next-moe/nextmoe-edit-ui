import { describe, it, expect } from 'vitest'
import {
  applyVocabularyOptions,
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
          encoding: 'int',
          base: 1,
          nullable: true
        }
      ]
    )
    expect(merged[0]).toMatchObject({
      vocabulary: 'gender',
      encoding: 'int',
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

describe('fieldVocabularyOptions', () => {
  it('derives integer codes as base plus published-order index', () => {
    const options = fieldVocabularyOptions(
      { kind: 'enum', vocabulary: 'gender', encoding: 'int', base: 1 },
      VOCABULARIES
    )
    expect(options).toEqual([
      { value: 1, label: 'Male' },
      { value: 2, label: 'Female' },
      { value: 3, label: 'Other' }
    ])
  })

  it('derives token values under token encoding, base ignored', () => {
    const options = fieldVocabularyOptions(
      { kind: 'enum', vocabulary: 'olang', encoding: 'token', base: 1 },
      VOCABULARIES
    )
    expect(options).toEqual([
      { value: 'en', label: 'English' },
      { value: 'ja', label: 'Japanese' }
    ])
  })

  it('returns null when the vocabulary is unknown or the field is not an enum', () => {
    expect(
      fieldVocabularyOptions(
        { kind: 'enum', vocabulary: 'nope', encoding: 'int' },
        VOCABULARIES
      )
    ).toBeNull()
    expect(
      fieldVocabularyOptions(
        { kind: 'text', vocabulary: 'olang', encoding: 'token' },
        VOCABULARIES
      )
    ).toBeNull()
  })

  // The caps face carries no encoding at all, and a server below spec 2.8.0
  // publishes a vocabulary without one.
  it('returns null when the encoding is not declared', () => {
    expect(
      fieldVocabularyOptions(
        { kind: 'enum', vocabulary: 'gender', base: 1 },
        VOCABULARIES
      )
    ).toBeNull()
  })

  it('prefers caller labels over published display names', () => {
    const options = vocabularyOptions(VOCABULARIES.gender!, {
      encoding: 'int',
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
      capsField({ vocabulary: 'gender', encoding: 'int', base: 1 }),
      config,
      VOCABULARIES
    )
    expect(applied!.options).toBe(config.options)
  })

  it('fills options and nullable for a bare field', () => {
    const applied = applyVocabularyOptions(
      capsField({
        vocabulary: 'gender',
        encoding: 'int',
        base: 1,
        nullable: true
      }),
      undefined,
      VOCABULARIES
    )
    expect(applied).toMatchObject({
      label: 'catalog.character.gender',
      nullable: true
    })
    expect(applied!.options).toHaveLength(3)
  })

  it('returns the original config untouched when nothing is derivable', () => {
    const config = { label: '性别' }
    expect(applyVocabularyOptions(capsField(), config, VOCABULARIES)).toBe(
      config
    )
    expect(
      applyVocabularyOptions(capsField(), undefined, undefined)
    ).toBeUndefined()
  })

  it('lets an explicit config nullable win over the schema', () => {
    const config = { label: '性别', nullable: false }
    const applied = applyVocabularyOptions(
      capsField({ nullable: true }),
      config,
      VOCABULARIES
    )
    expect(applied!.nullable).toBe(false)
  })
})

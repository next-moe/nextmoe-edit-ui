import { describe, expect, it } from 'vitest'
import type { EditSelectOption } from '@nextmoe/edit-ui-core'

import inventory from '../schema/inventory.json'
import {
  ALIAS_KIND_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  CHARACTER_LANG_OPTIONS,
  CONTENT_RATING_OPTIONS,
  GENDER_OPTIONS,
  INTRO_LANG_OPTIONS,
  LABEL_KIND_OPTIONS,
  OLANG_OPTIONS,
  RELEASE_KIND_OPTIONS,
  RELEASE_LANG_OPTIONS,
  RELEASE_PLATFORM_OPTIONS,
  ROSTER_KIND_OPTIONS,
  SEXUAL_OPTIONS,
  SPOILER_OPTIONS,
  TITLE_KIND_OPTIONS,
  TITLE_LANG_OPTIONS,
  VIOLENCE_OPTIONS
} from './vocab'

type WireMember = {
  key: string
  type: string
  vocabulary?: string | null
  base?: number
}

type WireValue = {
  vocabulary?: string | null
  encoding?: string | null
  base?: number
  element?: { members?: WireMember[] } | null
}

type InventoryField = { key: string; wire_value?: WireValue }

const fields = (inventory.entity_types as { fields: InventoryField[] }[])
  .flatMap((entity) => entity.fields)

const vocabularies = inventory.vocabularies as Record<
  string,
  { tokens: string[]; closed: boolean }
>

const wireSpec = (
  fieldKey: string,
  memberKey?: string
): { vocabulary: string; base: number } => {
  const field = fields.find((f) => f.key === fieldKey)
  expect(field?.wire_value, fieldKey).toBeDefined()
  const carrier = memberKey
    ? field!.wire_value!.element?.members?.find((m) => m.key === memberKey)
    : field!.wire_value
  expect(carrier?.vocabulary, `${fieldKey}${memberKey ? '.' + memberKey : ''}`)
    .toBeTruthy()
  return { vocabulary: carrier!.vocabulary!, base: carrier!.base ?? 0 }
}

// A field declares its coding outright since spec 2.8.0, but
// editing.ElementMember carries no encoding, so a member's `type` is the only
// discriminant the census can offer — and nothing upstream gates it:
// TestVocabularyTokensPassValidators loops fields alone. This map is what goes
// red if a member ever takes a code its type does not predict, rather than the
// site posting a 422 per row.
const MEMBER_CODING: Record<string, string> = { int: 'int', enum: 'token' }

const codingsByVocabulary = (): Map<string, Set<string>> => {
  const codings = new Map<string, Set<string>>()
  const record = (vocabulary: string | null | undefined, coding?: string) => {
    if (!vocabulary || !coding) {
      return
    }
    const seen = codings.get(vocabulary) ?? new Set<string>()
    codings.set(vocabulary, seen.add(coding))
  }
  for (const field of fields) {
    record(field.wire_value?.vocabulary, field.wire_value?.encoding ?? undefined)
    for (const member of field.wire_value?.element?.members ?? []) {
      record(member.vocabulary, MEMBER_CODING[member.type])
    }
  }
  return codings
}

const CODINGS = codingsByVocabulary()

// On an integer-coded field the wire carries base + the token's index in the
// vocabulary's published order; the census records both halves.
const INTEGER_TABLES: {
  name: string
  table: EditSelectOption[]
  field: string
  member?: string
}[] = [
  { name: 'CONTENT_RATING_OPTIONS', table: CONTENT_RATING_OPTIONS, field: 'catalog.work.content_rating' },
  { name: 'GENDER_OPTIONS', table: GENDER_OPTIONS, field: 'catalog.character.gender' },
  { name: 'BLOOD_TYPE_OPTIONS', table: BLOOD_TYPE_OPTIONS, field: 'catalog.character.blood_type' },
  { name: 'RELEASE_KIND_OPTIONS', table: RELEASE_KIND_OPTIONS, field: 'catalog.release.kind' },
  { name: 'TITLE_KIND_OPTIONS', table: TITLE_KIND_OPTIONS, field: 'catalog.work.titles', member: 'kind' },
  { name: 'ALIAS_KIND_OPTIONS', table: ALIAS_KIND_OPTIONS, field: 'catalog.character.aliases', member: 'kind' },
  { name: 'ROSTER_KIND_OPTIONS', table: ROSTER_KIND_OPTIONS, field: 'catalog.work.roster', member: 'kind' },
  { name: 'SPOILER_OPTIONS', table: SPOILER_OPTIONS, field: 'catalog.work.roster', member: 'spoiler' },
  { name: 'LABEL_KIND_OPTIONS', table: LABEL_KIND_OPTIONS, field: 'catalog.work.labels', member: 'kind' },
  { name: 'SEXUAL_OPTIONS', table: SEXUAL_OPTIONS, field: 'catalog.work.covers', member: 'sexual' },
  { name: 'VIOLENCE_OPTIONS', table: VIOLENCE_OPTIONS, field: 'catalog.work.covers', member: 'violence' }
]

// Token-coded tables carry the tokens themselves; order must be the published
// order. `leading` is the out-of-vocabulary empty string two fields accept.
const TOKEN_TABLES: {
  name: string
  table: EditSelectOption[]
  vocabulary: string
  leading?: string[]
}[] = [
  { name: 'OLANG_OPTIONS', table: OLANG_OPTIONS, vocabulary: 'olang' },
  { name: 'CHARACTER_LANG_OPTIONS', table: CHARACTER_LANG_OPTIONS, vocabulary: 'olang', leading: [''] },
  { name: 'TITLE_LANG_OPTIONS', table: TITLE_LANG_OPTIONS, vocabulary: 'olang', leading: [''] },
  { name: 'RELEASE_LANG_OPTIONS', table: RELEASE_LANG_OPTIONS, vocabulary: 'release_lang' },
  { name: 'INTRO_LANG_OPTIONS', table: INTRO_LANG_OPTIONS, vocabulary: 'intro_lang' },
  { name: 'RELEASE_PLATFORM_OPTIONS', table: RELEASE_PLATFORM_OPTIONS, vocabulary: 'platform' }
]

describe('option tables against the census vocabularies', () => {
  it('codes every integer table as base + published-order index', () => {
    for (const { name, table, field, member } of INTEGER_TABLES) {
      const spec = wireSpec(field, member)
      const tokens = vocabularies[spec.vocabulary]?.tokens
      expect(tokens, `${name}: vocabulary ${spec.vocabulary}`).toBeDefined()
      expect(
        table.map((option) => option.value),
        name
      ).toEqual(tokens!.map((_, index) => spec.base + index))
    }
  })

  it('lists every token table in published order', () => {
    for (const { name, table, vocabulary, leading } of TOKEN_TABLES) {
      const tokens = vocabularies[vocabulary]?.tokens
      expect(tokens, `${name}: vocabulary ${vocabulary}`).toBeDefined()
      expect(
        table.map((option) => option.value),
        name
      ).toEqual([...(leading ?? []), ...tokens!])
    }
  })

  // Completeness assertion over the two hand-maintained lists above: a
  // vocabulary the census gains without a table here fails, instead of a new
  // field silently shipping without options.
  it('covers every vocabulary the census publishes', () => {
    const covered = new Set<string>()
    for (const { field, member } of INTEGER_TABLES) {
      covered.add(wireSpec(field, member).vocabulary)
    }
    for (const { vocabulary } of TOKEN_TABLES) {
      covered.add(vocabulary)
    }
    expect([...covered].sort()).toEqual(Object.keys(vocabularies).sort())
  })

  // The split between the two tables above was hand-made from reading the
  // engine; this is the census checking it back. A vocabulary whose carriers
  // disagree also fails here — the set would hold both codings.
  it('splits the two tables the way the census declares each vocabulary', () => {
    for (const { name, field, member } of INTEGER_TABLES) {
      const { vocabulary } = wireSpec(field, member)
      expect([...(CODINGS.get(vocabulary) ?? [])], name).toEqual(['int'])
    }
    for (const { name, vocabulary } of TOKEN_TABLES) {
      expect([...(CODINGS.get(vocabulary) ?? [])], name).toEqual(['token'])
    }
  })

  it('declares an encoding on exactly the fields that name a vocabulary', () => {
    for (const field of fields) {
      const wire = field.wire_value
      expect(
        wire?.encoding === null || wire?.encoding === undefined,
        field.key
      ).toBe(!wire?.vocabulary)
      if (wire?.encoding) {
        expect(['int', 'token'], field.key).toContain(wire.encoding)
      }
    }
  })

  it('labels every option in Chinese or as a proper name, never as a bare code', () => {
    for (const { name, table } of [...INTEGER_TABLES, ...TOKEN_TABLES]) {
      for (const option of table) {
        expect(option.label, `${name}: ${String(option.value)}`).toBeTruthy()
        expect(option.label, `${name}: ${String(option.value)}`).not.toBe(
          option.value
        )
      }
    }
  })
})

import type {
  EditFieldConfig,
  EditSchemaElement,
  EditSchemaField,
  EditSelectOption
} from './types'

// One field on GET /v2/catalog/schemas/{object} — the keyless value-shape face.
// It names the kind `field_type` and carries no actor caps (an infra test
// asserts the absence), so neither face alone can drive a form.
export interface EditSchemaValueField {
  key: string
  field_type: string
  diff_hint?: string
  deprecated?: boolean
  max_suppressed?: number
  max_elements?: number
  vocabulary?: string
  base?: number
  nullable?: boolean
  element?: EditSchemaElement | null
}

export interface EditVocabularyValue {
  value: string
  display_name?: string
  description?: string
}

export interface EditVocabulary {
  name: string
  closed: boolean
  values: EditVocabularyValue[]
}

export type EditVocabularyMap = Record<string, EditVocabulary>

// The caps face decides membership: a field only the value face lists is one
// this actor cannot see, and value shapes never override caps.
export const mergeSchemaFaces = (
  caps: EditSchemaField[],
  values: EditSchemaValueField[]
): EditSchemaField[] => {
  const shapes = new Map(values.map((shape) => [shape.key, shape]))
  return caps.map((field) => {
    const shape = shapes.get(field.key)
    if (!shape) {
      return field
    }
    const merged: EditSchemaField = { ...field }
    if (shape.vocabulary) {
      merged.vocabulary = shape.vocabulary
    }
    if (shape.base !== undefined) {
      merged.base = shape.base
    }
    if (shape.nullable !== undefined) {
      merged.nullable = shape.nullable
    }
    if (shape.element) {
      merged.element = shape.element
    }
    return merged
  })
}

export type EditVocabularyCoding = 'integer' | 'token'

// On an integer-coded field the wire carries base + the token's index in the
// vocabulary's published order; on a token-coded field it carries the token.
export const vocabularyOptions = (
  vocabulary: EditVocabulary,
  opts?: {
    coding?: EditVocabularyCoding
    base?: number
    labels?: Record<string, string>
  }
): EditSelectOption[] =>
  vocabulary.values.map((entry, index) => ({
    value: opts?.coding === 'integer' ? (opts.base ?? 0) + index : entry.value,
    label: opts?.labels?.[entry.value] ?? entry.display_name ?? entry.value
  }))

// The schema cannot say whether a scalar enum field is integer-coded (gender
// wants 2) or token-coded (olang wants "ja"): both declare kind "enum" plus a
// vocabulary, and infra's own contract test tells them apart only by probing
// the validator. The stored value is the reliable witness; with no value, a
// base above zero proves integer coding (base exists only to shift indices)
// and base 0 proves nothing.
export const fieldVocabularyCoding = (
  field: Pick<EditSchemaField, 'base'>,
  value: unknown
): EditVocabularyCoding | null => {
  if (typeof value === 'number') {
    return 'integer'
  }
  if (typeof value === 'string') {
    return 'token'
  }
  return (field.base ?? 0) > 0 ? 'integer' : null
}

export const fieldVocabularyOptions = (
  field: Pick<EditSchemaField, 'kind' | 'vocabulary' | 'base'>,
  vocabularies: EditVocabularyMap | undefined,
  value: unknown,
  labels?: Record<string, string>
): EditSelectOption[] | null => {
  if (field.kind !== 'enum' || !field.vocabulary) {
    return null
  }
  const vocabulary = vocabularies?.[field.vocabulary]
  if (!vocabulary) {
    return null
  }
  const coding = fieldVocabularyCoding(field, value)
  if (!coding) {
    return null
  }
  return vocabularyOptions(vocabulary, { coding, base: field.base, labels })
}

// The renderer-facing merge: a config that already carries options keeps them
// (a site's hand-written labels beat published display names), one without
// gains vocabulary-derived options when the coding is decidable, and the
// schema's nullable fills in when the config is silent. When nothing changes,
// the original config comes back untouched.
export const applyVocabularyOptions = <TComponent = unknown>(
  field: EditSchemaField,
  config: EditFieldConfig<TComponent> | undefined,
  vocabularies: EditVocabularyMap | undefined,
  value: unknown
): EditFieldConfig<TComponent> | undefined => {
  const options = config?.options?.length
    ? null
    : fieldVocabularyOptions(field, vocabularies, value)
  const nullable = config?.nullable ?? field.nullable
  if (!options && nullable === config?.nullable) {
    return config
  }
  return {
    label: field.key,
    ...config,
    ...(options ? { options } : {}),
    ...(nullable !== undefined ? { nullable } : {})
  }
}

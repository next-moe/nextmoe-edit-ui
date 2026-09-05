import type {
  EditFieldConfig,
  EditSchemaElement,
  EditSchemaField,
  EditSelectOption,
  EditVocabularyEncoding
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
  encoding?: EditVocabularyEncoding
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
    if (shape.encoding) {
      merged.encoding = shape.encoding
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

// A vocabulary's published order is contractual only under `int`, where the
// wire code is base plus the token's index in it; under `token` the wire
// carries the token itself and the order is presentational.
export const vocabularyOptions = (
  vocabulary: EditVocabulary,
  opts?: {
    encoding?: EditVocabularyEncoding
    base?: number
    labels?: Record<string, string>
  }
): EditSelectOption[] =>
  vocabulary.values.map((entry, index) => ({
    value: opts?.encoding === 'int' ? (opts.base ?? 0) + index : entry.value,
    label: opts?.labels?.[entry.value] ?? entry.display_name ?? entry.value
  }))

// Nothing else on the wire separates the two encodings: content_rating wants 2
// and olang wants "ja", yet both declare kind "enum" plus a vocabulary. A field
// that reaches here without an encoding came from the caps face alone or from a
// server below spec 2.8.0, and degrades to read-only rather than guessing
// itself into a 422.
export const fieldVocabularyOptions = (
  field: Pick<EditSchemaField, 'kind' | 'vocabulary' | 'encoding' | 'base'>,
  vocabularies: EditVocabularyMap | undefined,
  labels?: Record<string, string>
): EditSelectOption[] | null => {
  if (field.kind !== 'enum' || !field.vocabulary || !field.encoding) {
    return null
  }
  const vocabulary = vocabularies?.[field.vocabulary]
  if (!vocabulary) {
    return null
  }
  return vocabularyOptions(vocabulary, {
    encoding: field.encoding,
    base: field.base,
    labels
  })
}

// The renderer-facing merge: a config that already carries options keeps them
// (a site's hand-written labels beat published display names), one without
// gains vocabulary-derived options, and the schema's nullable fills in when the
// config is silent. When nothing changes, the original config comes back
// untouched.
export const applyVocabularyOptions = <TComponent = unknown>(
  field: EditSchemaField,
  config: EditFieldConfig<TComponent> | undefined,
  vocabularies: EditVocabularyMap | undefined
): EditFieldConfig<TComponent> | undefined => {
  const options = config?.options?.length
    ? null
    : fieldVocabularyOptions(field, vocabularies)
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

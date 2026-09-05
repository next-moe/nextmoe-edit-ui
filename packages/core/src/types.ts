export interface EditSchemaElementMember {
  key: string
  type: string
  vocabulary?: string
  base?: number
  nullable?: boolean
}

export interface EditSchemaElement {
  type: string
  members?: EditSchemaElementMember[]
}

// How a write carries a vocabulary value: `int` is the wire code (base plus the
// token's index in the vocabulary's published order), `token` is the token
// string. Spec 2.8.0 publishes it exactly where a field names a vocabulary.
export type EditVocabularyEncoding = 'int' | 'token'

// The value-shape fields — vocabulary through element — never arrive on the
// actor-caps schema face; they live on GET /v2/catalog/schemas/{object} and are
// filled in by mergeSchemaFaces. A field object built from the caps response
// alone legitimately lacks them.
export interface EditSchemaField {
  key: string
  kind: string
  diff_hint: string
  deprecated?: boolean
  locked: boolean
  can_propose: boolean
  can_review: boolean
  would_automerge: boolean
  max_elements?: number
  max_suppressed?: number
  vocabulary?: string
  encoding?: EditVocabularyEncoding
  base?: number
  nullable?: boolean
  element?: EditSchemaElement | null
}

// The union is derived from the array, not written twice: `isEditControl` is
// what decides whether a control renders its editor or the read-only fallback,
// so a control present in the union but missing from the list would silently
// degrade a working field.
export const EDIT_CONTROLS = [
  'input',
  'number',
  'textarea',
  'select',
  'switch',
  'date',
  'string-list',
  'number-list',
  'object-list',
  'entity-picker',
  'entity-kind-picker',
  'image',
  'image-list',
  'readonly'
] as const

export type EditControl = (typeof EDIT_CONTROLS)[number]

export interface EditSelectOption {
  value: string | number
  label: string
}

// `type` is the JSON type the server demands for this column, not the widget.
// The catalog engine's object parsers type-switch on the wire value and reject a
// string where they want a number, so a column bound to a text input has to be
// coerced on the way out or every row is a 422.
export type EditColumnType = 'string' | 'integer' | 'number' | 'boolean'

export interface EditObjectColumn {
  key: string
  label: string
  control?: 'input' | 'textarea' | 'select' | 'switch' | 'entity-picker'
  type?: EditColumnType
  options?: EditSelectOption[]
  placeholder?: string
  width?: string
  required?: boolean
  searchEntities?: (keyword: string) => Promise<EditSelectOption[]>
  resolveEntities?: (
    ids: (string | number)[]
  ) => Promise<EditSelectOption[]> | EditSelectOption[]
}

export interface EditContextItem {
  label: string
  image?: string
}

// `component` is a Vue component in the vue package, but this package must stay
// framework-free (a bare `import type { Component } from 'vue'` puts vue in
// core's dependency closure). @nextmoe/edit-ui-vue re-exports this as
// `EditFieldConfig<Component>`; do not "simplify" the slot away.
export interface EditFieldConfig<TComponent = unknown> {
  label: string
  tabLabel?: string
  description?: string
  control?: EditControl
  options?: EditSelectOption[]
  group?: string
  placeholder?: string
  nullable?: boolean
  columns?: EditObjectColumn[]
  itemColumns?: EditObjectColumn[]
  // Not every list accepts new or removed rows: applyRoster holds no INSERT and
  // no DELETE, so a roster row added in the form is refused at merge with "is
  // not on this work's roster". Offering the button anyway is a trap.
  allowAdd?: boolean
  allowRemove?: boolean
  newRow?: () => Record<string, unknown>
  formatValue?: (value: unknown) => string
  formatItem?: (item: unknown) => string
  resolveImage?: (value: unknown) => string
  uploadImage?: (file: File, currentItems: unknown[]) => Promise<unknown | null>
  normalizeItems?: (items: unknown[]) => unknown[]
  pinItemFlag?: { key: string; label: string }
  multiple?: boolean
  searchEntities?: (keyword: string) => Promise<EditSelectOption[]>
  entityIdKey?: string
  entityKinds?: { value: number; label: string }[]
  entityDefaultKind?: number
  resolveEntities?: (
    ids: (string | number)[]
  ) => Promise<EditSelectOption[]> | EditSelectOption[]
  component?: TComponent
  fieldProps?: Record<string, unknown>
  contextNote?: string
  contextItems?: (value: unknown) => EditContextItem[]
  pairsSuppressed?: boolean
  // The identity-key format is the server's, not this package's — `title:<kind>
  // :<lang>:<cleaned text>` for work titles, `roster:<character_id>` for the
  // roster — so the site supplies it. Return null for a row that has no key yet.
  identityKey?: (item: unknown) => string | null
}

export type EditFieldConfigMap<TComponent = unknown> = Record<
  string,
  EditFieldConfig<TComponent>
>

export interface EditAmendment {
  id: number
  seq: number
  set?: Record<string, unknown>
  unset?: string[]
  amender_uid: number
  note: string
  created_at: string
}

export type EditProposalStatus = 'open' | 'merged' | 'declined' | 'withdrawn'

export interface EditProposal {
  id: number
  entity_type: string
  entity_id: number
  base_revision_seq: number
  patch: Record<string, unknown>
  effective_patch?: Record<string, unknown>
  proposer_uid: number
  note: string
  site: string
  status: EditProposalStatus
  decided_by_uid?: number
  decided_at?: string
  decision_note?: string
  created_at: string
  updated_at: string
  amendments?: EditAmendment[]
}

export interface EditRevision {
  id: number
  seq: number
  action: string
  changed_fields: string[]
  snapshot: Record<string, unknown>
  actor_uid: number
  amender_uid?: number
  proposal_id?: number
  site: string
  created_at: string
  legacy_action?: string
  legacy_note?: string
  legacy_minor?: boolean
  legacy_id?: number
}

export interface ImageDiffEntry {
  url: string
  text: string
}

export interface EditUser {
  id: number
  name: string
  avatar: string
}

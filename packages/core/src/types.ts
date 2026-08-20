export interface EditSchemaField {
  key: string
  kind: string
  diff_hint: string
  deprecated?: boolean
  locked: boolean
  can_propose: boolean
  can_review: boolean
  would_automerge: boolean
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

export interface EditObjectColumn {
  key: string
  label: string
  control?: 'input' | 'textarea' | 'select'
  options?: EditSelectOption[]
  placeholder?: string
  width?: string
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

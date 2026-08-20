export { default as EntityKindPicker } from './EntityKindPicker.vue'
export { default as EntityPicker } from './EntityPicker.vue'
export { default as FieldDiff } from './FieldDiff.vue'
export { default as ImageDiff } from './ImageDiff.vue'
export { default as ImageField } from './ImageField.vue'
export { default as ObjectListField } from './ObjectListField.vue'
export { default as ProposalCard } from './ProposalCard.vue'
export { default as ReviewQueue } from './ReviewQueue.vue'
export { default as RevisionTimeline } from './RevisionTimeline.vue'
export { default as SchemaField } from './SchemaField.vue'
export { default as SchemaForm } from './SchemaForm.vue'
export { default as SourceContext } from './SourceContext.vue'
export { default as TextDiff } from './TextDiff.vue'
export { default as Time } from './Time.vue'

// The single source the Nuxt module iterates to register auto-imports; a new
// component is picked up there with no edit in @nextmoe/edit-ui-nuxt.
export const EDIT_UI_COMPONENT_NAMES = [
  'EntityKindPicker',
  'EntityPicker',
  'FieldDiff',
  'ImageDiff',
  'ImageField',
  'ObjectListField',
  'ProposalCard',
  'ReviewQueue',
  'RevisionTimeline',
  'SchemaField',
  'SchemaForm',
  'SourceContext',
  'TextDiff',
  'Time'
] as const

export type EditUiComponentName = (typeof EDIT_UI_COMPONENT_NAMES)[number]

export type { EditFieldConfig, EditFieldConfigMap } from './types'

export { EDIT_CONTROLS } from '@nextmoe/edit-ui-core'
export {
  cloneEditValue,
  diffItems,
  diffTextSegments,
  diffTextStats,
  editValueEqual,
  elideTextDiff,
  formatEditItem,
  formatEditValue,
  isEditControl,
  isTextDiffElidable,
  proposalStatusBadge,
  resolveControl,
  revisionActionBadge,
  stableStringify,
  TEXT_DIFF_ELIDE_OVER
} from '@nextmoe/edit-ui-core'
export type {
  EditAmendment,
  EditContextItem,
  EditControl,
  EditObjectColumn,
  EditProposal,
  EditProposalStatus,
  EditRevision,
  EditSchemaField,
  EditSelectOption,
  EditUser,
  ImageDiffEntry,
  ItemsDiff,
  TextDiffOp,
  TextDiffPiece,
  TextDiffSegment
} from '@nextmoe/edit-ui-core'

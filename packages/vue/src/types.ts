import type { Component } from 'vue'
import type {
  EditFieldConfig as CoreEditFieldConfig
} from '@nextmoe/edit-ui-core'

// The config family is generic in @nextmoe/edit-ui-core so that package stays
// framework-free; this is the Vue-shaped specialisation every component here
// (and every downstream Vue/Nuxt site) actually uses.
export type EditFieldConfig = CoreEditFieldConfig<Component>

export type EditFieldConfigMap = Record<string, EditFieldConfig>

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

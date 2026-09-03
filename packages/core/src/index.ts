export { EDIT_CONTROLS } from './types'
export type {
  EditAmendment,
  EditColumnType,
  EditContextItem,
  EditControl,
  EditFieldConfig,
  EditFieldConfigMap,
  EditObjectColumn,
  EditProposal,
  EditProposalStatus,
  EditRevision,
  EditSchemaField,
  EditSelectOption,
  EditUser,
  ImageDiffEntry
} from './types'

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
} from './utils'
export type {
  ItemsDiff,
  TextDiffOp,
  TextDiffPiece,
  TextDiffSegment
} from './utils'

export { guardEditControl, listShape, overElementCap } from './shape'
export type { EditListShape, GuardedEditControl } from './shape'

export {
  blankEditRow,
  buildEditRow,
  buildEditRows,
  summarizeColumns
} from './row'
export type { EditColumnSummary, EditRowIssue, EditRowResult } from './row'

export {
  cleanEditText,
  compareIdentityKeys,
  isSuppressed,
  normalizeSuppressedKeys,
  toggleSuppressedKey
} from './suppression'

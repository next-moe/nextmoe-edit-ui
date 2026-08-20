import { diffWords } from 'diff'

import { EDIT_CONTROLS } from './types'
import type { EditControl, EditFieldConfig, EditSchemaField } from './types'

export const stableStringify = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'null'
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
    return `{${entries.join(',')}}`
  }
  return JSON.stringify(value)
}

export const editValueEqual = (a: unknown, b: unknown): boolean =>
  stableStringify(a) === stableStringify(b)

export const cloneEditValue = (value: unknown): unknown =>
  value === null || value === undefined
    ? null
    : JSON.parse(JSON.stringify(value))

export const resolveControl = (
  field: EditSchemaField,
  config?: EditFieldConfig
): EditControl => {
  if (config?.control) {
    return config.control
  }
  switch (field.kind) {
    case 'text':
      return field.diff_hint === 'lines' ? 'textarea' : 'input'
    case 'enum':
      return config?.options?.length ? 'select' : 'input'
    case 'int':
    case 'ref':
      return 'number'
    case 'date':
      return 'date'
    case 'imagehash':
      return 'image'
    case 'list':
      return field.diff_hint === 'image' ? 'image-list' : 'string-list'
    default:
      return 'readonly'
  }
}

const KNOWN_CONTROLS = new Set<string>(EDIT_CONTROLS)

export const isEditControl = (value: unknown): value is EditControl =>
  typeof value === 'string' && KNOWN_CONTROLS.has(value)

export const formatEditValue = (
  value: unknown,
  config?: EditFieldConfig
): string => {
  if (config?.formatValue) {
    return config.formatValue(value)
  }
  if (value === null || value === undefined || value === '') {
    return '（空）'
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (config?.options) {
    const hit = config.options.find((o) => o.value === value)
    if (hit) {
      return hit.label
    }
  }
  if (Array.isArray(value)) {
    return value.map((v) => formatEditItem(v, config)).join('、') || '（空）'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

export const formatEditItem = (
  item: unknown,
  config?: EditFieldConfig
): string => {
  if (config?.formatItem) {
    return config.formatItem(item)
  }
  if (item === null || item === undefined) {
    return '（空）'
  }
  if (typeof item === 'object') {
    const o = item as Record<string, unknown>
    if (typeof o.name === 'string' && typeof o.link === 'string') {
      return `${o.name} → ${o.link}`
    }
    return JSON.stringify(item)
  }
  return String(item)
}

export type TextDiffOp = 'equal' | 'insert' | 'delete'

export interface TextDiffSegment {
  op: TextDiffOp
  text: string
}

let segmenter: Intl.Segmenter | null | undefined

const wordSegmenter = (): Intl.Segmenter | null => {
  if (segmenter !== undefined) {
    return segmenter
  }
  segmenter =
    typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
      ? new Intl.Segmenter('zh', { granularity: 'word' })
      : null
  return segmenter
}

export const diffTextSegments = (
  before: string,
  after: string
): TextDiffSegment[] => {
  const a = before ?? ''
  const b = after ?? ''
  if (!a && !b) {
    return []
  }
  if (a === b) {
    return [{ op: 'equal', text: a }]
  }

  const seg = wordSegmenter()
  const parts = diffWords(a, b, seg ? { intlSegmenter: seg } : undefined)

  return parts.map((p) => ({
    op: p.added ? 'insert' : p.removed ? 'delete' : 'equal',
    text: p.value
  }))
}

export const diffTextStats = (
  segments: TextDiffSegment[]
): { added: number; removed: number } => {
  let added = 0
  let removed = 0
  for (const s of segments) {
    if (s.op === 'insert') {
      added += s.text.length
    } else if (s.op === 'delete') {
      removed += s.text.length
    }
  }
  return { added, removed }
}

export const TEXT_DIFF_ELIDE_OVER = 180
const TEXT_DIFF_CONTEXT = 60

export type TextDiffPiece =
  | { kind: 'text'; op: TextDiffOp; text: string }
  | { kind: 'elision'; count: number }

export const isTextDiffElidable = (segments: TextDiffSegment[]): boolean =>
  segments.length > 1 &&
  segments.some((s) => s.op === 'equal' && s.text.length > TEXT_DIFF_ELIDE_OVER)

export const elideTextDiff = (
  segments: TextDiffSegment[],
  expanded: boolean
): TextDiffPiece[] => {
  if (expanded || segments.length === 1) {
    return segments.map((s) => ({ kind: 'text', op: s.op, text: s.text }))
  }
  const out: TextDiffPiece[] = []
  segments.forEach((s, i) => {
    if (s.op !== 'equal' || s.text.length <= TEXT_DIFF_ELIDE_OVER) {
      out.push({ kind: 'text', op: s.op, text: s.text })
      return
    }
    const c = TEXT_DIFF_CONTEXT
    if (i === 0) {
      out.push({ kind: 'elision', count: s.text.length - c })
      out.push({ kind: 'text', op: 'equal', text: s.text.slice(-c) })
    } else if (i === segments.length - 1) {
      out.push({ kind: 'text', op: 'equal', text: s.text.slice(0, c) })
      out.push({ kind: 'elision', count: s.text.length - c })
    } else {
      out.push({ kind: 'text', op: 'equal', text: s.text.slice(0, c) })
      out.push({ kind: 'elision', count: s.text.length - 2 * c })
      out.push({ kind: 'text', op: 'equal', text: s.text.slice(-c) })
    }
  })
  return out
}

export interface ItemsDiff {
  added: unknown[]
  removed: unknown[]
  kept: unknown[]
}

export const diffItems = (from: unknown, to: unknown): ItemsDiff => {
  const a = Array.isArray(from) ? from : []
  const b = Array.isArray(to) ? to : []
  const aKeys = new Set(a.map(stableStringify))
  const bKeys = new Set(b.map(stableStringify))
  return {
    added: b.filter((x) => !aKeys.has(stableStringify(x))),
    removed: a.filter((x) => !bKeys.has(stableStringify(x))),
    kept: a.filter((x) => bKeys.has(stableStringify(x)))
  }
}

export const proposalStatusBadge = (
  status: string
): { label: string; color: 'primary' | 'success' | 'danger' | 'default' } => {
  switch (status) {
    case 'open':
      return { label: '待审核', color: 'primary' }
    case 'merged':
      return { label: '已合并', color: 'success' }
    case 'declined':
      return { label: '已拒绝', color: 'danger' }
    case 'withdrawn':
      return { label: '已撤回', color: 'default' }
    default:
      return { label: status, color: 'default' }
  }
}

export const revisionActionBadge = (
  action: string
): { label: string; color: 'primary' | 'success' | 'warning' | 'default' } => {
  switch (action) {
    case 'created':
      return { label: '创建', color: 'default' }
    case 'merged':
      return { label: '合并提案', color: 'success' }
    case 'direct':
      return { label: '直接编辑', color: 'primary' }
    case 'reverted':
      return { label: '回滚', color: 'warning' }
    default:
      return { label: action, color: 'default' }
  }
}

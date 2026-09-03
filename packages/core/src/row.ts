import type { EditColumnType, EditObjectColumn } from './types'

export interface EditRowIssue {
  key: string
  reason: string
}

export interface EditRowResult {
  row: Record<string, unknown>
  issues: EditRowIssue[]
}

const INTEGER = /^-?\d+$/

const matchOption = (
  raw: unknown,
  column: EditObjectColumn
): { value: unknown } | null => {
  if (!column.options?.length) {
    return null
  }
  const hit = column.options.find((o) => String(o.value) === String(raw))
  return hit ? { value: hit.value } : null
}

const coerce = (
  raw: unknown,
  type: EditColumnType
): { value: unknown } | { error: string } => {
  switch (type) {
    case 'integer': {
      if (typeof raw === 'number') {
        return Number.isInteger(raw) ? { value: raw } : { error: '必须是整数' }
      }
      const text = String(raw).trim()
      return INTEGER.test(text)
        ? { value: Number(text) }
        : { error: '必须是整数' }
    }
    case 'number': {
      if (typeof raw === 'number') {
        return Number.isFinite(raw) ? { value: raw } : { error: '必须是数字' }
      }
      const n = Number(String(raw).trim())
      return Number.isFinite(n) ? { value: n } : { error: '必须是数字' }
    }
    case 'boolean': {
      if (typeof raw === 'boolean') {
        return { value: raw }
      }
      const text = String(raw).trim().toLowerCase()
      if (text === 'true') {
        return { value: true }
      }
      if (text === 'false') {
        return { value: false }
      }
      return { error: '必须是布尔值' }
    }
    default:
      return { value: typeof raw === 'string' ? raw.trim() : String(raw) }
  }
}

const isBlank = (raw: unknown): boolean =>
  raw === null || raw === undefined || (typeof raw === 'string' && !raw.trim())

// The catalog engine's `asObject` rejects any key it was not told to expect, so
// a row carrying a leftover key from an earlier shape fails the whole patch.
// Build the payload from the columns, never by spreading the editing row.
export const buildEditRow = (
  raw: Record<string, unknown>,
  columns: EditObjectColumn[]
): EditRowResult => {
  const row: Record<string, unknown> = {}
  const issues: EditRowIssue[] = []

  for (const column of columns) {
    const value = raw[column.key]
    if (isBlank(value)) {
      if (column.required) {
        issues.push({ key: column.key, reason: '必填' })
      }
      continue
    }
    const option = matchOption(value, column)
    if (option) {
      row[column.key] = option.value
      continue
    }
    const result = coerce(value, column.type ?? 'string')
    if ('error' in result) {
      issues.push({ key: column.key, reason: result.error })
      row[column.key] = value
      continue
    }
    if (isBlank(result.value)) {
      if (column.required) {
        issues.push({ key: column.key, reason: '必填' })
      }
      continue
    }
    row[column.key] = result.value
  }

  return { row, issues }
}

export const buildEditRows = (
  rows: Record<string, unknown>[],
  columns: EditObjectColumn[]
): { rows: Record<string, unknown>[]; issues: (EditRowIssue & { index: number })[] } => {
  const out: Record<string, unknown>[] = []
  const issues: (EditRowIssue & { index: number })[] = []
  rows.forEach((raw, index) => {
    const built = buildEditRow(raw, columns)
    out.push(built.row)
    for (const issue of built.issues) {
      issues.push({ ...issue, index })
    }
  })
  return { rows: out, issues }
}

export const blankEditRow = (
  columns: EditObjectColumn[]
): Record<string, unknown> => {
  const row: Record<string, unknown> = {}
  for (const column of columns) {
    row[column.key] = column.type === 'boolean' ? false : ''
  }
  return row
}
